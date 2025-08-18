import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, ScrollView, StatusBar } from "react-native";
import backIcon from '../images/backIcon.png';
import NotificationsCards from "../components/NotificationsCards";

const NotificationsScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            {/* Configuración de la barra de estado */}
            <StatusBar backgroundColor="#F8F9FA" barStyle="dark-content" />
            
            {/* Header con botón de regreso y título */}
            <View style={styles.header}>
                {/* Botón para regresar a la pantalla anterior */}
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation?.goBack()} // Navegación condicional segura
                >
                    <Image source={backIcon} style={styles.backIcon} />
                </TouchableOpacity>
                
                {/* Título de la pantalla */}
                <Text style={styles.headerTitle}>Notificaciones</Text>
                
                {/* Espaciador para centrar el título en el header */}
                <View style={styles.placeholder} />
            </View>

            {/* Área de contenido principal */}
            <ScrollView 
                style={styles.content}
                showsVerticalScrollIndicator={false} // Ocultar barra de scroll vertical
                contentContainerStyle={styles.scrollContent}
            >
                {/* Componente que renderiza todas las tarjetas de notificaciones */}
                <NotificationsCards />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    // Contenedor principal con SafeAreaView para evitar superposición con áreas del sistema
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    
    // Estilos del header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between', // Distribuir elementos equitativamente
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1, // Línea divisoria sutil
        borderBottomColor: '#E5E7EB',
    },
    
    // Botón de regreso con área de toque ampliada
    backButton: {
        padding: 8, // Área de toque más grande para mejor UX
        marginLeft: -8, // Compensar el padding para alinear correctamente
        marginTop: 20,
    },
    
    // Icono de regreso con color personalizado
    backIcon: {
        width: 24,
        height: 24,
        tintColor: '#333333', // Color del icono
    },
    
    // Título principal del header
    headerTitle: {
        fontSize: 18,
        fontFamily: 'Poppins-SemiBold',
        fontWeight: '600',
        color: '#333333',
        textAlign: 'center',
        marginTop: 20,
    },
    
    // Espaciador para balancear el layout del header
    placeholder: {
        width: 32, // Mismo ancho que el área del botón de regreso
    },
    
    // Contenedor del área de scroll
    content: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    
    // Estilos del contenido dentro del ScrollView
    scrollContent: {
        paddingVertical: 20, // Espaciado vertical del contenido
        paddingBottom: 40, // Espaciado adicional en la parte inferior
    },
});

export default NotificationsScreen;