import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from "react-native";

// ✅ IMPORTAR ALERTAS PERSONALIZADAS
import { ConfirmationDialog } from "../components/CustomDialogs";
import { useAlert } from "../hooks/useAlert";

// Obtener dimensiones de pantalla para responsive design
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Breakpoints para responsive design
const BREAKPOINTS = {
    small: 320,    // iPhone SE, Galaxy S5
    medium: 375,   // iPhone X, 11, 12, 13
    large: 414,    // iPhone Plus, Max
    tablet: 768    // Tablets
};

// Función para obtener el factor de escala según el ancho de pantalla
const getScaleFactor = () => {
    if (SCREEN_WIDTH <= BREAKPOINTS.small) return 0.85;
    if (SCREEN_WIDTH <= BREAKPOINTS.medium) return 0.95;
    if (SCREEN_WIDTH <= BREAKPOINTS.large) return 1;
    if (SCREEN_WIDTH <= BREAKPOINTS.tablet) return 1.1;
    return 1.2; // Para pantallas muy grandes
};

// Función para obtener dimensiones responsive
const responsive = (size) => {
    return Math.round(size * getScaleFactor());
};

// Función para obtener el ancho máximo de las burbujas según el tamaño de pantalla
const getMaxBubbleWidth = () => {
    const basePercentage = 0.75; // 75% por defecto
    const screenWidth = SCREEN_WIDTH;
    
    if (screenWidth <= BREAKPOINTS.small) {
        return screenWidth * 0.8; // 80% para pantallas pequeñas
    } else if (screenWidth <= BREAKPOINTS.medium) {
        return screenWidth * 0.78; // 78% para pantallas medianas
    } else if (screenWidth <= BREAKPOINTS.large) {
        return screenWidth * basePercentage; // 75% para pantallas grandes
    } else if (screenWidth <= BREAKPOINTS.tablet) {
        return screenWidth * 0.65; // 65% para tablets
    }
    return screenWidth * 0.6; // 60% para pantallas muy grandes
};

// Función para obtener el tamaño de imagen responsive
const getImageDimensions = () => {
    const baseWidth = 200;
    const baseHeight = 150;
    const maxWidth = getMaxBubbleWidth() - responsive(32); // Restar padding de burbuja
    
    if (SCREEN_WIDTH <= BREAKPOINTS.small) {
        return {
            width: Math.min(responsive(160), maxWidth),
            height: responsive(120)
        };
    } else if (SCREEN_WIDTH <= BREAKPOINTS.medium) {
        return {
            width: Math.min(responsive(180), maxWidth),
            height: responsive(135)
        };
    } else if (SCREEN_WIDTH <= BREAKPOINTS.large) {
        return {
            width: Math.min(baseWidth, maxWidth),
            height: baseHeight
        };
    } else if (SCREEN_WIDTH <= BREAKPOINTS.tablet) {
        return {
            width: Math.min(responsive(220), maxWidth),
            height: responsive(165)
        };
    }
    return {
        width: Math.min(responsive(240), maxWidth),
        height: responsive(180)
    };
};

/**
 * Componente para renderizar burbujas de chat individuales
 * ✅ CON DISEÑO RESPONSIVE IMPLEMENTADO
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

        const imageDimensions = getImageDimensions();

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
                            style={[styles.messageImage, imageDimensions]} 
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
                    hasImage && styles.bubbleWithImage,
                    { maxWidth: getMaxBubbleWidth() }
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
        marginVertical: responsive(4),
        paddingHorizontal: responsive(16),
    },
    ownMessage: {
        justifyContent: 'flex-end',
    },
    otherMessage: {
        justifyContent: 'flex-start',
    },

    // Avatar
    avatar: {
        width: responsive(32),
        height: responsive(32),
        borderRadius: responsive(16),
        marginRight: responsive(8),
        overflow: 'hidden',
        alignSelf: 'flex-end',
        marginBottom: responsive(4),
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },

    // Burbuja del mensaje
    bubble: {
        paddingHorizontal: responsive(12),
        paddingVertical: responsive(8),
        borderRadius: responsive(18),
        position: 'relative',
        marginBottom: responsive(2),
        minWidth: responsive(60), // Ancho mínimo para burbujas pequeñas
    },
    ownBubble: {
        backgroundColor: '#F8BBD9',
        borderBottomRightRadius: responsive(4),
    },
    otherBubble: {
        backgroundColor: '#E5E5EA',
        borderBottomLeftRadius: responsive(4),
    },
    bubbleWithImage: {
        paddingHorizontal: responsive(8),
        paddingVertical: responsive(8),
    },
    typingBubble: {
        paddingVertical: responsive(12),
        minWidth: responsive(80),
    },

    // Información del remitente
    senderName: {
        fontSize: responsive(12),
        color: '#666666',
        fontFamily: 'Poppins-Medium',
        marginBottom: responsive(4),
    },

    // Texto del mensaje
    messageText: {
        fontSize: responsive(16),
        lineHeight: responsive(20),
        fontFamily: 'Poppins-Regular',
        flexShrink: 1, // Permitir que el texto se ajuste
    },
    ownText: {
        color: '#000000',
    },
    otherText: {
        color: '#000000',
    },
    messageTextWithImage: {
        marginTop: responsive(4),
    },

    // Imagen del mensaje (dimensiones dinámicas aplicadas directamente)
    messageImage: {
        borderRadius: responsive(12),
        marginBottom: responsive(4),
    },

    // Contenedor de tiempo y estado
    timeStatusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: responsive(4),
        flexShrink: 0, // No permitir que se comprima
    },

    // Tiempo del mensaje
    timeText: {
        fontSize: responsive(12),
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
        marginLeft: responsive(4),
        minWidth: responsive(16),
        alignItems: 'center',
    },
    statusRead: {
        fontSize: responsive(12),
        color: '#4A90E2',
        fontWeight: 'bold',
    },
    statusDelivered: {
        fontSize: responsive(12),
        color: '#999999',
        fontWeight: 'bold',
    },
    statusSending: {
        fontSize: responsive(12),
        color: '#CCCCCC',
    },

    // Indicador de escritura
    typingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    typingText: {
        fontSize: responsive(14),
        color: '#666666',
        fontFamily: 'Poppins-Regular',
        fontStyle: 'italic',
        marginRight: responsive(8),
    },
    typingDots: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dot: {
        width: responsive(4),
        height: responsive(4),
        borderRadius: responsive(2),
        backgroundColor: '#666666',
        marginHorizontal: responsive(1),
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