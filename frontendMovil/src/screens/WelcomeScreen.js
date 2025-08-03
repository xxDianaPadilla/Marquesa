import React from "react";
import { View, Text, StyleSheet, Dimensions, StatusBar, Image } from 'react-native';
import logoMovil from '../images/logoMovil.png';
import welcomeArrow from '../images/welcomeArrow.png';
import flowerFooter from '../images/flowerFooter.png';
import PinkButton from '../components/PinkButton';
import QuestionText from '../components/QuestionText';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) {
    const handleContinue = () => {
        console.log('Navegando a la siguiente pantalla...');
    };

    const handleLoginPress = () => {
        console.log('Ir a login');
    };

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="#F8E6E8" barStyle="dark-content" />
            
            {/* Contenido principal */}
            <View style={styles.content}>
                {/* Logo */}
                <View style={styles.logoSection}>
                    <View style={styles.logoContainer}>
                        <Image source={logoMovil} style={styles.logo} />
                        {/* Flecha decorativa debajo del logo */}
                        <Image source={welcomeArrow} style={styles.arrowImage} />
                    </View>
                </View>

                {/* Mensaje principal */}
                <Text style={styles.mainText}>
                    Tu mejor opción para crear{'\n'}momentos inolvidables
                </Text>

                {/* Botón continuar - usando el componente */}
                <PinkButton
                    title="Continuar"
                    onPress={handleContinue}
                    style={styles.continueButtonSpacing}
                />

                {/* Texto de inicio de sesión - usando el componente */}
                <QuestionText
                    questionText="¿Ya tienes una cuenta?"
                    linkText="Inicia Sesión"
                    onPress={handleLoginPress}
                    style={styles.loginTextSpacing}
                />
            </View>

            {/* Decoración inferior con imagen */}
            <View style={styles.bottomDecoration}>
                <Image source={flowerFooter} style={styles.flowerFooterImage} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FADDDD',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingTop: 60,
    },
    logoSection: {
        marginBottom: 80,
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
    },
    logo: {
        fontSize: 20,
        fontFamily: 'Poppins-SemiBold',
        letterSpacing: 3,
        color: '#6B4B6B',
        marginBottom: 15,
    },
    arrowImage: {
        width: 300,
        height: 60,
        resizeMode: 'contain',
    },
    mainText: {
        fontSize: 18,
        textAlign: 'center',
        color: '#000000',
        lineHeight: 24,
        marginBottom: 60,
        marginTop: -40,
        fontFamily: 'Poppins-Regular',
    },
    continueButtonSpacing: {
        marginBottom: 50,
    },
    loginTextSpacing: {
        marginTop: 20,
    },
    bottomDecoration: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingBottom: 30,
    },
    flowerFooterImage: {
        width: width,
        height: 120,
        resizeMode: 'cover',
        opacity: 0.8,
        bottom: -25
    },
});