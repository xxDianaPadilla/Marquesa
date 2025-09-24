import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    Image,
    Platform,
    Keyboard,
    TouchableWithoutFeedback,
    RefreshControl,
    ActivityIndicator
} from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Importación de iconos
import backIcon from '../images/backIcon.png';
import marquesaMiniLogo from "../images/marquesaMiniLogo.png";

// Importación de componentes y hooks
import ChatBubbles from "../components/ChatBubbles";
import ChatInput from "../components/ChatInput";
import { useChat } from "../hooks/useChat";
import { useAuth } from "../context/AuthContext";

// Importar alertas personalizadas
import { ConfirmationDialog, LoadingDialog, ToastDialog } from "../components/CustomDialogs";
import { useAlert } from "../hooks/useAlert";

/**
 * Pantalla principal del chat con alertas personalizadas integradas
 */
const ChatScreen = ({ navigation, route }) => {
    const insets = useSafeAreaInsets();
    const { user } = useAuth();

    // Hook de alertas personalizadas
    const {
        alertState,
        showConfirmation,
        hideConfirmation,
        showLoading,
        hideLoading,
        showErrorToast,
        showSuccessToast,
        showWarningToast
    } = useAlert();

    // Hook principal del chat
    const {
        conversation,
        messages,
        loading,
        error,
        sendingMessage,
        isConnected,
        connectionError,
        isTyping,
        typingUsers,
        unreadCount,
        sendMessage,
        markAsRead,
        deleteMessage,
        handleTyping,
        stopTyping,
        clearError,
        refreshConversation
    } = useChat();

    // Estados locales
    const [refreshing, setRefreshing] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    const [showScrollToBottom, setShowScrollToBottom] = useState(false);
    const [imageViewerVisible, setImageViewerVisible] = useState(false);
    const [selectedImageUri, setSelectedImageUri] = useState(null);
    const [deletingMessages, setDeletingMessages] = useState(new Set());

    // Referencias
    const scrollViewRef = useRef(null);
    const lastMessageIdRef = useRef(null);

    /**
     * Detección mejorada del teclado
     */
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            (e) => {
                console.log('⌨️ Teclado mostrado:', {
                    height: e.endCoordinates.height,
                    screenX: e.endCoordinates.screenX,
                    screenY: e.endCoordinates.screenY,
                    width: e.endCoordinates.width
                });

                setKeyboardHeight(e.endCoordinates.height);
                setIsKeyboardVisible(true);
                setTimeout(() => scrollToBottom(true), 50);
            }
        );

        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            (e) => {
                console.log('⌨️ Teclado ocultado');
                setKeyboardHeight(0);
                setIsKeyboardVisible(false);
            }
        );

        const keyboardWillShowListener = Keyboard.addListener(
            'keyboardWillShow',
            (e) => {
                console.log('⌨️ Teclado va a mostrarse:', e.endCoordinates.height);
                setIsKeyboardVisible(true);
            }
        );

        const keyboardWillHideListener = Keyboard.addListener(
            'keyboardWillHide',
            () => {
                console.log('⌨️ Teclado va a ocultarse');
                setIsKeyboardVisible(false);
            }
        );

        return () => {
            keyboardDidShowListener?.remove();
            keyboardDidHideListener?.remove();
            keyboardWillShowListener?.remove();
            keyboardWillHideListener?.remove();
        };
    }, []);

    /**
     * Auto-scroll cuando llegan nuevos mensajes
     */
    useEffect(() => {
        if (messages && messages.length > 0) {
            const lastMessage = messages[messages.length - 1];

            if (lastMessage._id !== lastMessageIdRef.current) {
                lastMessageIdRef.current = lastMessage._id;

                if (lastMessage.senderId._id === user?.id || !showScrollToBottom) {
                    setTimeout(() => scrollToBottom(), 100);
                }
            }
        }
    }, [messages, user?.id, showScrollToBottom]);

    /**
     * Marcar mensajes como leídos cuando se carga la conversación
     */
    useEffect(() => {
        if (conversation?.conversationId && messages.length > 0) {
            markAsRead(conversation.conversationId);
        }
    }, [conversation?.conversationId, messages.length, markAsRead]);

    /**
     * Calcula la altura de la barra de pestañas
     */
    const getTabBarHeight = () => {
        const baseHeight = 60;
        const paddingBottom = Math.max(insets.bottom, Platform.OS === 'ios' ? 25 : 10);
        return baseHeight + paddingBottom;
    };

    /**
     * Función para calcular altura del input
     */
    const calculateInputContainerBottom = useCallback(() => {
        const tabBarHeight = getTabBarHeight();

        if (isKeyboardVisible && keyboardHeight > 0) {
            const keyboardOffset = Platform.OS === 'ios'
                ? keyboardHeight - insets.bottom
                : keyboardHeight;

            console.log('⌨️ Calculando con teclado:', {
                keyboardHeight,
                keyboardOffset,
                insetsBottom: insets.bottom,
                platform: Platform.OS
            });

            return Math.max(keyboardOffset, 0);
        } else {
            console.log('⌨️ Calculando sin teclado, usando tabBarHeight:', tabBarHeight);
            return tabBarHeight;
        }
    }, [isKeyboardVisible, keyboardHeight, insets.bottom]);

    /**
     * Función para calcular altura de mensajes
     */
    const calculateMessagesContainerMargin = useCallback(() => {
        const inputHeight = calculateInputContainerBottom();
        const additionalPadding = isKeyboardVisible ? 20 : 30;
        return inputHeight + additionalPadding;
    }, [calculateInputContainerBottom, isKeyboardVisible]);

    /**
     * Oculta el teclado
     */
    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    /**
     * Scroll hasta el final de la conversación
     */
    const scrollToBottom = useCallback((animated = true) => {
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd({ animated });
            setShowScrollToBottom(false);
        }
    }, []);

    /**
     * Maneja el evento de scroll
     */
    const handleScroll = useCallback((event) => {
        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
        const paddingToBottom = 100;
        const isNearBottom = layoutMeasurement.height + contentOffset.y >=
            contentSize.height - paddingToBottom;

        setShowScrollToBottom(!isNearBottom);
    }, []);

    /**
     * Maneja el pull-to-refresh con alertas personalizadas
     */
    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await refreshConversation();
            clearError();
            // Opcional: mostrar toast de éxito solo si había error previo
            if (error) {
                showSuccessToast('Chat actualizado correctamente');
            }
        } catch (refreshError) {
            console.error('❌ Error refrescando chat:', refreshError);
            showErrorToast('Error al actualizar el chat. Inténtalo de nuevo.');
        } finally {
            setRefreshing(false);
        }
    }, [refreshConversation, clearError, error, showSuccessToast, showErrorToast]);

    /**
     * Maneja el envío de mensajes con alertas personalizadas
     */
    const handleSendMessage = useCallback(async (messageText, imageUri) => {
        try {
            // Validar que hay contenido
            if (!messageText?.trim() && !imageUri) {
                showWarningToast('Escribe un mensaje o selecciona una imagen');
                return { success: false, message: 'Mensaje vacío' };
            }

            // Mostrar loading
            showLoading({
                title: 'Enviando mensaje',
                message: 'Por favor espera...'
            });

            const result = await sendMessage(messageText, imageUri);

            // Ocultar loading
            hideLoading();

            if (result.success) {
                setTimeout(() => scrollToBottom(), 100);
                return result;
            } else {
                showErrorToast(result.message || 'Error al enviar mensaje');
                return result;
            }
        } catch (error) {
            hideLoading();
            console.error('❌ Error enviando mensaje:', error);
            showErrorToast('Error de conexión al enviar mensaje');
            return { success: false, message: 'Error de conexión' };
        }
    }, [sendMessage, scrollToBottom, showLoading, hideLoading, showErrorToast, showWarningToast]);

    /**
     * Maneja el press en imagen
     */
    const handleImagePress = useCallback((imageUri) => {
        setSelectedImageUri(imageUri);
        setImageViewerVisible(true);
    }, []);

    /**
     * Función de eliminar mensaje con alertas personalizadas
     */
    const handleMessageLongPress = useCallback(async (messageId, messageText, action) => {
        console.log('🗑️ LLAMANDO handleMessageLongPress:', { messageId, action });

        if (action === 'delete') {
            // Usar confirmación personalizada
            showConfirmation({
                title: "Eliminar mensaje",
                message: "¿Estás seguro de que quieres eliminar este mensaje? Esta acción no se puede deshacer.",
                confirmText: "Eliminar",
                cancelText: "Cancelar",
                isDangerous: true,
                onConfirm: async () => {
                    try {
                        hideConfirmation();

                        // Agregar ID a conjunto de mensajes en proceso de eliminación
                        setDeletingMessages(prev => new Set([...prev, messageId]));

                        // Mostrar loading de eliminación
                        showLoading({
                            title: 'Eliminando mensaje',
                            message: 'Por favor espera...',
                            color: '#F44336'
                        });

                        console.log('🗑️ INICIO DELETE - MessageID:', messageId);
                        console.log('🗑️ Llamando deleteMessage del hook useChat...');

                        const result = await deleteMessage(messageId);

                        hideLoading();
                        console.log('🗑️ RESULTADO deleteMessage:', result);

                        if (result.success) {
                            showSuccessToast('Mensaje eliminado correctamente');
                        } else {
                            showErrorToast(result.message || 'Error al eliminar el mensaje');
                        }

                    } catch (error) {
                        hideLoading();
                        console.error('❌ Error eliminando mensaje:', error);
                        showErrorToast('Error al eliminar el mensaje. Inténtalo de nuevo.');
                    } finally {
                        // Remover ID del conjunto de mensajes en proceso
                        setDeletingMessages(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(messageId);
                            return newSet;
                        });
                    }
                },
                onCancel: () => {
                    hideConfirmation();
                    console.log('🗑️ Usuario canceló eliminación');
                }
            });
        } else {
            // Mostrar opciones del mensaje
            const truncatedMessage = messageText.length > 50
                ? messageText.substring(0, 50) + '...'
                : messageText;

            showConfirmation({
                title: "Opciones del mensaje",
                message: truncatedMessage,
                confirmText: "Eliminar",
                cancelText: "Cancelar",
                isDangerous: true,
                onConfirm: () => {
                    hideConfirmation();
                    handleMessageLongPress(messageId, messageText, 'delete');
                },
                onCancel: () => {
                    hideConfirmation();
                    console.log('🗑️ Usuario canceló opciones');
                }
            });
        }
    }, [deleteMessage, showConfirmation, hideConfirmation, showLoading, hideLoading, showSuccessToast, showErrorToast]);

    /**
     * Función para limpiar errores con confirmación
     */
    const handleClearError = useCallback(() => {
        showConfirmation({
            title: "Limpiar error",
            message: "¿Quieres ocultar este mensaje de error?",
            confirmText: "Sí, ocultar",
            cancelText: "Cancelar",
            isDangerous: false,
            onConfirm: () => {
                hideConfirmation();
                clearError();
                showSuccessToast('Error ocultado');
            },
            onCancel: () => {
                hideConfirmation();
            }
        });
    }, [clearError, showConfirmation, hideConfirmation, showSuccessToast]);

    /**
     * Formatea la fecha para mostrar separadores
     */
    const formatMessageDate = (timestamp) => {
        if (!timestamp) return '';

        const messageDate = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (messageDate.toDateString() === today.toDateString()) {
            return 'Hoy';
        } else if (messageDate.toDateString() === yesterday.toDateString()) {
            return 'Ayer';
        } else {
            return messageDate.toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short'
            });
        }
    };

    /**
     * Agrupa mensajes por fecha
     */
    const groupMessagesByDate = useCallback(() => {
        if (!messages || messages.length === 0) return [];

        const grouped = [];
        let currentDate = '';

        messages.forEach((message, index) => {
            const messageDate = formatMessageDate(message.createdAt);

            if (messageDate !== currentDate) {
                currentDate = messageDate;
                grouped.push({
                    type: 'date',
                    date: messageDate,
                    key: `date-${index}`
                });
            }

            grouped.push({
                type: 'message',
                data: message,
                key: message._id || `message-${index}`
            });
        });

        return grouped;
    }, [messages]);

    /**
     * Renderiza el header de estado de conexión
     */
    const renderConnectionStatus = () => {
        if (connectionError) {
            return (
                <View style={styles.connectionStatus}>
                    <Text style={styles.connectionStatusText}>
                        ❌ Sin conexión - {connectionError}
                    </Text>
                </View>
            );
        }

        if (!isConnected) {
            return (
                <View style={styles.connectionStatus}>
                    <Text style={styles.connectionStatusText}>
                        🔄 Conectando...
                    </Text>
                </View>
            );
        }

        return null;
    };

    /**
     * Renderiza el indicador de escritura
     */
    const renderTypingIndicator = () => {
        if (typingUsers.length === 0) return null;

        return (
            <View style={styles.typingContainer}>
                <ChatBubbles
                    message=""
                    time=""
                    isOwnMessage={false}
                    hasImage={false}
                    isTyping={true}
                />
            </View>
        );
    };

    /**
     * Renderiza un elemento del chat (fecha o mensaje)
     */
    const renderChatItem = ({ item }) => {
        if (item.type === 'date') {
            return (
                <View style={styles.dateContainer}>
                    <Text style={styles.dateText}>{item.date}</Text>
                </View>
            );
        }

        if (item.type === 'message') {
            const message = item.data;
            const isOwnMessage = message.senderId._id === user?.id;
            const isDeleting = deletingMessages.has(message._id);

            return (
                <View style={isDeleting ? styles.deletingMessageContainer : null}>
                    {isDeleting && (
                        <View style={styles.deletingOverlay}>
                            <ActivityIndicator size="small" color="#FF3B30" />
                            <Text style={styles.deletingText}>Eliminando...</Text>
                        </View>
                    )}
                    <ChatBubbles
                        messageId={message._id}
                        message={message.message}
                        time={message.createdAt}
                        isOwnMessage={isOwnMessage}
                        hasImage={!!(message.media && message.media.url)}
                        imageSource={message.media?.url}
                        isRead={message.isRead}
                        isDelivered={true}
                        onImagePress={handleImagePress}
                        onLongPress={isOwnMessage ? handleMessageLongPress : undefined}
                        senderName={!isOwnMessage ? message.senderId.fullName : ''}
                        showSenderInfo={!isOwnMessage}
                    />
                </View>
            );
        }

        return null;
    };

    // Si está cargando la conversación inicial
    if (loading && !conversation) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#F8BBD9" />
                    <Text style={styles.loadingText}>Cargando chat...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const groupedMessages = groupMessagesByDate();

    return (
        <SafeAreaView style={styles.container}>
            <TouchableWithoutFeedback onPress={dismissKeyboard}>
                <View style={styles.container}>
                    {/* Header del chat */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => {
                                stopTyping();
                                navigation.goBack();
                            }}
                        >
                            <Image source={backIcon} style={styles.backIcon} />
                        </TouchableOpacity>

                        <View style={styles.headerCenter}>
                            <Image source={marquesaMiniLogo} style={styles.profileImage} />
                            <View>
                                <Text style={styles.headerTitle}>Marquesa</Text>
                                <Text style={styles.headerSubtitle}>
                                    {isConnected ? 'En línea' : 'Desconectado'}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.headerRight} />
                    </View>

                    {/* Estado de conexión */}
                    {renderConnectionStatus()}

                    {/* Mensajes */}
                    <View style={[
                        styles.messagesContainer,
                        {
                            marginBottom: calculateMessagesContainerMargin(),
                        }
                    ]}>
                        <ScrollView
                            ref={scrollViewRef}
                            style={styles.messagesScrollView}
                            contentContainerStyle={[
                                styles.messagesContent,
                                {
                                    paddingTop: 16,
                                    paddingBottom: isKeyboardVisible ? 50 : 50
                                }
                            ]}
                            showsVerticalScrollIndicator={false}
                            onScroll={handleScroll}
                            scrollEventThrottle={16}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={handleRefresh}
                                    tintColor="#F8BBD9"
                                    colors={["#F8BBD9"]}
                                />
                            }
                            keyboardShouldPersistTaps="handled"
                            contentInsetAdjustmentBehavior="automatic"
                        >
                            {/* Mensaje de error mejorado */}
                            {error && (
                                <View style={styles.errorContainer}>
                                    <Text style={styles.errorText}>{error}</Text>
                                    <TouchableOpacity
                                        style={styles.retryButton}
                                        onPress={handleClearError}
                                    >
                                        <Text style={styles.retryButtonText}>Ocultar</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {/* Mensajes agrupados */}
                            {groupedMessages.map((item) => (
                                <View key={item.key}>
                                    {renderChatItem({ item })}
                                </View>
                            ))}

                            {/* Indicador de escritura */}
                            {renderTypingIndicator()}
                        </ScrollView>

                        {/* Botón scroll to bottom */}
                        {showScrollToBottom && (
                            <TouchableOpacity
                                style={[
                                    styles.scrollToBottomButton,
                                    {
                                        bottom: isKeyboardVisible ? 80 : 140
                                    }
                                ]}
                                onPress={() => scrollToBottom()}
                            >
                                <Text style={styles.scrollToBottomText}>↓</Text>
                                {unreadCount > 0 && (
                                    <View style={styles.unreadBadge}>
                                        <Text style={styles.unreadBadgeText}>
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </TouchableWithoutFeedback>

            {/* Input */}
            <View style={[
                styles.inputContainer,
                {
                    bottom: calculateInputContainerBottom(),
                    backgroundColor: '#FFFFFF',
                }
            ]}>
                <ChatInput
                    onSendMessage={handleSendMessage}
                    onTyping={() => handleTyping(conversation?.conversationId, true)}
                    onStopTyping={() => handleTyping(conversation?.conversationId, false)}
                    disabled={!conversation && !isConnected}
                    isLoading={sendingMessage}
                    placeholder={conversation ? "Mensaje..." : "Conectando..."}
                    onImageSelected={(imageUri) => {
                        console.log('📷 Imagen seleccionada:', imageUri);
                    }}
                />
            </View>

            {/* Visor de imágenes */}
            {imageViewerVisible && selectedImageUri && (
                <View style={styles.imageViewerOverlay}>
                    <TouchableOpacity
                        style={styles.imageViewerClose}
                        onPress={() => {
                            setImageViewerVisible(false);
                            setSelectedImageUri(null);
                        }}
                    >
                        <Text style={styles.imageViewerCloseText}>✕</Text>
                    </TouchableOpacity>
                    <Image
                        source={{ uri: selectedImageUri }}
                        style={styles.imageViewerImage}
                        resizeMode="contain"
                    />
                </View>
            )}

            {/* Alertas personalizadas */}
            <ConfirmationDialog
                visible={alertState.confirmation.visible}
                title={alertState.confirmation.title}
                message={alertState.confirmation.message}
                onConfirm={alertState.confirmation.onConfirm}
                onCancel={alertState.confirmation.onCancel}
                confirmText={alertState.confirmation.confirmText}
                cancelText={alertState.confirmation.cancelText}
                isDangerous={alertState.confirmation.isDangerous}
            />

            <LoadingDialog
                visible={alertState.loading.visible}
                title={alertState.loading.title}
                message={alertState.loading.message}
                color={alertState.loading.color}
            />

            <ToastDialog
                visible={alertState.toast.visible}
                message={alertState.toast.message}
                type={alertState.toast.type}
                duration={alertState.toast.duration}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666666',
        fontFamily: 'Poppins-Regular',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E1E1E1',
        marginTop: 30,
    },
    backButton: {
        padding: 4,
    },
    backIcon: {
        width: 24,
        height: 24,
        tintColor: '#333333',
    },
    headerCenter: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: -28,
    },
    profileImage: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333333',
        fontFamily: 'Poppins-SemiBold',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#666666',
        fontFamily: 'Poppins-Regular',
    },
    headerRight: {
        width: 28,
    },
    connectionStatus: {
        backgroundColor: '#FFE4B5',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E1E1E1',
    },
    connectionStatusText: {
        fontSize: 14,
        color: '#8B4513',
        textAlign: 'center',
        fontFamily: 'Poppins-Regular',
    },
    messagesContainer: {
        flex: 1,
        position: 'relative',
    },
    messagesScrollView: {
        flex: 1,
        paddingHorizontal: 0,
    },
    messagesContent: {
        flexGrow: 1,
    },
    dateContainer: {
        alignItems: 'center',
        marginVertical: 8,
    },
    dateText: {
        fontSize: 14,
        color: '#999999',
        backgroundColor: '#E5E5EA',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        overflow: 'hidden',
        fontFamily: 'Poppins-Regular',
    },
    typingContainer: {
        marginTop: 4,
    },
    deletingMessageContainer: {
        position: 'relative',
        opacity: 0.6,
    },
    deletingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 59, 48, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        zIndex: 1,
        borderRadius: 18,
        marginHorizontal: 16,
    },
    deletingText: {
        marginLeft: 8,
        fontSize: 12,
        color: '#FF3B30',
        fontFamily: 'Poppins-Medium',
    },
    errorContainer: {
        backgroundColor: '#FFE6E6',
        margin: 16,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    errorText: {
        fontSize: 14,
        color: '#D32F2F',
        textAlign: 'center',
        fontFamily: 'Poppins-Regular',
        marginBottom: 8,
    },
    retryButton: {
        backgroundColor: '#F8BBD9',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 16,
    },
    retryButtonText: {
        fontSize: 14,
        color: '#FFFFFF',
        fontFamily: 'Poppins-Medium',
    },
    scrollToBottomButton: {
        position: 'absolute',
        right: 16,
        backgroundColor: '#F8BBD9',
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 10
    },
    scrollToBottomText: {
        fontSize: 20,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    unreadBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#FF3B30',
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    unreadBadgeText: {
        fontSize: 12,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    inputContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E1E1E1',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5
    },
    bottomSpacer: {
        height: 400,
    },
    imageViewerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    imageViewerClose: {
        position: 'absolute',
        top: 60,
        right: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1001,
    },
    imageViewerCloseText: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    imageViewerImage: {
        width: '90%',
        height: '70%',
    },
});

export default ChatScreen;