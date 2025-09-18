import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, StatusBar } from "react-native";
// Importación de recursos visuales
import backIcon from "../images/backIcon.png";
import sideBgFlower from "../images/sideBgFlower.png";
import PinkInputs from "../components/PinkInputs";
import PinkButton from "../components/PinkButton";
import emailIcon from "../images/emailIcon.png";

// Importación de componentes personalizados para alertas y carga
import { CustomAlert, LoadingDialog } from "../components/CustomDialogs";

// Importación del hook personalizado para recuperación de contraseña
import usePasswordReset from "../hooks/usePasswordReset";

// Componente para la pantalla de recuperación de contraseña
const RecoveryPasswordScreen = ({ navigation }) => {
    // Estado para almacenar el email ingresado por el usuario
    const [email, setEmail] = useState("");

    // Estados para controlar las alertas personalizadas
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [showErrorAlert, setShowErrorAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    // Hook personalizado para recuperación de contraseña
    const {
        isRequesting,
        error,
        requestPasswordReset,
        validateEmail,
        clearError
    } = usePasswordReset();

    // Función para proceder con la recuperación de contraseña
    const handleContinue = async () => {
        console.log("Email para recuperación: ", email);
        
        // Limpiar errores previos
        clearError();
        
        // Validar email localmente antes de enviar
        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) {
            setAlertMessage(emailValidation.error);
            setShowErrorAlert(true);
            return;
        }

        // Solicitar código de recuperación
        const result = await requestPasswordReset(email);
        
        if (result.success) {
            // Mostrar alerta de éxito
            setAlertMessage('Código de recuperación enviado a tu correo. Tienes 5 minutos para usarlo.');
            setShowSuccessAlert(true);
        } else {
            // Mostrar alerta de error
            setAlertMessage(result.message);
            setShowErrorAlert(true);
        }
    };

    // Función para manejar la confirmación de éxito
    const handleSuccessConfirm = () => {
        setShowSuccessAlert(false);
        // Navegar a la pantalla de código de verificación pasando el email
        navigation.navigate('RecoveryCode', { email });
    };

    // Función para cerrar alerta de error
    const handleErrorConfirm = () => {
        setShowErrorAlert(false);
    };

    // Función para regresar a la pantalla de login
    const handleGoBack = () => {
        console.log("Regresar");
        // Navegar de vuelta a la pantalla de login
        navigation.navigate('Login');
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Configuración de la barra de estado */}
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            {/* Header con botón de navegación hacia atrás */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleGoBack}
                    activeOpacity={0.7} // Efecto visual al presionar
                    disabled={isRequesting} // Deshabilitar durante la carga
                >
                    <Image source={backIcon} style={styles.backIcon} />
                </TouchableOpacity>
            </View>

            {/* Contenedor para imagen decorativa */}
            <View style={styles.decorativeContainer}>
                <Image source={sideBgFlower} style={styles.decorativeImage} />
            </View>

            {/* Contenido principal de la pantalla */}
            <View style={styles.mainContent}>
                {/* Título principal */}
                <Text style={styles.title}>Recupera tu cuenta</Text>

                {/* Instrucción para el usuario */}
                <Text style={styles.subtitle}>Ingresa tu correo electrónico</Text>

                {/* Campo de entrada para el email */}
                <View style={styles.inputContainer}>
                    <PinkInputs
                        placeholder="Correo electrónico"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address" // Teclado optimizado para emails
                        autoCapitalize="none" // Evitar capitalización automática
                        icon={emailIcon} // Icono visual del email
                        style={styles.emailInput}
                        editable={!isRequesting} // Deshabilitar durante la carga
                    />
                </View>

                {/* Texto informativo sobre el proceso */}
                <Text style={styles.description}>
                    Podemos enviarte notificaciones a tu gmail con fines de seguridad e inicio de sesión.
                </Text>

                {/* Contenedor del botón principal */}
                <View style={styles.buttonContainer}>
                    <PinkButton
                        title={isRequesting ? "Enviando..." : "Continuar"}
                        onPress={handleContinue}
                        style={styles.continueButton}
                        disabled={isRequesting} // Deshabilitar durante la carga
                    />
                </View>
            </View>

            {/* Diálogo de carga */}
            <LoadingDialog
                visible={isRequesting}
                title="Enviando código..."
                message="Validando correo y enviando código de recuperación..."
                color="#FDB4B7"
            />

            {/* Alerta de éxito personalizada */}
            <CustomAlert
                visible={showSuccessAlert}
                type="success"
                title="Código Enviado"
                message={alertMessage}
                confirmText="Continuar"
                onConfirm={handleSuccessConfirm}
            />

            {/* Alerta de error personalizada */}
            <CustomAlert
                visible={showErrorAlert}
                type="error"
                title="Error"
                message={alertMessage}
                confirmText="Entendido"
                onConfirm={handleErrorConfirm}
            />
        </SafeAreaView>
    );
};

// Estilos del componente
const styles = StyleSheet.create({
    // Contenedor principal que ocupa toda la pantalla
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    // Contenedor del header con navegación
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    // Botón de navegación hacia atrás
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 25,
    },
    // Icono del botón de regreso (definido pero no aplicado en el JSX)
    backIcon: {
        width: 24,
        height: 24,
        tintColor: '#3C3550',
        resizeMode: 'contain',
    },
    // Contenedor para elementos decorativos (no aplicado en el JSX actual)
    decorativeContainer: {
        position: 'absolute',
        top: 0,
        right: 0,
        zIndex: -1,
    },
    // Imagen decorativa de fondo
    decorativeImage: {
        position: 'absolute',
        top: -55,
        right: -20,
        height: 120,
        opacity: 0.5, // Transparencia para no interferir con el contenido
        resizeMode: 'contain',
    },
    // Contenedor del contenido principal
    mainContent: {
        flex: 1,
        paddingHorizontal: 40,
        paddingTop: 40,
    },
    // Título principal de la pantalla
    title: {
        fontSize: 28,
        fontFamily: 'Poppins-Bold',
        color: '#3C3550',
        marginBottom: 30,
        textAlign: 'left',
    },
    // Subtítulo con instrucción
    subtitle: {
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        color: '#3C3550',
        marginBottom: 20,
        textAlign: 'left',
    },
    // Contenedor del campo de entrada
    inputContainer: {
        marginBottom: 20,
    },
    // Estilo específico para el input de email (definido pero no aplicado)
    emailInput: {
        marginBottom: 10,
    },
    // Texto descriptivo informativo
    description: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#666666',
        lineHeight: 20,
        marginBottom: 40,
        textAlign: 'left',
    },
    // Contenedor del botón principal centrado
    buttonContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    // Configuración específica del botón continuar
    continueButton: {
        width: '100%',
        maxWidth: 280, // Ancho máximo para mantener proporciones
    },
});

export default RecoveryPasswordScreen;