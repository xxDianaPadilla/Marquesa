import React, { useState } from "react";
import { View, Text, SafeAreaView, TouchableOpacity, Image, TextInput, StyleSheet } from "react-native";
import backIcon from "../images/backIcon.png";
import sideBgFlower from "../images/sideBgFlower.png";
import PinkButton from "../components/PinkButton";

const RecoveryCodeScreen = ({navigation}) => {
    const [code, setCode] = useState(['', '', '', '', '']);

    const handleCodeChange = (value, index) => {
        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);
    };

    const handleContinue = () => {
        const fullCode = code.join('');
        console.log('Código ingresado: ', fullCode);
        navigation.navigate('ChangePassword');
    };

    const handleResendCode = () => {
        console.log('Reenviar código');
    };

    const handleGoBack = () => {
        console.log('Regresar');
        navigation.navigate('RecoveryPassword');
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Imagen de fondo decorativa */}
            <Image source={sideBgFlower} style={styles.backgroundFlower} />

            {/* Header con botón de regreso */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                    <Image source={backIcon} style={styles.backIcon} />
                </TouchableOpacity>
            </View>

            {/* Contenido principal */}
            <View style={styles.content}>
                <Text style={styles.title}>Confirma tu cuenta</Text>

                <Text style={styles.subtitle}>Ingresa el código</Text>

                {/* Campos de código */}
                <View style={styles.codeContainer}>
                    {code.map((digit, index) => (
                        <TextInput
                            key={index}
                            style={styles.codeInput}
                            value={digit}
                            onChangeText={(value) => handleCodeChange(value, index)}
                            maxLength={1}
                            keyboardType="numeric"
                            textAlign="center"
                            placeholder=""
                        />
                    ))}
                </View>

                <Text style={styles.description}>
                    Enviamos un código por gmail. Ingrésalo para confirmar tu cuenta.
                </Text>

                {/* Botón principal */}
                <View style={styles.buttonContainer}>
                    <PinkButton
                        title="Continuar"
                        onPress={handleContinue}
                        style={styles.continueButton}
                    />
                </View>

                {/* Botón secundario */}
                <TouchableOpacity onPress={handleResendCode} style={styles.resendButton}>
                    <Text style={styles.resendText}>¿No recibiste el código?</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    backgroundFlower: {
        position: 'absolute',
        top: 30,
        right: 2,
        height: 120,
        opacity: 0.5,
        resizeMode: 'contain',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    backIcon: {
        width: 24,
        height: 24,
        tintColor: '#3C3550',
        resizeMode: 'contain',
    },
    content: {
        flex: 1,
        paddingHorizontal: 30,
        paddingTop: 40,
    },
    title: {
        fontSize: 24,
        fontFamily: 'Poppins-SemiBold',
        color: '#3C3550',
        marginBottom: 30,
        textAlign: 'left',
    },
    subtitle: {
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        color: '#3C3550',
        marginBottom: 30,
    },
    codeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
        paddingHorizontal: 10,
    },
    codeInput: {
        width: 50,
        height: 50,
        borderWidth: 2,
        borderColor: '#FDB4B7',
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        fontSize: 18,
        fontFamily: 'Poppins-Medium',
        color: '#3C3550',
        textAlign: 'center',
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    description: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#666666',
        textAlign: 'left',
        lineHeight: 20,
        marginBottom: 40,
    },
    buttonContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    continueButton: {
        width: '100%',
        maxWidth: 300,
    },
    resendButton: {
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 30,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#3C3550',
        borderRadius: 25,
        marginTop: 10,
    },
    resendText: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#3C3550',
        textAlign: 'center',
    },
});

export default RecoveryCodeScreen;