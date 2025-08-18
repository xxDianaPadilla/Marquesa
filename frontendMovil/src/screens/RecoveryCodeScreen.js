import React, { useState } from "react";
import { View, Text, SafeAreaView, TouchableOpacity, Image, TextInput, StyleSheet } from "react-native";
// Importación de imágenes utilizadas en la pantalla
import backIcon from "../images/backIcon.png";
import sideBgFlower from "../images/sideBgFlower.png";
import PinkButton from "../components/PinkButton";

// Componente para la pantalla de verificación de código de recuperación
const RecoveryCodeScreen = ({navigation}) => {
    // Estado para almacenar los 5 dígitos del código de verificación
    const [code, setCode] = useState(['', '', '', '', '']);

    // Función para manejar cambios en cada dígito del código
    const handleCodeChange = (value, index) => {
        // Crear una copia del array de código actual
        const newCode = [...code];
        // Actualizar el dígito en la posición específica
        newCode[index] = value;
        // Actualizar el estado con el nuevo código
        setCode(newCode);
    };

    // Función para procesar el código completo y continuar
    const handleContinue = () => {
        // Unir todos los dígitos en un string completo
        const fullCode = code.join('');
        console.log('Código ingresado: ', fullCode);
        // Navegar a la pantalla de cambio de contraseña
        navigation.navigate('ChangePassword');
    };

    // Función para reenviar el código de verificación
    const handleResendCode = () => {
        console.log('Reenviar código');
        // Aquí se implementaría la lógica para reenviar el código
    };

    // Función para regresar a la pantalla anterior
    const handleGoBack = () => {
        console.log('Regresar');
        // Navegar de vuelta a la pantalla de recuperación de contraseña
        navigation.navigate('RecoveryPassword');
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Imagen decorativa de fondo */}
            <Image source={sideBgFlower} style={styles.backgroundFlower} />

            {/* Header con botón de navegación hacia atrás */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                    <Image source={backIcon} style={styles.backIcon} />
                </TouchableOpacity>
            </View>

            {/* Contenido principal de la pantalla */}
            <View style={styles.content}>
                {/* Título principal */}
                <Text style={styles.title}>Confirma tu cuenta</Text>

                {/* Subtítulo con instrucción */}
                <Text style={styles.subtitle}>Ingresa el código</Text>

                {/* Contenedor de los campos de entrada del código */}
                <View style={styles.codeContainer}>
                    {/* Mapear cada dígito y crear un input individual */}
                    {code.map((digit, index) => (
                        <TextInput
                            key={index}
                            style={styles.codeInput}
                            value={digit}
                            onChangeText={(value) => handleCodeChange(value, index)}
                            maxLength={1} // Solo permitir un carácter por campo
                            keyboardType="numeric" // Mostrar teclado numérico
                            textAlign="center" // Centrar el texto
                            placeholder="" // Sin placeholder para mantener limpio el diseño
                        />
                    ))}
                </View>

                {/* Descripción explicativa del proceso */}
                <Text style={styles.description}>
                    Enviamos un código por gmail. Ingrésalo para confirmar tu cuenta.
                </Text>

                {/* Contenedor del botón principal */}
                <View style={styles.buttonContainer}>
                    <PinkButton
                        title="Continuar"
                        onPress={handleContinue}
                        style={styles.continueButton}
                    />
                </View>

                {/* Botón secundario para reenviar código */}
                <TouchableOpacity onPress={handleResendCode} style={styles.resendButton}>
                    <Text style={styles.resendText}>¿No recibiste el código?</Text>
                </TouchableOpacity>
            </View>
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
    // Imagen decorativa de fondo posicionada absolutamente
    backgroundFlower: {
        position: 'absolute',
        top: 30,
        right: 2,
        height: 120,
        opacity: 0.5, // Transparencia para que no interfiera con el contenido
        resizeMode: 'contain',
    },
    // Contenedor del header
    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
    },
    // Botón de navegación hacia atrás
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    // Icono del botón de regreso
    backIcon: {
        width: 24,
        height: 24,
        tintColor: '#3C3550', // Color que coincide con el tema
        resizeMode: 'contain',
    },
    // Contenedor del contenido principal
    content: {
        flex: 1,
        paddingHorizontal: 30,
        paddingTop: 40,
    },
    // Título principal de la pantalla
    title: {
        fontSize: 24,
        fontFamily: 'Poppins-SemiBold',
        color: '#3C3550',
        marginBottom: 30,
        textAlign: 'left',
    },
    // Subtítulo con instrucción
    subtitle: {
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        color: '#3C3550',
        marginBottom: 30,
    },
    // Contenedor que organiza los campos de código en fila
    codeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
        paddingHorizontal: 10,
    },
    // Estilo individual para cada campo de entrada de código
    codeInput: {
        width: 50,
        height: 50,
        borderWidth: 2,
        borderColor: '#FDB4B7', // Color rosa suave para el borde
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        fontSize: 18,
        fontFamily: 'Poppins-Medium',
        color: '#3C3550',
        textAlign: 'center',
        // Sombra para dar profundidad al elemento
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2, // Sombra en Android
    },
    // Texto descriptivo que explica el proceso
    description: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#666666',
        textAlign: 'left',
        lineHeight: 20,
        marginBottom: 40,
    },
    // Contenedor del botón principal centrado
    buttonContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    // Configuración específica del botón continuar
    continueButton: {
        width: '100%',
        maxWidth: 300, // Ancho máximo para mantener proporciones
    },
    // Botón secundario para reenviar código
    resendButton: {
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 30,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#3C3550', // Borde del color del tema
        borderRadius: 25,
        marginTop: 10,
    },
    // Texto del botón de reenvío
    resendText: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#3C3550',
        textAlign: 'center',
    },
});

export default RecoveryCodeScreen;