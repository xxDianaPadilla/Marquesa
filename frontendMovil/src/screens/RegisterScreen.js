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
import backIcon from "../images/backIcon.png";
import sideBgFlower from "../images/sideBgFlower.png";
import userIcon from "../images/userIcon.png";
import phoneIcon from "../images/phoneIcon.png";
import emailIcon from "../images/emailIcon.png";
import calendarIcon from "../images/calendarIcon.png";
import locationIcon from "../images/locationIcon.png";
import lockIcon from "../images/lockIcon.png";
import PinkButton from "../components/PinkButton";
import PinkInputs from "../components/PinkInputs";
import QuestionText from "../components/QuestionText";

const RegisterScreen = ({ navigation }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        telefono: '',
        correo: '',
        fechaNacimiento: '',
        direccion: '',
        contrasena: ''
    });

    const [acceptedTerms, setAcceptedTerms] = useState(false);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleRegister = () => {
        console.log('Registrando usuario: ', formData);
    };

    const handleGoogleSignIn = () => {
        console.log('Iniciar sesión con Google');
    };

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

            <KeyboardAvoidingView 
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.backButton} onPress={handleLoginRedirect}>
                            <Image source={backIcon} style={styles.backIcon} />
                        </TouchableOpacity>
                        <Text style={styles.title}>Registrate</Text>
                    </View>

                    {/* Subtítulo */}
                    <Text style={styles.subtitle}>Crea tu cuenta</Text>

                    {/* Formulario */}
                    <View style={styles.formContainer}>
                        <PinkInputs
                            placeholder="Nombre"
                            value={formData.nombre}
                            onChangeText={(value) => handleInputChange('nombre', value)}
                            icon={userIcon}
                            style={styles.inputSpacing}
                        />

                        <PinkInputs
                            placeholder="Teléfono"
                            value={formData.telefono}
                            onChangeText={(value) => handleInputChange('telefono', value)}
                            icon={phoneIcon}
                            keyboardType="phone-pad"
                            style={styles.inputSpacing}
                        />

                        <PinkInputs
                            placeholder="Correo electrónico"
                            value={formData.correo}
                            onChangeText={(value) => handleInputChange('correo', value)}
                            icon={emailIcon}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            style={styles.inputSpacing}
                        />

                        <PinkInputs
                            placeholder="Fecha de nacimiento"
                            value={formData.fechaNacimiento}
                            onChangeText={(value) => handleInputChange('fechaNacimiento', value)}
                            icon={calendarIcon}
                            style={styles.inputSpacing}
                            isDateInput={true}
                            dateFormat="DD/MM/YYYY"
                        />

                        <PinkInputs
                            placeholder="Dirección"
                            value={formData.direccion}
                            onChangeText={(value) => handleInputChange('direccion', value)}
                            icon={locationIcon}
                            style={styles.inputSpacing}
                        />

                        <PinkInputs
                            placeholder="Contraseña"
                            value={formData.contrasena}
                            onChangeText={(value) => handleInputChange('contrasena', value)}
                            icon={lockIcon}
                            secureTextEntry={true}
                            style={styles.inputSpacing}
                        />

                        {/* Términos y condiciones */}
                        <View style={styles.termsContainer}>
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
                            <Text style={styles.termsText}>
                                Acepto los{' '}
                                <Text style={styles.termsLink}>Términos y Condiciones</Text>
                            </Text>
                        </View>

                        {/* Botón de registro */}
                        <PinkButton
                            title="Registrarse"
                            onPress={handleRegister}
                            disabled={!acceptedTerms}
                            style={styles.registerButton}
                        />

                        {/* Link a login */}
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

    // Función para manejar la selección de fecha 
    const handleDatePress = () => {
        // Aquí implementarías la lógica del date picker
        console.log('Abrir date picker');
    };
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF'
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    backgroundFlower: {
        position: 'absolute',
        top: 35,
        right: -20,
        height: 120,
        opacity: 0.5,
        resizeMode: 'contain',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 30,
        flexGrow: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 40,
        marginBottom: 10,
    },
    backButton: {
        padding: 10,
        marginRight: 20,
    },
    title: {
        fontSize: 24,
        fontFamily: 'Poppins-SemiBold',
        color: '#999999',
        flex: 1,
        textAlign: 'center',
        marginRight: 54,
    },
    subtitle: {
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        color: '#999999',
        textAlign: 'left',
        paddingHorizontal: 20,
        marginBottom: 20,
        marginTop: 10,
    },
    formContainer: {
        paddingHorizontal: 20,
    },
    inputSpacing: {
        marginBottom: 16,
    },
    termsContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 30,
        paddingHorizontal: 4,
    },
    checkbox: {
        marginRight: 12,
        marginTop: 10,
    },
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
    checkboxChecked: {
        backgroundColor: '#FDB4B7',
    },
    checkmark: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    termsText: {
        fontSize: 14,
        marginTop: 10,
        fontFamily: 'Poppins-Regular',
        color: "#666666",
        flex: 1,
        lineHeight: 20,
    },
    termsLink: {
        color: '#FDB4B7',
        fontFamily: 'Poppins-Medium',
    },
    registerButton: {
        marginBottom: 30,
        alignSelf: 'center',
        width: '100%',
    },
    separatorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
    },
    separatorLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E0E0E0',
    },
    separatorText: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#999999',
        marginHorizontal: 15,
    },
    googleButton: {
        alignItems: 'center',
        padding: 12,
        marginBottom: -15,
        marginTop: -15,
    },
    googleIcon: {
        width: 62,
        height: 62,
        resizeMode: 'contain',
    },
    loginContainer: {
        alignItems: 'center',
        marginBottom: 35,
    },
});

export default RegisterScreen;