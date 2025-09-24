// frontendMovil/src/components/ResultModalMobile.js
import React, { useEffect, useRef } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    Animated,
    Dimensions,
    StyleSheet,
    StatusBar
} from 'react-native';

const { width, height } = Dimensions.get('window');

/**
 * Modal de resultado para mostrar el código de descuento obtenido
 * Adaptado de la versión web con animaciones nativas para móvil
 */
export default function ResultModalMobile({
    isOpen,
    selectedCode,
    onClose,
    onCopyCode
}) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.5)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    /**
     * Efecto para animar la entrada del modal
     */
    useEffect(() => {
        if (isOpen) {
            console.log('🎉 Mostrando modal de resultado');
            
            // Resetear valores
            fadeAnim.setValue(0);
            scaleAnim.setValue(0.5);
            slideAnim.setValue(50);

            // Animación de entrada
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 50,
                    friction: 7,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 400,
                    useNativeDriver: true,
                })
            ]).start();
        }
    }, [isOpen, fadeAnim, scaleAnim, slideAnim]);

    /**
     * Función para cerrar el modal con animación
     */
    const handleClose = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 0.5,
                duration: 250,
                useNativeDriver: true,
            })
        ]).start(() => {
            if (onClose) {
                onClose();
            }
        });
    };

    /**
     * Función para copiar código con feedback visual
     */
    const handleCopyCode = async () => {
        if (selectedCode?.code && onCopyCode) {
            const success = await onCopyCode(selectedCode.code);
            
            if (success) {
                // Aquí podrías agregar un toast o feedback visual
                console.log('✅ Código copiado exitosamente');
            }
        }
    };

    /**
     * Formatear fecha de expiración
     */
    const formatExpiryDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        } catch (error) {
            return 'Fecha no válida';
        }
    };

    if (!selectedCode) {
        return null;
    }

    return (
        <Modal
            visible={isOpen}
            transparent={true}
            animationType="none"
            statusBarTranslucent={true}
            onRequestClose={handleClose}
        >
            <StatusBar backgroundColor="rgba(0, 0, 0, 0.5)" barStyle="light-content" />
            
            {/* Overlay con animación de fade */}
            <Animated.View 
                style={[
                    styles.overlay,
                    { opacity: fadeAnim }
                ]}
            >
                {/* Contenedor principal del modal */}
                <Animated.View
                    style={[
                        styles.modalContainer,
                        {
                            transform: [
                                { scale: scaleAnim },
                                { translateY: slideAnim }
                            ]
                        }
                    ]}
                >
                    {/* Header del modal */}
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>¡Felicidades! 🎉</Text>
                        <Text style={styles.modalSubtitle}>Has obtenido un código de descuento</Text>
                    </View>

                    {/* Tarjeta del código con colores dinámicos */}
                    <View 
                        style={[
                            styles.codeCard,
                            { backgroundColor: selectedCode.color || '#F9FAFB' }
                        ]}
                    >
                        {/* Nombre del descuento */}
                        <Text 
                            style={[
                                styles.codeName,
                                { color: selectedCode.textColor || '#374151' }
                            ]}
                        >
                            {selectedCode.name}
                        </Text>

                        {/* Badge de descuento */}
                        <View style={styles.discountBadge}>
                            <Text style={styles.discountText}>
                                {selectedCode.discount}
                            </Text>
                        </View>

                        {/* Código de descuento */}
                        <View style={styles.codeContainer}>
                            <Text style={styles.codeLabel}>Tu código:</Text>
                            <TouchableOpacity 
                                style={styles.codeButton}
                                onPress={handleCopyCode}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.codeValue}>
                                    {selectedCode.code}
                                </Text>
                                <Text style={styles.copyHint}>
                                    Toca para copiar
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Fecha de expiración */}
                        {selectedCode.expiresAt && (
                            <View style={styles.expiryContainer}>
                                <Text 
                                    style={[
                                        styles.expiryLabel,
                                        { color: selectedCode.textColor || '#6B7280' }
                                    ]}
                                >
                                    Válido hasta:
                                </Text>
                                <Text 
                                    style={[
                                        styles.expiryDate,
                                        { color: selectedCode.textColor || '#374151' }
                                    ]}
                                >
                                    {formatExpiryDate(selectedCode.expiresAt)}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Botones de acción */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={handleClose}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.secondaryButtonText}>
                                Ver mis códigos
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Botón de cerrar (X) */}
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={handleClose}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        maxHeight: height * 0.8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.25,
        shadowRadius: 25,
        elevation: 15,
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 24,
        fontFamily: 'Poppins-SemiBold',
        color: '#1F2937',
        textAlign: 'center',
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        color: '#6B7280',
        textAlign: 'center',
    },
    codeCard: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 24,
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    codeName: {
        fontSize: 20,
        fontFamily: 'Poppins-Bold',
        textAlign: 'center',
        marginBottom: 16,
    },
    discountBadge: {
        backgroundColor: '#E8ACD2',
        borderRadius: 50,
        paddingVertical: 8,
        paddingHorizontal: 20,
        alignSelf: 'center',
        marginBottom: 20,
    },
    discountText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontFamily: 'Poppins-Bold',
        textAlign: 'center',
    },
    codeContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    codeLabel: {
        fontSize: 14,
        fontFamily: 'Poppins-Medium',
        color: '#6B7280',
        marginBottom: 8,
    },
    codeButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderWidth: 2,
        borderColor: 'rgba(0, 0, 0, 0.1)',
        alignItems: 'center',
    },
    codeValue: {
        fontSize: 20,
        fontFamily: 'Poppins-Bold',
        color: '#1F2937',
        letterSpacing: 2,
    },
    copyHint: {
        fontSize: 12,
        fontFamily: 'Poppins-Regular',
        color: '#9CA3AF',
        marginTop: 4,
    },
    expiryContainer: {
        alignItems: 'center',
    },
    expiryLabel: {
        fontSize: 12,
        fontFamily: 'Poppins-Medium',
        marginBottom: 4,
    },
    expiryDate: {
        fontSize: 14,
        fontFamily: 'Poppins-SemiBold',
    },
    buttonContainer: {
        gap: 12,
    },
    primaryButton: {
        backgroundColor: '#E8ACD2',
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    secondaryButtonText: {
        color: '#6B7280',
        fontSize: 14,
        fontFamily: 'Poppins-Medium',
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeButtonText: {
        color: '#6B7280',
        fontSize: 18,
        fontFamily: 'Poppins-Medium',
    },
});