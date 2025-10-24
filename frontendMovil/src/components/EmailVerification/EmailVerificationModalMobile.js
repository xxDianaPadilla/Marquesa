import React, { useState, useEffect, useRef } from 'react';
import { 
    View, 
    Text, 
    Modal, 
    TouchableOpacity, 
    StyleSheet, 
    ActivityIndicator, 
    Dimensions, 
    Platform,
    ScrollView,
    KeyboardAvoidingView,
    Keyboard
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CodeInputMobile from './CodeInputMobile';
import { useEmailVerificationMobile } from '../../hooks/useEmailVerificationMobile';

// Obtener dimensiones de la pantalla para responsive design
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Modal para el proceso completo de verificación de email en móvil
// Maneja tres estados del proceso:
// 1. 'sending' - Enviando código de verificación
// 2. 'code' - Esperando que el usuario ingrese el código
// 3. 'verifying' - Verificando código y completando registro
const EmailVerificationModalMobile = ({ 
    isVisible, 
    onClose, 
    email, 
    fullName, 
    userData,
    onSuccess,
    onError
}) => {
    // Estados del modal
    const [step, setStep] = useState('sending');
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [resendTimer, setResendTimer] = useState(0);
    const [cooldownTimer, setCooldownTimer] = useState(0);
    
    // Estado para detectar si el teclado está visible
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    
    // Referencias
    const codeInputRef = useRef();

    // Hook personalizado para verificación de email
    const { requestEmailVerification, verifyEmailAndRegister, isLoading } = useEmailVerificationMobile();

    // Calcular dimensiones responsive del modal
    const getModalDimensions = () => {
        const isSmallScreen = screenWidth < 350;
        
        return {
            maxWidth: isSmallScreen ? screenWidth - 30 : Math.min(400, screenWidth - 40),
            horizontalPadding: isSmallScreen ? 15 : 20,
            contentPadding: isSmallScreen ? 20 : 24,
        };
    };

    const modalDimensions = getModalDimensions();

    // Efecto para enviar automáticamente el código cuando se abre el modal
    useEffect(() => {
        if (isVisible && email) {
            console.log('Modal abierto, enviando código de verificación...');
            sendVerificationCode();
        }
    }, [isVisible, email]);

    // Efecto para manejar la cuenta regresiva del botón de reenvío
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    // Efecto para manejar el cooldown de 10 minutos
    useEffect(() => {
        if (cooldownTimer > 0) {
            const timer = setTimeout(() => setCooldownTimer(cooldownTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldownTimer]);

    // Efecto para detectar cuando el teclado se muestra u oculta
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                setIsKeyboardVisible(true);
            }
        );

        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                setIsKeyboardVisible(false);
            }
        );

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    // Función para formatear tiempo en MM:SS
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // Envía o reenvía el código de verificación al email del usuario
    const sendVerificationCode = async () => {
        console.log('Enviando código de verificación...');
        setStep('sending');
        setError('');
        
        const result = await requestEmailVerification(email, fullName);
        
        if (result.success) {
            console.log('Código enviado exitosamente');
            setStep('code');
            setResendTimer(60);
            setCooldownTimer(600); // 10 minutos en segundos
            setCode('');
            
            if (codeInputRef.current) {
                codeInputRef.current.resetCode();
            }
        } else {
            console.log('Error al enviar código:', result.message);
            
            // Si el correo ya está registrado, cerrar modal y mostrar error externo
            if (result.message.includes('ya está registrado')) {
                handleClose();
                if (onError) {
                    onError(result.message);
                }
                return;
            }
            
            // Si es el error de cooldown, manejar internamente
            if (result.message.includes('Ya se envió un código recientemente')) {
                setError(result.message);
                setStep('code');
                setCooldownTimer(600); // Activar cooldown de 10 minutos
                return;
            }
            
            // Otros errores
            setError(result.message);
            setStep('code');
        }
    };

    // Maneja los cambios en el código ingresado por el usuario
    const handleCodeChange = (newCode) => {
        setCode(newCode);
        setError('');
    };

    // Se ejecuta cuando el usuario completa el código de 6 dígitos
    const handleCodeComplete = async (completeCode) => {
        console.log('Código completo ingresado, iniciando verificación...');
        setStep('verifying');
        setError('');

        const result = await verifyEmailAndRegister(email, completeCode, userData);

        if (result.success) {
            console.log('Verificación exitosa');
            onSuccess();
        } else {
            console.log('Verificación fallida:', result.message);
            setError(result.message);
            setStep('code');
            setCode('');
            
            if (codeInputRef.current) {
                codeInputRef.current.resetCode();
            }
        }
    };

    // Maneja el reenvío manual del código de verificación
    const handleResendCode = async () => {
        if (resendTimer > 0 || cooldownTimer > 0) {
            console.log('Reenvío bloqueado por timer');
            return;
        }
        
        console.log('Reenviando código de verificación...');
        await sendVerificationCode();
    };

    // Maneja el cierre del modal
    const handleClose = () => {
        if (!isLoading) {
            console.log('Cerrando modal de verificación');
            setStep('sending');
            setCode('');
            setError('');
            setResendTimer(0);
            setCooldownTimer(0);
            setIsKeyboardVisible(false);
            onClose();
        }
    };

    if (!isVisible) return null;

    return (
        <Modal
            visible={isVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                style={styles.overlay}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <View style={[
                    styles.modalWrapper,
                    isKeyboardVisible && styles.modalWrapperFocused
                ]}>
                    <View style={[
                        styles.modalContainer, 
                        { 
                            maxWidth: modalDimensions.maxWidth,
                        }
                    ]}>
                        
                        {/* Header del modal */}
                        <View style={[styles.header, { paddingHorizontal: modalDimensions.contentPadding }]}>
                            <View style={styles.headerContent}>
                                <View style={styles.iconContainer}>
                                    <Icon name="email" size={screenWidth < 350 ? 20 : 24} color="#FFFFFF" />
                                </View>
                                <Text style={[
                                    styles.title, 
                                    { fontSize: screenWidth < 350 ? 16 : 18 }
                                ]}>
                                    Verificar email
                                </Text>
                            </View>
                            
                            {!isLoading && (
                                <TouchableOpacity
                                    onPress={handleClose}
                                    style={styles.closeButton}
                                >
                                    <Icon name="close" size={screenWidth < 350 ? 20 : 24} color="#666666" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* ScrollView para permitir scroll del contenido cuando aparece el teclado */}
                        <ScrollView
                            style={styles.scrollView}
                            contentContainerStyle={[styles.scrollContent, { paddingHorizontal: modalDimensions.contentPadding }]}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            {/* Contenido dinámico según el estado */}
                            
                            {/* Estado: Enviando código */}
                            {step === 'sending' && (
                                <View style={styles.centerContent}>
                                    <View style={styles.loadingContainer}>
                                        <View style={styles.spinnerContainer}>
                                            <ActivityIndicator 
                                                size={screenWidth < 350 ? "default" : "large"} 
                                                color="#FDB4B7" 
                                            />
                                            <View style={[
                                                styles.pulseCircle,
                                                screenWidth < 350 && styles.pulseCircleSmall
                                            ]} />
                                        </View>
                                    </View>
                                    
                                    <Text style={[
                                        styles.stepTitle,
                                        { fontSize: screenWidth < 350 ? 18 : 20 }
                                    ]}>
                                        Enviando correo...
                                    </Text>
                                    <Text style={[
                                        styles.stepDescription,
                                        { fontSize: screenWidth < 350 ? 13 : 14 }
                                    ]}>
                                        Estamos enviando el código de verificación a
                                    </Text>
                                    <Text style={[
                                        styles.emailText,
                                        { fontSize: screenWidth < 350 ? 13 : 14 }
                                    ]}>
                                        {email}
                                    </Text>
                                </View>
                            )}

                            {/* Estado: Ingreso de código */}
                            {step === 'code' && (
                                <View style={styles.centerContent}>
                                    <View style={[
                                        styles.successIconContainer,
                                        screenWidth < 350 && styles.successIconContainerSmall
                                    ]}>
                                        <Icon 
                                            name="email" 
                                            size={screenWidth < 350 ? 28 : 32} 
                                            color="#FFFFFF" 
                                        />
                                    </View>
                                    
                                    <Text style={[
                                        styles.stepTitle,
                                        { fontSize: screenWidth < 350 ? 18 : 20 }
                                    ]}>
                                        Código enviado
                                    </Text>
                                    <Text style={[
                                        styles.stepDescription,
                                        { fontSize: screenWidth < 350 ? 13 : 14 }
                                    ]}>
                                        Hemos enviado un código de verificación a
                                    </Text>
                                    <Text style={[
                                        styles.emailText,
                                        { fontSize: screenWidth < 350 ? 13 : 14 }
                                    ]}>
                                        {email}
                                    </Text>
                                    
                                    <CodeInputMobile
                                        ref={codeInputRef}
                                        onCodeChange={handleCodeChange}
                                        onComplete={handleCodeComplete}
                                        disabled={isLoading}
                                        error={error}
                                    />
                                    
                                    {error && (
                                        <View style={styles.errorContainer}>
                                            <Icon name="error" size={16} color="#E53E3E" />
                                            <Text style={[
                                                styles.errorText,
                                                { fontSize: screenWidth < 350 ? 11 : 12 }
                                            ]}>
                                                {error}
                                            </Text>
                                        </View>
                                    )}
                                    
                                    <TouchableOpacity
                                        onPress={handleResendCode}
                                        disabled={resendTimer > 0 || cooldownTimer > 0 || isLoading}
                                        style={styles.resendButton}
                                    >
                                        <Text style={[
                                            styles.resendText,
                                            { fontSize: screenWidth < 350 ? 13 : 14 },
                                            (resendTimer > 0 || cooldownTimer > 0 || isLoading) && styles.resendTextDisabled
                                        ]}>
                                            {cooldownTimer > 0 
                                                ? `Podrás solicitar otro código en ${formatTime(cooldownTimer)}`
                                                : resendTimer > 0 
                                                    ? `Reenviar código en ${resendTimer}s`
                                                    : '¿No recibiste el código? Reenviar'
                                            }
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {/* Estado: Verificando código */}
                            {step === 'verifying' && (
                                <View style={styles.centerContent}>
                                    <View style={styles.verifyingContainer}>
                                        <View style={styles.spinnerContainer}>
                                            <ActivityIndicator 
                                                size={screenWidth < 350 ? "default" : "large"} 
                                                color="#4CAF50" 
                                            />
                                            <View style={[
                                                styles.verifyingPulse,
                                                screenWidth < 350 && styles.verifyingPulseSmall
                                            ]} />
                                        </View>
                                    </View>
                                    
                                    <Text style={[
                                        styles.stepTitle,
                                        { fontSize: screenWidth < 350 ? 18 : 20 }
                                    ]}>
                                        Verificando código...
                                    </Text>
                                    <Text style={[
                                        styles.stepDescription,
                                        { fontSize: screenWidth < 350 ? 13 : 14 }
                                    ]}>
                                        Estamos completando tu registro
                                    </Text>
                                </View>
                            )}
                        </ScrollView>

                        {/* Footer informativo */}
                        <View style={[styles.footer, { paddingHorizontal: modalDimensions.contentPadding }]}>
                            <Text style={[
                                styles.footerText,
                                { fontSize: screenWidth < 350 ? 11 : 12 }
                            ]}>
                                El código expira en 10 minutos. Si no lo recibes, 
                                revisa tu carpeta de spam o correo no deseado.
                            </Text>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    // Wrapper para centrar el modal y mantener su tamaño
    modalWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 40,
    },
    // Estilo cuando el teclado está visible - mueve el modal hacia arriba
    modalWrapperFocused: {
        justifyContent: 'flex-start',
        paddingTop: 60,
    },
    modalContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        width: '100%',
        maxHeight: screenHeight * 0.75,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FDB4B7',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    title: {
        fontFamily: 'Poppins-SemiBold',
        color: '#333333',
    },
    closeButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#F8F8F8',
    },
    // ScrollView que se ajusta al contenido sin comprimir el modal
    scrollView: {
        flexGrow: 0,
        flexShrink: 1,
    },
    // Contenido del ScrollView con padding vertical
    scrollContent: {
        paddingVertical: screenWidth < 350 ? 24 : 32,
        paddingBottom: screenWidth < 350 ? 32 : 40,
    },
    centerContent: {
        alignItems: 'center',
    },
    loadingContainer: {
        marginBottom: screenWidth < 350 ? 20 : 24,
        alignItems: 'center',
    },
    spinnerContainer: {
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        width: screenWidth < 350 ? 50 : 60,
        height: screenWidth < 350 ? 50 : 60,
    },
    pulseCircle: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FDB4B7',
        opacity: 0.3,
    },
    pulseCircleSmall: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    successIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#FDB4B7',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    successIconContainerSmall: {
        width: 56,
        height: 56,
        borderRadius: 28,
        marginBottom: 20,
    },
    verifyingContainer: {
        marginBottom: screenWidth < 350 ? 20 : 24,
        alignItems: 'center',
    },
    verifyingPulse: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#4CAF50',
        opacity: 0.3,
    },
    verifyingPulseSmall: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    stepTitle: {
        fontFamily: 'Poppins-SemiBold',
        color: '#333333',
        marginBottom: 12,
        textAlign: 'center',
    },
    stepDescription: {
        fontFamily: 'Poppins-Regular',
        color: '#666666',
        textAlign: 'center',
        marginBottom: 8,
        lineHeight: 20,
    },
    emailText: {
        fontFamily: 'Poppins-Medium',
        color: '#FDB4B7',
        textAlign: 'center',
        marginBottom: 24,
        flexWrap: 'wrap', 
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#FEF2F2',
        padding: 12,
        borderRadius: 8,
        marginTop: 16,
        marginBottom: 16,
        width: '100%',
    },
    errorText: {
        fontFamily: 'Poppins-Regular',
        color: '#E53E3E',
        marginLeft: 8,
        flex: 1,
        lineHeight: 16,
    },
    resendButton: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginTop: 16,
        width: '100%',
    },
    resendText: {
        fontFamily: 'Poppins-Medium',
        color: '#FDB4B7',
        textAlign: 'center',
        lineHeight: 18,
    },
    resendTextDisabled: {
        color: '#CCCCCC',
    },
    footer: {
        backgroundColor: '#F8F9FA',
        paddingVertical: 16,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    footerText: {
        fontFamily: 'Poppins-Regular',
        color: '#666666',
        textAlign: 'center',
        lineHeight: 18,
    },
});

export default EmailVerificationModalMobile;