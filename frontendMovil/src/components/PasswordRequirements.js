import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Componente que muestra los requisitos de contraseña con validación visual
const PasswordRequirements = ({ password }) => {
    // Validar longitud mínima
    const hasMinLength = password && password.length >= 8;
    
    // Validar mayúsculas
    const hasUppercase = password && /[A-Z]/.test(password);
    
    // Validar minúsculas
    const hasLowercase = password && /[a-z]/.test(password);
    
    // Validar números
    const hasNumbers = password && /\d/.test(password);

    // Función para obtener el estilo según si cumple el requisito
    const getRequirementStyle = (isValid) => [
        styles.requirement,
        isValid ? styles.requirementValid : styles.requirementInvalid
    ];

    // Función para obtener el ícono según si cumple el requisito
    const getRequirementIcon = (isValid) => isValid ? '✓' : '✗';

    return (
        <View style={styles.container}>
            <Text style={styles.title}>La contraseña debe contener:</Text>
            
            <View style={styles.requirementsList}>
                {/* Requisito: Longitud mínima */}
                <View style={styles.requirementRow}>
                    <Text style={getRequirementStyle(hasMinLength)}>
                        {getRequirementIcon(hasMinLength)} Al menos 8 caracteres
                    </Text>
                </View>
                
                {/* Requisito: Mayúsculas */}
                <View style={styles.requirementRow}>
                    <Text style={getRequirementStyle(hasUppercase)}>
                        {getRequirementIcon(hasUppercase)} Una letra mayúscula
                    </Text>
                </View>
                
                {/* Requisito: Minúsculas */}
                <View style={styles.requirementRow}>
                    <Text style={getRequirementStyle(hasLowercase)}>
                        {getRequirementIcon(hasLowercase)} Una letra minúscula
                    </Text>
                </View>
                
                {/* Requisito: Números */}
                <View style={styles.requirementRow}>
                    <Text style={getRequirementStyle(hasNumbers)}>
                        {getRequirementIcon(hasNumbers)} Un número
                    </Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    // Contenedor principal del componente
    container: {
        marginTop: 15,
        marginBottom: 20,
    },
    // Título de la sección de requisitos
    title: {
        fontSize: 14,
        fontFamily: 'Poppins-Medium',
        color: '#3C3550',
        marginBottom: 10,
    },
    // Lista de requisitos
    requirementsList: {
        paddingLeft: 5,
    },
    // Contenedor de cada requisito individual
    requirementRow: {
        marginBottom: 6,
    },
    // Estilo base para cada requisito
    requirement: {
        fontSize: 12,
        fontFamily: 'Poppins-Regular',
        paddingLeft: 5,
    },
    // Estilo para requisitos válidos (cumplidos)
    requirementValid: {
        color: '#4CAF50', // Verde para indicar éxito
    },
    // Estilo para requisitos inválidos (no cumplidos)
    requirementInvalid: {
        color: '#666666', // Gris para indicar pendiente
    },
});

export default PasswordRequirements;