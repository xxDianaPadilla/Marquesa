import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

// Componente para renderizar burbujas de chat individuales
// Props:
// - message: El texto del mensaje
// - time: La hora del mensaje
// - isOwnMessage: Boolean que indica si el mensaje es del usuario actual
// - hasImage: Boolean que indica si el mensaje contiene una imagen
// - imageSource: Fuente de la imagen del mensaje
const ChatBubbles = ({ message, time, isOwnMessage, hasImage, imageSource }) => {
    return (
        // Contenedor principal del mensaje con estilos condicionales según el emisor
        <View style={[styles.container, isOwnMessage ? styles.ownMessage : styles.otherMessage]}>
            {/* Avatar del remitente - solo se muestra para mensajes de otros usuarios */}
            {!isOwnMessage && (
                <View style={styles.avatar}>
                    {/* Imagen del avatar con logo de la marquesa */}
                    <Image source={require('../images/marquesaMiniLogo.png')} style={styles.avatarImage} />
                </View>
            )}

            {/* Burbuja del mensaje con estilos diferentes según el emisor */}
            <View style={[styles.bubble, isOwnMessage ? styles.ownBubble : styles.otherBubble]}>
                {/* Imagen del mensaje - se muestra solo si hasImage es true y existe imageSource */}
                {hasImage && imageSource && (
                    <Image source={imageSource} style={styles.messageImage} />
                )}
                {/* Texto del mensaje con estilos condicionales */}
                <Text style={[styles.messageText, isOwnMessage ? styles.ownText : styles.otherText]}>
                    {message}
                </Text>
                {/* Timestamp del mensaje */}
                <Text style={[styles.timeText, isOwnMessage ? styles.ownTime : styles.otherTime]}>
                    {time}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    // Contenedor principal - disposición horizontal con espaciado vertical y horizontal
    container: {
        flexDirection: 'row',
        marginVertical: 4,
        paddingHorizontal: 16,
    },
    // Estilo para mensajes propios - alineados a la derecha
    ownMessage: {
        justifyContent: 'flex-end',
    },
    // Estilo para mensajes de otros - alineados a la izquierda
    otherMessage: {
        justifyContent: 'flex-start',
    },
    // Contenedor del avatar circular
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 8,
        overflow: 'hidden',
    },
    // Imagen del avatar que ocupa todo el contenedor
    avatarImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    // Burbuja base del mensaje con padding y bordes redondeados
    bubble: {
        maxWidth: '75%',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 18,
        position: 'relative',
        marginBottom: 5,
    },
    // Estilo específico para burbujas de mensajes propios (color rosa)
    ownBubble: {
        backgroundColor: '#F8BBD9',
        borderBottomRightRadius: 4, // Cola de la burbuja hacia la derecha
    },
    // Estilo específico para burbujas de otros usuarios (color gris)
    otherBubble: {
        backgroundColor: '#E5E5EA',
        borderBottomLeftRadius: 4, // Cola de la burbuja hacia la izquierda
    },
    // Texto principal del mensaje
    messageText: {
        fontSize: 16,
        lineHeight: 20,
        fontFamily: 'Poppins-Regular',
    },
    // Color del texto para mensajes propios
    ownText: {
        color: '#000000',
    },
    // Color del texto para mensajes de otros
    otherText: {
        color: '#000000'
    },
    // Estilo base para el timestamp
    timeText: {
        fontSize: 12,
        marginTop: 4,
        fontFamily: 'Poppins-Regular'
    },
    // Estilo específico para timestamp de mensajes de otros
    otherTime: {
        color: '#666666',
        textAlign: 'left',
    },
    // Estilo para imágenes dentro del mensaje
    messageImage: {
        width: 150,
        height: 150,
        borderRadius: 12,
        marginBottom: 8,
        resizeMode: 'cover',
    },
});

export default ChatBubbles;