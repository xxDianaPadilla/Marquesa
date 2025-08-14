import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, StatusBar } from "react-native";
import backIcon from "../images/backIcon.png";
import sideBgFlower from "../images/sideBgFlower.png";
import PinkInputs from "../components/PinkInputs";
import PinkButton from "../components/PinkButton";
import emailIcon from "../images/emailIcon.png";

const RecoveryPasswordScreen = ({ navigation }) => {
    const [email, setEmail] = useState("");

    const handleContinue = () => {
        console.log("Email para recuperación: ", email);
        navigation.navigate('RecoveryCode');
    };

    const handleGoBack = () => {
        console.log("Regresar");
        navigation.navigate('Login');
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            {/* Header con botón de regreso */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleGoBack}
                    activeOpacity={0.7}
                >
                    <Image source={backIcon} style={styles.backIcon} />
                </TouchableOpacity>
            </View>

            {/* Imagen decorativa en la esquina */}
            <View style={styles.decorativeContainer}>
                <Image source={sideBgFlower} style={styles.decorativeImage} />
            </View>

            {/* Contenido principal */}
            <View style={styles.mainContent}>
                <Text style={styles.title}>Recupera tu cuenta</Text>

                <Text style={styles.subtitle}>Ingresa tu correo electrónico</Text>

                {/* Campo de email */}
                <View style={styles.inputContainer}>
                    <PinkInputs
                        placeholder="Correo electrónico"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        icon={emailIcon}
                        style={styles.emailInput}
                    />
                </View>

                <Text style={styles.description}>
                    Podemos enviarte notificaciones a tu gmail con fines de seguridad e inicio de sesión.
                </Text>

                {/* Botón de continuar */}
                <View style={styles.buttonContainer}>
                    <PinkButton
                        title="Continuar"
                        onPress={handleContinue}
                        style={styles.continueButton}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 25,
    },
    decorativeImage: {
        position: 'absolute',
        top: -55,
        right: -20,
        height: 120,
        opacity: 0.5,
        resizeMode: 'contain',
    },
    mainContent: {
        flex: 1,
        paddingHorizontal: 40,
        paddingTop: 40,
    },
    title: {
        fontSize: 28,
        fontFamily: 'Poppins-Bold',
        color: '#3C3550',
        marginBottom: 30,
        textAlign: 'left',
    },
    subtitle: {
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        color: '#3C3550',
        marginBottom: 20,
        textAlign: 'left',
    },
    inputContainer: {
        marginBottom: 20,
    },
    description: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#666666',
        lineHeight: 20,
        marginBottom: 40,
        textAlign: 'left',
    },
    buttonContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    continueButton: {
        width: '100%',
        maxWidth: 280,
    },
});

export default RecoveryPasswordScreen;