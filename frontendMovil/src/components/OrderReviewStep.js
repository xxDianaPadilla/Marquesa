import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAlert } from '../hooks/useAlert';
import { CustomAlert, LoadingDialog, ConfirmationDialog, InputDialog, ToastDialog } from '../components/CustomAlerts';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const OrderReviewStep = ({
    onBack,
    onConfirm,
    orderData,
    isProcessing = false
}) => {
    const [isConfirming, setIsConfirming] = useState(false);

    // Usar el hook de alertas personalizadas
    const {
        alertState,
        showError,
        hideAlert,
        hideLoading,
        hideConfirmation,
        hideInput,
        hideToast
    } = useAlert();

    // Función para manejar la confirmación
    const handleConfirm = async () => {
        setIsConfirming(true);
        try {
            await onConfirm();
        } catch (error) {
            console.error('Error al confirmar pedido:', error);
            // Reemplazar Alert.alert por alerta personalizada
            showError(
                'Error al confirmar el pedido. Inténtalo nuevamente.',
                'Error'
            );
        } finally {
            setIsConfirming(false);
        }
    };

    // Formatear fecha para mostrar - CORREGIDO para evitar desfase de fechas
    const formatDate = (dateString) => {
        if (!dateString) return 'No especificada';

        try {
            let date;

            if (dateString.includes('-')) {
                // Crear fecha de manera segura para evitar desfase de zona horaria
                const [year, month, day] = dateString.split('-');
                date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            } else {
                // Si viene como Date object o string, intentar parsearlo
                date = new Date(dateString);
            }

            if (isNaN(date.getTime())) {
                return 'Fecha inválida';
            }

            return date.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            console.error('Error formateando fecha:', error);
            return 'Fecha inválida';
        }
    };

    // Obtener etiqueta del método de pago
    const getPaymentTypeLabel = (type) => {
        const labels = {
            'Transferencia': 'Transferencia bancaria',
            'Débito': 'Tarjeta de débito',
            'Crédito': 'Tarjeta de crédito'
        };
        return labels[type] || type;
    };

    // Verificar si todos los datos están presentes
    const hasAllRequiredData = () => {
        return orderData.shippingInfo?.receiverName &&
            orderData.shippingInfo?.receiverPhone &&
            orderData.shippingInfo?.deliveryAddress &&
            orderData.paymentInfo?.paymentType;
    };

    if (!orderData) {
        return (
            <View style={styles.container}>
                <View style={styles.errorContainer}>
                    <Icon name="error-outline" size={24} color="#ef4444" />
                    <Text style={styles.errorText}>No se encontraron datos del pedido</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.cardContainer}>
                <Text style={styles.title}>Revisión del pedido</Text>

                <ScrollView
                    style={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Información de envío */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="local-shipping" size={20} color="#666" />
                            <Text style={styles.sectionTitle}>Información de envío</Text>
                        </View>

                        <View style={styles.infoCard}>
                            <View style={styles.infoGrid}>
                                <View style={styles.infoItem}>
                                    <Text style={styles.infoLabel}>Receptor:</Text>
                                    <Text style={styles.infoValue}>
                                        {orderData.shippingInfo?.receiverName || 'No especificado'}
                                    </Text>
                                </View>
                                <View style={styles.infoItem}>
                                    <Text style={styles.infoLabel}>Teléfono:</Text>
                                    <Text style={styles.infoValue}>
                                        {orderData.shippingInfo?.receiverPhone || 'No especificado'}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Dirección:</Text>
                                <Text style={styles.infoValue}>
                                    {orderData.shippingInfo?.deliveryAddress || 'No especificada'}
                                </Text>
                            </View>

                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Punto de referencia:</Text>
                                <Text style={styles.infoValue}>
                                    {orderData.shippingInfo?.deliveryPoint || 'No especificado'}
                                </Text>
                            </View>

                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Fecha de entrega:</Text>
                                <Text style={styles.infoValue}>
                                    {formatDate(orderData.shippingInfo?.deliveryDate)}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Información de pago */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="payment" size={20} color="#666" />
                            <Text style={styles.sectionTitle}>Información de pago</Text>
                        </View>

                        <View style={styles.infoCard}>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Método de pago:</Text>
                                <Text style={styles.infoValue}>
                                    {getPaymentTypeLabel(orderData.paymentInfo?.paymentType)}
                                </Text>
                            </View>

                            {/* Solo mostrar comprobante si es transferencia bancaria Y hay comprobante */}
                            {orderData.paymentInfo?.paymentType === 'Transferencia' && orderData.paymentInfo?.paymentProofImage && (
                                <View style={styles.paymentConfirmation}>
                                    <Icon name="check-circle" size={16} color="#10b981" />
                                    <Text style={styles.confirmationText}>
                                        Comprobante cargado correctamente
                                    </Text>
                                </View>
                            )}

                            {/* Mostrar información específica para tarjetas */}
                            {(orderData.paymentInfo?.paymentType === 'Débito' || orderData.paymentInfo?.paymentType === 'Crédito') && (
                                <View style={styles.paymentConfirmation}>
                                    <Icon name="check-circle" size={16} color="#10b981" />
                                    <Text style={styles.confirmationText}>
                                        Datos de tarjeta procesados correctamente
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Resumen financiero */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="account-balance-wallet" size={20} color="#666" />
                            <Text style={styles.sectionTitle}>Resumen de costos</Text>
                        </View>

                        <View style={styles.infoCard}>
                            <View style={styles.costRow}>
                                <Text style={styles.costLabel}>Subtotal:</Text>
                                <Text style={styles.costValue}>
                                    ${orderData.originalSubtotal?.toFixed(2) || '0.00'}
                                </Text>
                            </View>

                            {/* Mostrar descuento si está aplicado */}
                            {orderData.discountApplied && orderData.discountAmount > 0 && (
                                <View style={styles.costRow}>
                                    <Text style={styles.discountLabel}>
                                        Descuento {orderData.discountInfo?.name ? `(${orderData.discountInfo.name})` : ''}:
                                    </Text>
                                    <Text style={styles.discountValue}>
                                        -${orderData.discountAmount?.toFixed(2) || '0.00'}
                                    </Text>
                                </View>
                            )}

                            <View style={styles.costDivider} />

                            <View style={styles.costRow}>
                                <Text style={styles.totalLabel}>Total:</Text>
                                <Text style={styles.totalValue}>
                                    ${orderData.cartTotal?.toFixed(2) || '0.00'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Información importante */}
                    <View style={styles.warningSection}>
                        <View style={styles.warningHeader}>
                            <Icon name="warning" size={20} color="#f59e0b" />
                            <Text style={styles.warningTitle}>Importante</Text>
                        </View>
                        <View style={styles.warningContent}>
                            <Text style={styles.warningItem}>• Una vez confirmado, el pedido no podrá ser modificado</Text>
                            <Text style={styles.warningItem}>• El tiempo de entrega puede variar según la ubicación</Text>
                            <Text style={styles.warningItem}>• Asegúrate de que la información de contacto sea correcta</Text>
                        </View>
                    </View>
                </ScrollView>

                {/* Botones de acción */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={onBack}
                        disabled={isConfirming || isProcessing}
                    >
                        <Text style={styles.backButtonText}>Volver</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.confirmButton,
                            (!hasAllRequiredData() || isConfirming || isProcessing) && styles.buttonDisabled
                        ]}
                        onPress={handleConfirm}
                        disabled={!hasAllRequiredData() || isConfirming || isProcessing}
                    >
                        {isConfirming || isProcessing ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="small" color="#fff" />
                                <Text style={styles.loadingText}>Procesando...</Text>
                            </View>
                        ) : (
                            <Text style={styles.confirmButtonText}>Confirmar pedido</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Estado de procesamiento */}
                {(isConfirming || isProcessing) && (
                    <View style={styles.processingContainer}>
                        <View style={styles.processingContent}>
                            <ActivityIndicator size="small" color="#3b82f6" />
                            <View style={styles.processingText}>
                                <Text style={styles.processingTitle}>Procesando tu pedido...</Text>
                                <Text style={styles.processingSubtitle}>Por favor no cierres esta ventana</Text>
                            </View>
                        </View>
                    </View>
                )}
            </View>

            {/* Alertas personalizadas */}
            <CustomAlert
                visible={alertState.basicAlert.visible}
                title={alertState.basicAlert.title}
                message={alertState.basicAlert.message}
                type={alertState.basicAlert.type}
                confirmText={alertState.basicAlert.confirmText}
                cancelText={alertState.basicAlert.cancelText}
                showCancel={alertState.basicAlert.showCancel}
                onConfirm={alertState.basicAlert.onConfirm}
                onCancel={alertState.basicAlert.onCancel}
            />

            <LoadingDialog
                visible={alertState.loading.visible}
                title={alertState.loading.title}
                message={alertState.loading.message}
                color={alertState.loading.color}
            />

            <ConfirmationDialog
                visible={alertState.confirmation.visible}
                title={alertState.confirmation.title}
                message={alertState.confirmation.message}
                confirmText={alertState.confirmation.confirmText}
                cancelText={alertState.confirmation.cancelText}
                isDangerous={alertState.confirmation.isDangerous}
                onConfirm={alertState.confirmation.onConfirm}
                onCancel={alertState.confirmation.onCancel}
            />

            <InputDialog
                visible={alertState.input.visible}
                title={alertState.input.title}
                message={alertState.input.message}
                placeholder={alertState.input.placeholder}
                value={alertState.input.value}
                confirmText={alertState.input.confirmText}
                cancelText={alertState.input.cancelText}
                keyboardType={alertState.input.keyboardType}
                onChangeText={alertState.input.onChangeText}
                onConfirm={alertState.input.onConfirm}
                onCancel={alertState.input.onCancel}
            />

            <ToastDialog
                visible={alertState.toast.visible}
                message={alertState.toast.message}
                type={alertState.toast.type}
                duration={alertState.toast.duration}
                onHide={hideToast}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    cardContainer: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        marginHorizontal: 16,
        marginVertical: 8,
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginBottom: 20,
        fontFamily: 'Poppins-SemiBold',
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 16,
    },
    section: {
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginLeft: 8,
        fontFamily: 'Poppins-Medium',
    },
    infoCard: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 16,
    },
    infoGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    infoItem: {
        marginBottom: 12,
        flex: SCREEN_WIDTH < 400 ? 1 : 0.48,
    },
    infoLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: '#6b7280',
        marginBottom: 4,
        fontFamily: 'Poppins-Medium',
    },
    infoValue: {
        fontSize: 14,
        color: '#374151',
        fontFamily: 'Poppins-Regular',
        lineHeight: 18,
    },
    paymentConfirmation: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    confirmationText: {
        fontSize: 12,
        color: '#10b981',
        marginLeft: 6,
        fontFamily: 'Poppins-Regular',
    },
    costRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 4,
    },
    costLabel: {
        fontSize: 14,
        color: '#6b7280',
        fontFamily: 'Poppins-Regular',
    },
    costValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        fontFamily: 'Poppins-Medium',
    },
    discountLabel: {
        fontSize: 14,
        color: '#10b981',
        fontFamily: 'Poppins-Regular',
    },
    discountValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#10b981',
        fontFamily: 'Poppins-Medium',
    },
    costDivider: {
        height: 1,
        backgroundColor: '#e5e7eb',
        marginVertical: 12,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        fontFamily: 'Poppins-Bold',
    },
    totalValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        fontFamily: 'Poppins-Bold',
    },
    warningSection: {
        backgroundColor: '#fefbf3',
        borderRadius: 8,
        padding: 16,
        marginBottom: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#f59e0b',
    },
    warningHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    warningTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#92400e',
        marginLeft: 6,
        fontFamily: 'Poppins-Medium',
    },
    warningContent: {
        gap: 4,
    },
    warningItem: {
        fontSize: 12,
        color: '#a16207',
        fontFamily: 'Poppins-Regular',
        lineHeight: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
    },
    backButton: {
        flex: 1,
        backgroundColor: 'transparent',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#d1d5db',
        minHeight: 48,
        justifyContent: 'center',
    },
    backButtonText: {
        color: '#6b7280',
        fontSize: 16,
        fontWeight: '500',
        fontFamily: 'Poppins-Medium',
    },
    confirmButton: {
        flex: 2,
        backgroundColor: '#FDB4B7',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        minHeight: 48,
        justifyContent: 'center',
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Poppins-SemiBold',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    loadingText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
        fontFamily: 'Poppins-SemiBold',
    },
    processingContainer: {
        marginTop: 16,
        backgroundColor: '#eff6ff',
        borderRadius: 8,
        padding: 16,
        borderWidth: 1,
        borderColor: '#bfdbfe',
    },
    processingContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    processingText: {
        marginLeft: 12,
        flex: 1,
    },
    processingTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1d4ed8',
        fontFamily: 'Poppins-Medium',
    },
    processingSubtitle: {
        fontSize: 12,
        color: '#3b82f6',
        fontFamily: 'Poppins-Regular',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fef2f2',
        padding: 16,
        borderRadius: 8,
        margin: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#ef4444',
    },
    errorText: {
        flex: 1,
        fontSize: 14,
        color: '#dc2626',
        marginLeft: 8,
        fontFamily: 'Poppins-Regular',
    },
});

export default OrderReviewStep;