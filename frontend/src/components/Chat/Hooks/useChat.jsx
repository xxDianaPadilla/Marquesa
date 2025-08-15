import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useSocket } from "./useSocket";
 
/**
 * Hook useChat - CORREGIDO PARA CONEXIÓN ESTABLE
 *
 * PROBLEMAS SOLUCIONADOS:
 * - Mejor integración con el contexto de autenticación
 * - Inicialización más robusta con verificación de tokens
 * - Manejo mejorado de estados de carga
 * - Sincronización perfecta con Socket.IO
 *
 * Ubicación: frontend/src/components/Chat/Hooks/useChat.jsx
 */
export const useChat = () => {
    // ============ ESTADOS PRINCIPALES ============
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
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [messageToDelete, setMessageToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [typingUsers, setTypingUsers] = useState(new Set());
 
    // ============ REFERENCIAS ============
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const isInitializedRef = useRef(false);
    const lastMessageCountRef = useRef(0);
    const activeConversationRef = useRef(null);
    const fileInputRef = useRef(null);
    const retryTimeoutRef = useRef(null);
 
    // ============ HOOKS CORREGIDOS ============
    const {
        user,
        isAuthenticated,
        loading: authLoading,
        getBestAvailableToken,
        getAuthHeaders
    } = useAuth();
 
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
        onMessageDeleted,
        connectionError: socketError,
        reconnect: reconnectSocket
    } = useSocket();
 
    // ✅ CORRECCIÓN: URL de API con mejor configuración
    const API_BASE = "https://marquesa.onrender.com/api/chat";
 
    useEffect(() => {
        activeConversationRef.current = activeConversation;
    }, [activeConversation]);
 
    // ============ FUNCIÓN UNIFICADA DE FORMATO ============
 
    const formatChatContent = useCallback((data, options = {}) => {
        const formatTime = (date) => {
            if (!date) return '';
            return new Date(date).toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
            });
        };
 
        const formatDate = (date) => {
            if (!date) return '';
 
            const messageDate = new Date(date);
            const now = new Date();
 
            // ✅ CORRECCIÓN CRÍTICA: Comparar solo las fechas (sin horas)
            const messageDateOnly = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());
            const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
 
            const diffTime = todayOnly.getTime() - messageDateOnly.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
 
            if (diffDays === 0) {
                return 'Hoy';
            } else if (diffDays === 1) {
                return 'Ayer';
            } else if (diffDays <= 7) {
                return `Hace ${diffDays} días`;
            } else {
                return messageDate.toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: messageDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
                });
            }
        };
 
        const formatMessage = (message, maxLength = 50) => {
            if (!message) return 'Sin mensaje';
 
            if (message.message && message.message.trim()) {
                const text = message.message.trim();
                return text.length > maxLength
                    ? text.substring(0, maxLength) + '...'
                    : text;
            }
 
            if (message.media && message.media.url) {
                return `📷 ${message.media.filename || 'Imagen'}`;
            }
 
            return 'Sin contenido';
        };
 
        if (options.timeOnly) return formatTime(data);
        if (options.dateOnly) return formatDate(data);
        if (options.messageOnly) return formatMessage(data, options.maxLength);
 
        return {
            time: formatTime(data),
            date: formatDate(data),
            message: formatMessage(data, options.maxLength)
        };
    }, []);
 
    // ============ VALIDACIONES Y UTILIDADES CORREGIDAS ============
 
    const validateAuthenticatedUser = useCallback(() => {
        console.log('🔍 Validando usuario autenticado:', {
            authLoading,
            isAuthenticated,
            hasUser: !!user,
            userId: user?.id,
            userType: user?.userType
        });
 
        if (authLoading) {
            console.log('⏳ Autenticación en progreso...');
            return false;
        }
 
        if (!isAuthenticated || !user) {
            console.log('❌ Usuario no autenticado');
            setError('Debes iniciar sesión para usar el chat');
            return false;
        }
 
        if (!user.id || !user.userType) {
            console.log('❌ Datos de usuario incompletos');
            setError('Datos de usuario incompletos');
            return false;
        }
 
        console.log('✅ Usuario validado correctamente');
        return true;
    }, [isAuthenticated, user, authLoading]);
 
    const validateImageFile = useCallback((file) => {
        if (!file) return { isValid: true };
 
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        const maxSize = 10 * 1024 * 1024; // 10MB
 
        if (!allowedTypes.includes(file.type)) {
            return {
                isValid: false,
                error: 'Solo se permiten archivos de imagen (JPG, PNG, GIF, WebP)'
            };
        }
 
        if (file.size > maxSize) {
            return {
                isValid: false,
                error: 'El archivo no puede exceder 10MB'
            };
        }
 
        return { isValid: true };
    }, []);
 
    const scrollToBottom = useCallback(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, []);
 
    const handleClientNotFound = useCallback(() => {
        console.log('Cliente no encontrado, limpiando estado local...');
        setActiveConversation(null);
        setMessages([]);
        setConversations([]);
 
        if (user?.userType === 'Customer') {
            setError('Tu cuenta ha sido eliminada del sistema. Contacta al administrador.');
        }
    }, [user?.userType]);
 
    // ============ FUNCIÓN CRÍTICA CORREGIDA: updateConversationInList ============
 
    const updateConversationInList = useCallback((conversationId, updates) => {
        console.log(`🔄 Actualizando conversación ${conversationId} con:`, updates);
 
        setConversations(prev => {
            const existingConvIndex = prev.findIndex(conv => conv.conversationId === conversationId);
 
            if (existingConvIndex >= 0) {
                const updatedConversations = [...prev];
                const existingConv = updatedConversations[existingConvIndex];
 
                updatedConversations[existingConvIndex] = {
                    ...existingConv,
                    ...(updates.lastMessage !== undefined && { lastMessage: updates.lastMessage }),
                    ...(updates.lastMessageAt !== undefined && { lastMessageAt: updates.lastMessageAt }),
                    ...(updates.unreadCountAdmin !== undefined && { unreadCountAdmin: updates.unreadCountAdmin }),
                    ...(updates.unreadCountClient !== undefined && { unreadCountClient: updates.unreadCountClient }),
                    ...(updates.status !== undefined && { status: updates.status })
                };
 
                if (updates.lastMessageAt) {
                    updatedConversations.sort((a, b) =>
                        new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
                    );
                }
 
                console.log(`✅ Conversación ${conversationId} actualizada en lista`);
                return updatedConversations;
            } else if (updates.clientId) {
                console.log(`✨ Nueva conversación detectada: ${conversationId}`);
                const newConversation = {
                    conversationId,
                    status: 'active',
                    unreadCountAdmin: 0,
                    unreadCountClient: 0,
                    ...updates
                };
 
                return [newConversation, ...prev];
            }
 
            return prev;
        });
 
        if (activeConversationRef.current?.conversationId === conversationId) {
            setActiveConversation(prev => {
                if (!prev) return prev;
 
                return {
                    ...prev,
                    ...(updates.lastMessage !== undefined && { lastMessage: updates.lastMessage }),
                    ...(updates.lastMessageAt !== undefined && { lastMessageAt: updates.lastMessageAt }),
                    ...(updates.unreadCountAdmin !== undefined && { unreadCountAdmin: updates.unreadCountAdmin }),
                    ...(updates.unreadCountClient !== undefined && { unreadCountClient: updates.unreadCountClient }),
                    ...(updates.status !== undefined && { status: updates.status })
                };
            });
        }
    }, []);
 
    // ============ FUNCIÓN CRÍTICA CORREGIDA: calculateLastMessage ============
 
    const calculateLastMessage = useCallback((conversationId, currentMessages) => {
        console.log(`📋 Calculando último mensaje para conversación: ${conversationId}`);
 
        const validMessages = currentMessages.filter(msg =>
            msg.conversationId === conversationId && !msg.isDeleted
        );
 
        if (validMessages.length === 0) {
            console.log(`📝 No hay mensajes válidos, último mensaje vacío`);
            return {
                lastMessage: '',
                lastMessageAt: new Date()
            };
        }
 
        const sortedMessages = validMessages.sort((a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
        );
 
        const latestMessage = sortedMessages[0];
        const lastMessage = formatChatContent(latestMessage, { messageOnly: true });
 
        console.log(`✅ Último mensaje calculado: "${lastMessage}"`);
 
        return {
            lastMessage,
            lastMessageAt: latestMessage.createdAt
        };
    }, [formatChatContent]);
 
    // ============ FUNCIONES API CORREGIDAS ============
 
    const apiRequest = useCallback(async (url, options = {}) => {
        try {
            if (!validateAuthenticatedUser()) {
                throw new Error('Usuario no autenticado');
            }
 
            console.log(`🌐 API Request: ${options.method || 'GET'} ${API_BASE}${url}`);
 
            // ✅ CORRECCIÓN: Usar headers de autenticación del contexto
            const headers = getAuthHeaders ? getAuthHeaders() : {
                'Content-Type': 'application/json'
            };
 
            // ✅ AGREGAR TOKEN AL HEADER SI NO ESTÁ
            if (!headers.Authorization && getBestAvailableToken) {
                const token = getBestAvailableToken();
                if (token) {
                    headers.Authorization = `Bearer ${token}`;
                }
            }
 
            const response = await fetch(`${API_BASE}${url}`, {
                credentials: 'include',
                headers: {
                    ...headers,
                    ...options.headers
                },
                ...options
            });
 
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('El servidor no devolvió una respuesta JSON válida');
            }
 
            const data = await response.json();
 
            if (!response.ok) {
                if (response.status === 401) {
                    setError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
                    setConversations([]);
                    setActiveConversation(null);
                    setMessages([]);
                    return null;
                }
 
                if (response.status === 404 && data.message?.includes('Cliente no encontrado')) {
                    handleClientNotFound();
                    throw new Error('Tu cuenta ha sido eliminada del sistema');
                }
 
                throw new Error(data.message || `Error ${response.status}`);
            }
 
            console.log(`✅ API Request exitosa: ${url}`);
            return data;
        } catch (error) {
            console.error(`❌ Error en petición API ${url}:`, error);
 
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Error de conexión con el servidor. Verifica tu conexión a internet.');
            }
 
            throw error;
        }
    }, [validateAuthenticatedUser, handleClientNotFound, getAuthHeaders, getBestAvailableToken]);
 
    const apiRequestFormData = useCallback(async (url, formData) => {
        try {
            if (!validateAuthenticatedUser()) {
                throw new Error('Usuario no autenticado');
            }
 
            // ✅ CORRECCIÓN: Headers mejorados para FormData
            const headers = {};
 
            // Agregar token si está disponible
            if (getBestAvailableToken) {
                const token = getBestAvailableToken();
                if (token) {
                    headers.Authorization = `Bearer ${token}`;
                }
            }
 
            const response = await fetch(`${API_BASE}${url}`, {
                method: 'POST',
                credentials: 'include',
                headers: headers, // No incluir Content-Type para FormData
                body: formData
            });
 
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('El servidor no devolvió una respuesta JSON válida');
            }
 
            const data = await response.json();
 
            if (!response.ok) {
                if (response.status === 401) {
                    setError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
                    setConversations([]);
                    setActiveConversation(null);
                    setMessages([]);
                    return null;
                }
 
                throw new Error(data.message || `Error ${response.status}`);
            }
 
            return data;
        } catch (error) {
            console.error(`❌ Error en petición FormData ${url}:`, error);
            throw error;
        }
    }, [validateAuthenticatedUser, getBestAvailableToken]);
 
    // ============ FUNCIONES DE CONVERSACIONES ============
 
    const getOrCreateConversation = useCallback(async (showLoader = true, retryCount = 0) => {
        if (!validateAuthenticatedUser() || user.userType !== 'Customer') {
            return null;
        }
 
        try {
            if (showLoader) setLoading(true);
 
            const data = await apiRequest(`/conversation/${user.id}`);
 
            if (data === null) return null;
 
            if (data.conversation) {
                console.log(`✅ Conversación obtenida exitosamente`);
                return data.conversation;
            } else {
                console.log(`📝 No hay conversación activa aún`);
                return null;
            }
        } catch (error) {
            console.error(`❌ Error obteniendo conversación:`, error);
            setError('Error al obtener conversación: ' + error.message);
            return null;
        } finally {
            if (showLoader) setLoading(false);
        }
    }, [user, apiRequest, validateAuthenticatedUser]);
 
    const getAllConversations = useCallback(async (showLoader = true) => {
        if (!validateAuthenticatedUser() || user.userType !== 'admin') {
            return;
        }
 
        try {
            if (showLoader) setLoading(true);
 
            const data = await apiRequest('/admin/conversations');
 
            if (data === null) return;
 
            const newConversations = data.conversations || [];
 
            setConversations(newConversations);
 
            const totalUnread = newConversations.reduce((sum, conv) =>
                sum + (conv.unreadCountAdmin || 0), 0);
            setUnreadCount(totalUnread);
 
        } catch (error) {
            console.error(`❌ Error obteniendo conversaciones:`, error);
            setError('Error al obtener conversaciones: ' + error.message);
        } finally {
            if (showLoader) setLoading(false);
        }
    }, [user, apiRequest, validateAuthenticatedUser]);
 
    // ============ FUNCIONES DE MENSAJES ============
 
    const getMessages = useCallback(async (conversationId, page = 1, resetMessages = false, showLoader = true) => {
        if (!conversationId || !validateAuthenticatedUser()) {
            return;
        }
 
        try {
            if (showLoader) setLoadingMessages(true);
 
            const data = await apiRequest(`/messages/${conversationId}?page=${page}&limit=50`);
 
            if (data === null) return;
 
            const newMessages = data.messages || [];
 
            if (resetMessages || page === 1) {
                setMessages(newMessages);
                setCurrentPage(1);
            } else {
                setMessages(prev => [...newMessages, ...prev]);
            }
 
            setHasMoreMessages(data.pagination?.hasNextPage || false);
            setCurrentPage(page);
 
            if ((resetMessages || page === 1) && newMessages.length > 0) {
                setTimeout(() => scrollToBottom(), 100);
            }
 
        } catch (error) {
            console.error(`❌ Error obteniendo mensajes:`, error);
            setError('Error al obtener mensajes: ' + error.message);
        } finally {
            if (showLoader) setLoadingMessages(false);
        }
    }, [apiRequest, scrollToBottom, validateAuthenticatedUser]);
 
    const markAsRead = useCallback(async (conversationId) => {
        if (!conversationId || !validateAuthenticatedUser()) return;
 
        try {
            const data = await apiRequest(`/read/${conversationId}`, { method: 'PUT' });
 
            if (data === null) return;
 
            if (user?.userType === 'admin') {
                updateConversationInList(conversationId, {
                    unreadCountAdmin: 0
                });
 
                setUnreadCount(prev => {
                    const currentConv = conversations.find(c => c.conversationId === conversationId);
                    return Math.max(0, prev - (currentConv?.unreadCountAdmin || 0));
                });
            }
 
        } catch (error) {
            console.error(`❌ Error marcando como leído:`, error);
        }
    }, [user, apiRequest, validateAuthenticatedUser, updateConversationInList, conversations]);
 
    const selectConversation = useCallback(async (conversation) => {
        if (!conversation || !validateAuthenticatedUser()) return;
 
        if (activeConversationRef.current) {
            leaveConversation(activeConversationRef.current.conversationId);
        }
 
        setActiveConversation(conversation);
        setMessages([]);
        setCurrentPage(1);
        setHasMoreMessages(true);
        setTypingUsers(new Set());
 
        joinConversation(conversation.conversationId);
 
        await getMessages(conversation.conversationId, 1, true, true);
        await markAsRead(conversation.conversationId);
    }, [getMessages, markAsRead, leaveConversation, joinConversation, validateAuthenticatedUser]);
 
    // ============ FUNCIONES DE ENVÍO Y ELIMINACIÓN DE MENSAJES CORREGIDAS ============
 
    const sendMessage = useCallback(async (conversationId, message, file = null) => {
        if (!message?.trim() && !file) {
            setError('Debes escribir un mensaje o seleccionar un archivo');
            return false;
        }
 
        if (!validateAuthenticatedUser()) {
            setError('Debes iniciar sesión para enviar mensajes');
            return false;
        }
 
        if (file) {
            const validation = validateImageFile(file);
            if (!validation.isValid) {
                setError(validation.error);
                return false;
            }
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
                if (conversationId) {
                    formData.append('conversationId', conversationId);
                }
                if (message?.trim()) {
                    formData.append('message', message.trim());
                }
                formData.append('file', file);
 
                data = await apiRequestFormData('/message', formData);
            } else {
                const requestBody = {
                    message: message.trim()
                };
 
                if (conversationId) {
                    requestBody.conversationId = conversationId;
                }
 
                data = await apiRequest('/message', {
                    method: 'POST',
                    body: JSON.stringify(requestBody)
                });
            }
 
            if (data === null) return false;
 
            // ✅ NUEVO: Si no teníamos conversación activa, establecerla ahora
            if (!activeConversationRef.current && data.conversationId && user?.userType === 'Customer') {
                try {
                    const conversationData = await apiRequest(`/conversation/${user.id}`);
                    if (conversationData?.conversation) {
                        setActiveConversation(conversationData.conversation);
                        joinConversation(conversationData.conversation.conversationId);
                    }
                } catch (error) {
                    console.error('Error obteniendo conversación después de enviar mensaje:', error);
                }
            }
 
            return true;
 
        } catch (error) {
            console.error(`❌ Error enviando mensaje:`, error);
            setError('Error al enviar mensaje: ' + error.message);
            return false;
        }
    }, [user, apiRequest, apiRequestFormData, stopTyping, validateAuthenticatedUser, validateImageFile, joinConversation]);
 
    /**
     * ✅ FUNCIÓN CRÍTICA CORREGIDA: deleteMessage con actualizaciones correctas
     */
    const deleteMessage = useCallback(async (messageId) => {
        if (!messageId || !validateAuthenticatedUser()) {
            return false;
        }
 
        try {
            setIsDeleting(true);
 
            const messageToDelete = messages.find(msg => msg._id === messageId);
            const conversationId = messageToDelete?.conversationId || activeConversationRef.current?.conversationId;
 
            console.log(`🗑️ Eliminando mensaje: ${messageId}`);
 
            const data = await apiRequest(`/message/${messageId}`, { method: 'DELETE' });
 
            if (data === null) return false;
 
            console.log(`✅ Mensaje eliminado exitosamente`);
 
            // ✅ FIX CRÍTICO: Actualizar estado local INMEDIATAMENTE
            setMessages(prev => {
                const updatedMessages = prev.filter(msg => msg._id !== messageId);
 
                // ✅ CALCULAR NUEVO ÚLTIMO MENSAJE EN TIEMPO REAL
                if (conversationId) {
                    const { lastMessage, lastMessageAt } = calculateLastMessage(conversationId, updatedMessages);
 
                    console.log(`📋 Actualizando último mensaje inmediatamente: "${lastMessage}"`);
 
                    // ✅ ACTUALIZAR CONVERSACIÓN CON NUEVO ÚLTIMO MENSAJE
                    updateConversationInList(conversationId, {
                        lastMessage,
                        lastMessageAt
                    });
 
                    // ✅ FIX CRÍTICO: Si es cliente eliminando y no hay más mensajes, resetear unread count
                    if (user?.userType === 'Customer' && updatedMessages.filter(m => m.conversationId === conversationId).length === 0) {
                        updateConversationInList(conversationId, {
                            unreadCountAdmin: 0,
                            unreadCountClient: 0
                        });
 
                        // También actualizar el contador global para admins
                        setUnreadCount(prev => Math.max(0, prev - 1));
                    }
                }
 
                return updatedMessages;
            });
 
            return true;
        } catch (error) {
            console.error(`❌ Error eliminando mensaje:`, error);
            setError('Error al eliminar mensaje: ' + error.message);
            return false;
        } finally {
            setIsDeleting(false);
        }
    }, [apiRequest, messages, calculateLastMessage, updateConversationInList, validateAuthenticatedUser, user?.userType]);
 
    // ============ FUNCIONES DE MANEJO DE ARCHIVOS ============
 
    const handleFileSelect = useCallback((e) => {
        const file = e.target.files[0];
        if (file) {
            const validation = validateImageFile(file);
            if (!validation.isValid) {
                setError(validation.error);
                return;
            }
 
            setSelectedFile(file);
 
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => setPreviewUrl(e.target.result);
                reader.readAsDataURL(file);
            } else {
                setPreviewUrl(null);
            }
        }
    }, [validateImageFile]);
 
    const clearSelectedFile = useCallback(() => {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);
 
    // ============ FUNCIONES DE MANEJO DE MENSAJES ============
 
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
 
    const confirmDeleteMessage = useCallback(async () => {
        if (!messageToDelete) return;
 
        const success = await deleteMessage(messageToDelete._id);
        if (success) {
            closeDeleteModal();
        }
    }, [messageToDelete, deleteMessage]);
 
    const loadMoreMessages = useCallback(async () => {
        if (!activeConversation || !hasMoreMessages || loadingMessages || !validateAuthenticatedUser()) return;
 
        const nextPage = currentPage + 1;
        await getMessages(activeConversation.conversationId, nextPage, false, true);
    }, [activeConversation, hasMoreMessages, loadingMessages, currentPage, getMessages, validateAuthenticatedUser]);
 
    // ============ MODAL DE ELIMINACIÓN ============
 
    const openDeleteModal = useCallback((message) => {
        setMessageToDelete(message);
        setShowDeleteModal(true);
    }, []);
 
    const closeDeleteModal = useCallback(() => {
        setShowDeleteModal(false);
        setMessageToDelete(null);
        setIsDeleting(false);
    }, []);
 
    // ============ INICIALIZACIÓN CORREGIDA ============
 
    const initializeChat = useCallback(async () => {
        console.log('🚀 === INICIO initializeChat ===');
        console.log('Estados actuales:', {
            authLoading,
            isAuthenticated,
            hasUser: !!user,
            userId: user?.id,
            userType: user?.userType,
            isInitialized: isInitializedRef.current
        });
 
        if (authLoading || !validateAuthenticatedUser() || isInitializedRef.current) {
            console.log('❌ Condiciones no cumplidas para inicialización');
            return;
        }
 
        isInitializedRef.current = true;
 
        try {
            console.log('✅ Iniciando inicialización del chat...');
 
            // ✅ CORRECCIÓN: Verificar conexión de Socket.IO
            console.log('🔍 Estado de Socket.IO:', {
                socketConnected,
                socketError
            });
 
            // Si hay error de socket, intentar reconectar
            if (socketError && !socketConnected) {
                console.log('🔄 Intentando reconectar Socket.IO...');
                try {
                    reconnectSocket();
                } catch (reconnectError) {
                    console.log('⚠️ Error en reconexión, continuando con HTTP:', reconnectError);
                }
            }
 
            setIsConnected(true);
 
            if (user.userType === 'admin') {
                console.log('👨‍💼 Inicializando como administrador...');
                await getAllConversations(true);
            } else if (user.userType === 'Customer') {
                console.log('👤 Inicializando como cliente...');
                const conversation = await getOrCreateConversation(true);
                if (conversation) {
                    await selectConversation(conversation);
                }
            }
 
            console.log('🎉 Chat inicializado exitosamente');
 
        } catch (error) {
            console.error('❌ Error al inicializar el chat:', error);
            setError('Error al inicializar el chat: ' + error.message);
            isInitializedRef.current = false;
        }
    }, [
        authLoading,
        user,
        getAllConversations,
        getOrCreateConversation,
        selectConversation,
        validateAuthenticatedUser,
        socketConnected,
        socketError,
        reconnectSocket
    ]);
 
    // ============ CONFIGURACIÓN SOCKET.IO CORREGIDA ============
 
    useEffect(() => {
        if (!socketConnected || !isAuthenticated || !validateAuthenticatedUser()) return;
 
        console.log('⚙️ Configurando listeners de Socket.IO...');
 
        const unsubscribeNewMessage = onNewMessage((data) => {
            console.log('📨 Nuevo mensaje recibido:', data);
 
            setMessages(prev => {
                const exists = prev.find(msg => msg._id === data.message._id);
                if (exists) return prev;
 
                setTimeout(() => scrollToBottom(), 100);
                return [...prev, data.message];
            });
 
            if (user?.userType === 'admin') {
                let lastMessageText;
                if (data.message.message && data.message.message.trim()) {
                    lastMessageText = data.message.message;
                } else if (data.message.media?.url) {
                    lastMessageText = '📷 Imagen';
                } else {
                    lastMessageText = 'Nuevo mensaje';
                }
 
                updateConversationInList(data.conversationId, {
                    lastMessage: lastMessageText,
                    lastMessageAt: data.timestamp,
                    unreadCountAdmin: data.message.senderType !== 'admin'
                        ? ((conversations.find(c => c.conversationId === data.conversationId)?.unreadCountAdmin || 0) + 1)
                        : (conversations.find(c => c.conversationId === data.conversationId)?.unreadCountAdmin || 0)
                });
 
                if (data.message.senderType !== 'admin') {
                    setUnreadCount(prev => prev + 1);
                }
            }
        });
 
        const unsubscribeMessageDeleted = onMessageDeleted((data) => {
            console.log('🗑️ Mensaje eliminado via Socket.IO:', data);
 
            setMessages(prev => {
                const updatedMessages = prev.filter(msg => msg._id !== data.messageId);
 
                const { lastMessage, lastMessageAt } = calculateLastMessage(data.conversationId, updatedMessages);
 
                updateConversationInList(data.conversationId, {
                    lastMessage,
                    lastMessageAt
                });
 
                const remainingMessages = updatedMessages.filter(m => m.conversationId === data.conversationId);
 
                if (remainingMessages.length === 0) {
                    updateConversationInList(data.conversationId, {
                        unreadCountAdmin: 0,
                        unreadCountClient: 0
                    });
 
                    if (user?.userType === 'admin') {
                        const currentConv = conversations.find(c => c.conversationId === data.conversationId);
                        if (currentConv?.unreadCountAdmin > 0) {
                            setUnreadCount(prev => Math.max(0, prev - currentConv.unreadCountAdmin));
                        }
                    }
                }
 
                return updatedMessages;
            });
        });
 
        const unsubscribeConversationUpdated = onConversationUpdated((data) => {
            console.log('🔄 Conversación actualizada via Socket.IO:', data);
 
            if (user?.userType === 'admin') {
                updateConversationInList(data.conversationId, data);
 
                if (typeof data.unreadCountAdmin === 'number') {
                    const currentConv = conversations.find(c => c.conversationId === data.conversationId);
                    if (currentConv) {
                        const difference = data.unreadCountAdmin - (currentConv.unreadCountAdmin || 0);
                        setUnreadCount(prev => Math.max(0, prev + difference));
                    }
                }
            }
        });
 
        const unsubscribeConversationClosed = onConversationClosed((data) => {
            updateConversationInList(data.conversationId, { status: 'closed' });
 
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
                updateConversationInList(data.conversationId, { unreadCountAdmin: 0 });
 
                const currentConv = conversations.find(c => c.conversationId === data.conversationId);
                if (currentConv?.unreadCountAdmin > 0) {
                    setUnreadCount(prev => Math.max(0, prev - currentConv.unreadCountAdmin));
                }
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
            console.log('🧹 Limpiando listeners de Socket.IO...');
            unsubscribeNewMessage?.();
            unsubscribeMessageDeleted?.();
            unsubscribeConversationUpdated?.();
            unsubscribeConversationClosed?.();
            unsubscribeMessagesRead?.();
            unsubscribeUserTyping?.();
            unsubscribeChatStats?.();
        };
    }, [
        socketConnected,
        isAuthenticated,
        user?.id,
        user?.userType,
        conversations,
        onNewMessage,
        onMessageDeleted,
        onConversationUpdated,
        onConversationClosed,
        onMessagesRead,
        onUserTyping,
        onChatStatsUpdated,
        scrollToBottom,
        updateConversationInList,
        validateAuthenticatedUser,
        calculateLastMessage
    ]);
 
    // ============ EFECTOS DE INICIALIZACIÓN CORREGIDOS ============
 
    useEffect(() => {
        console.log('🔄 Efecto de inicialización - Estados:', {
            authLoading,
            isAuthenticated,
            hasUser: !!user,
            userId: user?.id,
            userType: user?.userType,
            isInitialized: isInitializedRef.current
        });
 
        if (!authLoading && isAuthenticated && user && user.id && user.userType && !isInitializedRef.current) {
            console.log('🚀 Condiciones cumplidas, iniciando chat...');
            // ✅ PEQUEÑO DELAY para asegurar que todo esté listo
            setTimeout(() => {
                initializeChat();
            }, 1500);
        }
    }, [authLoading, isAuthenticated, user?.id, user?.userType, initializeChat]);
 
    // ============ LIMPIEZA DE EFECTOS ============
 
    useEffect(() => {
        return () => {
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
            }
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);
 
    // ============ UTILIDADES ============
 
    const clearError = useCallback(() => {
        setError(null);
    }, []);
 
    // ============ RETORNO DEL HOOK CORREGIDO ============
 
    return {
        // Estados principales
        conversations,
        activeConversation,
        messages,
        newMessage,
        selectedFile,
        previewUrl,
        loading,
        error,
        isConnected: isConnected && socketConnected && !authLoading && !!user,
        unreadCount,
        hasMoreMessages,
        loadingMessages,
        typingUsers,
 
        // Estados del modal
        showDeleteModal,
        messageToDelete,
        isDeleting,
 
        // Estados adicionales
        authLoading,
        isAuthenticated,
        hasUser: !!user,
 
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
 
        // Archivos con validación de imágenes
        handleFileSelect,
        clearSelectedFile,
        validateImageFile,
 
        // Modal
        openDeleteModal,
        closeDeleteModal,
 
        // Referencias
        messagesEndRef,
        fileInputRef,
 
        // Función unificada de formato
        formatChatContent,
 
        // Nueva función crítica exportada
        calculateLastMessage,
 
        // Funciones para actualizaciones en tiempo real
        updateConversationInList,
 
        // Funciones de validación
        validateAuthenticatedUser,
 
        // Constantes para validación
        MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
        ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    };
};