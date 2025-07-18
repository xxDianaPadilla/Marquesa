import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useSocket } from "./useSocket";

/**
 * Hook personalizado para manejar toda la funcionalidad del chat
 * Gestiona conversaciones, mensajes, archivos, estado de conexión y eventos en tiempo real
 * Funciona tanto para administradores como para clientes
 * 
 * @returns {Object} Objeto con estados y funciones del chat
 */
export const useChat = () => {
    // ============ ESTADOS PRINCIPALES DEL CHAT ============
    
    // Estados de conversaciones y mensajes
    const [conversations, setConversations] = useState([]); // Lista de conversaciones (solo admin)
    const [activeConversation, setActiveConversation] = useState(null); // Conversación actualmente seleccionada
    const [messages, setMessages] = useState([]); // Mensajes de la conversación activa
    const [newMessage, setNewMessage] = useState(''); // Texto del mensaje que se está escribiendo
    
    // Estados de archivos multimedia
    const [selectedFile, setSelectedFile] = useState(null); // Archivo seleccionado para enviar
    const [previewUrl, setPreviewUrl] = useState(null); // URL de preview para imágenes
    
    // Estados de UI y conexión
    const [loading, setLoading] = useState(false); // Estado de carga general
    const [error, setError] = useState(null); // Mensajes de error
    const [isConnected, setIsConnected] = useState(false); // Estado de conexión al chat
    const [unreadCount, setUnreadCount] = useState(0); // Cantidad de mensajes no leídos (admin)
    
    // Estados para modal de eliminación de mensajes
    const [showDeleteModal, setShowDeleteModal] = useState(false); // Mostrar modal de confirmación
    const [messageToDelete, setMessageToDelete] = useState(null); // Mensaje seleccionado para eliminar
    const [isDeleting, setIsDeleting] = useState(false); // Estado de eliminación en progreso
    
    // Estados para paginación de mensajes
    const [currentPage, setCurrentPage] = useState(1); // Página actual de mensajes
    const [hasMoreMessages, setHasMoreMessages] = useState(true); // Si hay más mensajes para cargar
    const [loadingMessages, setLoadingMessages] = useState(false); // Cargando mensajes
    
    // Estados para funcionalidades en tiempo real
    const [typingUsers, setTypingUsers] = useState(new Set()); // Usuarios que están escribiendo
    const typingTimeoutRef = useRef(null); // Timeout para el indicador de escritura
    
    // ============ REFERENCIAS Y CONTEXTOS ============
    
    // Referencias para controlar el comportamiento del chat
    const messagesEndRef = useRef(null); // Referencia para hacer scroll al final
    const pollingIntervalRef = useRef(null); // Intervalo de polling (si es necesario)
    const isInitializedRef = useRef(false); // Flag para evitar inicialización múltiple
    const lastMessageCountRef = useRef(0); // Contador de mensajes para detectar cambios
    const activeConversationRef = useRef(null); // Referencia a la conversación activa
    const fileInputRef = useRef(null); // Referencia al input de archivos
    
    // Hooks de contexto
    const { user, isAuthenticated } = useAuth(); // Datos del usuario autenticado
    
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

    // ============ CONFIGURACIÓN DE API ============
    
    // URL base de la API del chat
    const API_BASE = "http://localhost:4000/api/chat";

    // ============ EFECTOS Y REFERENCIAS ============
    
    /**
     * Actualiza la referencia cuando cambia la conversación activa
     * Esto permite acceder a la conversación actual desde callbacks
     */
    useEffect(() => {
        activeConversationRef.current = activeConversation;
    }, [activeConversation]);

    // ============ FUNCIONES DE API ============
    
    /**
     * Función utilitaria para realizar peticiones a la API con manejo de errores
     * 
     * @param {string} url - URL relativa del endpoint
     * @param {Object} options - Opciones de fetch
     * @returns {Promise<Object>} Respuesta parseada de la API
     */
    const apiRequest = useCallback(async (url, options = {}) => {
        try {
            console.log(`API Request: ${options.method || 'GET'} ${url}`);
            
            const response = await fetch(`${API_BASE}${url}`, {
                credentials: 'include', // Incluir cookies de autenticación
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            // Verificar que la respuesta sea JSON válido
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('Respuesta no es JSON:', text);
                throw new Error('El servidor no devolvió una respuesta JSON válida');
            }

            const data = await response.json();
            
            // Verificar si la respuesta es exitosa
            if (!response.ok) {
                throw new Error(data.message || `Error ${response.status}`);
            }
            
            return data;
        } catch (error) {
            console.error('Error en petición API:', error);
            throw error;
        }
    }, []);

    /**
     * Función para realizar peticiones con FormData (para archivos)
     * 
     * @param {string} url - URL relativa del endpoint
     * @param {FormData} formData - Datos del formulario con archivos
     * @returns {Promise<Object>} Respuesta parseada de la API
     */
    const apiRequestFormData = useCallback(async (url, formData) => {
        try {
            console.log(`API Request FormData: POST ${url}`);
            
            const response = await fetch(`${API_BASE}${url}`, {
                method: 'POST',
                credentials: 'include',
                body: formData // No establecer Content-Type para FormData
            });

            // Verificar que la respuesta sea JSON válido
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

    // ============ FUNCIONES DE UTILIDAD ============
    
    /**
     * Hace scroll automático al final de la lista de mensajes
     * Útil cuando llegan mensajes nuevos o se carga la conversación
     */
    const scrollToBottom = useCallback(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, []);

    /**
     * Obtiene el último mensaje válido (no eliminado) de una conversación
     * 
     * @param {Array} conversationMessages - Array de mensajes de la conversación
     * @returns {string} Texto del último mensaje o mensaje por defecto
     */
    const getLastValidMessage = useCallback((conversationMessages) => {
        // Verificar que hay mensajes
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

    /**
     * Actualiza el último mensaje mostrado en la lista de conversaciones
     * 
     * @param {string} conversationId - ID de la conversación a actualizar
     */
    const updateConversationLastMessage = useCallback((conversationId) => {
        // Obtener mensajes válidos de la conversación
        const conversationMessages = messages.filter(msg => 
            !msg.isDeleted && 
            (msg.conversationId === conversationId || 
             activeConversationRef.current?.conversationId === conversationId)
        );
        
        // Calcular último mensaje y fecha
        const lastMessage = getLastValidMessage(conversationMessages);
        const lastMessageAt = conversationMessages.length > 0 
            ? conversationMessages[conversationMessages.length - 1].createdAt 
            : null;
        
        // Actualizar estado de conversaciones
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

    // ============ FUNCIONES PARA MANEJO DE ARCHIVOS ============
    
    /**
     * Maneja la selección de archivos para enviar
     * 
     * @param {Event} e - Evento de selección de archivo
     */
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

    /**
     * Limpia el archivo seleccionado y su preview
     */
    const clearSelectedFile = useCallback(() => {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);

    // ============ FUNCIONES PARA MODAL DE ELIMINACIÓN ============
    
    /**
     * Abre el modal de confirmación para eliminar un mensaje
     * 
     * @param {Object} message - Mensaje a eliminar
     */
    const openDeleteModal = useCallback((message) => {
        setMessageToDelete(message);
        setShowDeleteModal(true);
    }, []);

    /**
     * Cierra el modal de confirmación sin eliminar el mensaje
     */
    const closeDeleteModal = useCallback(() => {
        setShowDeleteModal(false);
        setMessageToDelete(null);
        setIsDeleting(false);
    }, []);

    // ============ CONFIGURACIÓN DE EVENTOS SOCKET.IO ============
    
    /**
     * Configura todos los listeners de eventos de Socket.IO
     * Maneja mensajes nuevos, eliminaciones, indicadores de escritura, etc.
     */
    useEffect(() => {
        // Solo configurar si hay conexión y usuario autenticado
        if (!socketConnected || !isAuthenticated) return;

        console.log('Configurando listeners de Socket.IO...');

        // ---- EVENTO: Nuevo mensaje recibido ----
        const unsubscribeNewMessage = onNewMessage((data) => {
            console.log('Nuevo mensaje recibido:', data);
            
            // Agregar mensaje si no existe (evitar duplicados)
            setMessages(prev => {
                const exists = prev.find(msg => msg._id === data.message._id);
                if (exists) return prev;
                
                // Hacer scroll automático después de agregar el mensaje
                setTimeout(() => scrollToBottom(), 100);
                return [...prev, data.message];
            });
            
            // Actualizar conversaciones para administradores
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

        // ---- EVENTO: Mensaje eliminado ----
        const unsubscribeMessageDeleted = onMessageDeleted((data) => {
            console.log('Mensaje eliminado via Socket.IO:', data);
            
            // Actualizar mensajes locales (remover el mensaje eliminado)
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

        // ---- EVENTO: Conversación actualizada ----
        const unsubscribeConversationUpdated = onConversationUpdated((data) => {
            if (user?.userType === 'admin') {
                setConversations(prev => prev.map(conv => 
                    conv.conversationId === data.conversationId
                        ? { ...conv, ...data }
                        : conv
                ));
            }
        });

        // ---- EVENTO: Conversación cerrada ----
        const unsubscribeConversationClosed = onConversationClosed((data) => {
            // Actualizar estado de la conversación
            setConversations(prev => prev.map(conv => 
                conv.conversationId === data.conversationId
                    ? { ...conv, status: 'closed' }
                    : conv
            ));
            
            // Mostrar error si es la conversación activa
            if (activeConversationRef.current?.conversationId === data.conversationId) {
                setError('La conversación ha sido cerrada por el administrador');
            }
        });

        // ---- EVENTO: Mensajes marcados como leídos ----
        const unsubscribeMessagesRead = onMessagesRead((data) => {
            // Marcar todos los mensajes como leídos
            setMessages(prev => prev.map(msg => ({
                ...msg,
                isRead: true,
                readAt: data.timestamp
            })));
            
            // Actualizar contadores para administradores
            if (user?.userType === 'admin') {
                setConversations(prev => prev.map(conv => 
                    conv.conversationId === data.conversationId
                        ? { ...conv, unreadCountAdmin: 0 }
                        : conv
                ));
            }
        });

        // ---- EVENTO: Usuario escribiendo ----
        const unsubscribeUserTyping = onUserTyping((data) => {
            // Solo mostrar indicador si no es el usuario actual
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

        // ---- EVENTO: Estadísticas del chat actualizadas ----
        const unsubscribeChatStats = onChatStatsUpdated((stats) => {
            if (user?.userType === 'admin') {
                setUnreadCount(stats.unreadMessages || 0);
            }
        });

        // ---- CLEANUP: Limpiar listeners al desmontar ----
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

    // ============ FUNCIONES DE CONVERSACIONES ============
    
    /**
     * Obtiene o crea una conversación para el cliente actual
     * Solo se usa para clientes, no para administradores
     * 
     * @param {boolean} showLoader - Si mostrar indicador de carga
     * @returns {Promise<Object|null>} Datos de la conversación o null
     */
    const getOrCreateConversation = useCallback(async (showLoader = true) => {
        // Verificar que es un cliente válido
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

    /**
     * Obtiene todas las conversaciones (solo para administradores)
     * 
     * @param {boolean} showLoader - Si mostrar indicador de carga
     */
    const getAllConversations = useCallback(async (showLoader = true) => {
        // Verificar que es un administrador
        if (!user || user.userType !== 'admin') {
            return;
        }
        
        try {
            if (showLoader) setLoading(true);
            const data = await apiRequest('/admin/conversations');
            
            // Actualizar conversaciones solo si hay cambios
            setConversations(prevConversations => {
                const newConversations = data.conversations || [];
                
                // Comparar si hay cambios significativos
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
                
                // Solo actualizar si hay cambios
                if (!hasChanges) {
                    return prevConversations;
                }
                
                return newConversations;
            });
            
            // Calcular total de mensajes no leídos
            const totalUnread = (data.conversations || []).reduce((sum, conv) => 
                sum + (conv.unreadCountAdmin || 0), 0);
            setUnreadCount(totalUnread);
            
        } catch (error) {
            setError('Error al obtener conversaciones');
        } finally {
            if (showLoader) setLoading(false);
        }
    }, [user, apiRequest]);

    // ============ FUNCIONES DE MENSAJES ============
    
    /**
     * Obtiene los mensajes de una conversación específica con paginación
     * 
     * @param {string} conversationId - ID de la conversación
     * @param {number} page - Página a cargar (por defecto 1)
     * @param {boolean} resetMessages - Si resetear la lista actual
     * @param {boolean} showLoader - Si mostrar indicador de carga
     */
    const getMessages = useCallback(async (conversationId, page = 1, resetMessages = false, showLoader = true) => {
        if (!conversationId) {
            return;
        }
        
        try {
            if (showLoader) setLoadingMessages(true);
            const data = await apiRequest(`/messages/${conversationId}?page=${page}&limit=50`);
            
            // Filtrar mensajes no eliminados
            const newMessages = (data.messages || []).filter(msg => !msg.isDeleted);
            
            if (resetMessages || page === 1) {
                // Resetear mensajes o cargar primera página
                setMessages(prevMessages => {
                    // Evitar actualizaciones innecesarias
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
                // Agregar mensajes anteriores (paginación)
                setMessages(prev => [...newMessages, ...prev]);
            }
            
            // Actualizar estado de paginación
            setHasMoreMessages(data.pagination?.hasNextPage || false);
            setCurrentPage(page);
            
            // Hacer scroll si es una carga nueva o hay mensajes nuevos
            if ((resetMessages || page === 1) && newMessages.length > lastMessageCountRef.current) {
                setTimeout(() => scrollToBottom(), 100);
            }
            
        } catch (error) {
            setError('Error al obtener mensajes');
        } finally {
            if (showLoader) setLoadingMessages(false);
        }
    }, [apiRequest, scrollToBottom]);

    /**
     * Maneja los cambios en el input del mensaje y el indicador de escritura
     * 
     * @param {string} value - Nuevo valor del input
     */
    const handleMessageChange = useCallback((value) => {
        setNewMessage(value);
        
        // Verificar que hay una conversación activa
        if (!activeConversationRef.current) return;
        
        // Iniciar indicador de escritura si es la primera vez
        if (value.trim() && !typingTimeoutRef.current) {
            startTyping(activeConversationRef.current.conversationId);
        }
        
        // Limpiar timeout anterior
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        
        // Configurar nuevo timeout para detener indicador
        typingTimeoutRef.current = setTimeout(() => {
            stopTyping(activeConversationRef.current?.conversationId);
            typingTimeoutRef.current = null;
        }, 2000); // 2 segundos sin escribir
        
        // Detener inmediatamente si no hay texto
        if (!value.trim()) {
            stopTyping(activeConversationRef.current.conversationId);
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = null;
            }
        }
    }, [startTyping, stopTyping]);

    /**
     * Envía un mensaje de texto o con archivo multimedia
     * 
     * @param {string} conversationId - ID de la conversación
     * @param {string} message - Texto del mensaje
     * @param {File} file - Archivo a enviar (opcional)
     * @returns {Promise<boolean>} Si el envío fue exitoso
     */
    const sendMessage = useCallback(async (conversationId, message, file = null) => {
        // Validaciones básicas
        if (!conversationId) {
            setError('ID de conversación requerido');
            return false;
        }

        if (!message?.trim() && !file) {
            setError('Debes escribir un mensaje o seleccionar un archivo');
            return false;
        }
        
        // Detener indicador de escritura
        stopTyping(conversationId);
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }
        
        try {
            let data;
            
            if (file) {
                // Enviar con archivo
                const formData = new FormData();
                formData.append('conversationId', conversationId);
                if (message?.trim()) {
                    formData.append('message', message.trim());
                }
                formData.append('file', file);
                
                data = await apiRequestFormData('/message', formData);
            } else {
                // Enviar solo texto
                data = await apiRequest('/message', {
                    method: 'POST',
                    body: JSON.stringify({
                        conversationId,
                        message: message.trim()
                    })
                });
            }
            
            // Actualizar último mensaje en conversaciones (solo admin)
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

    /**
     * Elimina un mensaje específico
     * 
     * @param {string} messageId - ID del mensaje a eliminar
     * @returns {Promise<boolean>} Si la eliminación fue exitosa
     */
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

    /**
     * Confirma y ejecuta la eliminación del mensaje seleccionado
     */
    const confirmDeleteMessage = useCallback(async () => {
        if (!messageToDelete) return;
        
        const success = await deleteMessage(messageToDelete._id);
        if (success) {
            closeDeleteModal();
        }
    }, [messageToDelete, deleteMessage, closeDeleteModal]);

    /**
     * Marca los mensajes de una conversación como leídos
     * 
     * @param {string} conversationId - ID de la conversación
     */
    const markAsRead = useCallback(async (conversationId) => {
        if (!conversationId) return;
        
        try {
            await apiRequest(`/read/${conversationId}`, { method: 'PUT' });
            
            // Actualizar contadores para administradores
            if (user?.userType === 'admin') {
                setConversations(prev => prev.map(conv => 
                    conv.conversationId === conversationId 
                        ? { ...conv, unreadCountAdmin: 0 }
                        : conv
                ));
                
                // Actualizar contador global
                setUnreadCount(prev => Math.max(0, prev - (activeConversationRef.current?.unreadCountAdmin || 0)));
            }
            
        } catch (error) {
            console.error('Error marcando como leído:', error);
        }
    }, [user, apiRequest]);

    /**
     * Selecciona una conversación activa y se une a la sala de Socket.IO
     * 
     * @param {Object} conversation - Objeto de la conversación a seleccionar
     */
    const selectConversation = useCallback(async (conversation) => {
        if (!conversation) return;
        
        // Salir de la conversación anterior si existe
        if (activeConversationRef.current) {
            leaveConversation(activeConversationRef.current.conversationId);
        }
        
        // Resetear estado de la nueva conversación
        setActiveConversation(conversation);
        setMessages([]);
        setCurrentPage(1);
        setHasMoreMessages(true);
        lastMessageCountRef.current = 0;
        setTypingUsers(new Set());
        
        // Unirse a la nueva conversación en Socket.IO
        joinConversation(conversation.conversationId);
        
        // Cargar mensajes y marcar como leídos
        await getMessages(conversation.conversationId, 1, true, true);
        await markAsRead(conversation.conversationId);
    }, [getMessages, markAsRead, leaveConversation, joinConversation]);

    /**
     * Carga más mensajes (paginación hacia atrás)
     */
    const loadMoreMessages = useCallback(async () => {
        if (!activeConversation || !hasMoreMessages || loadingMessages) return;
        
        const nextPage = currentPage + 1;
        await getMessages(activeConversation.conversationId, nextPage, false, true);
    }, [activeConversation, hasMoreMessages, loadingMessages, currentPage, getMessages]);

    // ============ INICIALIZACIÓN DEL CHAT ============
    
    /**
     * Inicializa el chat según el tipo de usuario
     * Para administradores: carga todas las conversaciones
     * Para clientes: obtiene/crea su conversación personal
     */
    const initializeChat = useCallback(async () => {
        // Evitar inicialización múltiple
        if (!isAuthenticated || !user || isInitializedRef.current) {
            return;
        }
        
        isInitializedRef.current = true;
        setIsConnected(true);
        
        try {
            if (user.userType === 'admin') {
                // Administrador: cargar todas las conversaciones
                await getAllConversations(true);
            } else if (user.userType === 'Customer') {
                // Cliente: obtener/crear conversación personal
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

    /**
     * Efecto para inicializar el chat cuando el usuario esté autenticado
     */
    useEffect(() => {
        if (isAuthenticated && user && !isInitializedRef.current) {
            initializeChat();
        }
    }, [isAuthenticated, user?.id, user?.userType, initializeChat]);

    // ============ FUNCIONES DE UTILIDAD ============
    
    /**
     * Limpia los mensajes de error
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // ============ RETORNO DEL HOOK ============
    
    return {
        // ---- Estados principales ----
        conversations,              // Lista de conversaciones (admin)
        activeConversation,         // Conversación actualmente seleccionada
        messages,                   // Mensajes de la conversación activa
        newMessage,                 // Texto del mensaje en progreso
        selectedFile,               // Archivo seleccionado para enviar
        previewUrl,                 // URL de preview de imagen
        loading,                    // Estado de carga general
        error,                      // Mensajes de error
        isConnected: isConnected && socketConnected, // Estado de conexión combinado
        unreadCount,                // Contador de mensajes no leídos (admin)
        hasMoreMessages,            // Si hay más mensajes para cargar
        loadingMessages,            // Estado de carga de mensajes
        typingUsers,                // Set de usuarios escribiendo
        
        // ---- Estados del modal de eliminación ----
        showDeleteModal,            // Mostrar modal de confirmación
        messageToDelete,            // Mensaje seleccionado para eliminar
        isDeleting,                 // Estado de eliminación en progreso
        
        // ---- Setters principales ----
        setNewMessage: handleMessageChange, // Setter con lógica de typing
        
        // ---- Acciones principales ----
        sendMessage,                // Enviar mensaje (texto o con archivo)
        deleteMessage,              // Eliminar mensaje específico
        confirmDeleteMessage,       // Confirmar eliminación desde modal
        selectConversation,         // Seleccionar conversación activa
        markAsRead,                 // Marcar mensajes como leídos
        loadMoreMessages,           // Cargar más mensajes (paginación)
        scrollToBottom,             // Hacer scroll al final
        clearError,                 // Limpiar mensajes de error
        
        // ---- Acciones de archivos ----
        handleFileSelect,           // Seleccionar archivo para enviar
        clearSelectedFile,          // Limpiar archivo seleccionado
        
        // ---- Acciones del modal ----
        openDeleteModal,            // Abrir modal de confirmación
        closeDeleteModal,           // Cerrar modal sin eliminar
        
        // ---- Referencias ----
        messagesEndRef,             // Ref para scroll automático
        fileInputRef                // Ref para input de archivos
    };
};