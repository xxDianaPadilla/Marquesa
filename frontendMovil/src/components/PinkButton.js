import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

// Componente de botón reutilizable con estilo rosa y estados deshabilitado
export default function PinkButton({ 
    title = "", // Texto a mostrar en el botón, por defecto vacío
    onPress, // Función callback que se ejecuta al presionar el botón
    style = {}, // Estilos personalizados adicionales para el botón, por defecto objeto vacío
    textStyle = {}, // Estilos personalizados adicionales para el texto, por defecto objeto vacío
    disabled = false // Estado del botón (habilitado/deshabilitado), por defecto habilitado
}) {
    return (
        // Botón táctil con estilos condicionales y combinados
        <TouchableOpacity
            style={[
                styles.continueButton, // Estilo base del botón
                disabled && styles.disabledButton, // Aplica estilo deshabilitado si disabled es true
                style // Estilos personalizados pasados como prop
            ]}
            onPress={onPress} // Función que se ejecuta al presionar
            disabled={disabled} // Deshabilita el botón si disabled es true
            activeOpacity={0.8} // Opacidad al presionar (efecto visual)
        >
            {/* Texto del botón con estilos condicionales */}
            <Text style={[
                styles.continueButtonText, // Estilo base del texto
                disabled && styles.disabledText, // Aplica estilo de texto deshabilitado si disabled es true
                textStyle // Estilos personalizados de texto pasados como prop
            ]}>
                {title} {/* Contenido del texto del botón */}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    // Estilo base del botón con fondo rosa y sombra
    continueButton: {
        backgroundColor: '#FDB4B7', // Fondo rosa claro
        paddingVertical: 16, // Espaciado vertical interno
        paddingHorizontal: 60, // Espaciado horizontal interno
        borderRadius: 30, // Bordes completamente redondeados
        // Sombra para iOS
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        // Elevación para Android
        elevation: 4,
        minWidth: 200, // Ancho mínimo del botón
        alignItems: 'center', // Centra el contenido horizontalmente
        justifyContent: 'center', // Centra el contenido verticalmente
    },
    // Estilo del texto del botón
    continueButtonText: {
        color: '#FFFFFF', // Texto blanco
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold', // Fuente semi-bold
        textAlign: 'center', // Centra el texto
    },
    // Estilo del botón cuando está deshabilitado
    disabledButton: {
        backgroundColor: '#CCCCCC', // Fondo gris para indicar que está deshabilitado
        shadowOpacity: 0, // Elimina la sombra en iOS
        elevation: 0, // Elimina la elevación en Android
    },
    // Estilo del texto cuando el botón está deshabilitado
    disabledText: {
        color: '#999999', // Texto gris más claro para indicar que está deshabilitado
    },
});