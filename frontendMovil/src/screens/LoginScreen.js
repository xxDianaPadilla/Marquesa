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

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const hasNavigated = useRef(false);

    const { login, isAuthenticated, authError, clearAuthError, loading } = useAuth();

    const {
        alertState,
        showLoading,
        hideLoading,
        showError,
        showSuccessToast,
        hideToast
    } = useAlert();

    useEffect(() => {
        if (loading) {
            showLoading({
                title: 'Verificando autenticación',
                message: 'Comprobando credenciales...'
            });
        } else {
            hideLoading();
        }

        if (isAuthenticated && !loading && !hasNavigated.current) {
            console.log('Usuario autenticado, navegando a Home');
            hasNavigated.current = true;
            hideLoading();
            showSuccessToast('¡Bienvenid@ de vuelta!');

            navigation.replace('TabNavigator');
        }
    }, [isAuthenticated, loading, navigation]);

    useEffect(() => {
        if (authError && !hasNavigated.current) {
            hideLoading();
            showError(authError, 'Error de Autenticación');
            clearAuthError();
        }
    }, [authError, clearAuthError]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            hasNavigated.current = false;
        });

        return unsubscribe;
    }, [navigation]);

    const handleLogin = async () => {
        if (isSubmitting || hasNavigated.current) return;

        if (!email.trim()) {
            showError("Por favor ingresa tu correo electrónico", "Campo requerido");
            return;
        }

        if (!password.trim()) {
            showError("Por favor ingresa tu contraseña", "Campo requerido");
            return;
        }

        try {
            setIsSubmitting(true);
            showLoading({
                title: 'Iniciando sesión',
                message: 'Verificando credenciales...'
            });

            console.log('Iniciando login con: ', { email: email.trim() });

            const result = await login(email.trim(), password);

            console.log('Resultado del login: ', result);

            if (result.success) {
                console.log('Login exitoso, el useEffect manejará la navegación');
            } else {
                console.log('Login falló: ', result.message);
                hideLoading();
            }
        } catch (error) {
            console.error('Error inesperado en login: ', error);
            hideLoading();
            showError("Ocurrió un error inesperado. Inténtelo de nuevo.", "Error de conexión");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRegister = () => {
        if (!hasNavigated.current) {
            console.log('Ir a registro');
            navigation.navigate('Register');
        }
    };

    const handleForgotPassword = () => {
        if (!hasNavigated.current) {
            console.log('Olvidé mi contraseña');
            navigation.navigate('RecoveryPassword');
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="transparent" translucent barStyle="light-content" />

            <ImageBackground source={loginBg} style={styles.backgroundImage}>
                <View style={styles.overlay}>
                    <KeyboardAvoidingView
                        style={{ flex: 1 }}
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    >
                        <ScrollView
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            <View style={styles.content}>
                                {/* Card principal */}
                                <View style={styles.loginCard}>
                                    {/* Título */}
                                    <Text style={styles.title}>
                                        Dedicados a realizar{'\n'}detalles únicos
                                    </Text>

                                    {/* Input de email */}
                                    <PinkInputs
                                        placeholder="Correo electrónico"
                                        value={email}
                                        onChangeText={setEmail}
                                        icon={emailIcon}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        style={styles.inputSpacing}
                                        editable={!isSubmitting && !hasNavigated.current}
                                    />

                                    {/* Input de contraseña */}
                                    <PinkInputs
                                        placeholder="Contraseña"
                                        value={password}
                                        onChangeText={setPassword}
                                        icon={lockIcon}
                                        secureTextEntry={!showPassword}
                                        showPasswordToggle={true}
                                        onTogglePassword={() => setShowPassword(!showPassword)}
                                        eyeIcon={eyeIcon}
                                        eyeOffIcon={eyeOffIcon}
                                        style={styles.inputSpacing}
                                        editable={!isSubmitting && !hasNavigated.current}
                                    />

                                    {/* Enlace olvidé contraseña */}
                                    <TouchableOpacity
                                        onPress={handleForgotPassword}
                                        style={styles.forgotPasswordContainer}
                                        activeOpacity={0.7}
                                        disabled={isSubmitting || hasNavigated.current}
                                    >
                                        <Text style={styles.forgotPasswordText}>
                                            ¿Olvidaste tu contraseña?
                                        </Text>
                                    </TouchableOpacity>

                                    {/* Botón iniciar sesión */}
                                    <PinkButton
                                        title={isSubmitting ? "Iniciando Sesión..." : "Iniciar Sesión"}
                                        onPress={handleLogin}
                                        style={styles.loginButtonSpacing}
                                        disabled={isSubmitting || hasNavigated.current}
                                    />

                                    {/* Texto registro */}
                                    <QuestionText
                                        questionText="¿No tienes una cuenta?"
                                        linkText="Regístrate"
                                        onPress={handleRegister}
                                        style={styles.registerTextSpacing}
                                        disabled={isSubmitting || hasNavigated.current}
                                    />
                                </View>
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </View>
            </ImageBackground>

            {/* Todos los dialogs personalizados */}
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
    container: {
        flex: 1,
    },
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        minHeight: height, // Asegura que ocupe toda la pantalla
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
        paddingVertical: 20, // Añadido padding vertical
    },
    loginCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 25,
        paddingHorizontal: 30,
        paddingVertical: 40,
        width: '100%',
        maxWidth: 350,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 8,
    },
    title: {
        fontSize: 20,
        fontFamily: 'Poppins-SemiBold',
        color: '#999999',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 26,
    },
    inputSpacing: {
        marginBottom: 20,
    },
    forgotPasswordContainer: {
        alignSelf: 'flex-end',
        marginBottom: 30,
        marginTop: -5,
    },
    forgotPasswordText: {
        fontSize: 14,
        color: '#999999',
        fontFamily: 'Poppins-SemiBold',
        marginTop: 5,
        bottom: -5
    },
    loginButtonSpacing: {
        marginBottom: 25,
        width: '100%',
    },
    registerTextSpacing: {
        marginTop: 10,
    },
});