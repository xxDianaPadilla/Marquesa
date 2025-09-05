import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";

// ✅ IMPORTAR ALERTAS PERSONALIZADAS
import { ConfirmationDialog } from "../components/CustomDialogs";
import { useAlert } from "../hooks/useAlert";

/**
 * Componente para renderizar burbujas de chat individuales
 * ✅ CON ALERTAS PERSONALIZADAS IMPLEMENTADAS
 */
const ChatBubbles = ({ 
    message, 
    time, 
    isOwnMessage, 
    hasImage, 
    imageSource, 
    isRead = false,
    isDelivered = true,
    onImagePress,
    onLongPress,
    showSenderInfo = false,
    senderName = '',
    isTyping = false,
    messageId
}) => {
    
    // ✅ Hook de alertas personalizadas
    const {
        alertState,
        showConfirmation,
        hideConfirmation
    } = useAlert();
    
    /**
     * ✅ MANEJA EL PRESS LARGO CON ALERTA PERSONALIZADA
     */
    const handleLongPress = () => {
        // Solo ejecutar si se proporciona la función y es mensaje propio
        if (onLongPress && isOwnMessage) {
            onLongPress(messageId, message);
        } else if (isOwnMessage && !onLongPress) {
            // ✅ FALLBACK CON ALERTA PERSONALIZADA EN LUGAR DE Alert.alert
            showConfirmation({
                title: "Opciones del mensaje",
                message: "¿Qué deseas hacer con este mensaje?",
                confirmText: "Eliminar",
                cancelText: "Cancelar",
                isDangerous: true,
                onConfirm: () => {
                    hideConfirmation();
                    console.log('🗑️ Eliminar mensaje:', messageId);
                },
                onCancel: () => {
                    hideConfirmation();
                    console.log('🗑️ Usuario canceló eliminación');
                }
            });
        }
    };

    /**
     * Maneja el press en imagen
     */
    const handleImagePress = () => {
        if (onImagePress && imageSource) {
            onImagePress(imageSource);
        }
    };

    /**
     * Formatea la hora del mensaje
     */
    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        
        try {
            const date = new Date(timestamp);
            return date.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
        } catch (error) {
            return time || '';
        }
    };

    /**
     * Renderiza el indicador de estado del mensaje
     */
    const renderMessageStatus = () => {
        if (!isOwnMessage) return null;

        return (
            <View style={styles.statusContainer}>
                {isRead ? (
                    <Text style={styles.statusRead}>✓✓</Text>
                ) : isDelivered ? (
                    <Text style={styles.statusDelivered}>✓</Text>
                ) : (
                    <Text style={styles.statusSending}>○</Text>
                )}
            </View>
        );
    };

    /**
     * Renderiza el contenido del mensaje
     */
    const renderMessageContent = () => {
        if (isTyping) {
            return (
                <View style={styles.typingIndicator}>
                    <Text style={styles.typingText}>escribiendo...</Text>
                    <View style={styles.typingDots}>
                        <View style={[styles.dot, styles.dot1]} />
                        <View style={[styles.dot, styles.dot2]} />
                        <View style={[styles.dot, styles.dot3]} />
                    </View>
                </View>
            );
        }

        return (
            <>
                {/* Información del remitente para mensajes de grupo */}
                {!isOwnMessage && showSenderInfo && senderName && (
                    <Text style={styles.senderName}>{senderName}</Text>
                )}

                {/* Imagen del mensaje */}
                {hasImage && imageSource && (
                    <TouchableOpacity onPress={handleImagePress} activeOpacity={0.8}>
                        <Image 
                            source={
                                typeof imageSource === 'string' 
                                    ? { uri: imageSource } 
                                    : imageSource
                            } 
                            style={styles.messageImage} 
                            resizeMode="cover"
                        />
                    </TouchableOpacity>
                )}

                {/* Texto del mensaje */}
                {message && message.trim() && (
                    <Text 
                        style={[
                            styles.messageText, 
                            isOwnMessage ? styles.ownText : styles.otherText,
                            hasImage && styles.messageTextWithImage
                        ]}
                    >
                        {message.trim()}
                    </Text>
                )}

                {/* Contenedor de tiempo y estado */}
                <View style={styles.timeStatusContainer}>
                    <Text style={[
                        styles.timeText, 
                        isOwnMessage ? styles.ownTime : styles.otherTime
                    ]}>
                        {formatTime(time)}
                    </Text>
                    {renderMessageStatus()}
                </View>
            </>
        );
    };

    // Si es mensaje de typing sin contenido, usar estilo especial
    if (isTyping && !message && !hasImage) {
        return (
            <View style={[styles.container, styles.otherMessage]}>
                <View style={styles.avatar}>
                    <Image 
                        source={require('../images/marquesaMiniLogo.png')} 
                        style={styles.avatarImage} 
                    />
                </View>
                <View style={[styles.bubble, styles.otherBubble, styles.typingBubble]}>
                    {renderMessageContent()}
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, isOwnMessage ? styles.ownMessage : styles.otherMessage]}>
            {/* Avatar del remitente - solo para mensajes de otros */}
            {!isOwnMessage && (
                <View style={styles.avatar}>
                    <Image 
                        source={require('../images/marquesaMiniLogo.png')} 
                        style={styles.avatarImage} 
                    />
                </View>
            )}

            {/* Burbuja del mensaje */}
            <TouchableOpacity
                style={[
                    styles.bubble, 
                    isOwnMessage ? styles.ownBubble : styles.otherBubble,
                    hasImage && styles.bubbleWithImage
                ]}
                onLongPress={handleLongPress}
                activeOpacity={0.8}
                delayLongPress={500}
            >
                {renderMessageContent()}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    // Contenedor principal
    container: {
        flexDirection: 'row',
        marginVertical: 4,
        paddingHorizontal: 16,
    },
    ownMessage: {
        justifyContent: 'flex-end',
    },
    otherMessage: {
        justifyContent: 'flex-start',
    },

    // Avatar
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 8,
        overflow: 'hidden',
        alignSelf: 'flex-end',
        marginBottom: 4,
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },

    // Burbuja del mensaje
    bubble: {
        maxWidth: '75%',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 18,
        position: 'relative',
        marginBottom: 2,
    },
    ownBubble: {
        backgroundColor: '#F8BBD9',
        borderBottomRightRadius: 4,
    },
    otherBubble: {
        backgroundColor: '#E5E5EA',
        borderBottomLeftRadius: 4,
    },
    bubbleWithImage: {
        paddingHorizontal: 8,
        paddingVertical: 8,
    },
    typingBubble: {
        paddingVertical: 12,
        minWidth: 80,
    },

    // Información del remitente
    senderName: {
        fontSize: 12,
        color: '#666666',
        fontFamily: 'Poppins-Medium',
        marginBottom: 4,
    },

    // Texto del mensaje
    messageText: {
        fontSize: 16,
        lineHeight: 20,
        fontFamily: 'Poppins-Regular',
    },
    ownText: {
        color: '#000000',
    },
    otherText: {
        color: '#000000',
    },
    messageTextWithImage: {
        marginTop: 4,
    },

    // Imagen del mensaje
    messageImage: {
        width: 200,
        height: 150,
        borderRadius: 12,
        marginBottom: 4,
    },

    // Contenedor de tiempo y estado
    timeStatusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 4,
    },

    // Tiempo del mensaje
    timeText: {
        fontSize: 12,
        fontFamily: 'Poppins-Regular',
    },
    ownTime: {
        color: '#666666',
        textAlign: 'right',
    },
    otherTime: {
        color: '#666666',
        textAlign: 'left',
    },

    // Estado del mensaje
    statusContainer: {
        marginLeft: 4,
        minWidth: 16,
        alignItems: 'center',
    },
    statusRead: {
        fontSize: 12,
        color: '#4A90E2',
        fontWeight: 'bold',
    },
    statusDelivered: {
        fontSize: 12,
        color: '#999999',
        fontWeight: 'bold',
    },
    statusSending: {
        fontSize: 12,
        color: '#CCCCCC',
    },

    // Indicador de escritura
    typingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    typingText: {
        fontSize: 14,
        color: '#666666',
        fontFamily: 'Poppins-Regular',
        fontStyle: 'italic',
        marginRight: 8,
    },
    typingDots: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#666666',
        marginHorizontal: 1,
    },
    dot1: {
        opacity: 0.4,
    },
    dot2: {
        opacity: 0.7,
    },
    dot3: {
        opacity: 1,
    },
});

export default ChatBubbles;