import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useSocket } from "./useSocket";

/**
 * Hook useChat - CORREGIDO PARA ACTUALIZACIÓN CORRECTA DEL ÚLTIMO MENSAJE
 * 
 * FIXES APLICADOS:
 * - Último mensaje se actualiza inmediatamente al eliminar
 * - Mejor sincronización entre mensajes locales y estado de conversaciones
 * - Socket.IO escucha eventos específicos de actualización de último mensaje
 * - Estado local se mantiene sincronizado con el backend
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
    
    // ============ HOOKS ============
    const { user, isAuthenticated, loading: authLoading } = useAuth();
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

    const API_BASE = "http://localhost:4000/api/chat";

    useEffect(() => {
        activeConversationRef.current = activeConversation;
    }, [activeConversation]);

    // ============ FUNCIONES DE VALIDACIÓN Y UTILIDAD ============

    /**
     * ✅ Valida que el usuario esté autenticado antes de hacer peticiones
     */
    const validateAuthenticatedUser = useCallback(() => {
        console.log(`🔍 Validando usuario autenticado:`, {
            isAuthenticated,
            hasUser: !!user,
            userId: user?.id,
            userType: user?.userType,
            authLoading
        });
        
        if (authLoading) {
            console.log(`⏳ Autenticación en progreso, esperando...`);
            return false;
        }
        
        if (!isAuthenticated || !user) {
            console.log(`❌ Usuario no autenticado`);
            setError('Debes iniciar sesión para usar el chat');
            return false;
        }
        
        if (!user.id || !user.userType) {
            console.log(`❌ Datos de usuario incompletos:`, user);
            setError('Datos de usuario incompletos');
            return false;
        }
        
        console.log(`✅ Usuario validado correctamente`);
        return true;
    }, [isAuthenticated, user, authLoading]);

    /**
     * ✅ Función de utilidad para scroll
     */
    const scrollToBottom = useCallback(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, []);

    /**
     * ✅ Función para manejar cliente no encontrado
     */
    const handleClientNotFound = useCallback(() => {
        console.log('Cliente no encontrado, limpiando estado local...');
        setActiveConversation(null);
        setMessages([]);
        setConversations([]);
        
        if (user?.userType === 'Customer') {
            setError('Tu cuenta ha sido eliminada del sistema. Contacta al administrador.');
        }
    }, [user?.userType]);

    /**
     * ✅ FUNCIÓN CRÍTICA CORREGIDA: Actualizar conversación específica en tiempo real
     */
    const updateConversationInList = useCallback((conversationId, updates) => {
        console.log(`🔄 Actualizando conversación ${conversationId} con:`, updates);
        
        setConversations(prev => {
            const existingConvIndex = prev.findIndex(conv => conv.conversationId === conversationId);
            
            if (existingConvIndex >= 0) {
                // Actualizar conversación existente
                const updatedConversations = [...prev];
                updatedConversations[existingConvIndex] = {
                    ...updatedConversations[existingConvIndex],
                    ...updates
                };
                
                // Reordenar por fecha del último mensaje si se actualizó
                if (updates.lastMessageAt) {
                    updatedConversations.sort((a, b) => 
                        new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
                    );
                }
                
                console.log(`✅ Conversación ${conversationId} actualizada en lista`);
                return updatedConversations;
            } else if (updates.clientId) {
                // ✅ NUEVA CONVERSACIÓN: Agregar al inicio de la lista
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
        
        // ✅ NUEVO: También actualizar conversación activa si es la misma
        if (activeConversationRef.current?.conversationId === conversationId) {
            setActiveConversation(prev => prev ? { ...prev, ...updates } : prev);
        }
    }, []);

    /**
     * ✅ FUNCIÓN CRÍTICA CORREGIDA: Actualización de último mensaje basada en mensajes LOCALES
     */
    const updateConversationLastMessage = useCallback((conversationId) => {
        console.log(`🔄 Actualizando último mensaje local para conversación: ${conversationId}`);
        
        // ✅ CAMBIO CRÍTICO: Usar mensajes del estado local actual, no del ref
        setMessages(currentMessages => {
            // Filtrar mensajes no eliminados de la conversación específica
            const validMessages = currentMessages.filter(msg => 
                !msg.isDeleted && 
                msg.conversationId === conversationId
            );
            
            console.log(`📊 Mensajes válidos locales encontrados: ${validMessages.length}`);
            
            let lastMessage = '';
            let lastMessageAt = null;
            
            if (validMessages.length > 0) {
                // Ordenar por fecha para obtener el más reciente
                const sortedMessages = validMessages.sort((a, b) => 
                    new Date(b.createdAt) - new Date(a.createdAt)
                );
                
                const latestMessage = sortedMessages[0];
                lastMessage = latestMessage.message || 
                    (latestMessage.media ? '📎 Archivo multimedia' : 'Sin contenido');
                lastMessageAt = latestMessage.createdAt;
                
                console.log(`✅ Nuevo último mensaje local: "${lastMessage}"`);
            } else {
                console.log(`📝 No hay mensajes válidos, limpiando último mensaje`);
            }
            
            // Actualizar usando la función de actualización específica
            updateConversationInList(conversationId, {
                lastMessage,
                lastMessageAt: lastMessageAt || new Date()
            });
            
            // Retornar los mensajes sin cambios (solo estamos consultando)
            return currentMessages;
        });
    }, [updateConversationInList]);

    // ============ FUNCIONES API CON MANEJO DE ERRORES MEJORADO ============

    /**
     * ✅ Petición API con mejor manejo de errores 401
     */
    const apiRequest = useCallback(async (url, options = {}) => {
        try {
            // Validar autenticación antes de hacer la petición
            if (!validateAuthenticatedUser()) {
                throw new Error('Usuario no autenticado');
            }
            
            console.log(`🌐 API Request: ${options.method || 'GET'} ${API_BASE}${url}`);
            
            const response = await fetch(`${API_BASE}${url}`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            console.log(`📡 Response status: ${response.status} for ${url}`);

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('El servidor no devolvió una respuesta JSON válida');
            }

            const data = await response.json();
            
            if (!response.ok) {
                // ✅ MANEJO ESPECÍFICO DE ERRORES 401
                if (response.status === 401) {
                    console.error(`❌ Error 401 en ${url}:`, data);
                    
                    // Si es error de token, limpiar estado y solicitar reautenticación
                    if (data.code === 'TOKEN_EXPIRED' || data.code === 'TOKEN_INVALID_DATA' || data.code === 'TOKEN_MISSING') {
                        setError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
                        // Limpiar estado del chat
                        setConversations([]);
                        setActiveConversation(null);
                        setMessages([]);
                        return null;
                    }
                    
                    throw new Error(data.message || 'Error de autenticación');
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
            
            // ✅ MANEJO ESPECÍFICO DE ERRORES DE RED
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Error de conexión con el servidor. Verifica tu conexión a internet.');
            }
            
            throw error;
        }
    }, [validateAuthenticatedUser, handleClientNotFound]);

    /**
     * ✅ Petición FormData con manejo de errores 401
     */
    const apiRequestFormData = useCallback(async (url, formData) => {
        try {
            // Validar autenticación antes de hacer la petición
            if (!validateAuthenticatedUser()) {
                throw new Error('Usuario no autenticado');
            }
            
            console.log(`🌐 FormData Request: POST ${API_BASE}${url}`);
            
            const response = await fetch(`${API_BASE}${url}`, {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            console.log(`📡 FormData Response status: ${response.status} for ${url}`);

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('El servidor no devolvió una respuesta JSON válida');
            }

            const data = await response.json();
            
            if (!response.ok) {
                // ✅ MANEJO ESPECÍFICO DE ERRORES 401
                if (response.status === 401) {
                    console.error(`❌ Error 401 en FormData ${url}:`, data);
                    
                    if (data.code === 'TOKEN_EXPIRED' || data.code === 'TOKEN_INVALID_DATA' || data.code === 'TOKEN_MISSING') {
                        setError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
                        setConversations([]);
                        setActiveConversation(null);
                        setMessages([]);
                        return null;
                    }
                    
                    throw new Error(data.message || 'Error de autenticación');
                }
                
                if (response.status === 404 && data.message?.includes('Cliente no encontrado')) {
                    handleClientNotFound();
                    throw new Error('Tu cuenta ha sido eliminada del sistema');
                }
                
                throw new Error(data.message || `Error ${response.status}`);
            }
            
            console.log(`✅ FormData Request exitosa: ${url}`);
            return data;
        } catch (error) {
            console.error(`❌ Error en petición FormData ${url}:`, error);
            throw error;
        }
    }, [validateAuthenticatedUser, handleClientNotFound]);

    // ============ FUNCIONES DE CONVERSACIONES ============

    /**
     * ✅ CORREGIDA: Obtener o crear conversación - solo devuelve si tiene mensajes
     */
    const getOrCreateConversation = useCallback(async (showLoader = true, retryCount = 0) => {
        if (!validateAuthenticatedUser()) {
            return null;
        }
        
        if (user.userType !== 'Customer') {
            return null;
        }
        
        try {
            if (showLoader) setLoading(true);
            
            console.log(`🎯 Obteniendo conversación para cliente ${user.id} (intento ${retryCount + 1})`);
            
            const data = await apiRequest(`/conversation/${user.id}`);
            
            if (data === null) {
                // Error 401 manejado, no reintentar
                return null;
            }
            
            // ✅ CAMBIO: El backend puede devolver null si no hay conversación con mensajes
            if (data.conversation) {
                console.log(`✅ Conversación obtenida exitosamente`);
                return data.conversation;
            } else {
                console.log(`📝 No hay conversación activa aún`);
                return null;
            }
        } catch (error) {
            console.error(`❌ Error obteniendo conversación (intento ${retryCount + 1}):`, error);
            
            // ✅ RETRY AUTOMÁTICO para errores temporales
            if (retryCount < 2 && !error.message.includes('cuenta ha sido eliminada') && !error.message.includes('sesión ha expirado')) {
                console.log(`🔄 Reintentando en 2 segundos... (intento ${retryCount + 2}/3)`);
                
                return new Promise((resolve) => {
                    retryTimeoutRef.current = setTimeout(async () => {
                        const result = await getOrCreateConversation(false, retryCount + 1);
                        resolve(result);
                    }, 2000);
                });
            }
            
            if (error.message.includes('cuenta ha sido eliminada')) {
                setError('Tu cuenta ha sido eliminada del sistema');
                return null;
            }
            
            setError('Error al obtener conversación: ' + error.message);
            return null;
        } finally {
            if (showLoader) setLoading(false);
        }
    }, [user, apiRequest, validateAuthenticatedUser]);

    /**
     * ✅ CORREGIDA: Obtener todas las conversaciones - solo con mensajes
     */
    const getAllConversations = useCallback(async (showLoader = true, retryCount = 0) => {
        if (!validateAuthenticatedUser()) {
            return;
        }
        
        if (user.userType !== 'admin') {
            return;
        }
        
        try {
            if (showLoader) setLoading(true);
            
            console.log(`🎯 Obteniendo conversaciones para admin ${user.id} (intento ${retryCount + 1})`);
            
            const data = await apiRequest('/admin/conversations');
            
            if (data === null) {
                // Error 401 manejado, no reintentar
                return;
            }
            
            const newConversations = data.conversations || [];
            
            console.log(`✅ Obtenidas ${newConversations.length} conversaciones válidas (solo con mensajes)`);
            
            setConversations(prevConversations => {
                // Verificar si hay cambios significativos
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
                    console.log('📝 Sin cambios en conversaciones');
                    return prevConversations;
                }
                
                console.log('🔄 Actualizando conversaciones con cambios');
                return newConversations;
            });
            
            // Calcular total de mensajes no leídos
            const totalUnread = newConversations.reduce((sum, conv) => 
                sum + (conv.unreadCountAdmin || 0), 0);
            setUnreadCount(totalUnread);
            
        } catch (error) {
            console.error(`❌ Error obteniendo conversaciones (intento ${retryCount + 1}):`, error);
            
            // ✅ RETRY AUTOMÁTICO para errores temporales
            if (retryCount < 2 && !error.message.includes('sesión ha expirado')) {
                console.log(`🔄 Reintentando conversaciones en 2 segundos... (intento ${retryCount + 2}/3)`);
                
                retryTimeoutRef.current = setTimeout(() => {
                    getAllConversations(false, retryCount + 1);
                }, 2000);
                return;
            }
            
            setError('Error al obtener conversaciones: ' + error.message);
        } finally {
            if (showLoader) setLoading(false);
        }
    }, [user, apiRequest, validateAuthenticatedUser]);

    // ============ FUNCIONES DE MENSAJES ============

    /**
     * ✅ Obtener mensajes con retry automático
     */
    const getMessages = useCallback(async (conversationId, page = 1, resetMessages = false, showLoader = true, retryCount = 0) => {
        if (!conversationId || !validateAuthenticatedUser()) {
            return;
        }
        
        try {
            if (showLoader) setLoadingMessages(true);
            
            console.log(`📨 Obteniendo mensajes para conversación: ${conversationId} (página ${page}, intento ${retryCount + 1})`);
            
            const data = await apiRequest(`/messages/${conversationId}?page=${page}&limit=50`);
            
            if (data === null) {
                // Error 401 manejado, no reintentar
                return;
            }
            
            const newMessages = data.messages || [];
            
            console.log(`✅ Obtenidos ${newMessages.length} mensajes válidos`);
            
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
            console.error(`❌ Error obteniendo mensajes (intento ${retryCount + 1}):`, error);
            
            // ✅ RETRY AUTOMÁTICO para errores temporales
            if (retryCount < 2 && !error.message.includes('cuenta ha sido eliminada') && !error.message.includes('sesión ha expirado')) {
                console.log(`🔄 Reintentando mensajes en 2 segundos... (intento ${retryCount + 2}/3)`);
                
                retryTimeoutRef.current = setTimeout(() => {
                    getMessages(conversationId, page, resetMessages, false, retryCount + 1);
                }, 2000);
                return;
            }
            
            if (error.message.includes('cuenta ha sido eliminada')) {
                return; // Ya manejado en apiRequest
            }
            
            setError('Error al obtener mensajes: ' + error.message);
        } finally {
            if (showLoader) setLoadingMessages(false);
        }
    }, [apiRequest, scrollToBottom, validateAuthenticatedUser]);

    /**
     * ✅ Marcar mensajes como leídos
     */
    const markAsRead = useCallback(async (conversationId, retryCount = 0) => {
        if (!conversationId || !validateAuthenticatedUser()) return;
        
        try {
            console.log(`👁️ Marcando como leído: ${conversationId} (intento ${retryCount + 1})`);
            
            const data = await apiRequest(`/read/${conversationId}`, { method: 'PUT' });
            
            if (data === null) {
                // Error 401 manejado, no reintentar
                return;
            }
            
            if (user?.userType === 'admin') {
                // ✅ ACTUALIZACIÓN LOCAL INMEDIATA
                updateConversationInList(conversationId, {
                    unreadCountAdmin: 0
                });
                
                setUnreadCount(prev => Math.max(0, prev - (activeConversationRef.current?.unreadCountAdmin || 0)));
            }
            
            console.log(`✅ Mensajes marcados como leídos`);
            
        } catch (error) {
            console.error(`❌ Error marcando como leído (intento ${retryCount + 1}):`, error);
            
            // ✅ RETRY AUTOMÁTICO para errores temporales
            if (retryCount < 1 && !error.message.includes('sesión ha expirado')) {
                console.log(`🔄 Reintentando marcar como leído en 1 segundo...`);
                
                retryTimeoutRef.current = setTimeout(() => {
                    markAsRead(conversationId, retryCount + 1);
                }, 1000);
            }
        }
    }, [user, apiRequest, validateAuthenticatedUser, updateConversationInList]);

    /**
     * ✅ FUNCIÓN DECLARADA DESPUÉS DE SUS DEPENDENCIAS: Seleccionar conversación
     */
    const selectConversation = useCallback(async (conversation) => {
        if (!conversation || !validateAuthenticatedUser()) return;
        
        if (activeConversationRef.current) {
            leaveConversation(activeConversationRef.current.conversationId);
        }
        
        console.log(`🎯 Seleccionando conversación: ${conversation.conversationId}`);
        
        setActiveConversation(conversation);
        setMessages([]);
        setCurrentPage(1);
        setHasMoreMessages(true);
        lastMessageCountRef.current = 0;
        setTypingUsers(new Set());
        
        joinConversation(conversation.conversationId);
        
        await getMessages(conversation.conversationId, 1, true, true);
        await markAsRead(conversation.conversationId);
    }, [getMessages, markAsRead, leaveConversation, joinConversation, validateAuthenticatedUser]);

    // ============ RESTO DE FUNCIONES ============

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

    /**
     * ✅ CORREGIDO: Enviar mensaje - maneja conversación nueva automáticamente
     */
    const sendMessage = useCallback(async (conversationId, message, file = null, retryCount = 0) => {
        // ✅ CAMBIO: Para clientes, permitir envío sin conversationId (primera vez)
        if (!message?.trim() && !file) {
            setError('Debes escribir un mensaje o seleccionar un archivo');
            return false;
        }
        
        if (!validateAuthenticatedUser()) {
            setError('Debes iniciar sesión para enviar mensajes');
            return false;
        }
        
        stopTyping(conversationId);
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }
        
        try {
            console.log(`📤 Enviando mensaje (intento ${retryCount + 1}):`, {
                conversationId,
                hasMessage: !!message?.trim(),
                hasFile: !!file,
                userType: user?.userType
            });
            
            let data;
            
            if (file) {
                const formData = new FormData();
                // ✅ CAMBIO: conversationId puede ser null para clientes sin conversación
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
                
                // ✅ CAMBIO: Solo incluir conversationId si existe
                if (conversationId) {
                    requestBody.conversationId = conversationId;
                }
                
                data = await apiRequest('/message', {
                    method: 'POST',
                    body: JSON.stringify(requestBody)
                });
            }
            
            if (data === null) {
                // Error 401 manejado, no reintentar
                return false;
            }
            
            console.log(`✅ Mensaje enviado exitosamente`);
            
            // ✅ NUEVO: Si no teníamos conversación activa, establecerla ahora
            if (!activeConversationRef.current && data.conversationId && user?.userType === 'Customer') {
                // Obtener la conversación completa
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
            
            // ✅ ACTUALIZACIÓN INMEDIATA: Actualizar último mensaje para admins
            if (user?.userType === 'admin' && conversationId) {
                updateConversationInList(conversationId, {
                    lastMessage: message?.trim() || '📎 Archivo multimedia',
                    lastMessageAt: new Date()
                });
            }
            
            return true;
            
        } catch (error) {
            console.error(`❌ Error enviando mensaje (intento ${retryCount + 1}):`, error);
            
            // ✅ RETRY AUTOMÁTICO para errores temporales
            if (retryCount < 2 && !error.message.includes('cuenta ha sido eliminada') && !error.message.includes('sesión ha expirado')) {
                console.log(`🔄 Reintentando envío en 2 segundos... (intento ${retryCount + 2}/3)`);
                
                return new Promise((resolve) => {
                    retryTimeoutRef.current = setTimeout(async () => {
                        const result = await sendMessage(conversationId, message, file, retryCount + 1);
                        resolve(result);
                    }, 2000);
                });
            }
            
            if (error.message.includes('cuenta ha sido eliminada')) {
                return false;
            }
            
            setError('Error al enviar mensaje: ' + error.message);
            return false;
        }
    }, [user, apiRequest, apiRequestFormData, stopTyping, validateAuthenticatedUser, updateConversationInList, joinConversation]);

    /**
     * ✅ FUNCIÓN CRÍTICA CORREGIDA: Eliminar mensaje con actualización inmediata del último mensaje
     */
    const deleteMessage = useCallback(async (messageId, retryCount = 0) => {
        if (!messageId) {
            setError('ID de mensaje requerido');
            return false;
        }
        
        if (!validateAuthenticatedUser()) {
            setError('Debes iniciar sesión para eliminar mensajes');
            return false;
        }
        
        try {
            setIsDeleting(true);
            
            const messageToDelete = messages.find(msg => msg._id === messageId);
            const conversationId = messageToDelete?.conversationId || activeConversationRef.current?.conversationId;
            
            console.log(`🗑️ Eliminando mensaje: ${messageId} (intento ${retryCount + 1})`);
            
            const data = await apiRequest(`/message/${messageId}`, { method: 'DELETE' });
            
            if (data === null) {
                // Error 401 manejado, no reintentar
                return false;
            }
            
            console.log(`✅ Mensaje eliminado exitosamente`);
            
            // ✅ ACTUALIZACIÓN CRÍTICA INMEDIATA: Actualizar estado local primero
            setMessages(prev => {
                const updatedMessages = prev.filter(msg => msg._id !== messageId);
                
                // ✅ INMEDIATAMENTE actualizar último mensaje basado en mensajes restantes
                if (conversationId) {
                    // Usar los mensajes actualizados para calcular el nuevo último mensaje
                    const validMessages = updatedMessages.filter(msg => 
                        !msg.isDeleted && msg.conversationId === conversationId
                    );
                    
                    let newLastMessage = '';
                    let newLastMessageAt = new Date();
                    
                    if (validMessages.length > 0) {
                        const sortedMessages = validMessages.sort((a, b) => 
                            new Date(b.createdAt) - new Date(a.createdAt)
                        );
                        const latestMessage = sortedMessages[0];
                        newLastMessage = latestMessage.message || 
                            (latestMessage.media ? '📎 Archivo multimedia' : 'Sin contenido');
                        newLastMessageAt = latestMessage.createdAt;
                    }
                    
                    console.log(`📋 Actualizando último mensaje inmediatamente: "${newLastMessage}"`);
                    
                    // Actualizar inmediatamente en la lista de conversaciones
                    updateConversationInList(conversationId, {
                        lastMessage: newLastMessage,
                        lastMessageAt: newLastMessageAt
                    });
                }
                
                return updatedMessages;
            });
            
            return true;
        } catch (error) {
            console.error(`❌ Error eliminando mensaje (intento ${retryCount + 1}):`, error);
            
            // ✅ RETRY AUTOMÁTICO para errores temporales
            if (retryCount < 2 && !error.message.includes('sesión ha expirado')) {
                console.log(`🔄 Reintentando eliminación en 2 segundos... (intento ${retryCount + 2}/3)`);
                
                return new Promise((resolve) => {
                    retryTimeoutRef.current = setTimeout(async () => {
                        const result = await deleteMessage(messageId, retryCount + 1);
                        resolve(result);
                    }, 2000);
                });
            }
            
            setError('Error al eliminar mensaje: ' + error.message);
            return false;
        } finally {
            setIsDeleting(false);
        }
    }, [apiRequest, messages, updateConversationInList, validateAuthenticatedUser]);

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

    // ============ INICIALIZACIÓN MEJORADA ============

    /**
     * ✅ Inicialización con mejor manejo de estados de auth
     */
    const initializeChat = useCallback(async () => {
        // Esperar a que la autenticación se complete
        if (authLoading) {
            console.log('⏳ Esperando a que termine la carga de autenticación...');
            return;
        }
        
        if (!validateAuthenticatedUser() || isInitializedRef.current) {
            return;
        }
        
        isInitializedRef.current = true;
        setIsConnected(true);
        
        try {
            if (user.userType === 'admin') {
                console.log('👨‍💼 Inicializando chat para administrador...');
                await getAllConversations(true);
            } else if (user.userType === 'Customer') {
                console.log('👤 Inicializando chat para cliente...');
                const conversation = await getOrCreateConversation(true);
                if (conversation) {
                    await selectConversation(conversation);
                }
            }
        } catch (error) {
            console.error('Error al inicializar el chat:', error);
            if (!error.message.includes('cuenta ha sido eliminada') && !error.message.includes('sesión ha expirado')) {
                setError('Error al inicializar el chat: ' + error.message);
            }
            isInitializedRef.current = false;
        }
    }, [authLoading, user, getAllConversations, getOrCreateConversation, selectConversation, validateAuthenticatedUser]);

    // ============ CONFIGURACIÓN SOCKET.IO MEJORADA ============

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
            
            // ✅ ACTUALIZACIÓN EN TIEMPO REAL: Actualizar conversación inmediatamente
            if (user?.userType === 'admin') {
                updateConversationInList(data.conversationId, {
                    lastMessage: data.message.message || '📎 Archivo multimedia',
                    lastMessageAt: data.timestamp,
                    unreadCountAdmin: data.message.senderType !== 'admin' 
                        ? ((conversations.find(c => c.conversationId === data.conversationId)?.unreadCountAdmin || 0) + 1)
                        : (conversations.find(c => c.conversationId === data.conversationId)?.unreadCountAdmin || 0)
                });
                
                // Actualizar contador total
                if (data.message.senderType !== 'admin') {
                    setUnreadCount(prev => prev + 1);
                }
            }
        });

        const unsubscribeMessageDeleted = onMessageDeleted((data) => {
            console.log('🗑️ Mensaje eliminado via Socket.IO:', data);
            
            setMessages(prev => {
                const updatedMessages = prev.filter(msg => msg._id !== data.messageId);
                
                // ✅ NO NECESARIO: La actualización del último mensaje la manejará el evento específico
                // El backend ya emite conversation_updated con el nuevo último mensaje
                
                return updatedMessages;
            });
        });

        // ✅ LISTENER CRÍTICO: Actualizaciones específicas de conversaciones
        const unsubscribeConversationUpdated = onConversationUpdated((data) => {
            console.log('🔄 Conversación actualizada via Socket.IO:', data);
            
            if (user?.userType === 'admin') {
                // ✅ CRÍTICO: Siempre actualizar cuando viene del backend
                updateConversationInList(data.conversationId, data);
                
                // Actualizar contador total si cambió unreadCountAdmin
                if (typeof data.unreadCountAdmin === 'number') {
                    const currentConv = conversations.find(c => c.conversationId === data.conversationId);
                    if (currentConv) {
                        const difference = data.unreadCountAdmin - (currentConv.unreadCountAdmin || 0);
                        setUnreadCount(prev => Math.max(0, prev + difference));
                    }
                }
            }
        });

        // ✅ NUEVO LISTENER: Nuevas conversaciones creadas (con socket actual)
        if (socketConnected && socketConnected.on) {
            socketConnected.on('new_conversation_created', (data) => {
                console.log('✨ Nueva conversación creada via Socket.IO:', data);
                
                if (user?.userType === 'admin') {
                    updateConversationInList(data.conversationId, data);
                }
            });

            // ✅ NUEVO LISTENER: Actualizaciones de lista de conversaciones
            socketConnected.on('conversation_list_updated', (data) => {
                console.log('📋 Lista de conversaciones actualizada:', data);
                
                if (user?.userType === 'admin') {
                    // ✅ CRÍTICO: Para eliminación de mensajes, refrescar la lista
                    if (data.action === 'message_deleted') {
                        console.log('🔄 Refrescando conversaciones por eliminación de mensaje');
                        // Pequeño delay para permitir que el backend actualice
                        setTimeout(() => {
                            getAllConversations(false);
                        }, 200);
                    }
                }
            });
        }

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
            
            // ✅ ACTUALIZACIÓN EN TIEMPO REAL: Actualizar contador
            if (user?.userType === 'admin') {
                updateConversationInList(data.conversationId, { unreadCountAdmin: 0 });
                
                const currentConv = conversations.find(c => c.conversationId === data.conversationId);
                if (currentConv?.unreadCountAdmin) {
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
            
            // Limpiar listeners específicos del socket
            if (socketConnected && socketConnected.off) {
                socketConnected.off('new_conversation_created');
                socketConnected.off('conversation_list_updated');
            }
        };
    }, [socketConnected, isAuthenticated, user?.id, user?.userType, conversations, onNewMessage, onMessageDeleted, onConversationUpdated, onConversationClosed, onMessagesRead, onUserTyping, onChatStatsUpdated, scrollToBottom, updateConversationInList, getAllConversations, validateAuthenticatedUser]);

    // ============ EFECTOS DE INICIALIZACIÓN ============

    useEffect(() => {
        if (!authLoading && isAuthenticated && user && !isInitializedRef.current) {
            console.log('🚀 Iniciando inicialización del chat...');
            initializeChat();
        }
    }, [authLoading, isAuthenticated, user?.id, user?.userType, initializeChat]);

    // ============ LIMPIEZA DE EFECTOS ============

    useEffect(() => {
        return () => {
            // Limpiar timeouts al desmontar
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
            }
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    // ============ FUNCIONES DE ARCHIVOS ============

    const handleFileSelect = useCallback((e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            
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

    // ============ UTILIDADES ============

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // ============ RETORNO DEL HOOK MEJORADO ============

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
        
        // Estados adicionales para debug
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
        
        // Archivos
        handleFileSelect,
        clearSelectedFile,
        
        // Modal
        openDeleteModal,
        closeDeleteModal,
        
        // Referencias
        messagesEndRef,
        fileInputRef,
        
        // ✅ FUNCIONES para actualizaciones en tiempo real
        updateConversationInList,
        
        // Funciones de validación (para debug)
        validateAuthenticatedUser
    };
};