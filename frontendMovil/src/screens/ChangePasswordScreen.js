import React, { useState } from "react";
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    Image, 
    SafeAreaView, 
    ScrollView, 
    KeyboardAvoidingView,  
    Platform 
} from "react-native";

// Importación de iconos y elementos gráficos
import backIcon from '../images/backIcon.png';
import sideBgFlower from "../images/sideBgFlower.png";
import eyeIcon from "../images/eyeIcon.png";
import eyeOffIcon from "../images/eyeOffIcon.png";

// Importación de componentes personalizados
import PinkInputs from "../components/PinkInputs";
import PinkButton from "../components/PinkButton";
import PasswordRequirements from "../components/PasswordRequirements";

// Importación de componentes personalizados para alertas y carga
import { CustomAlert, LoadingDialog } from "../components/CustomDialogs";

// Importación del hook personalizado para recuperación de contraseña
import usePasswordReset from "../hooks/usePasswordReset";

/**
 * Pantalla para cambiar/crear nueva contraseña
 * Permite al usuario establecer una nueva contraseña con confirmación
 * @param {object} navigation - Objeto de navegación de React Navigation
 * @param {object} route - Objeto de ruta que contiene parámetros (email, verificationCode)
 */
const ChangePasswordScreen = ({ navigation, route }) => {
    // Obtener email y código de verificación desde los parámetros de navegación
    const { email, verificationCode } = route.params || {};

    // Estados para manejar los valores de los campos de contraseña
    const [newPassword, setNewPassword] = useState(""); // Contraseña nueva
    const [confirmPassword, setConfirmPassword] = useState(""); // Confirmación de contraseña
    
    // Estados para controlar la visibilidad de las contraseñas
    const [showNewPassword, setShowNewPassword] = useState(false); // Mostrar/ocultar nueva contraseña
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Mostrar/ocultar confirmación

    // Estados para controlar las alertas personalizadas
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [showErrorAlert, setShowErrorAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    // Hook personalizado para recuperación de contraseña
    const {
        isUpdatingPassword,
        updatePassword,
        clearError
    } = usePasswordReset();

    // Estado local para controlar cuando mostrar la alerta de carga
    const [isProcessing, setIsProcessing] = useState(false);

    /**
     * Función para validar contraseña según los requisitos del sistema
     * @param {string} password - Contraseña a validar
     * @returns {object} - Objeto con isValid y error
     */
    const validatePassword = (password) => {
        if (!password || typeof password !== 'string') {
            return { isValid: false, error: "Contraseña es requerida" };
        }
        
        if (password.length < 8) {
            return { isValid: false, error: "Contraseña debe tener al menos 8 caracteres" };
        }
        
        if (password.length > 128) {
            return { isValid: false, error: "Contraseña demasiado larga" };
        }
        
        // Validar complejidad de contraseña
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        
        if (!hasUppercase || !hasLowercase || !hasNumbers) {
            return {
                isValid: false,
                error: "Contraseña debe contener al menos una mayúscula, una minúscula y un número"
            };
        }
        
        return { isValid: true };
    };

    /**
     * Maneja el evento de retroceso
     * Navega de vuelta a la pantalla de código de recuperación
     */
    const handleBack = () => {
        console.log("Back pressed");
        navigation.navigate("RecoveryCode", { email });
    };

    /**
     * Maneja el evento de continuar
     * Procesa las contraseñas, valida y envía al backend
     */
    const handleContinue = async () => {
        console.log("Continue pressed");
        
        // Limpiar errores previos
        clearError();

        // Validar que las contraseñas no estén vacías
        if (!newPassword.trim()) {
            setAlertMessage("Por favor ingresa una contraseña");
            setShowErrorAlert(true);
            return;
        }

        if (!confirmPassword.trim()) {
            setAlertMessage("Por favor confirma tu contraseña");
            setShowErrorAlert(true);
            return;
        }

        // Validar que las contraseñas coincidan
        if (newPassword !== confirmPassword) {
            setAlertMessage("Las contraseñas no coinciden");
            setShowErrorAlert(true);
            return;
        }

        // Validar que la contraseña cumpla los requisitos
        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            setAlertMessage(passwordValidation.error);
            setShowErrorAlert(true);
            return;
        }

        // Verificar que tenemos los datos necesarios
        if (!email || !verificationCode) {
            setAlertMessage("Error: faltan datos de verificación. Inicia el proceso nuevamente.");
            setShowErrorAlert(true);
            return;
        }

        // Iniciar estado de procesamiento
        setIsProcessing(true);

        try {
            // Enviar nueva contraseña al backend
            const result = await updatePassword(email, verificationCode, newPassword);

            if (result.success) {
                // Mostrar alerta de éxito
                setAlertMessage("Contraseña actualizada correctamente");
                setShowSuccessAlert(true);
            } else {
                // Mostrar alerta de error
                setAlertMessage(result.message || "Error al actualizar la contraseña");
                setShowErrorAlert(true);
            }
        } catch (error) {
            // Manejar errores de conexión
            setAlertMessage("Error de conexión. Verifica tu internet e inténtalo nuevamente.");
            setShowErrorAlert(true);
        } finally {
            // Detener estado de procesamiento
            setIsProcessing(false);
        }
    };

    /**
     * Función para manejar la confirmación de éxito
     */
    const handleSuccessConfirm = () => {
        setShowSuccessAlert(false);
        // Navegar al login después del éxito
        navigation.navigate("Login");
    };

    /**
     * Función para cerrar alerta de error
     */
    const handleErrorConfirm = () => {
        setShowErrorAlert(false);
    };

    /**
     * Alterna la visibilidad de la nueva contraseña
     * Cambia entre mostrar texto plano y texto oculto
     */
    const toggleNewPasswordVisibility = () => {
        setShowNewPassword(!showNewPassword);
    };

    /**
     * Alterna la visibilidad de la confirmación de contraseña
     * Cambia entre mostrar texto plano y texto oculto
     */
    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Elemento decorativo de fondo - flor en la esquina superior derecha */}
            <Image source={sideBgFlower} style={styles.backgroundFlower} />

            {/* KeyboardAvoidingView para evitar que el teclado tape los inputs */}
            <KeyboardAvoidingView
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                {/* ScrollView para permitir scroll cuando el teclado está visible */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.content}>
                        {/* Header con botón de retroceso */}
                        <View style={styles.header}>
                            <TouchableOpacity 
                                onPress={handleBack} 
                                style={styles.backButton}
                                disabled={isProcessing} // Deshabilitar durante la carga
                            >
                                <Image source={backIcon} style={styles.backIcon} />
                            </TouchableOpacity>
                        </View>

                        {/* Sección de título y descripción */}
                        <View style={styles.titleSection}>
                            <Text style={styles.title}>Crea una nueva contraseña</Text>
                            <Text style={styles.description}>
                                Crea una contraseña que contenga al menos 8 caracteres. Debes incluir caracteres especiales, mayúsculas y minúsculas.
                            </Text>
                        </View>

                        {/* Contenedor de campos de entrada de contraseña */}
                        <View style={styles.inputsContainer}>
                            {/* Campo para la nueva contraseña */}
                            <PinkInputs
                                placeholder="Contraseña nueva"
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry={!showNewPassword} // Oculta el texto si showNewPassword es false
                                showPasswordToggle={true} // Habilita el botón de mostrar/ocultar
                                onTogglePassword={toggleNewPasswordVisibility}
                                eyeIcon={eyeIcon} // Icono para mostrar contraseña
                                eyeOffIcon={eyeOffIcon} // Icono para ocultar contraseña
                                style={styles.inputSpacing}
                                editable={!isProcessing} // Deshabilitar durante la carga
                            />

                            {/* Componente de requisitos de contraseña */}
                            <PasswordRequirements password={newPassword} />

                            {/* Campo para confirmar la contraseña */}
                            <PinkInputs
                                placeholder="Confirmar contraseña"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showConfirmPassword} // Oculta el texto si showConfirmPassword es false
                                showPasswordToggle={true} // Habilita el botón de mostrar/ocultar
                                onTogglePassword={toggleConfirmPasswordVisibility}
                                eyeIcon={eyeIcon} // Icono para mostrar contraseña
                                eyeOffIcon={eyeOffIcon} // Icono para ocultar contraseña
                                style={styles.inputSpacing}
                                editable={!isProcessing} // Deshabilitar durante la carga
                            />
                        </View>

                        {/* Contenedor del botón de continuar */}
                        <View style={styles.buttonContainer}>
                            <PinkButton
                                title={isProcessing ? "Actualizando..." : "Continuar"}
                                onPress={handleContinue}
                                style={styles.continueButton}
                                disabled={isProcessing} // Deshabilitar durante la carga
                            />
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Diálogo de carga */}
            <LoadingDialog
                visible={isProcessing}
                title="Actualizando contraseña..."
                message="Guardando tu nueva contraseña..."
                color="#FDB4B7"
            />

            {/* Alerta de éxito personalizada */}
            <CustomAlert
                visible={showSuccessAlert}
                type="success"
                title="¡Éxito!"
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

const styles = StyleSheet.create({
    // Contenedor principal - ocupa toda la pantalla con fondo blanco
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    
    // KeyboardAvoidingView para ajustar la vista cuando aparece el teclado
    keyboardAvoidingView: {
        flex: 1,
    },
    
    // ScrollView para permitir desplazamiento
    scrollView: {
        flex: 1,
    },
    
    // Contenido del ScrollView con padding inferior para scroll completo
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 30,
    },
    
    // Elemento decorativo de fondo - flor posicionada en la esquina superior derecha
    backgroundFlower: {
        position: 'absolute',
        top: 40,
        right: 0,
        width: 100,
        height: 100,
        resizeMode: 'contain',
        opacity: 0.6, // Opacidad reducida para que no interfiera con el contenido
    },
    
    // Contenedor principal del contenido con padding horizontal
    content: {
        flex: 1,
        paddingHorizontal: 24, // Espaciado lateral consistente
        paddingTop: 20,
    },
    
    // Header que contiene el botón de retroceso
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 40, // Espaciado inferior generoso
    },
    
    // Área clickeable del botón de retroceso con padding para mejor UX
    backButton: {
        padding: 8, // Área de toque más grande
        marginTop: 20,
    },
    
    // Estilo del icono de retroceso
    backIcon: {
        width: 24,
        height: 24,
        tintColor: '#3C3550', // Color gris oscuro
        resizeMode: 'contain',
    },
    
    // Sección que contiene título y descripción
    titleSection: {
        marginBottom: 40, // Espaciado antes de los inputs
    },
    
    // Título principal de la pantalla
    title: {
        fontSize: 24,
        fontFamily: 'Poppins-SemiBold', // Fuente semi-bold para énfasis
        color: '#3C3550', // Color principal de texto
        marginBottom: 16,
        lineHeight: 32, // Espaciado vertical mejorado
    },
    
    // Texto descriptivo con instrucciones para la contraseña
    description: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular', // Fuente regular para texto secundario
        color: '#666666', // Color gris para texto secundario
        lineHeight: 22, // Espaciado para mejor legibilidad
    },
    
    // Contenedor que agrupa los campos de entrada
    inputsContainer: {
        marginBottom: 40, // Espaciado antes del botón
    },
    
    // Espaciado entre campos de entrada
    inputSpacing: {
        marginBottom: 20,
    },
    
    // Contenedor del botón de continuar con ancho limitado
    buttonContainer: {
        width: '100%',
        maxWidth: 300, // Ancho máximo para mantener proporciones en pantallas grandes
    },
});

export default ChangePasswordScreen;