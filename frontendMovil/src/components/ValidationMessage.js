import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Componente para mostrar mensajes de validación de campos
const ValidationMessage = ({ 
    message,           // Mensaje de error/validación a mostrar
    type = 'error',    // Tipo de mensaje (error, success, warning, info)
    visible = true,    // Controla si el mensaje es visible
    style = {}         // Estilos personalizados adicionales
}) => {
    // No renderizar nada si no hay mensaje o no está visible
    if (!message || !visible) {
        return null;
    }

    // Obtener estilos según el tipo de mensaje
    const getMessageStyle = () => {
        switch (type) {
            case 'success':
                return styles.successMessage;
            case 'warning':
                return styles.warningMessage;
            case 'info':
                return styles.infoMessage;
            case 'error':
            default:
                return styles.errorMessage;
        }
    };

    return (
        <View style={[styles.container, style]}>
            <Text style={[styles.baseMessage, getMessageStyle()]}>
                {message}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    // Contenedor principal del mensaje
    container: {
        marginTop: 5,
        marginBottom: 5,
        paddingHorizontal: 5,
    },
    // Estilos base para todos los mensajes
    baseMessage: {
        fontSize: 12,
        fontFamily: 'Poppins-Regular',
        lineHeight: 16,
    },
    // Mensaje de error (rojo)
    errorMessage: {
        color: '#E53E3E',
    },
    // Mensaje de éxito (verde)
    successMessage: {
        color: '#38A169',
    },
    // Mensaje de advertencia (naranja)
    warningMessage: {
        color: '#DD6B20',
    },
    // Mensaje informativo (azul)
    infoMessage: {
        color: '#3182CE',
    },
});

export default ValidationMessage;