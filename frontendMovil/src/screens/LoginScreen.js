import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Dimensions, StatusBar, ImageBackground, TouchableOpacity, Alert } from "react-native";
import { useAuth } from "../context/AuthContext";
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

    const { login, isAuthenticated, authError, clearAuthError, loading } = useAuth();

    useEffect(() => {
        if (isAuthenticated && !loading) {
            console.log('Usuario autenticado, navegando a Home');
            navigation.replace('Home');
        }
    }, [isAuthenticated, loading, navigation]);

    useEffect(() => {
        if (authError) {
            Alert.alert(
                "Error de Autenticación",
                authError,
                [
                    {
                        text: 'OK',
                        onPress: () => clearAuthError()
                    }
                ]
            );
        }
    }, [authError, clearAuthError]);

    const handleLogin = async () => {
        if (isSubmitting) return;

        if (!email.trim()) {
            Alert.alert("Error", "Por favor ingresa tu correo electrónico");
            return;
        }

        if (!password.trim()) {
            Alert.alert("Error", "Por favor ingresa tu contraseña");
            return;
        }

        try {
            setIsSubmitting(true);
            console.log('Iniciando login con: ', { email: email.trim() });

            const result = await login(email.trim(), password);

            console.log('Resultado del login: ', result);

            if (result.success) {
                console.log('Login exitoso, el useEffect manejará la navegación');
            } else {
                console.log('Login falló: ', result.message);
            }
        } catch (error) {
            console.error('Error inesperado en login: ', error);
            Alert.alert("Error", "Ocurrió un error inesperado. Inténtalo de nuevo.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRegister = () => {
        console.log('Ir a registro');
    };

    const handleForgotPassword = () => {
        console.log('Olvidé mi contraseña');
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <Text style={styles.loadingText}>Verificando autenticación...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="transparent" translucent barStyle="light-content" />

            <ImageBackground source={loginBg} style={styles.backgroundImage}>
                <View style={styles.overlay}>
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
                                editable={!isSubmitting}
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
                                editable={!isSubmitting}
                            />

                            {/* Enlace olvidé contraseña */}
                            <TouchableOpacity
                                onPress={handleForgotPassword}
                                style={styles.forgotPasswordContainer}
                                activeOpacity={0.7}
                                disabled={isSubmitting}
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
                                disabled={isSubmitting}
                            />

                            {/* Texto registro */}
                            <QuestionText
                                questionText="¿No tienes una cuenta?"
                                linkText="Regístrate"
                                onPress={handleRegister}
                                style={styles.registerTextSpacing}
                                disabled={isSubmitting}
                            />
                        </View>
                    </View>
                </View>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
    },
    loadingText: {
        fontSize: 16,
        color: '#666666',
        fontFamily: 'Poppins-Regular',
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
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
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
        fontSize: 18,
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
        fontSize: 12,
        color: '#999999',
        fontFamily: 'Poppins-Regular',
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