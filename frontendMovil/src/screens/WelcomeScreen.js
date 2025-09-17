import React from "react";
import { View, Text, StyleSheet, Dimensions, StatusBar, Image } from 'react-native';
// Importación de imágenes estáticas
import logoMovil from '../images/logoMovil.png'; // Logo principal de la aplicación
import welcomeArrow from '../images/welcomeArrow.png'; // Flecha decorativa para el logo
import flowerFooter from '../images/flowerFooter.png'; // Decoración floral del pie de página
// Importación de componentes reutilizables
import PinkButton from '../components/PinkButton'; // Botón principal rosa personalizado
import QuestionText from '../components/QuestionText'; // Componente para texto con pregunta y enlace

// Obtener las dimensiones de la pantalla del dispositivo
const { width, height } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) {
    // Función manejadora para el botón "Continuar"
    const handleContinue = () => {
        console.log('Navegando a la pantalla de registro...');
        navigation.navigate('Login'); // Navegar a la pantalla de Login
    };

    // Función manejadora para el enlace "Regístrate"
    const handleRegisterPress = () => {
        console.log('Ir a Registro');
        navigation.navigate('Register'); // Navegar a la pantalla de Register
    };

    return (
        <View style={styles.container}>
            {/* Configuración de la barra de estado */}
            <StatusBar backgroundColor="#F8E6E8" barStyle="dark-content" />
            
            {/* Contenido principal de la pantalla */}
            <View style={styles.content}>
                {/* Sección del logo y flecha decorativa */}
                <View style={styles.logoSection}>
                    <View style={styles.logoContainer}>
                        {/* Logo principal de la aplicación */}
                        <Image source={logoMovil} style={styles.logo} />
                        {/* Flecha decorativa debajo del logo */}
                        <Image source={welcomeArrow} style={styles.arrowImage} />
                    </View>
                </View>

                {/* Mensaje principal de bienvenida */}
                <Text style={styles.mainText}>
                    Tu mejor opción para crear{'\n'}momentos inolvidables
                </Text>

                {/* Botón continuar - usando el componente PinkButton */}
                <PinkButton
                    title="Continuar"
                    onPress={handleContinue}
                    style={styles.continueButtonSpacing} // Estilo adicional para espaciado
                />

                {/* Texto de pregunta con enlace - usando el componente QuestionText */}
                <QuestionText
                    questionText="¿No tienes una cuenta?"
                    linkText="Regístrate"
                    onPress={handleRegisterPress}
                    style={styles.loginTextSpacing} // Estilo adicional para espaciado
                />
            </View>

            {/* Decoración inferior con imagen de flores */}
            <View style={styles.bottomDecoration}>
                <Image source={flowerFooter} style={styles.flowerFooterImage} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    // Contenedor principal de la pantalla
    container: {
        flex: 1,
        backgroundColor: '#FADDDD', // Color de fondo rosa suave
    },
    // Contenedor del contenido principal centrado
    content: {
        flex: 1,
        justifyContent: 'center', // Centrar verticalmente
        alignItems: 'center', // Centrar horizontalmente
        paddingHorizontal: 40, // Espaciado lateral
        paddingTop: 60, // Espaciado superior
    },
    // Sección que contiene el logo y elementos relacionados
    logoSection: {
        marginBottom: 80, // Espaciado inferior grande
        alignItems: 'center',
    },
    // Contenedor específico del logo para alineación
    logoContainer: {
        alignItems: 'center',
    },
    // Estilo del logo principal (actualmente configurado como texto)
    logo: {
        fontSize: 20,
        fontFamily: 'Poppins-SemiBold',
        letterSpacing: 3, // Espaciado entre letras
        color: '#6B4B6B', // Color morado/rosa oscuro
        marginBottom: 15,
    },
    // Estilo de la imagen de flecha decorativa
    arrowImage: {
        width: 300,
        height: 60,
        resizeMode: 'contain', // Mantener proporción de la imagen
    },
    // Estilo del texto principal descriptivo
    mainText: {
        fontSize: 18,
        textAlign: 'center',
        color: '#000000', // Color negro
        lineHeight: 24, // Altura de línea para mejor legibilidad
        marginBottom: 60, // Espaciado inferior
        marginTop: -40, // Espaciado superior negativo para acercar al logo
        fontFamily: 'Poppins-Regular',
    },
    // Espaciado específico para el botón continuar
    continueButtonSpacing: {
        marginBottom: 50, // Espaciado inferior del botón
    },
    // Espaciado específico para el texto de login
    loginTextSpacing: {
        marginTop: 20, // Espaciado superior del texto
    },
    // Contenedor de la decoración inferior
    bottomDecoration: {
        position: 'absolute', // Posicionamiento absoluto
        bottom: 0, // Pegado al fondo
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingBottom: 30, // Espaciado interno inferior
    },
    // Estilo de la imagen de flores del pie de página
    flowerFooterImage: {
        width: width, // Ancho completo de la pantalla
        height: 120, // Altura fija
        resizeMode: 'cover', // Cubrir todo el espacio disponible
        opacity: 0.8, // Ligeramente transparente
        bottom: -25 // Posicionamiento para que se vea parcialmente fuera de pantalla
    },
});