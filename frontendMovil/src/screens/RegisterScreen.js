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

// Importación de imágenes e iconos
import backIcon from "../images/backIcon.png";
import sideBgFlower from "../images/sideBgFlower.png";
import userIcon from "../images/userIcon.png";
import phoneIcon from "../images/phoneIcon.png";
import emailIcon from "../images/emailIcon.png";
import calendarIcon from "../images/calendarIcon.png";
import locationIcon from "../images/locationIcon.png";
import lockIcon from "../images/lockIcon.png";
import eyeIcon from "../images/eyeIcon.png";
import eyeOffIcon from "../images/eyeOffIcon.png";

// Importación de componentes personalizados
import PinkButton from "../components/PinkButton";
import PinkInputs from "../components/PinkInputs";
import QuestionText from "../components/QuestionText";
import ValidationMessage from "../components/ValidationMessage";
import { CustomAlert, LoadingDialog } from "../components/CustomDialogs";

// Importación del modal de verificación de email
import EmailVerificationModalMobile from "../components/EmailVerification/EmailVerificationModalMobile";

// Importación de hooks personalizados
import useRegister from "../hooks/useRegister";
import { useAuth } from "../context/AuthContext";

const RegisterScreen = ({ navigation }) => {
    // Hook personalizado para el registro con la nueva función
    const {
        isRegistering,
        fieldErrors,
        generalError,
        handleRegisterProcess, // NUEVA función que maneja el proceso por pasos
        clearFieldError,
        formatPhoneInput
    } = useRegister();

    // Obtener función de login del contexto para auto-login después del registro
    const { login } = useAuth();

    // Estado para manejar los datos del formulario de registro
    const [formData, setFormData] = useState({
        nombre: '',
        telefono: '',
        correo: '',
        fechaNacimiento: '',
        direccion: '',
        contrasena: ''
    });

    // Estado para manejar la aceptación de términos y condiciones
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    // Estados para controlar las alertas personalizadas
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [showErrorAlert, setShowErrorAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Estados para el modal de verificación de email
    const [showEmailVerification, setShowEmailVerification] = useState(false);

    // Estado para controlar el proceso de validación
    const [isValidating, setIsValidating] = useState(false);

    // Función para manejar los cambios en los campos del formulario
    const handleInputChange = (field, value) => {
        let processedValue = value;

        // Formatear automáticamente el teléfono mientras se escribe
        if (field === 'telefono') {
            processedValue = formatPhoneInput(value);
        }

        setFormData(prev => ({
            ...prev,
            [field]: processedValue
        }));

        // Limpiar error del campo cuando el usuario comienza a escribir
        if (fieldErrors[field]) {
            clearFieldError(field);
        }
    };

    // NUEVA función para manejar el proceso de registro por pasos
    const handleRegisterSubmit = async () => {
        // Validar que se acepten los términos y condiciones
        if (!acceptedTerms) {
            setAlertMessage('Debes aceptar los términos y condiciones para continuar');
            setShowErrorAlert(true);
            return;
        }

        try {
            setIsValidating(true);
            console.log('Iniciando proceso de registro por pasos...');

            // Ejecutar el proceso de registro por pasos
            const result = await handleRegisterProcess(formData);

            console.log('Resultado del proceso:', result);

            if (result.success) {
                // Si todo está bien, mostrar modal de verificación de email
                if (result.step === 'ready_for_verification') {
                    console.log('Mostrando modal de verificación de email');
                    setShowEmailVerification(true);
                }
            } else {
                // Manejar diferentes tipos de errores
                switch (result.step) {
                    case 'validation':
                        // Los errores de validación ya se establecieron en fieldErrors
                        console.log('Errores de validación mostrados en campos');
                        break;

                    case 'email_exists':
                    case 'email_check':
                    case 'error':
                    default:
                        // Mostrar error general
                        setAlertMessage(result.message);
                        setShowErrorAlert(true);
                        break;
                }
            }
        } catch (error) {
            console.error('Error en registro:', error);
            setAlertMessage('Error inesperado durante el registro');
            setShowErrorAlert(true);
        } finally {
            setIsValidating(false);
        }
    };

    // Función que se ejecuta cuando la verificación de email es exitosa
    const handleEmailVerificationSuccess = () => {
        setShowEmailVerification(false);

        // Mostrar alerta de éxito
        setAlertMessage('Tu correo ha sido verificado y tu cuenta ha sido creada exitosamente. Ahora serás dirigido al inicio.');
        setShowSuccessAlert(true);
    };

    // Función para manejar errores del modal de verificación de email
    const handleEmailVerificationError = (errorMessage) => {
        console.log('Error de verificación de email:', errorMessage);
        setAlertMessage(errorMessage);
        setShowErrorAlert(true);
    };

    // Función para cerrar el modal de verificación de email
    const handleEmailVerificationClose = () => {
        setShowEmailVerification(false);
    };

    // Función para manejar la confirmación de registro exitoso
    const handleSuccessConfirm = async () => {
        setShowSuccessAlert(false);

        try {
            // Intentar hacer login automático después del registro
            const loginResult = await login(formData.correo, formData.contrasena);

            if (loginResult.success) {
                // Navegar al TabNavigator (que incluye Home)
                navigation.replace('TabNavigator');
            } else {
                // Si falla el auto-login, ir a la pantalla de login
                navigation.replace('Login');
            }
        } catch (loginError) {
            console.log('Error en auto-login:', loginError);
            // En caso de error, ir a login
            navigation.replace('Login');
        }
    };

    // Función para cerrar alerta de error
    const handleErrorConfirm = () => {
        setShowErrorAlert(false);
    };

    // Función para redirigir a la pantalla de login
    const handleLoginRedirect = () => {
        navigation.navigate('Login');
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Imagen de fondo decorativa */}
            <Image
                source={sideBgFlower}
                style={styles.backgroundFlower}
            />

            {/* Contenedor que ajusta la vista cuando aparece el teclado */}
            <KeyboardAvoidingView
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                {/* ScrollView para permitir desplazamiento cuando el contenido es largo */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header con botón de retroceso y título */}
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.backButton} onPress={handleLoginRedirect}>
                            <Image source={backIcon} style={styles.backIcon} />
                        </TouchableOpacity>
                        <Text style={styles.title}>Registrate</Text>
                    </View>

                    {/* Subtítulo de la pantalla */}
                    <Text style={styles.subtitle}>Crea tu cuenta</Text>

                    {/* Mensaje de error general si existe */}
                    {generalError ? (
                        <ValidationMessage
                            message={generalError}
                            type="error"
                            style={styles.generalError}
                        />
                    ) : null}

                    {/* Contenedor principal del formulario */}
                    <View style={styles.formContainer}>
                        {/* Campo de entrada para el nombre */}
                        <View style={styles.inputGroup}>
                            <PinkInputs
                                placeholder="Nombre completo"
                                value={formData.nombre}
                                onChangeText={(value) => handleInputChange('nombre', value)}
                                icon={userIcon}
                                style={[styles.inputSpacing, fieldErrors.nombre && styles.inputError]}
                                editable={!isRegistering && !isValidating}
                            />
                            <ValidationMessage
                                message={fieldErrors.nombre}
                                visible={!!fieldErrors.nombre}
                            />
                        </View>

                        {/* Campo de entrada para el teléfono con formateo automático */}
                        <View style={styles.inputGroup}>
                            <PinkInputs
                                placeholder="Teléfono (xxxx-xxxx)"
                                value={formData.telefono}
                                onChangeText={(value) => handleInputChange('telefono', value)}
                                icon={phoneIcon}
                                keyboardType="phone-pad"
                                style={[styles.inputSpacing, fieldErrors.telefono && styles.inputError]}
                                editable={!isRegistering && !isValidating}
                                maxLength={9} // 8 números + 1 guión
                            />
                            <ValidationMessage
                                message={fieldErrors.telefono}
                                visible={!!fieldErrors.telefono}
                            />
                        </View>

                        {/* Campo de entrada para el correo electrónico */}
                        <View style={styles.inputGroup}>
                            <PinkInputs
                                placeholder="Correo electrónico"
                                value={formData.correo}
                                onChangeText={(value) => handleInputChange('correo', value)}
                                icon={emailIcon}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                style={[styles.inputSpacing, fieldErrors.correo && styles.inputError]}
                                editable={!isRegistering && !isValidating}
                            />
                            <ValidationMessage
                                message={fieldErrors.correo}
                                visible={!!fieldErrors.correo}
                            />
                        </View>

                        {/* Campo de entrada para la fecha de nacimiento */}
                        <View style={styles.inputGroup}>
                            <PinkInputs
                                placeholder="Fecha de nacimiento"
                                value={formData.fechaNacimiento}
                                onChangeText={(value) => handleInputChange('fechaNacimiento', value)}
                                icon={calendarIcon}
                                style={[styles.inputSpacing, fieldErrors.fechaNacimiento && styles.inputError]}
                                isDateInput={true}
                                dateFormat="DD/MM/YYYY"
                                editable={!isRegistering && !isValidating}
                            />
                            <ValidationMessage
                                message={fieldErrors.fechaNacimiento}
                                visible={!!fieldErrors.fechaNacimiento}
                            />
                        </View>

                        {/* Campo de entrada para la dirección */}
                        <View style={styles.inputGroup}>
                            <PinkInputs
                                placeholder="Dirección completa"
                                value={formData.direccion}
                                onChangeText={(value) => handleInputChange('direccion', value)}
                                icon={locationIcon}
                                style={[styles.inputSpacing, fieldErrors.direccion && styles.inputError]}
                                editable={!isRegistering && !isValidating}
                            />
                            <ValidationMessage
                                message={fieldErrors.direccion}
                                visible={!!fieldErrors.direccion}
                            />
                        </View>

                        {/* Campo de entrada para la contraseña */}
                        <View style={styles.inputGroup}>
                            <PinkInputs
                                placeholder="Contraseña"
                                value={formData.contrasena}
                                onChangeText={(value) => handleInputChange('contrasena', value)}
                                icon={lockIcon}
                                style={[styles.inputSpacing, fieldErrors.contrasena && styles.inputError]}
                                editable={!isRegistering && !isValidating}
                                secureTextEntry={!showPassword} // Ocultar/mostrar contraseña
                                showPasswordToggle={true} // Mostrar botón de toggle
                                onTogglePassword={() => setShowPassword(!showPassword)}
                                eyeIcon={eyeIcon}
                                eyeOffIcon={eyeOffIcon}
                            />
                            <ValidationMessage
                                message={fieldErrors.contrasena}
                                visible={!!fieldErrors.contrasena}
                            />
                        </View>

                        {/* Sección de términos y condiciones */}
                        <View style={styles.termsContainer}>
                            {/* Checkbox personalizado para términos y condiciones */}
                            <TouchableOpacity
                                style={styles.checkbox}
                                onPress={() => setAcceptedTerms(!acceptedTerms)}
                                disabled={isRegistering || isValidating}
                            >
                                <View style={[
                                    styles.checkboxSquare,
                                    acceptedTerms && styles.checkboxChecked
                                ]}>
                                    {acceptedTerms && <Text style={styles.checkmark}>✓</Text>}
                                </View>
                            </TouchableOpacity>
                            {/* Texto de términos y condiciones */}
                            <Text style={styles.termsText}>
                                Acepto los{' '}
                                <Text style={styles.termsLink}>Términos y Condiciones</Text>
                            </Text>
                        </View>

                        {/* Botón de registro */}
                        <PinkButton
                            title={isValidating ? "Validando..." : isRegistering ? "Registrando..." : "Registrarse"}
                            onPress={handleRegisterSubmit}
                            disabled={!acceptedTerms || isRegistering || isValidating}
                            style={styles.registerButton}
                        />

                        {/* Componente de pregunta con enlace para ir al login */}
                        <QuestionText
                            questionText="¿Ya tienes una cuenta?"
                            linkText="Inicia Sesión"
                            onPress={handleLoginRedirect}
                            style={styles.loginContainer}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Modal de verificación de email */}
            <EmailVerificationModalMobile
                isVisible={showEmailVerification}
                onClose={handleEmailVerificationClose}
                email={formData.correo}
                fullName={formData.nombre}
                userData={{
                    fullName: formData.nombre.trim(),
                    phone: formData.telefono,
                    email: formData.correo.trim().toLowerCase(),
                    birthDate: formData.fechaNacimiento,
                    address: formData.direccion.trim(),
                    password: formData.contrasena
                }}
                onSuccess={handleEmailVerificationSuccess}
                onError={handleEmailVerificationError}
            />

            {/* Diálogo de carga durante la validación */}
            <LoadingDialog
                visible={isValidating}
                title="Validando..."
                message="Verificando los datos del formulario..."
                color="#FDB4B7"
            />

            {/* Diálogo de carga durante el registro */}
            <LoadingDialog
                visible={isRegistering}
                title="Registrando..."
                message="Creando tu cuenta, por favor espera..."
                color="#FDB4B7"
            />

            {/* Alerta de éxito personalizada */}
            <CustomAlert
                visible={showSuccessAlert}
                type="success"
                title="Registro Exitoso"
                message={alertMessage}
                confirmText="Continuar"
                onConfirm={handleSuccessConfirm}
            />

            {/* Alerta de error personalizada */}
            <CustomAlert
                visible={showErrorAlert}
                type="error"
                title="Error en el Registro"
                message={alertMessage}
                confirmText="Entendido"
                onConfirm={handleErrorConfirm}
            />
        </SafeAreaView>
    );
};

// Los estilos permanecen iguales...
const styles = StyleSheet.create({
    // Contenedor principal de la pantalla
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF'
    },
    // Contenedor para evitar que el teclado cubra el contenido
    keyboardAvoidingView: {
        flex: 1,
    },
    // Imagen decorativa de fondo
    backgroundFlower: {
        position: 'absolute',
        top: 35,
        right: -20,
        height: 120,
        opacity: 0.5,
        resizeMode: 'contain',
    },
    // Vista de desplazamiento
    scrollView: {
        flex: 1,
    },
    // Contenido del ScrollView
    scrollContent: {
        paddingBottom: 30,
        flexGrow: 1,
    },
    // Estilo del header con título y botón de retroceso
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 40,
        marginBottom: 10,
    },
    // Botón de retroceso
    backButton: {
        padding: 10,
        marginRight: 20,
    },
    // Icono de retroceso
    backIcon: {
        width: 24,
        height: 24,
        tintColor: '#999999',
    },
    // Título principal de la pantalla
    title: {
        fontSize: 24,
        fontFamily: 'Poppins-SemiBold',
        color: '#999999',
        flex: 1,
        textAlign: 'center',
        marginRight: 54, // Compensación para centrar el título
    },
    // Subtítulo de la pantalla
    subtitle: {
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        color: '#999999',
        textAlign: 'left',
        paddingHorizontal: 20,
        marginBottom: 20,
        marginTop: 10,
    },
    // Mensaje de error general
    generalError: {
        marginHorizontal: 20,
        marginBottom: 15,
        padding: 10,
        backgroundColor: '#FEF2F2',
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#E53E3E',
    },
    // Contenedor del formulario
    formContainer: {
        paddingHorizontal: 20,
    },
    // Grupo de input con validación
    inputGroup: {
        marginBottom: 16,
    },
    // Espaciado entre campos de entrada
    inputSpacing: {
        marginBottom: 0,
    },
    // Estilo para inputs con error
    inputError: {
        borderColor: '#E53E3E',
        borderWidth: 2,
    },
    // Contenedor de términos y condiciones
    termsContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 30,
        paddingHorizontal: 4,
    },
    // Área del checkbox
    checkbox: {
        marginRight: 12,
        marginTop: 10,
    },
    // Cuadrado del checkbox
    checkboxSquare: {
        width: 18,
        height: 18,
        borderWidth: 2,
        borderColor: '#FDB4B7',
        borderRadius: 3,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Estado marcado del checkbox
    checkboxChecked: {
        backgroundColor: '#FDB4B7',
    },
    // Marca de verificación del checkbox
    checkmark: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    // Texto de términos y condiciones
    termsText: {
        fontSize: 14,
        marginTop: 10,
        fontFamily: 'Poppins-Regular',
        color: "#666666",
        flex: 1,
        lineHeight: 20,
    },
    // Enlace de términos y condiciones
    termsLink: {
        color: '#FDB4B7',
        fontFamily: 'Poppins-Medium',
    },
    // Botón de registro
    registerButton: {
        marginBottom: 30,
        alignSelf: 'center',
        width: '100%',
    },
    // Contenedor del enlace de login
    loginContainer: {
        alignItems: 'center',
        marginBottom: 35,
    },
});

export default RegisterScreen;