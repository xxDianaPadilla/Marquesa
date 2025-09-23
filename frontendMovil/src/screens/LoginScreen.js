import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Dimensions, StatusBar, ImageBackground, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform, Animated, Image } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useAlert } from "../hooks/useAlert";
import { CustomAlert, LoadingDialog, ToastDialog } from "../components/CustomAlerts";
import loginBg from "../images/loginBg.png";
import shieldLock from "../images/shieldLock.png";
import PinkInputs from "../components/PinkInputs";
import emailIcon from "../images/emailIcon.png";
import lockIcon from "../images/lockIcon.png";
import eyeIcon from "../images/eyeIcon.png";
import eyeOffIcon from "../images/eyeOffIcon.png";
import PinkButton from "../components/PinkButton";
import QuestionText from "../components/QuestionText";

// Obtener dimensiones de la pantalla para diseño responsivo
const { width, height } = Dimensions.get('window');

// Funciones auxiliares para responsive design
const scale = (size) => (width / 375) * size; // Escalar basado en iPhone X como referencia
const verticalScale = (size) => (height / 812) * size; // Escalar verticalmente
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor; // Escalar moderadamente

export default function LoginScreen({ navigation }) {
    // Estados locales del componente
    const [email, setEmail] = useState(''); // Email ingresado por el usuario
    const [password, setPassword] = useState(''); // Contraseña ingresada por el usuario
    const [showPassword, setShowPassword] = useState(false); // Controlar visibilidad de la contraseña
    const [isSubmitting, setIsSubmitting] = useState(false); // Estado de envío del formulario

    // Estados para el sistema de límite de intentos
    const [attemptWarning, setAttemptWarning] = useState(null); // Advertencia sobre intentos restantes
    const [lockoutTimer, setLockoutTimer] = useState(null); // Timer para el conteo regresivo del bloqueo

    // Referencias para animaciones y navegación
    const hasNavigated = useRef(false);
    const slideAnimation = useRef(new Animated.Value(0)).current; // Animación para alertas deslizantes
    const progressAnimation = useRef(new Animated.Value(0)).current; // Animación para barra de progreso

    // Contexto de autenticación - obtiene funciones y estados del sistema de auth
    const { 
        login, 
        isAuthenticated, 
        authError, 
        clearAuthError, 
        loading,
        lockoutInfo,
        checkAccountLockStatus,
        getAttemptsWarning,
        rateLimitConfig
    } = useAuth();

    // Hook personalizado para manejo de alertas y diálogos
    const {
        alertState,
        showLoading,
        hideLoading,
        showError,
        showSuccessToast,
        hideToast
    } = useAlert();

    // Función para formatear tiempo restante de bloqueo
    const formatLockoutTime = (seconds) => {
        if (seconds <= 0) return '';
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    // Effect para manejar el conteo regresivo del bloqueo
    useEffect(() => {
        if (lockoutInfo && lockoutInfo.isLocked && lockoutInfo.remainingTime > 0) {
            setLockoutTimer(lockoutInfo.remainingTime);
            
            const interval = setInterval(() => {
                setLockoutTimer(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        // Verificar nuevamente el estado de bloqueo cuando termine el tiempo
                        if (email.trim()) {
                            checkAccountLockStatus(email.trim().toLowerCase());
                        }
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(interval);
        } else {
            setLockoutTimer(null);
        }
    }, [lockoutInfo, email, checkAccountLockStatus]);

    // Effect para verificar el estado de bloqueo cuando cambia el email
    useEffect(() => {
        if (email.trim()) {
            const cleanEmail = email.trim().toLowerCase();
            
            // Verificar estado de bloqueo
            const lockStatus = checkAccountLockStatus(cleanEmail);
            
            // Obtener advertencia de intentos
            const warning = getAttemptsWarning(cleanEmail);
            setAttemptWarning(warning);
            
            // Animar barra de progreso si hay advertencia
            if (warning) {
                const attemptMatch = warning.match(/Te quedan (\d+) intento/);
                if (attemptMatch) {
                    const remaining = parseInt(attemptMatch[1]);
                    const attempted = rateLimitConfig.maxAttempts - remaining;
                    const percentage = (attempted / rateLimitConfig.maxAttempts);
                    
                    Animated.timing(progressAnimation, {
                        toValue: percentage,
                        duration: 300,
                        useNativeDriver: false,
                    }).start();
                }
            } else {
                Animated.timing(progressAnimation, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: false,
                }).start();
            }
        } else {
            setAttemptWarning(null);
            Animated.timing(progressAnimation, {
                toValue: 0,
                duration: 300,
                useNativeDriver: false,
            }).start();
        }
    }, [email, checkAccountLockStatus, getAttemptsWarning, rateLimitConfig.maxAttempts]);

    // Effect para animar alertas de bloqueo y advertencias
    useEffect(() => {
        if (lockoutInfo?.isLocked || attemptWarning) {
            Animated.timing(slideAnimation, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(slideAnimation, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [lockoutInfo, attemptWarning]);

    // Efecto para manejar el estado de carga y navegación después de autenticarse
    useEffect(() => {
        // Mostrar loading mientras se verifica la autenticación
        if (loading) {
            showLoading({
                title: 'Verificando autenticación',
                message: 'Comprobando credenciales...'
            });
        } else {
            hideLoading();
        }

        // Si el usuario está autenticado y no estamos cargando, navegar al home
        if (isAuthenticated && !loading && !hasNavigated.current) {
            console.log('Usuario autenticado, navegando a Home');
            hasNavigated.current = true; // Marcar que ya navegamos
            hideLoading();
            showSuccessToast('¡Bienvenid@ de vuelta!');

            // Reemplazar la pantalla actual con el TabNavigator principal
            navigation.replace('TabNavigator');
        }
    }, [isAuthenticated, loading, navigation]);

    // Efecto para manejar errores de autenticación
    useEffect(() => {
        if (authError && !hasNavigated.current) {
            hideLoading();
            // No mostrar error general si es un problema de bloqueo
            if (!authError.includes('bloqueada temporalmente')) {
                showError(authError, 'Error de Autenticación');
            }
            clearAuthError(); // Limpiar el error después de mostrarlo
        }
    }, [authError, clearAuthError]);

    // Efecto para resetear el flag de navegación cuando la pantalla recibe foco
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            hasNavigated.current = false;
        });

        return unsubscribe; // Cleanup del listener
    }, [navigation]);

    // Función principal para manejar el proceso de login
    const handleLogin = async () => {
        // Prevenir múltiples envíos simultáneos
        if (isSubmitting || hasNavigated.current) return;

        // Verificar si la cuenta está bloqueada antes de continuar
        if (lockoutInfo && lockoutInfo.isLocked) {
            const timeRemaining = formatLockoutTime(lockoutTimer || lockoutInfo.remainingTime);
            showError(
                `Tu cuenta está bloqueada temporalmente. Tiempo restante: ${timeRemaining}`,
                "Cuenta Bloqueada"
            );
            return;
        }

        // Validación: verificar que el email no esté vacío
        if (!email.trim()) {
            showError("Por favor ingresa tu correo electrónico", "Campo requerido");
            return;
        }

        // Validación: verificar que la contraseña no esté vacía
        if (!password.trim()) {
            showError("Por favor ingresa tu contraseña", "Campo requerido");
            return;
        }

        try {
            // Marcar como enviando y mostrar loading
            setIsSubmitting(true);
            showLoading({
                title: 'Iniciando sesión',
                message: 'Verificando credenciales...'
            });

            console.log('Iniciando login con: ', { email: email.trim() });

            // Llamar a la función de login del contexto
            const result = await login(email.trim(), password);

            console.log('Resultado del login: ', result);

            // Si el login es exitoso, el useEffect se encargará de la navegación
            if (result.success) {
                console.log('Login exitoso, el useEffect manejará la navegación');
            } else {
                console.log('Login falló: ', result.message);
                hideLoading();

                // Manejar diferentes tipos de errores de login
                if (result.isAccountLocked) {
                    // La cuenta se bloqueó con este intento
                    const timeRemaining = formatLockoutTime(result.remainingTime);
                    showError(
                        `Tu cuenta ha sido bloqueada por seguridad. Tiempo restante: ${timeRemaining}`,
                        "Cuenta Bloqueada"
                    );
                } else {
                    // Error de credenciales pero no bloqueado
                    let errorMessage = result.message;
                    
                    // Separar mensaje principal de advertencia
                    const messageParts = result.message.split('\n\n');
                    if (messageParts.length > 1) {
                        errorMessage = messageParts[0];
                        // La advertencia se manejará a través del estado attemptWarning
                    }
                    
                    if (errorMessage.includes('user not found') || errorMessage.includes('usuario no encontrado')) {
                        showError("No se encontró una cuenta con este correo electrónico", "Usuario no encontrado");
                    } else if (errorMessage.includes('Invalid password') || errorMessage.includes('contraseña')) {
                        showError("La contraseña ingresada es incorrecta", "Contraseña incorrecta");
                    } else {
                        showError(errorMessage, "Error de autenticación");
                    }
                }
            }
        } catch (error) {
            // Manejar errores inesperados
            console.error('Error inesperado en login: ', error);
            hideLoading();
            showError("Ocurrió un error inesperado. Inténtelo de nuevo.", "Error de conexión");
        } finally {
            // Siempre limpiar el estado de envío
            setIsSubmitting(false);
        }
    };

    // Navegación a la pantalla de registro
    const handleRegister = () => {
        if (!hasNavigated.current && !lockoutInfo?.isLocked) {
            console.log('Ir a registro');
            navigation.navigate('Register');
        }
    };

    // Navegación a la pantalla de recuperación de contraseña
    const handleForgotPassword = () => {
        if (!hasNavigated.current && !lockoutInfo?.isLocked) {
            console.log('Olvidé mi contraseña');
            navigation.navigate('RecoveryPassword');
        }
    };

    // Determinar si el formulario debe estar deshabilitado
    const isFormDisabled = isSubmitting || hasNavigated.current || (lockoutInfo && lockoutInfo.isLocked);

    // Componente para mostrar alerta de bloqueo de cuenta
    const renderLockoutAlert = () => {
        if (!lockoutInfo || !lockoutInfo.isLocked) return null;

        const timeRemaining = formatLockoutTime(lockoutTimer || lockoutInfo.remainingTime);

        return (
            <Animated.View 
                style={[
                    styles.alertContainer,
                    styles.lockoutAlert,
                    {
                        opacity: slideAnimation,
                        transform: [{
                            translateY: slideAnimation.interpolate({
                                inputRange: [0, 1],
                                outputRange: [-20, 0],
                            }),
                        }],
                    }
                ]}
            >
                <View style={styles.alertIcon}>
                    <Image source={shieldLock} style={styles.alertIconImage} />
                </View>
                <View style={styles.alertContent}>
                    <Text style={styles.alertTitle}>Cuenta Temporalmente Bloqueada</Text>
                    <Text style={styles.alertMessage}>
                        Tu cuenta ha sido bloqueada debido a múltiples intentos fallidos de inicio de sesión.
                    </Text>
                    <View style={styles.timeContainer}>
                        <Text style={styles.timeLabel}>Tiempo restante:</Text>
                        <Text style={styles.timeValue}>{timeRemaining}</Text>
                    </View>
                    <Text style={styles.alertFooter}>
                        Por tu seguridad, espera antes de intentar nuevamente.
                    </Text>
                </View>
            </Animated.View>
        );
    };

    // Componente para mostrar advertencia sobre intentos restantes
    const renderAttemptWarning = () => {
        if (!attemptWarning || (lockoutInfo && lockoutInfo.isLocked)) return null;

        // Extraer número de intentos restantes
        const attemptMatch = attemptWarning.match(/Te quedan (\d+) intento/);
        const remaining = attemptMatch ? parseInt(attemptMatch[1]) : 0;
        const attempted = rateLimitConfig.maxAttempts - remaining;

        return (
            <Animated.View 
                style={[
                    styles.alertContainer,
                    styles.warningAlert,
                    {
                        opacity: slideAnimation,
                        transform: [{
                            translateY: slideAnimation.interpolate({
                                inputRange: [0, 1],
                                outputRange: [-20, 0],
                            }),
                        }],
                    }
                ]}
            >
                <View style={styles.alertIcon}>
                    <Image source={shieldLock} style={styles.warningIconImage} />
                </View>
                <View style={styles.alertContent}>
                    <Text style={styles.warningTitle}>Advertencia de Seguridad</Text>
                    <Text style={styles.warningMessage}>{attemptWarning}</Text>
                    
                    {/* Barra de progreso de intentos */}
                    <View style={styles.progressContainer}>
                        <View style={styles.progressInfo}>
                            <Text style={styles.progressLabel}>
                                Intentos fallidos: {attempted}/{rateLimitConfig.maxAttempts}
                            </Text>
                            <Text style={styles.progressRemaining}>
                                {remaining} restantes
                            </Text>
                        </View>
                        <View style={styles.progressBarContainer}>
                            <Animated.View 
                                style={[
                                    styles.progressBar,
                                    {
                                        width: progressAnimation.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: ['0%', '100%'],
                                        }),
                                        backgroundColor: progressAnimation.interpolate({
                                            inputRange: [0, 0.6, 1],
                                            outputRange: ['#FFA500', '#FF6B35', '#FF3333'],
                                        }),
                                    }
                                ]}
                            />
                        </View>
                    </View>
                </View>
            </Animated.View>
        );
    };

    // Componente para mostrar información de seguridad
    const renderSecurityInfo = () => {
        if ((lockoutInfo && lockoutInfo.isLocked) || attemptWarning) return null;

        return (
            <View style={styles.securityInfo}>
                <View style={styles.securityIcon}>
                    <Image source={shieldLock} style={styles.securityIconImage} />
                </View>
                <Text style={styles.securityText}>
                    Por tu seguridad, tu cuenta se bloqueará temporalmente después de {rateLimitConfig.maxAttempts} intentos fallidos.
                </Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Configuración de la barra de estado */}
            <StatusBar backgroundColor="transparent" translucent barStyle="light-content" />

            {/* Imagen de fondo de la pantalla de login */}
            <ImageBackground source={loginBg} style={styles.backgroundImage}>
                {/* Overlay semitransparente sobre la imagen de fondo */}
                <View style={styles.overlay}>
                    {/* KeyboardAvoidingView para manejar el teclado en iOS */}
                    <KeyboardAvoidingView
                        style={{ flex: 1 }}
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    >
                        {/* ScrollView para permitir scroll cuando el teclado está visible */}
                        <ScrollView
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled" // Permitir toques fuera del teclado
                        >
                            {/* Contenedor principal del contenido */}
                            <View style={styles.content}>
                                {/* Tarjeta principal del formulario de login */}
                                <View style={styles.loginCard}>
                                    {/* Alerta de bloqueo de cuenta */}
                                    {renderLockoutAlert()}

                                    {/* Información de seguridad */}
                                    {renderSecurityInfo()}

                                    {/* Advertencia sobre intentos restantes */}
                                    {renderAttemptWarning()}

                                    {/* Título de la aplicación */}
                                    <Text style={styles.title}>
                                        Dedicados a realizar{'\n'}detalles únicos
                                    </Text>

                                    {/* Campo de entrada para el email */}
                                    <PinkInputs
                                        placeholder="Correo electrónico"
                                        value={email}
                                        onChangeText={setEmail}
                                        icon={emailIcon}
                                        keyboardType="email-address" // Teclado optimizado para email
                                        autoCapitalize="none" // No capitalizar automáticamente
                                        style={[
                                            styles.inputSpacing,
                                            isFormDisabled && styles.disabledInput
                                        ]}
                                        editable={!isFormDisabled} // Deshabilitar durante envío o bloqueo
                                    />

                                    {/* Campo de entrada para la contraseña */}
                                    <PinkInputs
                                        placeholder="Contraseña"
                                        value={password}
                                        onChangeText={setPassword}
                                        icon={lockIcon}
                                        secureTextEntry={!showPassword} // Ocultar/mostrar contraseña
                                        showPasswordToggle={true} // Mostrar botón de toggle
                                        onTogglePassword={() => setShowPassword(!showPassword)}
                                        eyeIcon={eyeIcon}
                                        eyeOffIcon={eyeOffIcon}
                                        style={[
                                            styles.inputSpacing,
                                            isFormDisabled && styles.disabledInput
                                        ]}
                                        editable={!isFormDisabled} // Deshabilitar durante envío o bloqueo
                                    />

                                    {/* Enlace para recuperar contraseña */}
                                    <TouchableOpacity
                                        onPress={handleForgotPassword}
                                        style={[
                                            styles.forgotPasswordContainer,
                                            isFormDisabled && styles.disabledLink
                                        ]}
                                        activeOpacity={0.7}
                                        disabled={isFormDisabled} // Deshabilitar durante envío o bloqueo
                                    >
                                        <Text style={[
                                            styles.forgotPasswordText,
                                            isFormDisabled && styles.disabledText
                                        ]}>
                                            ¿Olvidaste tu contraseña?
                                        </Text>
                                    </TouchableOpacity>

                                    {/* Botón principal de iniciar sesión */}
                                    <PinkButton
                                        title={
                                            lockoutInfo?.isLocked
                                                ? "Cuenta Bloqueada"
                                                : isSubmitting
                                                ? "Iniciando Sesión..."
                                                : "Iniciar Sesión"
                                        }
                                        onPress={handleLogin}
                                        style={[
                                            styles.loginButtonSpacing,
                                            isFormDisabled && styles.disabledButton
                                        ]}
                                        disabled={isFormDisabled} // Deshabilitar durante envío o bloqueo
                                    />

                                    {/* Indicador de carga o información de bloqueo */}
                                    {isFormDisabled && (
                                        <View style={styles.statusContainer}>
                                            {lockoutInfo?.isLocked ? (
                                                <View style={styles.lockoutStatus}>
                                                    <Image source={shieldLock} style={styles.lockoutStatusIcon} />
                                                    <Text style={styles.lockoutStatusText}>
                                                        Formulario deshabilitado por seguridad
                                                    </Text>
                                                </View>
                                            ) : isSubmitting ? (
                                                <View style={styles.loadingStatus}>
                                                    <View style={styles.loadingSpinner} />
                                                    <Text style={styles.loadingStatusText}>
                                                        Verificando credenciales...
                                                    </Text>
                                                </View>
                                            ) : null}
                                        </View>
                                    )}

                                    {/* Enlace para ir a la pantalla de registro */}
                                    <QuestionText
                                        questionText="¿No tienes una cuenta?"
                                        linkText="Regístrate"
                                        onPress={handleRegister}
                                        style={[
                                            styles.registerTextSpacing,
                                            isFormDisabled && styles.disabledLink
                                        ]}
                                        disabled={isFormDisabled} // Deshabilitar durante envío o bloqueo
                                    />

                                    {/* Información sobre el sistema de seguridad */}
                                    {!lockoutInfo?.isLocked && (
                                        <View style={styles.securityFooter}>
                                            <View style={styles.securityFooterIcon}>
                                                <Image source={shieldLock} style={styles.securityFooterIconImage} />
                                            </View>
                                            <Text style={styles.securityFooterTitle}>
                                                Sistema de Seguridad Activo
                                            </Text>
                                            <Text style={styles.securityFooterText}>
                                                Tu cuenta se protege automáticamente contra intentos de acceso no autorizados
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </View>
            </ImageBackground>

            {/* Diálogo de alerta personalizada */}
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

            {/* Diálogo de carga */}
            <LoadingDialog
                visible={alertState.loading.visible}
                title={alertState.loading.title}
                message={alertState.loading.message}
                color={alertState.loading.color}
            />

            {/* Toast de notificaciones */}
            <ToastDialog
                visible={alertState.toast.visible}
                message={alertState.toast.message}
                type={alertState.toast.type}
                duration={alertState.toast.duration}
                onHide={hideToast}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    // Contenedor principal de la pantalla
    container: {
        flex: 1,
    },
    
    // Imagen de fondo que ocupa toda la pantalla
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    
    // Overlay semitransparente sobre la imagen de fondo
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    
    // Contenido del ScrollView con responsive design
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        minHeight: height, // Asegurar que ocupe toda la pantalla
        paddingVertical: verticalScale(20),
    },
    
    // Contenedor principal del contenido con responsive design
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: scale(20),
        paddingVertical: verticalScale(10),
    },
    
    // Tarjeta principal del formulario de login con responsive design
    loginCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)', // Fondo semitransparente
        borderRadius: moderateScale(25),
        paddingHorizontal: scale(25),
        paddingVertical: verticalScale(30),
        width: '100%',
        maxWidth: scale(350), // Ancho máximo responsive
        alignItems: 'center',
        // Sombra para dar profundidad
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: moderateScale(10),
        },
        shadowOpacity: 0.1,
        shadowRadius: moderateScale(20),
        elevation: 8, // Sombra en Android
    },
    
    // Estilos para alertas de bloqueo y advertencias con responsive design
    alertContainer: {
        width: '100%',
        borderRadius: moderateScale(15),
        padding: scale(12),
        marginBottom: verticalScale(15),
        flexDirection: 'row',
        alignItems: 'flex-start',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: moderateScale(4),
        },
        shadowOpacity: 0.1,
        shadowRadius: moderateScale(8),
        elevation: 4,
    },
    
    // Alerta de bloqueo de cuenta
    lockoutAlert: {
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    
    // Alerta de advertencia
    warningAlert: {
        backgroundColor: '#FFFBEB',
        borderWidth: 1,
        borderColor: '#FDE68A',
    },
    
    // Contenedor del icono de alerta con responsive design
    alertIcon: {
        width: scale(24),
        height: scale(24),
        borderRadius: scale(12),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(10),
        marginTop: verticalScale(2),
    },
    
    // Imagen del icono de alerta
    alertIconImage: {
        width: scale(20),
        height: scale(20),
        tintColor: '#DC2626',
    },
    
    // Imagen del icono de advertencia
    warningIconImage: {
        width: scale(18),
        height: scale(18),
        tintColor: '#D97706',
    },
    
    // Contenido de la alerta
    alertContent: {
        flex: 1,
    },
    
    // Título de la alerta de bloqueo con responsive design
    alertTitle: {
        fontSize: moderateScale(14),
        fontFamily: 'Poppins-SemiBold',
        color: '#991B1B',
        marginBottom: verticalScale(6),
        lineHeight: moderateScale(18),
    },
    
    // Mensaje de la alerta de bloqueo con responsive design
    alertMessage: {
        fontSize: moderateScale(12),
        fontFamily: 'Poppins-Regular',
        color: '#7F1D1D',
        marginBottom: verticalScale(10),
        lineHeight: moderateScale(16),
    },
    
    // Contenedor del tiempo restante con responsive design
    timeContainer: {
        backgroundColor: '#FEE2E2',
        borderRadius: moderateScale(8),
        padding: scale(8),
        marginBottom: verticalScale(6),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    
    // Etiqueta del tiempo con responsive design
    timeLabel: {
        fontSize: moderateScale(11),
        fontFamily: 'Poppins-Medium',
        color: '#991B1B',
    },
    
    // Valor del tiempo restante con responsive design
    timeValue: {
        fontSize: moderateScale(14),
        fontFamily: 'Poppins-Bold',
        color: '#DC2626',
        letterSpacing: 1,
    },
    
    // Pie de la alerta con responsive design
    alertFooter: {
        fontSize: moderateScale(10),
        fontFamily: 'Poppins-Regular',
        color: '#7F1D1D',
        lineHeight: moderateScale(14),
    },
    
    // Título de la advertencia con responsive design
    warningTitle: {
        fontSize: moderateScale(13),
        fontFamily: 'Poppins-SemiBold',
        color: '#92400E',
        marginBottom: verticalScale(5),
        lineHeight: moderateScale(17),
    },
    
    // Mensaje de la advertencia con responsive design
    warningMessage: {
        fontSize: moderateScale(11),
        fontFamily: 'Poppins-Regular',
        color: '#78350F',
        marginBottom: verticalScale(10),
        lineHeight: moderateScale(15),
    },
    
    // Contenedor de la barra de progreso
    progressContainer: {
        width: '100%',
    },
    
    // Información de progreso con responsive design
    progressInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(6),
    },
    
    // Etiqueta del progreso con responsive design
    progressLabel: {
        fontSize: moderateScale(10),
        fontFamily: 'Poppins-Medium',
        color: '#92400E',
    },
    
    // Intentos restantes con responsive design
    progressRemaining: {
        fontSize: moderateScale(10),
        fontFamily: 'Poppins-SemiBold',
        color: '#D97706',
    },
    
    // Contenedor de la barra de progreso con responsive design
    progressBarContainer: {
        width: '100%',
        height: verticalScale(5),
        backgroundColor: '#FEF3C7',
        borderRadius: moderateScale(3),
        overflow: 'hidden',
    },
    
    // Barra de progreso animada con responsive design
    progressBar: {
        height: '100%',
        borderRadius: moderateScale(3),
    },
    
    // Información de seguridad con responsive design
    securityInfo: {
        width: '100%',
        backgroundColor: '#FDF2F8',
        borderWidth: 1,
        borderColor: '#FBCFE8',
        borderRadius: moderateScale(12),
        padding: scale(10),
        marginBottom: verticalScale(15),
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    
    // Icono de seguridad con responsive design
    securityIcon: {
        width: scale(18),
        height: scale(18),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(8),
        marginTop: verticalScale(1),
    },
    
    // Imagen del icono de seguridad
    securityIconImage: {
        width: scale(16),
        height: scale(16),
        tintColor: '#86198F',
    },
    
    // Texto de información de seguridad con responsive design
    securityText: {
        flex: 1,
        fontSize: moderateScale(10),
        fontFamily: 'Poppins-Regular',
        color: '#86198F',
        lineHeight: moderateScale(14),
    },
    
    // Título principal de la aplicación con responsive design
    title: {
        fontSize: moderateScale(18),
        fontFamily: 'Poppins-SemiBold',
        color: '#999999',
        textAlign: 'center',
        marginBottom: verticalScale(25),
        lineHeight: moderateScale(24), // Espaciado entre líneas
    },
    
    // Espaciado para los campos de entrada con responsive design
    inputSpacing: {
        marginBottom: verticalScale(15),
    },
    
    // Estilos para campos deshabilitados
    disabledInput: {
        opacity: 0.6,
    },
    
    // Contenedor del enlace "olvidé mi contraseña" con responsive design
    forgotPasswordContainer: {
        alignSelf: 'flex-end', // Alineado a la derecha
        marginBottom: verticalScale(25),
        marginTop: verticalScale(-3),
    },
    
    // Texto del enlace "olvidé mi contraseña" con responsive design
    forgotPasswordText: {
        fontSize: moderateScale(12),
        color: '#999999',
        fontFamily: 'Poppins-SemiBold',
        marginTop: verticalScale(3),
        bottom: verticalScale(-3)
    },
    
    // Estilos para enlaces deshabilitados
    disabledLink: {
        opacity: 0.5,
    },
    
    // Texto deshabilitado
    disabledText: {
        color: '#CCCCCC',
    },
    
    // Espaciado para el botón de login con responsive design
    loginButtonSpacing: {
        marginBottom: verticalScale(20),
        width: '100%', // Ocupar todo el ancho disponible
    },
    
    // Botón deshabilitado
    disabledButton: {
        opacity: 0.6,
    },
    
    // Contenedor de estado con responsive design
    statusContainer: {
        width: '100%',
        alignItems: 'center',
        marginBottom: verticalScale(12),
    },
    
    // Estado de bloqueo con responsive design
    lockoutStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF2F2',
        padding: scale(8),
        borderRadius: moderateScale(8),
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    
    // Icono de estado de bloqueo con responsive design
    lockoutStatusIcon: {
        width: scale(14),
        height: scale(14),
        tintColor: '#991B1B',
        marginRight: scale(6),
    },
    
    // Texto de estado de bloqueo con responsive design
    lockoutStatusText: {
        fontSize: moderateScale(10),
        fontFamily: 'Poppins-Medium',
        color: '#991B1B',
    },
    
    // Estado de carga con responsive design
    loadingStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        padding: scale(8),
        borderRadius: moderateScale(8),
        borderWidth: 1,
        borderColor: '#D1D5DB',
    },
    
    // Spinner de carga con responsive design
    loadingSpinner: {
        width: scale(14),
        height: scale(14),
        borderRadius: scale(7),
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderTopColor: '#FF6B6B',
        marginRight: scale(6),
        // Animación de rotación se maneja por separado
    },
    
    // Texto de estado de carga con responsive design
    loadingStatusText: {
        fontSize: moderateScale(10),
        fontFamily: 'Poppins-Medium',
        color: '#6B7280',
    },
    
    // Espaciado para el texto de registro con responsive design
    registerTextSpacing: {
        marginTop: verticalScale(8),
    },
    
    // Pie de información de seguridad con responsive design
    securityFooter: {
        width: '100%',
        alignItems: 'center',
        marginTop: verticalScale(20),
        paddingTop: verticalScale(15),
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    
    // Icono del pie de seguridad con responsive design
    securityFooterIcon: {
        width: scale(20),
        height: scale(20),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(6),
    },
    
    // Imagen del icono del pie de seguridad
    securityFooterIconImage: {
        width: scale(18),
        height: scale(18),
        tintColor: '#9CA3AF',
    },
    
    // Título del pie de seguridad con responsive design
    securityFooterTitle: {
        fontSize: moderateScale(11),
        fontFamily: 'Poppins-Medium',
        color: '#9CA3AF',
        marginBottom: verticalScale(3),
        textAlign: 'center',
    },
    
    // Texto del pie de seguridad con responsive design
    securityFooterText: {
        fontSize: moderateScale(10),
        fontFamily: 'Poppins-Regular',
        color: '#9CA3AF',
        textAlign: 'center',
        lineHeight: moderateScale(14),
        paddingHorizontal: scale(15),
    },
});