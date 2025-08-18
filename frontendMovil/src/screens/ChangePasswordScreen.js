import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView } from "react-native";

// Importación de iconos y elementos gráficos
import backIcon from '../images/backIcon.png';
import sideBgFlower from "../images/sideBgFlower.png";
import eyeIcon from "../images/eyeIcon.png";
import eyeOffIcon from "../images/eyeOffIcon.png";

// Importación de componentes personalizados
import PinkInputs from "../components/PinkInputs";
import PinkButton from "../components/PinkButton";

/**
 * Pantalla para cambiar/crear nueva contraseña
 * Permite al usuario establecer una nueva contraseña con confirmación
 * @param {object} navigation - Objeto de navegación de React Navigation
 */
const ChangePasswordScreen = ({ navigation }) => {
    // Estados para manejar los valores de los campos de contraseña
    const [newPassword, setNewPassword] = useState(""); // Contraseña nueva
    const [confirmPassword, setConfirmPassword] = useState(""); // Confirmación de contraseña
    
    // Estados para controlar la visibilidad de las contraseñas
    const [showNewPassword, setShowNewPassword] = useState(false); // Mostrar/ocultar nueva contraseña
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Mostrar/ocultar confirmación

    /**
     * Maneja el evento de retroceso
     * Navega de vuelta a la pantalla de código de recuperación
     */
    const handleBack = () => {
        console.log("Back pressed");
        navigation.navigate("RecoveryCode");
    };

    /**
     * Maneja el evento de continuar
     * Procesa las contraseñas y navega a la pantalla de login
     * TODO: Agregar validación de contraseñas antes de navegar
     */
    const handleContinue = () => {
        console.log("Continue pressed");
        // Aquí se podría agregar lógica de validación:
        // - Verificar que las contraseñas coincidan
        // - Validar que cumple con los requisitos de seguridad
        navigation.navigate("Login");
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

            <View style={styles.content}>
                {/* Header con botón de retroceso */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                        <Image source={backIcon} style={styles.backIcon} />
                    </TouchableOpacity>
                </View>

                {/* Sección de título y descripción */}
                <View style={styles.titleSection}>
                    <Text style={styles.title}>Crea una nueva contraseña</Text>
                    <Text style={styles.description}>
                        Crea una contraseña que contenga al menos 12 dígitos. Debes incluir caracteres especiales, mayúsculas y minúsculas.
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
                    />

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
                    />
                </View>

                {/* Contenedor del botón de continuar */}
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
    // Contenedor principal - ocupa toda la pantalla con fondo blanco
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
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