import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useSocket } from "./useSocket";

// Custom hook para manejar la funcionalidad de chat
export const useChat = () => {
    // Estados principales del chat
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    
    // Estados para modal de eliminación
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [messageToDelete, setMessageToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    
    // Estados para paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    
    // Estados adicionales para funcionalidades en tiempo real
    const [typingUsers, setTypingUsers] = useState(new Set());
    const typingTimeoutRef = useRef(null);
    
    // Referencias para controlar el comportamiento del chat
    const messagesEndRef = useRef(null);
    const pollingIntervalRef = useRef(null);
    const isInitializedRef = useRef(false);
    const lastMessageCountRef = useRef(0);
    const activeConversationRef = useRef(null);
    const fileInputRef = useRef(null);
    
    const { user, isAuthenticated } = useAuth();
    
    // Hook de Socket.IO para comunicación en tiempo real
    const {
        isConnected: socketConnected,
        joinConversation,
        leaveConversation,
        startTyping,
        stopTyping,
        onNewMessage,
        onConversationUpdated,
        onConversationClosed,
        onMessagesRead,
        onUserTyping,
        onChatStatsUpdated,
        onMessageDeleted
    } = useSocket();

    // URL base de la API
    const API_BASE = "http://localhost:4000/api/chat";

    // Actualizar referencia cuando cambia la conversación activa
    useEffect(() => {
        activeConversationRef.current = activeConversation;
    }, [activeConversation]);

    // Función para realizar peticiones a la API
    const apiRequest = useCallback(async (url, options = {}) => {
        try {
            console.log(`API Request: ${options.method || 'GET'} ${url}`);
            
            const response = await fetch(`${API_BASE}${url}`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('Respuesta no es JSON:', text);
                throw new Error('El servidor no devolvió una respuesta JSON válida');
            }

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || `Error ${response.status}`);
            }
            
            return data;
        } catch (error) {
            console.error('Error en petición API:', error);
            throw error;
        }
    }, []);

    // Función para realizar peticiones con FormData (para archivos)
    const apiRequestFormData = useCallback(async (url, formData) => {
        try {
            console.log(`API Request FormData: POST ${url}`);
            
            const response = await fetch(`${API_BASE}${url}`, {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('Respuesta no es JSON:', text);
                throw new Error('El servidor no devolvió una respuesta JSON válida');
            }

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || `Error ${response.status}`);
            }
            
            return data;
        } catch (error) {
            console.error('Error en petición API con FormData:', error);
            throw error;
        }
    }, []);

    // Función para hacer scroll al final de los mensajes
    const scrollToBottom = useCallback(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, []);

    // NUEVA FUNCIÓN: Obtener el último mensaje válido de una conversación
    const getLastValidMessage = useCallback((conversationMessages) => {
        if (!conversationMessages || conversationMessages.length === 0) {
            return 'Sin mensajes';
        }
        
        // Filtrar mensajes no eliminados y obtener el último
        const validMessages = conversationMessages.filter(msg => !msg.isDeleted);
        if (validMessages.length === 0) {
            return 'Sin mensajes';
        }
        
        const lastMessage = validMessages[validMessages.length - 1];
        return lastMessage.message || 'Archivo multimedia';
    }, []);

    // NUEVA FUNCIÓN: Actualizar el último mensaje en las conversaciones
    const updateConversationLastMessage = useCallback((conversationId) => {
        const conversationMessages = messages.filter(msg => 
            !msg.isDeleted && 
            (msg.conversationId === conversationId || 
             activeConversationRef.current?.conversationId === conversationId)
        );
        
        const lastMessage = getLastValidMessage(conversationMessages);
        const lastMessageAt = conversationMessages.length > 0 
            ? conversationMessages[conversationMessages.length - 1].createdAt 
            : null;
        
        setConversations(prev => prev.map(conv => 
            conv.conversationId === conversationId
                ? { 
                    ...conv, 
                    lastMessage,
                    lastMessageAt 
                }
                : conv
        ));
    }, [messages, getLastValidMessage]);

    // Funciones para manejo de archivos
    const handleFileSelect = useCallback((e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            
            // Crear preview para imágenes
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => setPreviewUrl(e.target.result);
                reader.readAsDataURL(file);
            } else {
                setPreviewUrl(null);
            }
        }
    }, []);

    const clearSelectedFile = useCallback(() => {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);

    // Funciones para modal de eliminación
    const openDeleteModal = useCallback((message) => {
        setMessageToDelete(message);
        setShowDeleteModal(true);
    }, []);

    const closeDeleteModal = useCallback(() => {
        setShowDeleteModal(false);
        setMessageToDelete(null);
        setIsDeleting(false);
    }, []);

    // Configurar eventos de Socket.IO
    useEffect(() => {
        if (!socketConnected || !isAuthenticated) return;

        console.log('Configurando listeners de Socket.IO...');

        const unsubscribeNewMessage = onNewMessage((data) => {
            console.log('Nuevo mensaje recibido:', data);
            setMessages(prev => {
                const exists = prev.find(msg => msg._id === data.message._id);
                if (exists) return prev;
                
                setTimeout(() => scrollToBottom(), 100);
                return [...prev, data.message];
            });
            
            if (user?.userType === 'admin') {
                setConversations(prev => prev.map(conv => 
                    conv.conversationId === data.conversationId
                        ? { 
                            ...conv, 
                            lastMessage: data.message.message || 'Archivo multimedia',
                            lastMessageAt: data.timestamp,
                            unreadCountAdmin: data.message.senderType !== 'admin' 
                                ? (conv.unreadCountAdmin || 0) + 1 
                                : conv.unreadCountAdmin
                        }
                        : conv
                ));
            }
        });

        // LISTENER MEJORADO: Manejo de mensajes eliminados
        const unsubscribeMessageDeleted = onMessageDeleted((data) => {
            console.log('Mensaje eliminado via Socket.IO:', data);
            
            // Actualizar mensajes locales
            setMessages(prev => {
                const updatedMessages = prev.filter(msg => msg._id !== data.messageId);
                
                // Si el mensaje eliminado era de la conversación activa, actualizar último mensaje
                const deletedMessage = prev.find(msg => msg._id === data.messageId);
                if (deletedMessage && activeConversationRef.current) {
                    setTimeout(() => {
                        updateConversationLastMessage(activeConversationRef.current.conversationId);
                    }, 100);
                }
                
                return updatedMessages;
            });
            
            // Actualizar conversaciones para administradores
            if (user?.userType === 'admin' && data.conversationId) {
                // Obtener mensajes válidos después de la eliminación
                const validMessages = messages.filter(msg => 
                    msg._id !== data.messageId && !msg.isDeleted
                );
                const lastValidMessage = getLastValidMessage(validMessages);
                
                setConversations(prev => prev.map(conv => 
                    conv.conversationId === data.conversationId
                        ? { 
                            ...conv, 
                            lastMessage: lastValidMessage,
                            lastMessageAt: validMessages.length > 0 
                                ? validMessages[validMessages.length - 1].createdAt 
                                : conv.lastMessageAt
                        }
                        : conv
                ));
            }
        });

        const unsubscribeConversationUpdated = onConversationUpdated((data) => {
            if (user?.userType === 'admin') {
                setConversations(prev => prev.map(conv => 
                    conv.conversationId === data.conversationId
                        ? { ...conv, ...data }
                        : conv
                ));
            }
        });

        const unsubscribeConversationClosed = onConversationClosed((data) => {
            setConversations(prev => prev.map(conv => 
                conv.conversationId === data.conversationId
                    ? { ...conv, status: 'closed' }
                    : conv
            ));
            
            if (activeConversationRef.current?.conversationId === data.conversationId) {
                setError('La conversación ha sido cerrada por el administrador');
            }
        });

        const unsubscribeMessagesRead = onMessagesRead((data) => {
            setMessages(prev => prev.map(msg => ({
                ...msg,
                isRead: true,
                readAt: data.timestamp
            })));
            
            if (user?.userType === 'admin') {
                setConversations(prev => prev.map(conv => 
                    conv.conversationId === data.conversationId
                        ? { ...conv, unreadCountAdmin: 0 }
                        : conv
                ));
            }
        });

        const unsubscribeUserTyping = onUserTyping((data) => {
            if (data.userId !== user?.id) {
                setTypingUsers(prev => {
                    const newSet = new Set(prev);
                    if (data.isTyping) {
                        newSet.add(data.userId);
                    } else {
                        newSet.delete(data.userId);
                    }
                    return newSet;
                });
            }
        });

        const unsubscribeChatStats = onChatStatsUpdated((stats) => {
            if (user?.userType === 'admin') {
                setUnreadCount(stats.unreadMessages || 0);
            }
        });

        return () => {
            console.log('Limpiando listeners de Socket.IO...');
            unsubscribeNewMessage?.();
            unsubscribeMessageDeleted?.();
            unsubscribeConversationUpdated?.();
            unsubscribeConversationClosed?.();
            unsubscribeMessagesRead?.();
            unsubscribeUserTyping?.();
            unsubscribeChatStats?.();
        };
    }, [socketConnected, isAuthenticated, user?.id, user?.userType, messages, onNewMessage, onMessageDeleted, onConversationUpdated, onConversationClosed, onMessagesRead, onUserTyping, onChatStatsUpdated, scrollToBottom, updateConversationLastMessage, getLastValidMessage]);

    // Obtener o crear conversación para el cliente actual
    const getOrCreateConversation = useCallback(async (showLoader = true) => {
        if (!user?.id || user.userType !== 'Customer') {
            return null;
        }
        
        try {
            if (showLoader) setLoading(true);
            const data = await apiRequest(`/conversation/${user.id}`);
            return data.conversation;
        } catch (error) {
            setError('Error al obtener conversación');
            return null;
        } finally {
            if (showLoader) setLoading(false);
        }
    }, [user, apiRequest]);

    // Obtener todas las conversaciones (para administradores)
    const getAllConversations = useCallback(async (showLoader = true) => {
        if (!user || user.userType !== 'admin') {
            return;
        }
        
        try {
            if (showLoader) setLoading(true);
            const data = await apiRequest('/admin/conversations');
            
            setConversations(prevConversations => {
                const newConversations = data.conversations || [];
                
                const hasChanges = JSON.stringify(prevConversations.map(c => ({
                    id: c.conversationId,
                    lastMessage: c.lastMessage,
                    lastMessageAt: c.lastMessageAt,
                    unreadCount: c.unreadCountAdmin
                }))) !== JSON.stringify(newConversations.map(c => ({
                    id: c.conversationId,
                    lastMessage: c.lastMessage,
                    lastMessageAt: c.lastMessageAt,
                    unreadCount: c.unreadCountAdmin
                })));
                
                if (!hasChanges) {
                    return prevConversations;
                }
                
                return newConversations;
            });
            
            const totalUnread = (data.conversations || []).reduce((sum, conv) => 
                sum + (conv.unreadCountAdmin || 0), 0);
            setUnreadCount(totalUnread);
            
        } catch (error) {
            setError('Error al obtener conversaciones');
        } finally {
            if (showLoader) setLoading(false);
        }
    }, [user, apiRequest]);

    // Obtener mensajes de una conversación específica
    const getMessages = useCallback(async (conversationId, page = 1, resetMessages = false, showLoader = true) => {
        if (!conversationId) {
            return;
        }
        
        try {
            if (showLoader) setLoadingMessages(true);
            const data = await apiRequest(`/messages/${conversationId}?page=${page}&limit=50`);
            
            const newMessages = (data.messages || []).filter(msg => !msg.isDeleted);
            
            if (resetMessages || page === 1) {
                setMessages(prevMessages => {
                    const hasSameIds = JSON.stringify(prevMessages.map(m => m._id)) === 
                                     JSON.stringify(newMessages.map(m => m._id));
                    
                    if (hasSameIds && prevMessages.length === newMessages.length) {
                        return prevMessages;
                    }
                    
                    lastMessageCountRef.current = newMessages.length;
                    return newMessages;
                });
                setCurrentPage(1);
            } else {
                setMessages(prev => [...newMessages, ...prev]);
            }
            
            setHasMoreMessages(data.pagination?.hasNextPage || false);
            setCurrentPage(page);
            
            if ((resetMessages || page === 1) && newMessages.length > lastMessageCountRef.current) {
                setTimeout(() => scrollToBottom(), 100);
            }
            
        } catch (error) {
            setError('Error al obtener mensajes');
        } finally {
            if (showLoader) setLoadingMessages(false);
        }
    }, [apiRequest, scrollToBottom]);

    // Manejar cambios en el input para indicar que está escribiendo
    const handleMessageChange = useCallback((value) => {
        setNewMessage(value);
        
        if (!activeConversationRef.current) return;
        
        if (value.trim() && !typingTimeoutRef.current) {
            startTyping(activeConversationRef.current.conversationId);
        }
        
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        
        typingTimeoutRef.current = setTimeout(() => {
            stopTyping(activeConversationRef.current?.conversationId);
            typingTimeoutRef.current = null;
        }, 2000);
        
        if (!value.trim()) {
            stopTyping(activeConversationRef.current.conversationId);
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = null;
            }
        }
    }, [startTyping, stopTyping]);

    // Enviar un mensaje (con archivo multimedia opcional)
    const sendMessage = useCallback(async (conversationId, message, file = null) => {
        if (!conversationId) {
            setError('ID de conversación requerido');
            return false;
        }

        if (!message?.trim() && !file) {
            setError('Debes escribir un mensaje o seleccionar un archivo');
            return false;
        }
        
        stopTyping(conversationId);
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }
        
        try {
            let data;
            
            if (file) {
                const formData = new FormData();
                formData.append('conversationId', conversationId);
                if (message?.trim()) {
                    formData.append('message', message.trim());
                }
                formData.append('file', file);
                
                data = await apiRequestFormData('/message', formData);
            } else {
                data = await apiRequest('/message', {
                    method: 'POST',
                    body: JSON.stringify({
                        conversationId,
                        message: message.trim()
                    })
                });
            }
            
            // ACTUALIZAR: Usar la función para actualizar último mensaje
            if (user?.userType === 'admin') {
                setConversations(prev => prev.map(conv => 
                    conv.conversationId === conversationId 
                        ? { 
                            ...conv, 
                            lastMessage: message?.trim() || 'Archivo multimedia', 
                            lastMessageAt: new Date() 
                        }
                        : conv
                ));
            }
            
            return true;
            
        } catch (error) {
            console.error('Error al enviar mensaje:', error);
            setError(error.message || 'Error al enviar mensaje');
            return false;
        }
    }, [user, apiRequest, apiRequestFormData, stopTyping]);

    // FUNCIÓN MEJORADA: Eliminar mensaje
    const deleteMessage = useCallback(async (messageId) => {
        if (!messageId) {
            setError('ID de mensaje requerido');
            return false;
        }
        
        try {
            setIsDeleting(true);
            
            // Encontrar el mensaje antes de eliminarlo para obtener la conversación
            const messageToDelete = messages.find(msg => msg._id === messageId);
            const conversationId = messageToDelete?.conversationId || activeConversationRef.current?.conversationId;
            
            await apiRequest(`/message/${messageId}`, { method: 'DELETE' });
            
            // Actualizar inmediatamente el estado local
            setMessages(prev => {
                const updatedMessages = prev.filter(msg => msg._id !== messageId);
                
                // Si hay una conversación activa, actualizar su último mensaje
                if (conversationId) {
                    setTimeout(() => {
                        updateConversationLastMessage(conversationId);
                    }, 100);
                }
                
                return updatedMessages;
            });
            
            // Para administradores, actualizar la lista de conversaciones
            if (user?.userType === 'admin' && conversationId) {
                const remainingMessages = messages.filter(msg => 
                    msg._id !== messageId && !msg.isDeleted
                );
                const lastValidMessage = getLastValidMessage(remainingMessages);
                
                setConversations(prev => prev.map(conv => 
                    conv.conversationId === conversationId
                        ? { 
                            ...conv, 
                            lastMessage: lastValidMessage,
                            lastMessageAt: remainingMessages.length > 0 
                                ? remainingMessages[remainingMessages.length - 1].createdAt 
                                : conv.lastMessageAt
                        }
                        : conv
                ));
            }
            
            return true;
        } catch (error) {
            console.error('Error al eliminar mensaje:', error);
            setError(error.message || 'Error al eliminar mensaje');
            return false;
        } finally {
            setIsDeleting(false);
        }
    }, [apiRequest, messages, user?.userType, updateConversationLastMessage, getLastValidMessage]);

    // Confirmar eliminación de mensaje
    const confirmDeleteMessage = useCallback(async () => {
        if (!messageToDelete) return;
        
        const success = await deleteMessage(messageToDelete._id);
        if (success) {
            closeDeleteModal();
        }
    }, [messageToDelete, deleteMessage, closeDeleteModal]);

    // Marcar mensajes como leídos
    const markAsRead = useCallback(async (conversationId) => {
        if (!conversationId) return;
        
        try {
            await apiRequest(`/read/${conversationId}`, { method: 'PUT' });
            
            if (user?.userType === 'admin') {
                setConversations(prev => prev.map(conv => 
                    conv.conversationId === conversationId 
                        ? { ...conv, unreadCountAdmin: 0 }
                        : conv
                ));
                
                setUnreadCount(prev => Math.max(0, prev - (activeConversationRef.current?.unreadCountAdmin || 0)));
            }
            
        } catch (error) {
            console.error('Error marcando como leído:', error);
        }
    }, [user, apiRequest]);

    // Seleccionar conversación activa y unirse a la sala de Socket.IO
    const selectConversation = useCallback(async (conversation) => {
        if (!conversation) return;
        
        if (activeConversationRef.current) {
            leaveConversation(activeConversationRef.current.conversationId);
        }
        
        setActiveConversation(conversation);
        setMessages([]);
        setCurrentPage(1);
        setHasMoreMessages(true);
        lastMessageCountRef.current = 0;
        setTypingUsers(new Set());
        
        joinConversation(conversation.conversationId);
        
        await getMessages(conversation.conversationId, 1, true, true);
        await markAsRead(conversation.conversationId);
    }, [getMessages, markAsRead, leaveConversation, joinConversation]);

    // Cargar más mensajes (paginación)
    const loadMoreMessages = useCallback(async () => {
        if (!activeConversation || !hasMoreMessages || loadingMessages) return;
        
        const nextPage = currentPage + 1;
        await getMessages(activeConversation.conversationId, nextPage, false, true);
    }, [activeConversation, hasMoreMessages, loadingMessages, currentPage, getMessages]);

    // Inicializar chat según tipo de usuario
    const initializeChat = useCallback(async () => {
        if (!isAuthenticated || !user || isInitializedRef.current) {
            return;
        }
        
        isInitializedRef.current = true;
        setIsConnected(true);
        
        try {
            if (user.userType === 'admin') {
                await getAllConversations(true);
            } else if (user.userType === 'Customer') {
                const conversation = await getOrCreateConversation(true);
                if (conversation) {
                    await selectConversation(conversation);
                }
            }
        } catch (error) {
            console.error('Error al inicializar el chat:', error);
            setError('Error al inicializar el chat');
            isInitializedRef.current = false;
        }
    }, [isAuthenticated, user, getAllConversations, getOrCreateConversation, selectConversation]);

    // Effect principal para inicializar
    useEffect(() => {
        if (isAuthenticated && user && !isInitializedRef.current) {
            initializeChat();
        }
    }, [isAuthenticated, user?.id, user?.userType, initializeChat]);

    // Función para limpiar errores
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        // Estados
        conversations,
        activeConversation,
        messages,
        newMessage,
        selectedFile,
        previewUrl,
        loading,
        error,
        isConnected: isConnected && socketConnected,
        unreadCount,
        hasMoreMessages,
        loadingMessages,
        typingUsers,
        
        // Estados del modal de eliminación
        showDeleteModal,
        messageToDelete,
        isDeleting,
        
        // Setters
        setNewMessage: handleMessageChange,
        
        // Acciones principales
        sendMessage,
        deleteMessage,
        confirmDeleteMessage,
        selectConversation,
        markAsRead,
        loadMoreMessages,
        scrollToBottom,
        clearError,
        
        // Acciones de archivos
        handleFileSelect,
        clearSelectedFile,
        
        // Acciones del modal
        openDeleteModal,
        closeDeleteModal,
        
        // Referencias
        messagesEndRef,
        fileInputRef
    };
};