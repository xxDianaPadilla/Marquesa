import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// Componente reutilizable para texto de login con enlace interactivo
// Típicamente usado para "¿Ya tienes cuenta? Inicia sesión" o "¿No tienes cuenta? Regístrate"
export default function LoginText({ 
    questionText = "", // Texto de la pregunta (ej: "¿Ya tienes cuenta?"), por defecto vacío
    linkText = "", // Texto del enlace clickeable (ej: "Inicia sesión"), por defecto vacío
    onPress, // Función callback que se ejecuta al presionar el enlace
    style = {}, // Estilos personalizados para el contenedor principal
    questionStyle = {}, // Estilos personalizados para el texto de la pregunta
    linkStyle = {} // Estilos personalizados para el texto del enlace
}) {
    return (
        // Contenedor principal con layout horizontal y centrado
        <View style={[styles.loginSection, style]}>
            {/* Texto que combina pregunta y enlace */}
            <Text style={[styles.loginText, questionStyle]}>
                {questionText}{' '} {/* Texto de la pregunta seguido de un espacio */}
                {/* Botón táctil para el enlace */}
                <TouchableOpacity 
                    onPress={onPress} // Función que se ejecuta al presionar
                    style={styles.loginLinkButton}
                    activeOpacity={0.7} // Reduce opacidad al presionar para feedback visual
                >
                    {/* Texto del enlace con estilo diferenciado */}
                    <Text style={[styles.loginLink, linkStyle]}>
                        {linkText}
                    </Text>
                </TouchableOpacity>
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    // Contenedor principal con layout horizontal centrado
    loginSection: {
        flexDirection: 'row',
        alignItems: 'center', // Centra verticalmente
        justifyContent: 'center', // Centra horizontalmente
        flexWrap: 'wrap', // Permite que el texto se ajuste en múltiples líneas si es necesario
    },
    // Estilo del texto base de la pregunta
    loginText: {
        fontSize: 14,
        color: '#999999', // Color gris claro para el texto de la pregunta
        textAlign: 'center',
        fontFamily: 'Poppins-Regular',
        flexDirection: 'row', // Layout horizontal para combinar texto y enlace
        alignItems: 'center', // Alinea verticalmente el contenido
    },
    // Contenedor del botón de enlace
    loginLinkButton: {
        marginLeft: 4, // Pequeño espaciado a la izquierda del enlace
    },
    // Estilo del texto del enlace clickeable
    loginLink: {
        fontSize: 14,
        fontFamily: 'Poppins-SemiBold', // Fuente más pesada para destacar el enlace
        color: '#3C3550', // Color más oscuro para diferenciarlo de la pregunta
        top: 8, // Ajuste vertical para alinear con el texto de la pregunta
    },
});