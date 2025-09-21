import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Modal,
    BackHandler,
    Dimensions,
    Animated
} from 'react-native';

// Importaciones de contextos
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

// Importaciones de componentes
import Icon from 'react-native-vector-icons/MaterialIcons';
import backIcon from '../images/backIcon.png';
import ShippingInfoMobile from '../components/ShippingInfo';
import PaymentMethodStep from '../components/PaymentMethodStep';
import OrderReviewStep from '../components/OrderReviewStep';

// NUEVAS IMPORTACIONES - Alertas personalizadas
import { 
    CustomAlert, 
    LoadingDialog, 
    ConfirmationDialog, 
    ToastDialog 
} from '../components/CustomDialogs';
import { useAlert } from '../hooks/useAlert';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Componente ProgressSteps para mostrar el progreso
const ProgressSteps = ({ currentStep = 1 }) => {
    const steps = [
        {
            number: 1,
            title: "Envío",
            active: currentStep >= 1,
            completed: currentStep > 1
        },
        {
            number: 2,
            title: "Pago",
            active: currentStep >= 2,
            completed: currentStep > 2
        },
        {
            number: 3,
            title: "Revisión",
            active: currentStep >= 3,
            completed: currentStep > 3
        }
    ];

    return (
        <View style={styles.progressContainer}>
            <Text style={styles.progressTitle}>Finalizar Compra</Text>
            <View style={styles.stepsContainer}>
                {steps.map((step, index) => (
                    <View key={step.number} style={styles.stepWrapper}>
                        <View style={styles.stepItem}>
                            <View style={[
                                styles.stepCircle,
                                step.completed ? styles.stepCompleted :
                                    step.active ? styles.stepActive : styles.stepInactive
                            ]}>
                                <Text style={[
                                    styles.stepText,
                                    step.completed || step.active ? styles.stepTextActive : styles.stepTextInactive
                                ]}>
                                    {step.completed ? '✓' : step.number}
                                </Text>
                            </View>
                            <Text style={styles.stepTitle}>{step.title}</Text>
                        </View>
                        {index < steps.length - 1 && (
                            <View style={[
                                styles.stepConnector,
                                step.completed ? styles.connectorCompleted : styles.connectorInactive
                            ]} />
                        )}
                    </View>
                ))}
            </View>
        </View>
    );
};

// Componente Modal del resumen del pedido
const PaymentOrderSummaryModal = ({
    visible,
    onClose,
    subtotal = 0,
    total = 0,
    discountApplied = false,
    discountAmount = 0,
    discountInfo = null,
    cartItems = []
}) => {
    const calculatedSubtotal = subtotal || cartItems.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
    }, 0);

    const finalTotal = Math.max(0, calculatedSubtotal - (discountAmount || 0));

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.summaryModalOverlay}>
                <View style={styles.summaryModalContent}>
                    {/* Header del modal */}
                    <View style={styles.summaryModalHeader}>
                        <Text style={styles.summaryModalTitle}>Resumen del pedido</Text>
                        <TouchableOpacity onPress={onClose} style={styles.summaryModalCloseButton}>
                            <Icon name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    {/* Contenido scrolleable */}
                    <ScrollView
                        style={styles.summaryModalScrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.summaryModalBody}>
                            {/* Totales principales */}
                            <View style={styles.summarySection}>
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Subtotal</Text>
                                    <Text style={styles.summaryValue}>${calculatedSubtotal.toFixed(2)}</Text>
                                </View>

                                {discountApplied && discountAmount > 0 && (
                                    <View style={styles.summaryRow}>
                                        <Text style={styles.discountLabel}>
                                            Descuento {discountInfo?.name ? `(${discountInfo.name})` : ''}
                                        </Text>
                                        <Text style={styles.discountValue}>-${discountAmount.toFixed(2)}</Text>
                                    </View>
                                )}

                                <View style={styles.summaryDivider} />

                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryTotalLabel}>Total</Text>
                                    <Text style={styles.summaryTotalValue}>${(total || finalTotal).toFixed(2)}</Text>
                                </View>
                            </View>

                            {/* Lista de productos */}
                            {cartItems.length > 0 && (
                                <View style={styles.itemsSection}>
                                    <Text style={styles.itemsSectionTitle}>
                                        Productos ({cartItems.length} {cartItems.length === 1 ? 'artículo' : 'artículos'})
                                    </Text>

                                    <View style={styles.itemsList}>
                                        {cartItems.map((item, index) => (
                                            <View key={item.id || index} style={styles.itemCard}>
                                                <View style={styles.itemInfo}>
                                                    <Text style={styles.itemName} numberOfLines={2}>
                                                        {item.name}
                                                    </Text>
                                                    <Text style={styles.itemDetails}>
                                                        Cantidad: {item.quantity} • Precio: ${item.price.toFixed(2)}
                                                    </Text>
                                                </View>
                                                <Text style={styles.itemTotalPrice}>
                                                    ${(item.price * item.quantity).toFixed(2)}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )}

                            {/* Badge de descuento */}
                            {discountApplied && discountInfo && (
                                <View style={styles.discountBadge}>
                                    <Icon name="check-circle" size={16} color="#10b981" />
                                    <View style={styles.discountBadgeText}>
                                        <Text style={styles.discountBadgeTitle}>¡Descuento aplicado!</Text>
                                        <Text style={styles.discountBadgeSubtitle}>
                                            {discountInfo.name} - Código: {discountInfo.code}
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    </ScrollView>

                    {/* Footer del modal */}
                    <View style={styles.summaryModalFooter}>
                        <TouchableOpacity
                            style={styles.summaryModalCloseButtonFull}
                            onPress={onClose}
                        >
                            <Text style={styles.summaryModalCloseButtonText}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

// Botón flotante para mostrar el resumen
const FloatingSummaryButton = ({ onPress, total, itemCount }) => {
    const [scaleAnim] = useState(new Animated.Value(1));

    const handlePress = () => {
        // Animación de "bounce" al presionar
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();

        onPress();
    };

    return (
        <Animated.View style={[styles.floatingButton, { transform: [{ scale: scaleAnim }] }]}>
            <TouchableOpacity
                style={styles.floatingButtonContent}
                onPress={handlePress}
                activeOpacity={0.8}
            >
                <View style={styles.floatingButtonLeft}>
                    <Icon name="receipt" size={20} color="#fff" />
                    <Text style={styles.floatingButtonText}>Ver resumen</Text>
                </View>
                <View style={styles.floatingButtonRight}>
                    <Text style={styles.floatingButtonTotal}>${total.toFixed(2)}</Text>
                    <Text style={styles.floatingButtonItems}>
                        {itemCount} {itemCount === 1 ? 'artículo' : 'artículos'}
                    </Text>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

// Componente Modal de éxito
const SuccessModal = ({ visible, orderData, onContinueShopping }) => {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            statusBarTranslucent={true}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.successIcon}>
                        <Icon name="check-circle" size={60} color="#10b981" />
                    </View>

                    <Text style={styles.modalTitle}>¡Pedido Realizado!</Text>
                    <Text style={styles.modalMessage}>
                        Tu pedido ha sido procesado exitosamente.
                    </Text>

                    {orderData && (
                        <View style={styles.orderDetails}>
                            <Text style={styles.orderIdLabel}>Número de pedido:</Text>
                            <Text style={styles.orderIdValue}>{orderData.orderId}</Text>

                            <View style={styles.orderSummary}>
                                <View style={styles.orderSummaryRow}>
                                    <Text style={styles.orderSummaryLabel}>Total pagado:</Text>
                                    <Text style={styles.orderSummaryValue}>
                                        ${orderData.total?.toFixed(2)}
                                    </Text>
                                </View>
                                <View style={styles.orderSummaryRow}>
                                    <Text style={styles.orderSummaryLabel}>Método de pago:</Text>
                                    <Text style={styles.orderSummaryValue}>
                                        {orderData.paymentType}
                                    </Text>
                                </View>
                                {orderData.discountUsed && (
                                    <View style={styles.orderSummaryRow}>
                                        <Text style={styles.orderSummaryDiscountLabel}>Descuento aplicado:</Text>
                                        <Text style={styles.orderSummaryDiscountValue}>
                                            -${orderData.discountAmount?.toFixed(2)}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    )}

                    <Text style={styles.modalNote}>
                        Recibirás una confirmación por correo electrónico con los detalles de tu pedido.
                    </Text>

                    <TouchableOpacity
                        style={styles.modalButton}
                        onPress={onContinueShopping}
                    >
                        <Text style={styles.modalButtonText}>Seguir Comprando</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const PaymentProcessScreen = ({ navigation, route }) => {
    const { user, isAuthenticated } = useAuth();
    const {
        clearCartAfterPurchase,
        getActiveCart
    } = useCart();

    // NUEVO: Hook para manejar alertas personalizadas
    const {
        alertState,
        showError,
        showSuccess,
        showConfirmation,
        hideAlert,
        hideConfirmation,
        showLoading,
        hideLoading,
        showSuccessToast,
        hideToast
    } = useAlert();

    // Estados principales
    const [currentStep, setCurrentStep] = useState(1);
    const [error, setError] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Estados para el modal de éxito
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [orderSuccessData, setOrderSuccessData] = useState(null);

    // NUEVO: Estado para el modal de resumen
    const [showSummaryModal, setShowSummaryModal] = useState(false);

    // Estados para los datos del pedido
    const [orderData, setOrderData] = useState({
        cartItems: [],
        cartTotal: 0,
        originalSubtotal: 0,
        discountApplied: false,
        discountAmount: 0,
        discountInfo: null,
        shippingInfo: {
            receiverName: '',
            receiverPhone: '',
            deliveryAddress: '',
            deliveryPoint: '',
            deliveryDate: null
        },
        paymentInfo: {
            paymentType: '',
            paymentProofImage: null
        },
    });

    // Manejar el botón back de Android
    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            handleBackPress
        );

        return () => backHandler.remove();
    }, [currentStep]);

    // Verificar autenticación y obtener datos del carrito
    useEffect(() => {
        if (!isAuthenticated) {
            navigation.navigate('Login');
            return;
        }

        // Obtener datos del carrito desde route params (desde ShoppingCart)
        const checkoutData = route.params;

        if (!checkoutData) {
            // REEMPLAZADO: Alert nativo por alerta personalizada
            showError(
                'No se encontraron datos del carrito',
                'Error',
                () => navigation.navigate('ShoppingCart')
            );
            return;
        }

        console.log('Datos del carrito recibidos en PaymentProcess:', checkoutData);

        // Actualizar orderData con la información del carrito
        setOrderData(prev => ({
            ...prev,
            cartItems: checkoutData.cartItems || [],
            cartTotal: checkoutData.total || 0,
            originalSubtotal: checkoutData.subtotal || 0,
            discountApplied: checkoutData.discountApplied || false,
            discountAmount: checkoutData.discountAmount || 0,
            discountInfo: checkoutData.discountInfo || null
        }));

    }, [isAuthenticated, route.params, navigation]);

    const handleBackPress = () => {
        if (currentStep > 1) {
            handlePrevStep();
            return true;
        }

        // REEMPLAZADO: Alert nativo por confirmación personalizada
        showConfirmation({
            title: 'Confirmar',
            message: '¿Estás seguro de que quieres salir del proceso de pago?',
            onConfirm: () => {
                hideConfirmation();
                navigation.navigate('ShoppingCart');
            },
            onCancel: () => hideConfirmation(),
            confirmText: 'Salir',
            cancelText: 'Cancelar',
            isDangerous: true
        });
        return true;
    };

    const handleNextStep = () => {
        setCurrentStep(prev => Math.min(prev + 1, 3));
        setError(null);
    };

    const handlePrevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => Math.max(prev - 1, 1));
            setError(null);
        } else {
            navigation.navigate('ShoppingCart');
        }
    };

    const handleShippingInfoUpdate = (shippingData) => {
        // Procesar la fecha antes de guardarla
        let processedShippingData = { ...shippingData };

        if (shippingData.deliveryDate) {
            // Si viene como string, asegurar que sea válida
            if (typeof shippingData.deliveryDate === 'string') {
                const dateTest = new Date(shippingData.deliveryDate);
                if (!isNaN(dateTest.getTime())) {
                    processedShippingData.deliveryDate = shippingData.deliveryDate;
                } else {
                    console.warn('Fecha inválida recibida:', shippingData.deliveryDate);
                    processedShippingData.deliveryDate = null;
                }
            } else if (shippingData.deliveryDate instanceof Date) {
                // Si es Date, convertir a string ISO
                processedShippingData.deliveryDate = shippingData.deliveryDate.toISOString().split('T')[0];
            }
        }

        setOrderData(prev => ({
            ...prev,
            shippingInfo: {
                ...prev.shippingInfo,
                ...processedShippingData
            }
        }));
        console.log('Información de envío actualizada:', processedShippingData);
    };

    const handlePaymentInfoUpdate = (paymentData) => {
        setOrderData(prev => ({
            ...prev,
            paymentInfo: {
                ...prev.paymentInfo,
                ...paymentData
            }
        }));
        console.log('Información de pago actualizada:', paymentData);
    };

    // Función para crear la venta en el backend
    const createSale = async (saleData) => {
        try {
            const formData = new FormData();

            // Agregar campos requeridos
            formData.append('paymentType', saleData.paymentType);
            formData.append('deliveryAddress', saleData.deliveryAddress);
            formData.append('receiverName', saleData.receiverName);
            formData.append('receiverPhone', saleData.receiverPhone);
            formData.append('deliveryPoint', saleData.deliveryPoint);
            formData.append('deliveryDate', saleData.deliveryDate);
            formData.append('ShoppingCartId', saleData.ShoppingCartId);

            // CORREGIDO: Manejar imagen de comprobante para React Native
            if (saleData.paymentProofImage && saleData.paymentProofImage.uri) {
                // Crear el objeto de archivo compatible con FormData en React Native
                const imageFile = {
                    uri: saleData.paymentProofImage.uri,
                    type: saleData.paymentProofImage.mimeType || 'image/jpeg',
                    name: saleData.paymentProofImage.fileName || 'payment_proof.jpg'
                };

                formData.append('paymentProofImage', imageFile);
                console.log('Imagen agregada a FormData:', {
                    uri: imageFile.uri,
                    type: imageFile.type,
                    name: imageFile.name
                });
            }

            console.log('Enviando FormData al servidor...');

            const response = await fetch('https://marquesa.onrender.com/api/sales', {
                method: 'POST',
                credentials: 'include',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                }
            });

            const data = await response.json();

            if (response.ok && data.success) {
                return { success: true, data: data.data };
            } else {
                throw new Error(data.message || 'Error al crear la venta');
            }
        } catch (error) {
            console.error('Error creando venta:', error);
            return {
                success: false,
                message: error.message || 'Error al procesar el pedido'
            };
        }
    };

    const handleConfirmOrder = async () => {
        try {
            // REEMPLAZADO: setIsProcessing por loading personalizado
            showLoading({
                title: 'Procesando pedido...',
                message: 'Por favor espera mientras procesamos tu pedido'
            });
            setError(null);

            console.log('Confirmando orden...');

            // Validar información de envío
            if (!orderData.shippingInfo.receiverName ||
                !orderData.shippingInfo.receiverPhone ||
                !orderData.shippingInfo.deliveryAddress ||
                !orderData.shippingInfo.deliveryPoint ||
                !orderData.shippingInfo.deliveryDate) {
                hideLoading();
                showError('Faltan datos de envío requeridos');
                return;
            }

            // Validar información de pago
            if (!orderData.paymentInfo.paymentType) {
                hideLoading();
                showError('Falta seleccionar método de pago');
                return;
            }

            // Obtener el ShoppingCartId del usuario actual
            const cartResponse = await fetch(`https://marquesa.onrender.com/api/shoppingCart/client/${user.id}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const cartData = await cartResponse.json();

            if (!cartResponse.ok || !cartData.success || !cartData.shoppingCart) {
                hideLoading();
                showError('Error al obtener información del carrito');
                return;
            }

            // Preparar datos para crear la venta
            const saleData = {
                paymentType: orderData.paymentInfo.paymentType,
                deliveryAddress: orderData.shippingInfo.deliveryAddress,
                receiverName: orderData.shippingInfo.receiverName,
                receiverPhone: orderData.shippingInfo.receiverPhone,
                deliveryPoint: orderData.shippingInfo.deliveryPoint,
                deliveryDate: orderData.shippingInfo.deliveryDate,
                ShoppingCartId: cartData.shoppingCart._id,
                paymentProofImage: orderData.paymentInfo.paymentProofImage
            };

            console.log('Datos de venta a enviar:', saleData);

            // Crear la venta
            const result = await createSale(saleData);

            if (result.success) {
                console.log('Venta creada exitosamente:', result.data);

                // Manejar descuento si está aplicado
                if (orderData.discountApplied && orderData.discountAmount > 0) {
                    try {
                        console.log('Procesando descuento aplicado');
                        // Aquí puedes agregar la lógica para marcar el descuento como usado
                        // según tu implementación de backend
                    } catch (discountError) {
                        console.error('Error al marcar descuento como usado:', discountError);
                    }
                }

                // Limpiar carrito
                const clearResult = await clearCartAfterPurchase(cartData.shoppingCart._id);

                if (clearResult?.success) {
                    console.log('Carrito limpiado exitosamente');
                } else {
                    console.warn('No se pudo limpiar el carrito, pero la compra fue exitosa');
                }

                hideLoading();

                // Mostrar modal de éxito
                setOrderSuccessData({
                    orderId: result.data.sale._id,
                    total: orderData.cartTotal,
                    paymentType: result.data.sale.paymentType,
                    discountUsed: orderData.discountApplied,
                    discountAmount: orderData.discountAmount
                });
                setShowSuccessModal(true);

            } else {
                hideLoading();
                showError(result.message || 'Error al procesar el pedido');
            }

        } catch (error) {
            console.error('Error al confirmar pedido:', error);
            hideLoading();
            showError('Error inesperado al procesar el pedido');
        }
    };

    const handleContinueShopping = () => {
        setShowSuccessModal(false);

        // Refrescar carrito si es necesario
        if (getActiveCart) {
            getActiveCart(true);
        }

        // Mostrar toast de éxito
        showSuccessToast('¡Compra realizada exitosamente!');

        // Navegar de vuelta al TabNavigator y específicamente al tab Home
        navigation.reset({
            index: 0,
            routes: [
                {
                    name: 'TabNavigator', // Nombre correcto según tu Navigation.js
                    state: {
                        routes: [{ name: 'Home' }],
                        index: 0,
                    }
                }
            ],
        });
    };

    // Renderizar contenido según el paso actual
    const renderCurrentStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <ShippingInfoMobile
                        onNext={handleNextStep}
                        onShippingInfoUpdate={handleShippingInfoUpdate}
                        userInfo={user}
                        initialData={{
                            ...orderData.shippingInfo,
                            // Asegurar que deliveryDate sea Date si existe
                            deliveryDate: orderData.shippingInfo.deliveryDate
                                ? (typeof orderData.shippingInfo.deliveryDate === 'string'
                                    ? new Date(orderData.shippingInfo.deliveryDate)
                                    : orderData.shippingInfo.deliveryDate)
                                : null
                        }}
                    />
                );
            case 2:
                return (
                    <PaymentMethodStep
                        onNext={handleNextStep}
                        onBack={handlePrevStep}
                        onPaymentInfoUpdate={handlePaymentInfoUpdate}
                        initialData={orderData.paymentInfo}
                    />
                );
            case 3:
                return (
                    <OrderReviewStep
                        onBack={handlePrevStep}
                        onConfirm={handleConfirmOrder}
                        orderData={orderData}
                        isProcessing={isProcessing}
                    />
                );
            default:
                return null;
        }
    };

    if (!isAuthenticated) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4A4170" />
                    <Text style={styles.loadingText}>Verificando autenticación...</Text>
                </View>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                        <Image source={backIcon} style={styles.backIcon} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Proceso de Pago</Text>
                    <View style={styles.headerSpacer} />
                </View>

                {/* Mostrar error si existe */}
                {error && (
                    <View style={styles.errorContainer}>
                        <Icon name="error-outline" size={20} color="#e74c3c" />
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity onPress={() => setError(null)}>
                            <Icon name="close" size={20} color="#e74c3c" />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Progress Steps */}
                <ProgressSteps currentStep={currentStep} />

                {/* Contenido principal simplificado - solo el step actual */}
                <View style={styles.mainContentContainer}>
                    <ScrollView
                        style={styles.mainScrollContainer}
                        contentContainerStyle={styles.mainScrollContent}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        {renderCurrentStep()}
                    </ScrollView>
                </View>

                {/* Botón flotante para mostrar resumen */}
                <FloatingSummaryButton
                    onPress={() => setShowSummaryModal(true)}
                    total={orderData.cartTotal}
                    itemCount={orderData.cartItems.length}
                />

                {/* Modal de resumen del pedido */}
                <PaymentOrderSummaryModal
                    visible={showSummaryModal}
                    onClose={() => setShowSummaryModal(false)}
                    subtotal={orderData.originalSubtotal}
                    total={orderData.cartTotal}
                    discountApplied={orderData.discountApplied}
                    discountAmount={orderData.discountAmount}
                    discountInfo={orderData.discountInfo}
                    cartItems={orderData.cartItems}
                />

                {/* Modal de éxito */}
                <SuccessModal
                    visible={showSuccessModal}
                    orderData={orderSuccessData}
                    onContinueShopping={handleContinueShopping}
                />

                {/* Alertas personalizadas */}
                <CustomAlert
                    visible={alertState.basicAlert.visible}
                    title={alertState.basicAlert.title}
                    message={alertState.basicAlert.message}
                    type={alertState.basicAlert.type}
                    onConfirm={alertState.basicAlert.onConfirm}
                    onCancel={alertState.basicAlert.onCancel}
                    confirmText={alertState.basicAlert.confirmText}
                    cancelText={alertState.basicAlert.cancelText}
                    showCancel={alertState.basicAlert.showCancel}
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
                    onConfirm={alertState.confirmation.onConfirm}
                    onCancel={alertState.confirmation.onCancel}
                    confirmText={alertState.confirmation.confirmText}
                    cancelText={alertState.confirmation.cancelText}
                    isDangerous={alertState.confirmation.isDangerous}
                />

                <ToastDialog
                    visible={alertState.toast.visible}
                    message={alertState.toast.message}
                    type={alertState.toast.type}
                    duration={alertState.toast.duration}
                    onHide={hideToast}
                />
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 25,
        backgroundColor: '#fff',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        zIndex: 1,
    },
    backButton: {
        padding: 4,
        marginTop: 15,
    },
    backIcon: {
        width: 24,
        height: 24,
        resizeMode: 'contain'
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginTop: 15,
        fontFamily: 'Poppins-SemiBold',
    },
    headerSpacer: {
        width: 32
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffebee',
        padding: 12,
        marginHorizontal: 16,
        borderRadius: 8,
        marginBottom: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#e74c3c',
    },
    errorText: {
        flex: 1,
        fontSize: 14,
        color: '#e74c3c',
        marginLeft: 8,
        fontFamily: 'Poppins-Regular',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
        marginTop: 16,
        fontFamily: 'Poppins-Regular',
    },

    // Progress Steps Styles
    progressContainer: {
        backgroundColor: '#fff',
        paddingVertical: 20,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    progressTitle: {
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 20,
        color: '#333',
        fontFamily: 'Poppins-Bold',
    },
    stepsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        left: 5,
    },
    stepWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stepItem: {
        alignItems: 'center',
    },
    stepCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepCompleted: {
        backgroundColor: '#10b981',
    },
    stepActive: {
        backgroundColor: '#FDB4B7',
    },
    stepInactive: {
        backgroundColor: '#d1d5db',
    },
    stepText: {
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'Poppins-SemiBold',
    },
    stepTextActive: {
        color: '#fff',
    },
    stepTextInactive: {
        color: '#6b7280',
    },
    stepTitle: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 8,
        fontFamily: 'Poppins-Regular',
    },
    stepConnector: {
        width: 40,
        height: 2,
        marginHorizontal: 8,
        marginTop: -28,
    },
    connectorCompleted: {
        backgroundColor: '#10b981',
    },
    connectorInactive: {
        backgroundColor: '#d1d5db',
    },

    // Layout principal simplificado
    mainContentContainer: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        paddingBottom: 100, // Espacio para el botón flotante
    },
    mainScrollContainer: {
        flex: 1,
    },
    mainScrollContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 16,
        flexGrow: 1,
    },

    // Floating Button Styles
    floatingButton: {
        position: 'absolute',
        bottom: 20,
        left: 16,
        right: 16,
        zIndex: 10,
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
    },
    floatingButtonContent: {
        backgroundColor: '#FDB4B7',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 56,
    },
    floatingButtonLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    floatingButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
        fontFamily: 'Poppins-SemiBold',
    },
    floatingButtonRight: {
        alignItems: 'flex-end',
    },
    floatingButtonTotal: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        fontFamily: 'Poppins-Bold',
    },
    floatingButtonItems: {
        color: '#fff',
        fontSize: 12,
        opacity: 0.9,
        fontFamily: 'Poppins-Regular',
    },

    // Summary Modal Styles
    summaryModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    summaryModalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: SCREEN_HEIGHT * 0.85,
        minHeight: SCREEN_HEIGHT * 0.6,
    },
    summaryModalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    summaryModalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        fontFamily: 'Poppins-SemiBold',
    },
    summaryModalCloseButton: {
        padding: 4,
    },
    summaryModalScrollContent: {
        flex: 1,
    },
    summaryModalBody: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    summarySection: {
        marginBottom: 24,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 6,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#666',
        fontFamily: 'Poppins-Regular',
    },
    summaryValue: {
        fontSize: 14,
        color: '#333',
        fontFamily: 'Poppins-Regular',
    },
    discountLabel: {
        fontSize: 14,
        color: '#10b981',
        fontFamily: 'Poppins-Medium',
    },
    discountValue: {
        fontSize: 14,
        color: '#10b981',
        fontWeight: '700',
        fontFamily: 'Poppins-Bold',
    },
    summaryDivider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginVertical: 12,
    },
    summaryTotalLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#4A4170',
        fontFamily: 'Poppins-Bold',
    },
    summaryTotalValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#4A4170',
        fontFamily: 'Poppins-Bold',
    },
    itemsSection: {
        marginBottom: 24,
    },
    itemsSectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
        fontFamily: 'Poppins-SemiBold',
    },
    itemsList: {
        gap: 12,
    },
    itemCard: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
    itemInfo: {
        flex: 1,
        marginRight: 12,
    },
    itemName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        marginBottom: 4,
        fontFamily: 'Poppins-Medium',
    },
    itemDetails: {
        fontSize: 12,
        color: '#666',
        fontFamily: 'Poppins-Regular',
    },
    itemTotalPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        fontFamily: 'Poppins-SemiBold',
    },
    discountBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0fdf4',
        borderRadius: 8,
        padding: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#10b981',
    },
    discountBadgeText: {
        marginLeft: 8,
        flex: 1,
    },
    discountBadgeTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#15803d',
        fontFamily: 'Poppins-SemiBold',
    },
    discountBadgeSubtitle: {
        fontSize: 10,
        color: '#16a34a',
        fontFamily: 'Poppins-Regular',
    },
    summaryModalFooter: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    summaryModalCloseButtonFull: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    summaryModalCloseButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '500',
        fontFamily: 'Poppins-Medium',
    },
    stepTitle: {
        fontSize: SCREEN_WIDTH < 400 ? 18 : 20,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        fontFamily: 'Poppins-SemiBold',
    },
    // Success Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: SCREEN_WIDTH < 400 ? 20 : 24,
        width: '100%',
        maxWidth: SCREEN_WIDTH < 400 ? 350 : 400,
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        maxHeight: SCREEN_HEIGHT * 0.8,
    },
    successIcon: {
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: SCREEN_WIDTH < 400 ? 20 : 24,
        fontWeight: '700',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
        fontFamily: 'Poppins-Bold',
    },
    modalMessage: {
        fontSize: SCREEN_WIDTH < 400 ? 14 : 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
        fontFamily: 'Poppins-Regular',
    },
    orderDetails: {
        width: '100%',
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: SCREEN_WIDTH < 400 ? 12 : 16,
        marginBottom: 16,
    },
    orderIdLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
        fontFamily: 'Poppins-Regular',
    },
    orderIdValue: {
        fontSize: SCREEN_WIDTH < 400 ? 12 : 14,
        fontWeight: '600',
        color: '#333',
        fontFamily: 'Poppins-SemiBold',
        marginBottom: 16,
    },
    orderSummary: {
        gap: 8,
    },
    orderSummaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    orderSummaryLabel: {
        fontSize: 12,
        color: '#666',
        fontFamily: 'Poppins-Regular',
        flex: 1,
    },
    orderSummaryValue: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333',
        fontFamily: 'Poppins-SemiBold',
    },
    orderSummaryDiscountLabel: {
        fontSize: 12,
        color: '#10b981',
        fontFamily: 'Poppins-Regular',
        flex: 1,
    },
    orderSummaryDiscountValue: {
        fontSize: 12,
        fontWeight: '600',
        color: '#10b981',
        fontFamily: 'Poppins-SemiBold',
    },
    modalNote: {
        fontSize: SCREEN_WIDTH < 400 ? 11 : 12,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
        fontFamily: 'Poppins-Regular',
        lineHeight: 16,
    },
    modalButton: {
        backgroundColor: '#FDB4B7',
        borderRadius: 8,
        paddingVertical: SCREEN_WIDTH < 400 ? 12 : 14,
        paddingHorizontal: 32,
        width: '100%',
        alignItems: 'center',
        minHeight: 48,
        justifyContent: 'center',
    },
    modalButtonText: {
        color: '#fff',
        fontSize: SCREEN_WIDTH < 400 ? 14 : 16,
        fontWeight: '600',
        fontFamily: 'Poppins-SemiBold',
    },
});

export default PaymentProcessScreen;