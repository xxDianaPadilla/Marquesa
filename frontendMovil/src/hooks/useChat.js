import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChatSocket } from './useChatSocket';

/**
 * Hook principal para la gestión completa del chat
 * Combina API calls con eventos Socket.IO para una experiencia en tiempo real
 */
export const useChat = () => {
    const { user, isAuthenticated, getBestAvailableToken } = useAuth();
    const { 
        socket, 
        isConnected, 
        connectionError, 
        joinConversation, 
        leaveConversation, 
        emitTyping, 
        subscribeToEvent 
    } = useChatSocket();

    // Estados principales
    const [conversation, setConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [sendingMessage, setSendingMessage] = useState(false);

    // Estados de UI
    const [isTyping, setIsTyping] = useState(false);
    const [typingUsers, setTypingUsers] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Referencias
    const currentConversationId = useRef(null);
    const typingTimeout = useRef(null);

    // URL base de la API
    const API_BASE_URL = 'https://marquesa.onrender.com/api/chat';

    /**
     * Obtiene o crea una conversación para el cliente actual
     */
    const getOrCreateConversation = useCallback(async () => {
        try {
            if (!isAuthenticated || !user?.id) {
                console.log('👤 Usuario no autenticado');
                return null;
            }

            setLoading(true);
            setError(null);

            const token = await getBestAvailableToken();
            if (!token) {
                throw new Error('Token de autenticación no disponible');
            }

            console.log('🔄 Obteniendo conversación para cliente:', user.id);

            const response = await fetch(`${API_BASE_URL}/conversation/${user.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('📝 Respuesta de conversación:', data);

            if (data.success) {
                if (data.conversation) {
                    setConversation(data.conversation);
                    
                    // Unirse a la sala de la conversación si está conectado el socket
                    if (isConnected && data.conversation.conversationId) {
                        joinConversation(data.conversation.conversationId);
                        currentConversationId.current = data.conversation.conversationId;
                    }

                    return data.conversation;
                } else {
                    // No hay conversación activa
                    console.log('📭 No hay conversación activa');
                    setConversation(null);
                    return null;
                }
            } else {
                throw new Error(data.message || 'Error al obtener conversación');
            }
        } catch (error) {
            console.error('❌ Error obteniendo conversación:', error);
            setError(error.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, user?.id, getBestAvailableToken, isConnected, joinConversation]);

    /**
     * Obtiene los mensajes de una conversación
     */
    const getMessages = useCallback(async (conversationId, page = 1) => {
        try {
            if (!conversationId) {
                console.log('❌ No hay ID de conversación');
                return [];
            }

            const token = await getBestAvailableToken();
            if (!token) {
                throw new Error('Token de autenticación no disponible');
            }

            console.log('📨 Obteniendo mensajes para conversación:', conversationId);

            const response = await fetch(`${API_BASE_URL}/messages/${conversationId}?page=${page}&limit=50`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('📨 Mensajes obtenidos:', data.messages?.length || 0);

            if (data.success && data.messages) {
                if (page === 1) {
                    setMessages(data.messages);
                } else {
                    // Agregar mensajes anteriores (paginación)
                    setMessages(prev => [...data.messages, ...prev]);
                }
                return data.messages;
            } else {
                throw new Error(data.message || 'Error al obtener mensajes');
            }
        } catch (error) {
            console.error('❌ Error obteniendo mensajes:', error);
            setError(error.message);
            return [];
        }
    }, [getBestAvailableToken]);

    /**
     * Envía un mensaje (texto o imagen)
     */
    const sendMessage = useCallback(async (messageText, imageUri = null) => {
        try {
            if (!messageText?.trim() && !imageUri) {
                console.log('❌ Mensaje vacío');
                return { success: false, message: 'Mensaje requerido' };
            }

            setSendingMessage(true);
            setError(null);

            const token = await getBestAvailableToken();
            if (!token) {
                throw new Error('Token de autenticación no disponible');
            }

            // Preparar datos del formulario
            const formData = new FormData();
            
            // Si hay conversación existente, usar su ID
            if (conversation?.conversationId) {
                formData.append('conversationId', conversation.conversationId);
            }
            
            // Agregar mensaje si existe
            if (messageText?.trim()) {
                formData.append('message', messageText.trim());
            }

            // Agregar imagen si existe
            if (imageUri) {
                const fileExtension = imageUri.split('.').pop()?.toLowerCase() || 'jpg';
                const mimeType = `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;
                
                formData.append('file', {
                    uri: imageUri,
                    type: mimeType,
                    name: `image_${Date.now()}.${fileExtension}`,
                });
            }

            console.log('📤 Enviando mensaje...');

            const response = await fetch(`${API_BASE_URL}/message`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('✅ Mensaje enviado:', data);

            if (data.success) {
                // Si es nueva conversación, configurarla
                if (data.isNewConversation && data.conversationId) {
                    await getOrCreateConversation();
                }

                return {
                    success: true,
                    message: data.message,
                    conversationId: data.conversationId
                };
            } else {
                throw new Error(data.message || 'Error al enviar mensaje');
            }
        } catch (error) {
            console.error('❌ Error enviando mensaje:', error);
            setError(error.message);
            return { success: false, message: error.message };
        } finally {
            setSendingMessage(false);
        }
    }, [conversation?.conversationId, getBestAvailableToken, getOrCreateConversation]);

    /**
     * Marca los mensajes como leídos
     */
    const markAsRead = useCallback(async (conversationId) => {
        try {
            if (!conversationId) return;

            const token = await getBestAvailableToken();
            if (!token) return;

            const response = await fetch(`${API_BASE_URL}/read/${conversationId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setUnreadCount(0);
                    console.log('✅ Mensajes marcados como leídos');
                }
            }
        } catch (error) {
            console.error('❌ Error marcando como leído:', error);
        }
    }, [getBestAvailableToken]);

    /**
     * Maneja el indicador de escritura
     */
    const handleTyping = useCallback((conversationId, typing = true) => {
        if (!isConnected || !conversationId) return;

        // Limpiar timeout anterior
        if (typingTimeout.current) {
            clearTimeout(typingTimeout.current);
        }

        if (typing) {
            setIsTyping(true);
            emitTyping(conversationId, true);

            // Auto-stop después de 3 segundos
            typingTimeout.current = setTimeout(() => {
                setIsTyping(false);
                emitTyping(conversationId, false);
            }, 3000);
        } else {
            setIsTyping(false);
            emitTyping(conversationId, false);
        }
    }, [isConnected, emitTyping]);

    /**
     * Detiene el indicador de escritura
     */
    const stopTyping = useCallback(() => {
        if (typingTimeout.current) {
            clearTimeout(typingTimeout.current);
        }
        setIsTyping(false);
        
        if (currentConversationId.current) {
            emitTyping(currentConversationId.current, false);
        }
    }, [emitTyping]);

    // Effect para eventos de socket en tiempo real
    useEffect(() => {
        if (!socket || !isConnected) return;

        console.log('🔌 Configurando listeners de eventos de chat...');

        // Listener para nuevos mensajes
        const handleNewMessage = (data) => {
            console.log('📨 Nuevo mensaje recibido:', data);
            
            if (data.conversationId === currentConversationId.current) {
                setMessages(prev => [...prev, data.message]);
                
                // Marcar como leído si la conversación está activa
                if (data.message.senderType === 'admin') {
                    markAsRead(data.conversationId);
                }
            }
        };

        // Listener para mensajes eliminados
        const handleMessageDeleted = (data) => {
            console.log('🗑️ Mensaje eliminado:', data);
            
            if (data.conversationId === currentConversationId.current) {
                setMessages(prev => prev.filter(msg => msg._id !== data.messageId));
            }
        };

        // Listener para indicador de escritura
        const handleUserTyping = (data) => {
            if (data.conversationId === currentConversationId.current && data.userId !== user?.id) {
                if (data.isTyping) {
                    setTypingUsers(prev => [...prev.filter(id => id !== data.userId), data.userId]);
                } else {
                    setTypingUsers(prev => prev.filter(id => id !== data.userId));
                }
            }
        };

        // Listener para mensajes leídos
        const handleMessagesRead = (data) => {
            if (data.conversationId === currentConversationId.current) {
                setMessages(prev => 
                    prev.map(msg => 
                        msg.senderId._id === user?.id ? { ...msg, isRead: true } : msg
                    )
                );
            }
        };

        // Suscribir a eventos
        const unsubscribeNewMessage = subscribeToEvent('new_message', handleNewMessage);
        const unsubscribeMessageDeleted = subscribeToEvent('message_deleted', handleMessageDeleted);
        const unsubscribeTyping = subscribeToEvent('user_typing', handleUserTyping);
        const unsubscribeRead = subscribeToEvent('messages_read', handleMessagesRead);

        // Cleanup
        return () => {
            if (unsubscribeNewMessage) unsubscribeNewMessage();
            if (unsubscribeMessageDeleted) unsubscribeMessageDeleted();
            if (unsubscribeTyping) unsubscribeTyping();
            if (unsubscribeRead) unsubscribeRead();
        };
    }, [socket, isConnected, subscribeToEvent, user?.id, markAsRead]);

    // Effect para cargar conversación y mensajes al iniciar
    useEffect(() => {
        if (isAuthenticated && user?.id) {
            console.log('🔄 Inicializando chat para usuario:', user.id);
            getOrCreateConversation().then(conv => {
                if (conv?.conversationId) {
                    getMessages(conv.conversationId);
                }
            });
        } else {
            // Limpiar estado cuando no está autenticado
            setConversation(null);
            setMessages([]);
            setError(null);
            currentConversationId.current = null;
        }
    }, [isAuthenticated, user?.id, getOrCreateConversation, getMessages]);

    // Effect para limpiar al desmontar
    useEffect(() => {
        return () => {
            if (currentConversationId.current) {
                leaveConversation(currentConversationId.current);
            }
            stopTyping();
        };
    }, [leaveConversation, stopTyping]);

    /**
     * Elimina un mensaje del backend - FUNCIÓN REAL
     */
    const deleteMessage = useCallback(async (messageId) => {
        try {
            if (!messageId) {
                console.log('❌ ID de mensaje requerido');
                return { success: false, message: 'ID de mensaje requerido' };
            }

            const token = await getBestAvailableToken();
            if (!token) {
                throw new Error('Token de autenticación no disponible');
            }

            console.log('🗑️ Eliminando mensaje del backend:', messageId);

            const response = await fetch(`${API_BASE_URL}/message/${messageId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('✅ Respuesta de eliminación del backend:', data);

            if (data.success) {
                // Actualizar lista local de mensajes DESPUÉS de confirmación del backend
                setMessages(prev => prev.filter(msg => msg._id !== messageId));
                
                return {
                    success: true,
                    message: data.message || 'Mensaje eliminado correctamente'
                };
            } else {
                throw new Error(data.message || 'Error al eliminar mensaje');
            }
        } catch (error) {
            console.error('❌ Error eliminando mensaje del backend:', error);
            setError(error.message);
            return { success: false, message: error.message };
        }
    }, [getBestAvailableToken]);

    return {
        // Estado del chat
        conversation,
        messages,
        loading,
        error,
        sendingMessage,
        
        // Estado de Socket.IO
        isConnected,
        connectionError,
        
        // Estado de UI
        isTyping,
        typingUsers,
        unreadCount,
        
        // Funciones principales
        sendMessage,
        getMessages,
        markAsRead,
        deleteMessage, // ✅ ELIMINACIÓN FÍSICA REAL DEL BACKEND
        
        // Funciones de typing
        handleTyping,
        stopTyping,
        
        // Funciones de conversación
        getOrCreateConversation,
        
        // Funciones de utilidad
        clearError: () => setError(null),
        refreshConversation: getOrCreateConversation
    };
};