import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useSocket } from "./useSocket";

/**
 * Hook useChat - CORRECCIÓN CRÍTICA PARA PRIMER MENSAJE
 *
 * PROBLEMAS CRÍTICOS SOLUCIONADOS:
 * - Sincronización entre Socket.IO y envío del primer mensaje
 * - Espera a que Socket.IO esté realmente listo antes de enviar
 * - Mejor manejo de eventos para primer mensaje
 * - Inicialización secuencial garantizada
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
    const lastProcessedEventRef = useRef(new Map());
    const firstMessageSentRef = useRef(false);

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
        isSocketReady,
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

    // ============ VALIDACIONES Y UTILIDADES ============
    const validateAuthenticatedUser = useCallback(() => {
        if (authLoading) return false;
        if (!isAuthenticated || !user || !user.id || !user.userType) {
            setError('Debes iniciar sesión para usar el chat');
            return false;
        }
        return true;
    }, [isAuthenticated, user, authLoading]);

    const validateImageFile = useCallback((file) => {
        if (!file) return { isValid: true };
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        const maxSize = 10 * 1024 * 1024;
        if (!allowedTypes.includes(file.type)) {
            return { isValid: false, error: 'Solo se permiten archivos de imagen (JPG, PNG, GIF, WebP)' };
        }
        if (file.size > maxSize) {
            return { isValid: false, error: 'El archivo no puede exceder 10MB' };
        }
        return { isValid: true };
    }, []);

    const scrollToBottom = useCallback(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, []);

    const handleClientNotFound = useCallback(() => {
        setActiveConversation(null);
        setMessages([]);
        setConversations([]);
        if (user?.userType === 'Customer') {
            setError('Tu cuenta ha sido eliminada del sistema. Contacta al administrador.');
        }
    }, [user?.userType]);

    // ============ FUNCIÓN CRÍTICA: updateConversationInList ============
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

                return updatedConversations;
            } else if (updates.clientId) {
                if (user?.userType === 'admin') {
                    console.log(`✨ Nueva conversación detectada para admin: ${conversationId}`);
                    const newConversation = {
                        conversationId,
                        status: 'active',
                        unreadCountAdmin: 1,
                        unreadCountClient: 0,
                        ...updates
                    };
                    return [newConversation, ...prev];
                }
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
    }, [user?.userType]);

    // ============ FUNCIÓN CRÍTICA: calculateLastMessage ============
    const calculateLastMessage = useCallback((conversationId, currentMessages) => {
        const validMessages = currentMessages.filter(msg =>
            msg.conversationId === conversationId && !msg.isDeleted
        );

        if (validMessages.length === 0) {
            return { lastMessage: '', lastMessageAt: new Date() };
        }

        const sortedMessages = validMessages.sort((a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
        );

        const latestMessage = sortedMessages[0];
        const lastMessage = formatChatContent(latestMessage, { messageOnly: true });

        return { lastMessage, lastMessageAt: latestMessage.createdAt };
    }, [formatChatContent]);

    // ============ FUNCIONES API CORREGIDAS ============
    const apiRequest = useCallback(async (url, options = {}) => {
        try {
            if (!validateAuthenticatedUser()) {
                throw new Error('Usuario no autenticado');
            }

            const headers = getAuthHeaders ? getAuthHeaders() : {
                'Content-Type': 'application/json'
            };

            if (!headers.Authorization && getBestAvailableToken) {
                const token = getBestAvailableToken();
                if (token) {
                    headers.Authorization = `Bearer ${token}`;
                }
            }

            const response = await fetch(`${API_BASE}${url}`, {
                credentials: 'include',
                headers: { ...headers, ...options.headers },
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

            return data;
        } catch (error) {
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

            const headers = {};
            if (getBestAvailableToken) {
                const token = getBestAvailableToken();
                if (token) {
                    headers.Authorization = `Bearer ${token}`;
                }
            }

            const response = await fetch(`${API_BASE}${url}`, {
                method: 'POST',
                credentials: 'include',
                headers: headers,
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
            throw error;
        }
    }, [validateAuthenticatedUser, getBestAvailableToken]);

    // ============ FUNCIONES DE CONVERSACIONES ============
    const getOrCreateConversation = useCallback(async (showLoader = false) => {
        if (!validateAuthenticatedUser() || user.userType !== 'Customer') {
            return null;
        }

        try {
            if (showLoader) setLoading(true);
            const data = await apiRequest(`/conversation/${user.id}`);
            if (data === null) return null;

            if (data.conversation) {
                return data.conversation;
            } else {
                return null;
            }
        } catch (error) {
            setError('Error al obtener conversación: ' + error.message);
            return null;
        } finally {
            if (showLoader) setLoading(false);
        }
    }, [user, apiRequest, validateAuthenticatedUser]);

    const getAllConversations = useCallback(async (showLoader = false) => {
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
                updateConversationInList(conversationId, { unreadCountAdmin: 0 });
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

        if (activeConversationRef.current?.conversationId !== conversation.conversationId) {
            if (activeConversationRef.current) {
                leaveConversation(activeConversationRef.current.conversationId);
            }
            joinConversation(conversation.conversationId);
        }

        setActiveConversation(conversation);
        setMessages([]);
        setCurrentPage(1);
        setHasMoreMessages(true);
        setTypingUsers(new Set());

        await getMessages(conversation.conversationId, 1, true, true);
        await markAsRead(conversation.conversationId);
    }, [getMessages, markAsRead, leaveConversation, joinConversation, validateAuthenticatedUser]);

    // ============ FUNCIÓN sendMessage CON ESPERA DE SOCKET.IO ============
    const sendMessage = useCallback(async (conversationId, message, file = null) => {
        console.log('📤 === INICIO sendMessage CON ESPERA SOCKET.IO ===', {
            conversationId,
            hasMessage: !!message?.trim(),
            hasFile: !!file,
            userType: user?.userType,
            userId: user?.id,
            hasActiveConversation: !!activeConversationRef.current,
            isSocketReady,
            socketConnected
        });

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

        const isFirstMessage = !activeConversationRef.current && user?.userType === 'Customer';
        
        if (isFirstMessage) {
            console.log('🎯 === PRIMER MENSAJE DETECTADO ===');
            console.log('🔍 Estado Socket.IO:', {
                socketConnected,
                isSocketReady,
                shouldWait: !isSocketReady
            });

            if (!isSocketReady) {
                console.log('⏳ Socket.IO no está listo, ESPERANDO...');
                setError('Conectando al chat, espera un momento...');
                
                let attempts = 0;
                const maxAttempts = 50;
                
                while (!isSocketReady && attempts < maxAttempts) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    attempts++;
                    
                    if (attempts % 10 === 0) {
                        console.log(`⏳ Esperando Socket.IO... Intento ${attempts}/${maxAttempts}`);
                    }
                }
                
                if (!isSocketReady) {
                    console.warn('⚠️ Socket.IO no se conectó a tiempo, enviando de todas formas...');
                    setError('Conexión lenta detectada. El mensaje se enviará pero puede tardar en aparecer.');
                } else {
                    console.log('✅ Socket.IO finalmente listo, continuando...');
                    setError(null);
                }
            }
        }

        let temporalMessageId = null;

        if (isFirstMessage) {
            temporalMessageId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            const temporalMessage = {
                _id: temporalMessageId,
                conversationId: conversationId || 'temp_conversation',
                senderId: {
                    _id: user.id,
                    fullName: 'Tú',
                    email: user.email || '',
                    profilePicture: null
                },
                senderType: 'Customer',
                message: message?.trim() || '',
                media: file ? {
                    type: 'image',
                    url: URL.createObjectURL(file),
                    filename: file.name,
                    size: file.size
                } : null,
                status: 'sending',
                isRead: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isTemporary: true
            };

            console.log('✨ AGREGANDO MENSAJE TEMPORAL:', temporalMessageId);

            if (!activeConversationRef.current) {
                const tempConversation = {
                    conversationId: 'temp_conversation',
                    clientId: user.id,
                    status: 'active',
                    lastMessage: message?.trim() || '📷 Imagen',
                    lastMessageAt: new Date(),
                    unreadCountAdmin: 0,
                    unreadCountClient: 0,
                    isTemporary: true
                };

                activeConversationRef.current = tempConversation;
                setActiveConversation(tempConversation);
            }

            setMessages(prev => [...prev, temporalMessage]);
            setTimeout(() => scrollToBottom(), 100);
        }

        try {
            let data;

            console.log('📤 Enviando mensaje al servidor...');

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
                const requestBody = { message: message.trim() };
                if (conversationId) {
                    requestBody.conversationId = conversationId;
                }
                data = await apiRequest('/message', {
                    method: 'POST',
                    body: JSON.stringify(requestBody)
                });
            }

            console.log('📥 Respuesta del servidor:', {
                success: data?.success,
                conversationId: data?.conversationId,
                isNewConversation: data?.isNewConversation,
                messageId: data?.message?._id
            });

            if (data === null) {
                if (temporalMessageId) {
                    console.log('❌ Removiendo mensaje temporal por error');
                    setMessages(prev => prev.filter(msg => msg._id !== temporalMessageId));
                }
                return false;
            }

            if (isFirstMessage && temporalMessageId) {
                console.log('⚡ PROCESAMIENTO INMEDIATO DE PRIMER MENSAJE');
                
                if (data.conversationId && isSocketReady) {
                    console.log('🔗 Uniéndose inmediatamente a conversación:', data.conversationId);
                    joinConversation(data.conversationId);
                }

                setTimeout(() => {
                    console.log('🔄 Reemplazando mensaje temporal...');

                    setMessages(prev => {
                        const withoutTemporal = prev.filter(msg => msg._id !== temporalMessageId);
                        
                        const realMessageExists = withoutTemporal.find(msg =>
                            msg._id === data.message?._id ||
                            (msg.message === message?.trim() && !msg.isTemporary && msg.senderType === 'Customer')
                        );

                        if (realMessageExists) {
                            console.log('✅ Mensaje real ya existe, solo removiendo temporal');
                            return withoutTemporal;
                        } else {
                            console.log('⚠️ Mensaje real no llegó, creando versión final');
                            const finalMessage = {
                                ...prev.find(msg => msg._id === temporalMessageId),
                                _id: data.message?._id || temporalMessageId + '_final',
                                conversationId: data.conversationId,
                                status: 'sent',
                                isTemporary: false
                            };
                            return [...withoutTemporal, finalMessage];
                        }
                    });

                    if (data.conversationId && data.conversationId !== 'temp_conversation') {
                        const realConversation = {
                            conversationId: data.conversationId,
                            clientId: user.id,
                            status: 'active',
                            lastMessage: message?.trim() || '📷 Imagen',
                            lastMessageAt: new Date(),
                            unreadCountAdmin: 0,
                            unreadCountClient: 0,
                            isTemporary: false
                        };

                        activeConversationRef.current = realConversation;
                        setActiveConversation(realConversation);
                    }

                    console.log('✅ Reemplazo de primer mensaje completado');
                }, 2000);

                firstMessageSentRef.current = true;

            } else if (data.conversationId && isSocketReady) {
                joinConversation(data.conversationId);
            }

            console.log('✅ sendMessage completado exitosamente');
            return true;

        } catch (error) {
            console.error('❌ Error en sendMessage:', error);

            if (temporalMessageId) {
                console.log('❌ Removiendo mensaje temporal por error de red');
                setMessages(prev => prev.filter(msg => msg._id !== temporalMessageId));
            }

            setError('Error al enviar mensaje: ' + error.message);
            return false;
        }
    }, [user, apiRequest, apiRequestFormData, stopTyping, validateAuthenticatedUser, validateImageFile, joinConversation, scrollToBottom, isSocketReady, socketConnected]);

    const deleteMessage = useCallback(async (messageId) => {
        if (!messageId || !validateAuthenticatedUser()) {
            return false;
        }

        try {
            setIsDeleting(true);
            const messageToDelete = messages.find(msg => msg._id === messageId);
            const conversationId = messageToDelete?.conversationId || activeConversationRef.current?.conversationId;

            // ✅ VERIFICAR PERMISOS DE ELIMINACIÓN
            if (!messageToDelete) {
                setError('Mensaje no encontrado');
                return false;
            }

            // ✅ SOLO EL REMITENTE O ADMIN PUEDEN ELIMINAR
            const canDelete = user?.userType === 'admin' || 
                            (user?.userType === 'Customer' && messageToDelete.senderType === 'Customer' && 
                             (messageToDelete.senderId?._id === user.id || messageToDelete.senderId === user.id));

            if (!canDelete) {
                setError('No tienes permisos para eliminar este mensaje');
                return false;
            }

            console.log('🗑️ Eliminando mensaje:', {
                messageId,
                conversationId,
                senderType: messageToDelete.senderType,
                userType: user?.userType
            });

            const data = await apiRequest(`/message/${messageId}`, { method: 'DELETE' });
            if (data === null) return false;

            // ✅ ACTUALIZAR ESTADO LOCAL INMEDIATAMENTE
            setMessages(prev => {
                const updatedMessages = prev.filter(msg => msg._id !== messageId);

                if (conversationId) {
                    const { lastMessage, lastMessageAt } = calculateLastMessage(conversationId, updatedMessages);
                    updateConversationInList(conversationId, { lastMessage, lastMessageAt });

                    // ✅ SI ES EL ÚLTIMO MENSAJE DE UN CLIENTE, RESETEAR CONTADORES
                    if (user?.userType === 'Customer' && updatedMessages.filter(m => m.conversationId === conversationId).length === 0) {
                        updateConversationInList(conversationId, {
                            unreadCountAdmin: 0,
                            unreadCountClient: 0
                        });
                        setUnreadCount(prev => Math.max(0, prev - 1));
                    }
                }

                return updatedMessages;
            });

            console.log('✅ Mensaje eliminado exitosamente');
            return true;
        } catch (error) {
            console.error('❌ Error eliminando mensaje:', error);
            setError('Error al eliminar mensaje: ' + error.message);
            return false;
        } finally {
            setIsDeleting(false);
        }
    }, [apiRequest, messages, calculateLastMessage, updateConversationInList, validateAuthenticatedUser, user?.userType, user?.id]);

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

    // ============ INICIALIZACIÓN CORREGIDA CON ESPERA SOCKET.IO ============
    const initializeChat = useCallback(async () => {
        console.log('🚀 === INICIO initializeChat MEJORADO ===', {
            authLoading,
            isInitialized: isInitializedRef.current,
            userType: user?.userType,
            isSocketReady,
            socketConnected
        });

        if (authLoading || !validateAuthenticatedUser() || isInitializedRef.current) {
            return;
        }

        // ✅ ESPERAR A QUE SOCKET.IO ESTÉ LISTO PARA CLIENTES
        if (user?.userType === 'Customer' && !isSocketReady) {
            console.log('⏳ Cliente esperando Socket.IO listo...');
            return; // Salir temprano, se reiniciará cuando isSocketReady sea true
        }

        isInitializedRef.current = true;

        try {
            setIsConnected(true);

            if (user.userType === 'admin') {
                console.log('👨‍💼 Inicializando chat para admin...');
                await getAllConversations(false);
            } else if (user.userType === 'Customer') {
                console.log('👤 Inicializando chat para cliente con Socket.IO listo...');
                const conversation = await getOrCreateConversation(false);
                if (conversation) {
                    await selectConversation(conversation);
                }
            }

        } catch (error) {
            setError('Error al inicializar el chat: ' + error.message);
            isInitializedRef.current = false;
        }
    }, [authLoading, user, isSocketReady, socketConnected, getAllConversations, getOrCreateConversation, selectConversation, validateAuthenticatedUser]);

    // ============ CONFIGURACIÓN SOCKET.IO CRÍTICA CORREGIDA ============

    useEffect(() => {
        if (!socketConnected || !isAuthenticated || !validateAuthenticatedUser()) return;

        console.log('⚙️ Configurando listeners Socket.IO CON SOCKET READY:', { socketConnected, isSocketReady });

        const unsubscribeNewMessage = onNewMessage((data) => {
            console.log('📨 Evento nuevo mensaje recibido:', {
                conversationId: data.conversationId,
                messageId: data.message._id,
                senderType: data.message.senderType,
                senderId: data.message.senderId,
                activeConversationId: activeConversationRef.current?.conversationId,
                userType: user?.userType,
                currentUserId: user?.id,
                isSocketReady
            });

            // ✅ FILTRO DE EVENTOS DUPLICADOS
            const eventKey = `new_message_${data.message._id}`;
            if (lastProcessedEventRef.current.has(eventKey)) {
                console.log('⚠️ Evento duplicado detectado, ignorando...');
                return;
            }
            lastProcessedEventRef.current.set(eventKey, Date.now());

            // ✅ IDENTIFICACIÓN DE MENSAJE PROPIO MEJORADA
            let isClientOwnMessage = false;

            if (user?.userType === 'Customer' && data.message.senderType === 'Customer') {
                if (data.message.senderId?._id === user.id ||
                    data.message.senderId === user.id ||
                    data.message.senderId?.id === user.id) {
                    isClientOwnMessage = true;
                }
            }

            const isForActiveConversation = activeConversationRef.current?.conversationId === data.conversationId;
            const isAdminAndClientMessage = user?.userType === 'admin' && data.message.senderType === 'Customer';

            console.log('🔍 Análisis del mensaje:', {
                isForActiveConversation,
                isAdminAndClientMessage,
                isClientOwnMessage,
                hasActiveConversation: !!activeConversationRef.current
            });

            // ✅ LÓGICA MEJORADA PARA CLIENTES CON MENSAJES TEMPORALES
            if (user?.userType === 'Customer') {
                if (isClientOwnMessage) {
                    console.log('✅ PROCESANDO MENSAJE PROPIO DEL CLIENTE');

                    // ✅ REEMPLAZAR MENSAJE TEMPORAL SI EXISTE
                    setMessages(prev => {
                        const temporalMessageIndex = prev.findIndex(msg =>
                            msg.isTemporary &&
                            msg.senderId?._id === user.id &&
                            (
                                (msg.message === data.message.message) ||
                                (msg.media?.filename === data.message.media?.filename)
                            )
                        );

                        if (temporalMessageIndex >= 0) {
                            console.log('🔄 REEMPLAZANDO MENSAJE TEMPORAL con mensaje real');
                            const newMessages = [...prev];

                            newMessages[temporalMessageIndex] = {
                                ...data.message,
                                isTemporary: false,
                                status: 'sent'
                            };

                            return newMessages;
                        } else {
                            const exists = prev.find(msg => msg._id === data.message._id);
                            if (exists) {
                                console.log('⚠️ Mensaje real ya existe, ignorando...');
                                return prev;
                            }

                            console.log('✅ AGREGANDO MENSAJE REAL (sin temporal previo)');
                            return [...prev, data.message];
                        }
                    });

                    // ✅ ESTABLECER CONVERSACIÓN si no existe o es temporal
                    if (!activeConversationRef.current || activeConversationRef.current.isTemporary) {
                        console.log('✨ ESTABLECIENDO CONVERSACIÓN REAL');
                        const newConversation = {
                            conversationId: data.conversationId,
                            clientId: user.id,
                            status: 'active',
                            lastMessage: data.message.message || '📷 Imagen',
                            lastMessageAt: data.timestamp,
                            unreadCountAdmin: 0,
                            unreadCountClient: 0,
                            isTemporary: false
                        };

                        activeConversationRef.current = newConversation;
                        setActiveConversation(newConversation);

                        // Unirse a Socket.IO con conversación real
                        joinConversation(data.conversationId);
                    }

                    setTimeout(() => scrollToBottom(), 100);
                    return;

                } else if (!isForActiveConversation) {
                    console.log('⚠️ Mensaje de otro usuario no es para conversación activa, ignorando...');
                    return;
                }
            }

            // ✅ LÓGICA PARA ADMIN
            if (user?.userType === 'admin' && !isAdminAndClientMessage && !isForActiveConversation) {
                console.log('⚠️ Mensaje de admin no es para conversación activa, ignorando...');
                return;
            }

            // ✅ AGREGAR MENSAJE PARA CONVERSACIÓN ACTIVA
            if (isForActiveConversation) {
                setMessages(prev => {
                    const exists = prev.find(msg => msg._id === data.message._id);
                    if (exists) {
                        console.log('⚠️ Mensaje ya existe en conversación activa, ignorando...');
                        return prev;
                    }

                    console.log('✅ AGREGANDO MENSAJE A CONVERSACIÓN ACTIVA');
                    setTimeout(() => scrollToBottom(), 100);
                    return [...prev, data.message];
                });
            }

            // ✅ ACTUALIZAR LISTA DE CONVERSACIONES PARA ADMIN
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
                    unreadCountAdmin: data.message.senderType !== 'admin' ? 1 : 0
                });

                if (data.message.senderType !== 'admin') {
                    setUnreadCount(prev => prev + 1);
                }
            }
        });

        const unsubscribeMessageDeleted = onMessageDeleted((data) => {
            console.log('🗑️ Evento mensaje eliminado recibido:', {
                conversationId: data.conversationId,
                messageId: data.messageId,
                activeConversationId: activeConversationRef.current?.conversationId
            });

            const eventKey = `delete_message_${data.messageId}`;
            if (lastProcessedEventRef.current.has(eventKey)) {
                console.log('⚠️ Evento de eliminación duplicado, ignorando...');
                return;
            }
            lastProcessedEventRef.current.set(eventKey, Date.now());

            const isForActiveConversation = activeConversationRef.current?.conversationId === data.conversationId;

            if (user?.userType === 'Customer' && !isForActiveConversation) {
                console.log('⚠️ Eliminación no es para conversación activa del cliente, ignorando...');
                return;
            }

            setMessages(prev => {
                const updatedMessages = prev.filter(msg => msg._id !== data.messageId);

                if (isForActiveConversation || user?.userType === 'admin') {
                    const { lastMessage, lastMessageAt } = calculateLastMessage(data.conversationId, updatedMessages);
                    updateConversationInList(data.conversationId, { lastMessage, lastMessageAt });

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
                }

                return updatedMessages;
            });
        });

        const unsubscribeConversationUpdated = onConversationUpdated((data) => {
            console.log('🔄 Evento conversación actualizada recibida:', {
                conversationId: data.conversationId,
                action: data.action,
                userType: user?.userType
            });

            const eventKey = `conv_updated_${data.conversationId}_${data.action}_${data.timestamp}`;
            if (lastProcessedEventRef.current.has(eventKey)) {
                console.log('⚠️ Evento de conversación duplicado, ignorando...');
                return;
            }
            lastProcessedEventRef.current.set(eventKey, Date.now());

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
            if (activeConversationRef.current?.conversationId === data.conversationId) {
                updateConversationInList(data.conversationId, { status: 'closed' });
                setError('La conversación ha sido cerrada por el administrador');
            }
        });

        const unsubscribeMessagesRead = onMessagesRead((data) => {
            if (activeConversationRef.current?.conversationId === data.conversationId) {
                setMessages(prev => prev.map(msg => ({
                    ...msg,
                    isRead: true,
                    readAt: data.timestamp
                })));
            }

            if (user?.userType === 'admin') {
                updateConversationInList(data.conversationId, { unreadCountAdmin: 0 });
                const currentConv = conversations.find(c => c.conversationId === data.conversationId);
                if (currentConv?.unreadCountAdmin > 0) {
                    setUnreadCount(prev => Math.max(0, prev - currentConv.unreadCountAdmin));
                }
            }
        });

        const unsubscribeUserTyping = onUserTyping((data) => {
            if (data.userId !== user?.id && activeConversationRef.current?.conversationId === data.conversationId) {
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

        // ✅ LIMPIEZA PERIÓDICA DE EVENTOS PROCESADOS
        const cleanupInterval = setInterval(() => {
            const now = Date.now();
            const fiveMinutesAgo = now - (5 * 60 * 1000);

            for (const [key, timestamp] of lastProcessedEventRef.current.entries()) {
                if (timestamp < fiveMinutesAgo) {
                    lastProcessedEventRef.current.delete(key);
                }
            }
        }, 60000);

        return () => {
            console.log('🧹 Limpiando listeners de Socket.IO...');
            unsubscribeNewMessage?.();
            unsubscribeMessageDeleted?.();
            unsubscribeConversationUpdated?.();
            unsubscribeConversationClosed?.();
            unsubscribeMessagesRead?.();
            unsubscribeUserTyping?.();
            unsubscribeChatStats?.();
            clearInterval(cleanupInterval);
        };
    }, [
        socketConnected,
        isSocketReady, // ✅ NUEVA DEPENDENCIA CRÍTICA
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
        calculateLastMessage,
        joinConversation
    ]);

    // ============ EFECTO DE INICIALIZACIÓN CRÍTICO ============
    useEffect(() => {
        console.log('🔄 Efecto initializeChat:', {
            authLoading,
            isAuthenticated,
            hasUser: !!user,
            userId: user?.id,
            userType: user?.userType,
            isInitialized: isInitializedRef.current,
            isSocketReady
        });

        if (!authLoading && isAuthenticated && user && user.id && user.userType && !isInitializedRef.current) {
            initializeChat();
        }
    }, [authLoading, isAuthenticated, user?.id, user?.userType, isSocketReady, initializeChat]); // ✅ DEPENDENCIA CRÍTICA

    // ============ EFECTO PARA RE-INICIALIZAR CUANDO SOCKET.IO ESTÉ LISTO ============
    useEffect(() => {
        // ✅ CRÍTICO: Re-inicializar chat cuando Socket.IO esté listo para clientes
        if (user?.userType === 'Customer' && 
            isAuthenticated && 
            !authLoading && 
            isSocketReady && 
            !isInitializedRef.current) {
            
            console.log('🎯 Socket.IO listo para cliente, inicializando chat...');
            initializeChat();
        }
    }, [user?.userType, isAuthenticated, authLoading, isSocketReady, initializeChat]);

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
        isConnected: isConnected && socketConnected && isSocketReady && !authLoading && !!user, // ✅ CORREGIDO CON isSocketReady
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
        isSocketReady, // ✅ NUEVO: Exposer estado de Socket.IO listo

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