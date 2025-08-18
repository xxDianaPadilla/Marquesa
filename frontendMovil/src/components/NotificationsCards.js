import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
// Importación de imágenes locales
import marquesaMiniLogo from "../images/marquesaMiniLogo.png";
import moreIcon from "../images/moreIcon.png";

const NotificationsCards = () => {
    // Array de notificaciones con diferentes tipos y mensajes
    const notifications = [
        {
            id: 1,
            type: "Promoción",
            message: "Se acercan las mejores promociones para ti 🛒.",
        },
        {
            id: 2,
            type: "Pedido enviado",
            message: "Tu pedido ha sido enviado con éxito. Agradecemos que nos confirmes cuando recibas",
        },
        {
            id: 3,
            type: "Confirmación de pedido",
            message: "Tu pedido ha sido confirmado, cuando esté listo el siguiente paso te avisaremos.",
        },
    ];

    return (
        // Contenedor principal de las tarjetas de notificaciones
        <View style={styles.container}>
            {/* Mapeo de las notificaciones para generar una tarjeta por cada una */}
            {notifications.map((notification) => (
                // Tarjeta individual de notificación
                <View key={notification.id} style={styles.card}>
                    {/* Contenido interno de la tarjeta con layout horizontal */}
                    <View style={styles.cardContent}>
                        {/* Contenedor del logo de la marca */}
                        <View style={styles.logoContainer}>
                            <Image source={marquesaMiniLogo} style={styles.logo} />
                        </View>
                        {/* Contenedor del texto (título y mensaje) */}
                        <View style={styles.textContainer}>
                            {/* Título de la notificación con límite de 2 líneas */}
                            <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
                                {notification.type}
                            </Text>
                            {/* Mensaje de la notificación con límite de 3 líneas */}
                            <Text style={styles.message} numberOfLines={3} ellipsizeMode="tail">
                                {notification.message}
                            </Text>
                        </View>
                        {/* Botón de opciones adicionales (tres puntos) */}
                        <TouchableOpacity style={styles.moreButton}>
                            <Image source={moreIcon} style={styles.moreIcon} />
                        </TouchableOpacity>
                    </View>
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    // Contenedor principal con flex y padding horizontal
    container: {
        flex: 1,
        paddingHorizontal: 16,
    },
    // Estilo de cada tarjeta de notificación
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 16,
        paddingVertical: 20,
        paddingHorizontal: 16,
        // Sombra para iOS
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        // Elevación para Android
        elevation: 3,
    },
    // Layout horizontal del contenido de la tarjeta
    cardContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    // Contenedor circular del logo con fondo rosado
    logoContainer: {
        width: 38,
        height: 38,
        borderRadius: 24,
        backgroundColor: '#FFE8E8',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 6,
        marginLeft: -4, 
        flexShrink: 0,  // Evita que se redimensione
    },
    // Estilo del logo de la marca
    logo: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
    },
    // Contenedor del texto que ocupa el espacio disponible
    textContainer: {
        flex: 1,
        marginRight: 8,
        minWidth: 0, // Permite que el texto se ajuste correctamente
    },
    // Estilo del título de la notificación
    title: {
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
        fontWeight: '600',
        color: '#333333',
        marginBottom: 4,
        flexWrap: 'wrap', 
    },
    // Estilo del mensaje de la notificación
    message: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#666666',
        lineHeight: 20,
        flexWrap: 'wrap', 
        paddingRight: 18
    },
    // Botón de opciones adicionales con área táctil
    moreButton: {
        padding: 4,
        flexShrink: 0, // Mantiene su tamaño fijo
    },
    // Icono de tres puntos con color gris
    moreIcon: {
        width: 20,
        height: 20,
        tintColor: '#999999',
    },
});

export default NotificationsCards;