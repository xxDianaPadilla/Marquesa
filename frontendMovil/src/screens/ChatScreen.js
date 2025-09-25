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
    ActivityIndicator,
    Dimensions
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

// ✅ MANTENER EL DETECTOR DINÁMICO DE TECLADO IMPORTADO
import { 
    useKeyboardDetector, 
    KeyboardDebugInfo 
} from "../hooks/useKeyboardDetector";

/**
 * Pantalla principal del chat con comportamiento responsive SIMPLE como la versión antigua
 * ✅ USA VALORES FIJOS EN LUGAR DEL SISTEMA RESPONSIVE COMPLEJO
 * ✅ MANTIENE LA DETECCIÓN DINÁMICA DE TECLADO
 */
const ChatScreen = ({ navigation, route }) => {
    const insets = useSafeAreaInsets();
    const { user } = useAuth();

    // ✅ USAR DETECTOR DINÁMICO DE TECLADO IMPORTADO
    const {
        keyboardHeight,
        isKeyboardVisible,
        keyboardType,
        keyboardBrand,
        getAdjustedKeyboardHeight,
        getKeyboardInfo
    } = useKeyboardDetector();

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
    const [showScrollToBottom, setShowScrollToBottom] = useState(false);
    const [imageViewerVisible, setImageViewerVisible] = useState(false);
    const [selectedImageUri, setSelectedImageUri] = useState(null);
    const [deletingMessages, setDeletingMessages] = useState(new Set());
    const [imagePreviewHeight, setImagePreviewHeight] = useState(0);
    const [showKeyboardDebug, setShowKeyboardDebug] = useState(false); // ✅ DESACTIVADO POR DEFECTO

    // Referencias
    const scrollViewRef = useRef(null);
    const lastMessageIdRef = useRef(null);

    /**
     * 📊 Log información del teclado cuando cambia
     */
    useEffect(() => {
        if (isKeyboardVisible) {
            const info = getKeyboardInfo();
            console.log('⌨️ === INFORMACIÓN DEL TECLADO ===');
            console.log('⌨️ Altura detectada:', info.height);
            console.log('⌨️ Tipo:', info.type);
            console.log('⌨️ Marca estimada:', info.brand);
            console.log('⌨️ Ratio de pantalla:', (info.metrics.keyboardRatio * 100).toFixed(1) + '%');
        }
    }, [isKeyboardVisible, keyboardHeight, getKeyboardInfo]);

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
     * Auto-scroll cuando aparece/desaparece el teclado
     */
    useEffect(() => {
        if (isKeyboardVisible) {
            const delay = Platform.OS === 'android' ? 250 : 100;
            setTimeout(() => scrollToBottom(true), delay);
        }
    }, [isKeyboardVisible, keyboardHeight]);

    /**
     * Marcar mensajes como leídos
     */
    useEffect(() => {
        if (conversation?.conversationId && messages.length > 0) {
            markAsRead(conversation.conversationId);
        }
    }, [conversation?.conversationId, messages.length, markAsRead]);

    /**
     * 📱 Calcula la altura de la barra de pestañas - COMO VERSIÓN ANTIGUA
     */
    const getTabBarHeight = useCallback(() => {
        const baseHeight = 60; // VALOR FIJO como versión antigua
        const paddingBottom = Math.max(insets.bottom, Platform.OS === 'ios' ? 25 : 10); // COMO VERSIÓN ANTIGUA
        return baseHeight + paddingBottom;
    }, [insets.bottom]);

    /**
     * 🔧 Función DINÁMICA para calcular posición del input - COMO VERSIÓN ANTIGUA + DETECCIÓN
     * ✅ COMBINA LA SIMPLICIDAD DE LA VERSIÓN ANTIGUA CON LA DETECCIÓN DINÁMICA
     */
    const getInputContainerBottom = useCallback(() => {
        if (isKeyboardVisible && keyboardHeight > 0) {
            // ✅ USAR LA DETECCIÓN DINÁMICA PERO CON LÓGICA SIMPLE COMO LA VERSIÓN ANTIGUA
            const extraPadding = Platform.OS === 'ios' ? 10 : 50; // MISMO CÁLCULO QUE VERSIÓN ANTIGUA
            return keyboardHeight + extraPadding;
        }
        return getTabBarHeight(); // MISMO FALLBACK QUE VERSIÓN ANTIGUA
    }, [isKeyboardVisible, keyboardHeight, getTabBarHeight]);

    /**
     * 📝 Función para calcular margin bottom del contenedor de mensajes - COMO VERSIÓN ANTIGUA
     */
    const calculateMessagesContainerMargin = useCallback(() => {
        // ✅ EXACTAMENTE COMO LA VERSIÓN ANTIGUA
        return getInputContainerBottom() + 70 + imagePreviewHeight;
    }, [getInputContainerBottom, imagePreviewHeight]);

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
            requestAnimationFrame(() => {
                try {
                    scrollViewRef.current?.scrollToEnd({ animated });
                    setShowScrollToBottom(false);
                } catch (error) {
                    console.log('Error al hacer scroll:', error);
                }
            });
        }
    }, []);

    /**
     * Maneja el evento de scroll
     */
    const handleScroll = useCallback((event) => {
        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
        const paddingToBottom = 100; // VALOR FIJO como versión antigua
        const isNearBottom = layoutMeasurement.height + contentOffset.y >=
            contentSize.height - paddingToBottom;

        setShowScrollToBottom(!isNearBottom);
    }, []);

    /**
     * Maneja el pull-to-refresh
     */
    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await refreshConversation();
            clearError();
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
     * 📤 Maneja el envío de mensajes
     */
    const handleSendMessage = useCallback(async (messageText, imageUri) => {
        try {
            if (!messageText?.trim() && !imageUri) {
                showWarningToast('Escribe un mensaje o selecciona una imagen');
                return { success: false, message: 'Mensaje vacío' };
            }

            showLoading({
                title: 'Enviando mensaje',
                message: 'Por favor espera...'
            });

            const result = await sendMessage(messageText, imageUri);
            hideLoading();

            if (result.success) {
                const delay = Platform.OS === 'android' ? 300 : 150;
                setTimeout(() => scrollToBottom(), delay);
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
     * 📸 Callback para cuando se selecciona/elimina una imagen - CON VALORES FIJOS
     */
    const handleImageSelectionChange = useCallback((hasImage) => {
        if (hasImage) {
            // ✅ USAR VALOR FIJO EN LUGAR DE FUNCIÓN RESPONSIVE
            const previewHeight = 90; // ALTURA FIJA COMO VERSIÓN ANTIGUA
            setImagePreviewHeight(previewHeight);
        } else {
            setImagePreviewHeight(0);
        }
        
        setTimeout(() => {
            if (messages.length > 0) {
                scrollToBottom(false);
            }
        }, 200);
    }, [messages.length, scrollToBottom]);

    /**
     * Función de eliminar mensaje
     */
    const handleMessageLongPress = useCallback(async (messageId, messageText, action) => {
        if (action === 'delete') {
            showConfirmation({
                title: "Eliminar mensaje",
                message: "¿Estás seguro de que quieres eliminar este mensaje? Esta acción no se puede deshacer.",
                confirmText: "Eliminar",
                cancelText: "Cancelar",
                isDangerous: true,
                onConfirm: async () => {
                    try {
                        hideConfirmation();
                        setDeletingMessages(prev => new Set([...prev, messageId]));
                        
                        showLoading({
                            title: 'Eliminando mensaje',
                            message: 'Por favor espera...',
                            color: '#F44336'
                        });

                        const result = await deleteMessage(messageId);
                        hideLoading();
                    } catch (error) {
                        hideLoading();
                        console.error('❌ Error eliminando mensaje:', error);
                        showErrorToast('Error al eliminar el mensaje. Inténtalo de nuevo.');
                    } finally {
                        setDeletingMessages(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(messageId);
                            return newSet;
                        });
                    }
                },
                onCancel: () => {
                    hideConfirmation();
                }
            });
        } else {
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
                }
            });
        }
    }, [deleteMessage, showConfirmation, hideConfirmation, showLoading, hideLoading, showSuccessToast, showErrorToast]);

    /**
     * Función para limpiar errores
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

    // Funciones auxiliares
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

    // Si está cargando
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
                    {/* Header - EXACTAMENTE COMO LA VERSIÓN ORIGINAL */}
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                            <Image source={backIcon} style={styles.backIcon} />
                        </TouchableOpacity>

                        <View style={styles.headerCenter}>
                            <Image source={marquesaMiniLogo} style={styles.profileImage} />
                            <Text style={styles.headerTitle}>Marquesa</Text>
                        </View>

                        <View style={styles.headerRight} />
                    </View>

                    {/* Estado de conexión */}
                    {renderConnectionStatus()}

                    {/* ✅ DEBUG INFO DEL TECLADO IMPORTADO */}
                    <KeyboardDebugInfo visible={showKeyboardDebug} />

                    {/* Mensajes - CON MARGIN BOTTOM SIMPLE COMO VERSIÓN ANTIGUA */}
                    <ScrollView
                        ref={scrollViewRef}
                        style={[
                            styles.messagesContainer,
                            { marginBottom: calculateMessagesContainerMargin() } // ✅ COMO VERSIÓN ANTIGUA
                        ]}
                        contentContainerStyle={styles.messagesContent}
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
                        nestedScrollEnabled={true}
                        overScrollMode="always"
                    >
                        {/* Mensaje de error */}
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

                    {/* Botón scroll to bottom - VALORES FIJOS */}
                    {showScrollToBottom && (
                        <TouchableOpacity
                            style={[
                                styles.scrollToBottomButton,
                                {
                                    bottom: isKeyboardVisible ? 
                                        keyboardHeight + 100 : // CÁLCULO SIMPLE
                                        120
                                }
                            ]}
                            onPress={() => scrollToBottom()}
                            activeOpacity={0.7}
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
            </TouchableWithoutFeedback>

            {/* Input con detección dinámica pero posicionamiento simple */}
            <View style={[
                styles.inputContainer,
                { bottom: getInputContainerBottom() } // ✅ MISMA LÓGICA QUE VERSIÓN ANTIGUA + DETECCIÓN DINÁMICA
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
                    onImageSelectionChange={handleImageSelectionChange}
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
                        activeOpacity={0.7}
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
                onHide={alertState.toast.onHide}
            />
        </SafeAreaView>
    );
};

// ✅ ESTILOS FIJOS COMO LA VERSIÓN ANTIGUA (SIN RESPONSIVE)
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
        paddingHorizontal: 16, // VALOR FIJO COMO VERSIÓN ANTIGUA
        paddingVertical: 12, // VALOR FIJO COMO VERSIÓN ANTIGUA
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E1E1E1',
        marginTop: 30, // VALOR FIJO COMO VERSIÓN ANTIGUA
    },
    backButton: {
        padding: 4, // VALOR FIJO COMO VERSIÓN ANTIGUA
    },
    backIcon: {
        width: 24, // VALOR FIJO COMO VERSIÓN ANTIGUA
        height: 24, // VALOR FIJO COMO VERSIÓN ANTIGUA
        tintColor: '#333333',
    },
    headerCenter: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: -110, // VALOR FIJO COMO VERSIÓN ANTIGUA
    },
    profileImage: {
        width: 32, // VALOR FIJO COMO VERSIÓN ANTIGUA
        height: 32, // VALOR FIJO COMO VERSIÓN ANTIGUA
        borderRadius: 16, // VALOR FIJO COMO VERSIÓN ANTIGUA
        marginRight: 8, // VALOR FIJO COMO VERSIÓN ANTIGUA
    },
    headerTitle: {
        fontSize: 18, // VALOR FIJO COMO VERSIÓN ANTIGUA
        fontWeight: '600',
        color: '#333333',
        fontFamily: 'Poppins-SemiBold',
    },
    headerSubtitle: {
        fontSize: 12, // VALOR FIJO
        color: '#666666',
        fontFamily: 'Poppins-Regular',
    },
    headerRight: {
        width: 28, // VALOR FIJO COMO VERSIÓN ANTIGUA
    },
    connectionStatus: {
        paddingVertical: 8,
        backgroundColor: '#FFE4B5',
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
        flex: 1, // COMO VERSIÓN ANTIGUA
    },
    messagesContent: {
        paddingVertical: 16, // VALOR FIJO COMO VERSIÓN ANTIGUA
        paddingBottom: 20, // VALOR FIJO COMO VERSIÓN ANTIGUA
    },
    dateContainer: {
        alignItems: 'center',
        marginVertical: 8,
    },
    dateText: {
        fontSize: 14, // VALOR FIJO COMO VERSIÓN ANTIGUA
        color: '#999999',
        backgroundColor: '#E5E5EA',
        paddingHorizontal: 12, // VALOR FIJO COMO VERSIÓN ANTIGUA
        paddingVertical: 4, // VALOR FIJO COMO VERSIÓN ANTIGUA
        borderRadius: 12, // VALOR FIJO COMO VERSIÓN ANTIGUA
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
        margin: 16,
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#FFE6E6',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 14,
        marginBottom: 8,
        color: '#D32F2F',
        textAlign: 'center',
        fontFamily: 'Poppins-Regular',
    },
    retryButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 16,
        backgroundColor: '#F8BBD9',
    },
    retryButtonText: {
        fontSize: 14,
        color: '#FFFFFF',
        fontFamily: 'Poppins-Medium',
    },
    scrollToBottomButton: {
        position: 'absolute',
        right: 16, // VALOR FIJO COMO VERSIÓN ANTIGUA
        width: 48, // VALOR FIJO
        height: 48, // VALOR FIJO
        borderRadius: 24, // VALOR FIJO
        backgroundColor: '#F8BBD9',
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
        zIndex: 10,
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
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        paddingHorizontal: 4,
        backgroundColor: '#FF3B30',
        alignItems: 'center',
        justifyContent: 'center',
    },
    unreadBadgeText: {
        fontSize: 12,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    inputContainer: {
        position: 'absolute', // COMO VERSIÓN ANTIGUA
        left: 0, // COMO VERSIÓN ANTIGUA
        right: 0, // COMO VERSIÓN ANTIGUA
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
        elevation: 5,
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
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1001,
    },
    imageViewerCloseText: {
        fontSize: 20,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    imageViewerImage: {
        width: '90%',
        height: '70%',
    },
});

export default ChatScreen;