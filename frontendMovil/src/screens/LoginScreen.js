import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Dimensions, StatusBar, ImageBackground, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useAlert } from "../hooks/useAlert";
import { CustomAlert, LoadingDialog, ToastDialog } from "../components/CustomAlerts";
import loginBg from "../images/loginBg.png";
import PinkInputs from "../components/PinkInputs";
import emailIcon from "../images/emailIcon.png";
import lockIcon from "../images/lockIcon.png";
import eyeIcon from "../images/eyeIcon.png";
import eyeOffIcon from "../images/eyeOffIcon.png";
import PinkButton from "../components/PinkButton";
import QuestionText from "../components/QuestionText";

// Obtener dimensiones de la pantalla para diseño responsivo
const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
    // Estados locales del componente
    const [email, setEmail] = useState(''); // Email ingresado por el usuario
    const [password, setPassword] = useState(''); // Contraseña ingresada por el usuario
    const [showPassword, setShowPassword] = useState(false); // Controlar visibilidad de la contraseña
    const [isSubmitting, setIsSubmitting] = useState(false); // Estado de envío del formulario

    // Ref para evitar navegaciones múltiples simultáneas
    const hasNavigated = useRef(false);

    // Contexto de autenticación - obtiene funciones y estados del sistema de auth
    const { login, isAuthenticated, authError, clearAuthError, loading } = useAuth();

    // Hook personalizado para manejo de alertas y diálogos
    const {
        alertState,
        showLoading,
        hideLoading,
        showError,
        showSuccessToast,
        hideToast
    } = useAlert();

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
            showError(authError, 'Error de Autenticación');
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
        if (!hasNavigated.current) {
            console.log('Ir a registro');
            navigation.navigate('Register');
        }
    };

    // Navegación a la pantalla de recuperación de contraseña
    const handleForgotPassword = () => {
        if (!hasNavigated.current) {
            console.log('Olvidé mi contraseña');
            navigation.navigate('RecoveryPassword');
        }
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
                                        style={styles.inputSpacing}
                                        editable={!isSubmitting && !hasNavigated.current} // Deshabilitar durante envío
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
                                        style={styles.inputSpacing}
                                        editable={!isSubmitting && !hasNavigated.current} // Deshabilitar durante envío
                                    />

                                    {/* Enlace para recuperar contraseña */}
                                    <TouchableOpacity
                                        onPress={handleForgotPassword}
                                        style={styles.forgotPasswordContainer}
                                        activeOpacity={0.7}
                                        disabled={isSubmitting || hasNavigated.current} // Deshabilitar durante envío
                                    >
                                        <Text style={styles.forgotPasswordText}>
                                            ¿Olvidaste tu contraseña?
                                        </Text>
                                    </TouchableOpacity>

                                    {/* Botón principal de iniciar sesión */}
                                    <PinkButton
                                        title={isSubmitting ? "Iniciando Sesión..." : "Iniciar Sesión"}
                                        onPress={handleLogin}
                                        style={styles.loginButtonSpacing}
                                        disabled={isSubmitting || hasNavigated.current} // Deshabilitar durante envío
                                    />

                                    {/* Enlace para ir a la pantalla de registro */}
                                    <QuestionText
                                        questionText="¿No tienes una cuenta?"
                                        linkText="Regístrate"
                                        onPress={handleRegister}
                                        style={styles.registerTextSpacing}
                                        disabled={isSubmitting || hasNavigated.current} // Deshabilitar durante envío
                                    />
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
    
    // Contenedor de KeyboardAvoidingView
    keyboardAvoidingView: {
        flex: 1,
    },
    
    // Contenido del ScrollView
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        minHeight: height, // Asegurar que ocupe toda la pantalla
    },
    
    // Contenedor principal del contenido
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
        paddingVertical: 20, // Padding vertical para espaciado
    },
    
    // Tarjeta principal del formulario de login
    loginCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)', // Fondo semitransparente
        borderRadius: 25,
        paddingHorizontal: 30,
        paddingVertical: 40,
        width: '100%',
        maxWidth: 350, // Ancho máximo en pantallas grandes
        alignItems: 'center',
        // Sombra para dar profundidad
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 8, // Sombra en Android
    },
    
    // Título principal de la aplicación
    title: {
        fontSize: 20,
        fontFamily: 'Poppins-SemiBold',
        color: '#999999',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 26, // Espaciado entre líneas
    },
    
    // Espaciado para los campos de entrada
    inputSpacing: {
        marginBottom: 20,
    },
    
    // Contenedor del enlace "olvidé mi contraseña"
    forgotPasswordContainer: {
        alignSelf: 'flex-end', // Alineado a la derecha
        marginBottom: 30,
        marginTop: -5,
    },
    
    // Texto del enlace "olvidé mi contraseña"
    forgotPasswordText: {
        fontSize: 14,
        color: '#999999',
        fontFamily: 'Poppins-SemiBold',
        marginTop: 5,
        bottom: -5
    },
    
    // Espaciado para el botón de login
    loginButtonSpacing: {
        marginBottom: 25,
        width: '100%', // Ocupar todo el ancho disponible
    },
    
    // Espaciado para el texto de registro
    registerTextSpacing: {
        marginTop: 10,
    },
});