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

// Importación de componentes personalizados
import PinkButton from "../components/PinkButton";
import PinkInputs from "../components/PinkInputs";
import QuestionText from "../components/QuestionText";

const RegisterScreen = ({ navigation }) => {
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

    // Función para manejar los cambios en los campos del formulario
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Función para procesar el registro del usuario
    const handleRegister = () => {
        console.log('Registrando usuario: ', formData);
        // TODO: Implementar lógica de registro
    };

    // Función para manejar el inicio de sesión con Google
    const handleGoogleSignIn = () => {
        console.log('Iniciar sesión con Google');
        // TODO: Implementar autenticación con Google
    };

    // Función para redirigir a la pantalla de login
    const handleLoginRedirect = () => {
        console.log('Navegar a login');
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

                    {/* Contenedor principal del formulario */}
                    <View style={styles.formContainer}>
                        {/* Campo de entrada para el nombre */}
                        <PinkInputs
                            placeholder="Nombre"
                            value={formData.nombre}
                            onChangeText={(value) => handleInputChange('nombre', value)}
                            icon={userIcon}
                            style={styles.inputSpacing}
                        />

                        {/* Campo de entrada para el teléfono */}
                        <PinkInputs
                            placeholder="Teléfono"
                            value={formData.telefono}
                            onChangeText={(value) => handleInputChange('telefono', value)}
                            icon={phoneIcon}
                            keyboardType="phone-pad"
                            style={styles.inputSpacing}
                        />

                        {/* Campo de entrada para el correo electrónico */}
                        <PinkInputs
                            placeholder="Correo electrónico"
                            value={formData.correo}
                            onChangeText={(value) => handleInputChange('correo', value)}
                            icon={emailIcon}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            style={styles.inputSpacing}
                        />

                        {/* Campo de entrada para la fecha de nacimiento */}
                        <PinkInputs
                            placeholder="Fecha de nacimiento"
                            value={formData.fechaNacimiento}
                            onChangeText={(value) => handleInputChange('fechaNacimiento', value)}
                            icon={calendarIcon}
                            style={styles.inputSpacing}
                            isDateInput={true}
                            dateFormat="DD/MM/YYYY"
                        />

                        {/* Campo de entrada para la dirección */}
                        <PinkInputs
                            placeholder="Dirección"
                            value={formData.direccion}
                            onChangeText={(value) => handleInputChange('direccion', value)}
                            icon={locationIcon}
                            style={styles.inputSpacing}
                        />

                        {/* Campo de entrada para la contraseña */}
                        <PinkInputs
                            placeholder="Contraseña"
                            value={formData.contrasena}
                            onChangeText={(value) => handleInputChange('contrasena', value)}
                            icon={lockIcon}
                            secureTextEntry={true}
                            style={styles.inputSpacing}
                        />

                        {/* Sección de términos y condiciones */}
                        <View style={styles.termsContainer}>
                            {/* Checkbox personalizado para términos y condiciones */}
                            <TouchableOpacity
                                style={styles.checkbox}
                                onPress={() => setAcceptedTerms(!acceptedTerms)}
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

                        {/* Botón de registro (habilitado solo si se aceptan los términos) */}
                        <PinkButton
                            title="Registrarse"
                            onPress={handleRegister}
                            disabled={!acceptedTerms}
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
        </SafeAreaView>
    );

    // Función para manejar la selección de fecha (actualmente no utilizada)
    const handleDatePress = () => {
        // Aquí implementarías la lógica del date picker
        console.log('Abrir date picker');
        // TODO: Implementar date picker nativo
    };
};

// Definición de estilos para todos los componentes
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
    // Contenedor del formulario
    formContainer: {
        paddingHorizontal: 20,
    },
    // Espaciado entre campos de entrada
    inputSpacing: {
        marginBottom: 16,
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
    // Contenedor del separador (actualmente no utilizado)
    separatorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
    },
    // Línea del separador (actualmente no utilizada)
    separatorLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E0E0E0',
    },
    // Texto del separador (actualmente no utilizado)
    separatorText: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#999999',
        marginHorizontal: 15,
    },
    // Botón de Google (actualmente no utilizado)
    googleButton: {
        alignItems: 'center',
        padding: 12,
        marginBottom: -15,
        marginTop: -15,
    },
    // Icono de Google (actualmente no utilizado)
    googleIcon: {
        width: 62,
        height: 62,
        resizeMode: 'contain',
    },
    // Contenedor del enlace de login
    loginContainer: {
        alignItems: 'center',
        marginBottom: 35,
    },
});

export default RegisterScreen;