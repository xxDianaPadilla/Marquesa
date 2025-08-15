import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../../../context/AuthContext';
 
/**
 * Hook useSocket - CORREGIDO PARA CONEXIÓN ESTABLE
 *
 * CAMBIOS IMPLEMENTADOS:
 * - Mejor manejo de autenticación con tokens
 * - Configuración de reconexión mejorada
 * - URL corregida para coincidir con el backend
 * - Manejo robusto de errores de conexión
 * - Logging detallado para debugging
 *
 * Ubicación: frontend/src/components/Chat/Hooks/useSocket.jsx
 */
export const useSocket = () => {
    // ============ CONTEXTO Y REFERENCIAS ============
   
    const { user, isAuthenticated, getBestAvailableToken } = useAuth();
    const socketRef = useRef(null);
   
    // ============ ESTADOS DE CONEXIÓN ============
   
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState(null);
    const [isConnecting, setIsConnecting] = useState(false);
 
    // ============ FUNCIONES DE AUTENTICACIÓN CORREGIDAS ============
   
    /**
     * ✅ CORRECCIÓN: Obtiene el token de autenticación de múltiples fuentes
     */
    const getAuthToken = useCallback(() => {
        try {
            // 1. Intentar usar función del contexto de auth (preferido)
            if (getBestAvailableToken) {
                const contextToken = getBestAvailableToken();
                if (contextToken) {
                    console.log('✅ Token obtenido del contexto de auth');
                    return contextToken;
                }
            }
           
            // 2. Fallback: intentar cookies directamente
            const cookies = document.cookie.split(';');
            for (let cookie of cookies) {
                const [name, value] = cookie.trim().split('=');
                if (name === 'authToken' && value && value !== 'undefined' && value !== 'null') {
                    console.log('✅ Token obtenido de cookies como fallback');
                    return value;
                }
            }
           
            console.log('❌ No se encontró token de autenticación');
            return null;
        } catch (error) {
            console.error('❌ Error obteniendo token:', error);
            return null;
        }
    }, [getBestAvailableToken]);
 
    // ============ FUNCIONES DE CONEXIÓN CORREGIDAS ============
   
    /**
     * ✅ CORRECCIÓN CRÍTICA: Establece la conexión con el servidor Socket.IO
     */
    const connectSocket = useCallback(() => {
        console.log('🔄 === INICIO connectSocket ===');
       
        if (isConnecting) {
            console.log('⚠️ Ya hay una conexión en proceso, saltando...');
            return;
        }
       
        if (!isAuthenticated || !user) {
            console.log('❌ Usuario no autenticado, cancelando conexión');
            setConnectionError('Usuario no autenticado');
            return;
        }
 
        if (socketRef.current?.connected) {
            console.log('✅ Socket ya conectado, saltando conexión');
            setIsConnected(true);
            return;
        }
 
        const token = getAuthToken();
        if (!token) {
            console.log('❌ No hay token de autenticación disponible');
            setConnectionError('No hay token de autenticación');
            return;
        }
 
        try {
            setIsConnecting(true);
            setConnectionError(null);
           
            console.log('🚀 Creando nueva conexión Socket.IO...');
            console.log('🔍 Datos de conexión:', {
                serverUrl: 'https://marquesa.onrender.com',
                userId: user.id,
                userType: user.userType,
                hasToken: !!token
            });
           
            // ✅ CORRECCIÓN CRÍTICA: URL y configuración corregidas
            socketRef.current = io('https://marquesa.onrender.com', {
                auth: {
                    token: token,
                    userId: user.id,
                    userType: user.userType
                },
                withCredentials: true,
                // ✅ CONFIGURACIÓN DE RECONEXIÓN MEJORADA
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                timeout: 20000,
                transports: ['websocket', 'polling'],
                // ✅ NUEVAS CONFIGURACIONES PARA ESTABILIDAD
                forceNew: false,
                autoConnect: true,
                upgrade: true,
                // ✅ CONFIGURACIONES ADICIONALES PARA CROSS-DOMAIN
                query: {
                    userType: user.userType,
                    userId: user.id
                }
            });
 
            setupConnectionEvents();
 
        } catch (error) {
            console.error('❌ Error creando socket:', error);
            setConnectionError(`Error creando socket: ${error.message}`);
            setIsConnected(false);
            setIsConnecting(false);
        }
    }, [isAuthenticated, user, getAuthToken, isConnecting]);
 
    /**
     * ✅ CORRECCIÓN: Configura todos los eventos de conexión Socket.IO
     */
    const setupConnectionEvents = useCallback(() => {
        if (!socketRef.current) {
            console.log('❌ No hay socket para configurar eventos');
            return;
        }
 
        console.log('⚙️ Configurando eventos de conexión Socket.IO...');
 
        // ✅ LIMPIAR LISTENERS PREVIOS
        socketRef.current.removeAllListeners();
 
        // ---- EVENTO: Conexión exitosa ----
        socketRef.current.on('connect', () => {
            console.log('✅ Socket.IO conectado exitosamente:', socketRef.current.id);
            setIsConnected(true);
            setConnectionError(null);
            setIsConnecting(false);
        });
 
        // ---- EVENTO: Confirmación del servidor ----
        socketRef.current.on('connected', (data) => {
            console.log('🎯 Confirmación recibida del servidor:', data);
            setIsConnected(true);
            setConnectionError(null);
            setIsConnecting(false);
        });
 
        // ---- EVENTO: Desconexión ----
        socketRef.current.on('disconnect', (reason) => {
            console.log('❌ Socket.IO desconectado:', reason);
            setIsConnected(false);
            setIsConnecting(false);
           
            // ✅ CORRECCIÓN: Solo mostrar error si no es desconexión intencional
            if (reason !== 'io client disconnect' && reason !== 'transport close') {
                setConnectionError(`Desconectado: ${reason}`);
                console.log('🔄 Intentando reconectar automáticamente...');
            }
        });
 
        // ---- EVENTO: Error de conexión ----
        socketRef.current.on('connect_error', (error) => {
            console.error('❌ Error de conexión Socket.IO:', error);
            setConnectionError(`Error de conexión: ${error.message || 'Error desconocido'}`);
            setIsConnected(false);
            setIsConnecting(false);
        });
 
        // ---- EVENTO: Error de autenticación ----
        socketRef.current.on('unauthorized', (error) => {
            console.error('❌ Error de autenticación Socket.IO:', error);
            setConnectionError('Error de autenticación: Token inválido o expirado');
            setIsConnected(false);
            setIsConnecting(false);
        });
 
        // ---- EVENTO: Error general del socket ----
        socketRef.current.on('error', (error) => {
            console.error('❌ Error en socket:', error);
            setConnectionError(`Error en socket: ${error.message || error}`);
            setIsConnected(false);
            setIsConnecting(false);
        });
 
        // ✅ CORRECCIÓN: Evento de reconexión exitosa
        socketRef.current.on('reconnect', (attemptNumber) => {
            console.log(`✅ Reconectado exitosamente después de ${attemptNumber} intentos`);
            setIsConnected(true);
            setConnectionError(null);
            setIsConnecting(false);
        });
 
        // ✅ CORRECCIÓN: Evento de intento de reconexión
        socketRef.current.on('reconnect_attempt', (attemptNumber) => {
            console.log(`🔄 Intento de reconexión #${attemptNumber}`);
            setConnectionError(`Reconectando... Intento ${attemptNumber}/5`);
            setIsConnecting(true);
        });
 
        // ✅ CORRECCIÓN: Evento de fallo de reconexión
        socketRef.current.on('reconnect_failed', () => {
            console.error('❌ Falló la reconexión después de todos los intentos');
            setConnectionError('No se pudo reconectar. Verifica tu conexión a internet.');
            setIsConnected(false);
            setIsConnecting(false);
        });
 
        console.log('✅ Eventos de conexión configurados correctamente');
 
    }, []);
 
    /**
     * ✅ CORRECCIÓN: Desconecta el socket y limpia referencias
     */
    const disconnectSocket = useCallback(() => {
        console.log('🔌 Desconectando Socket.IO...');
       
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
            setIsConnected(false);
            setConnectionError(null);
            setIsConnecting(false);
            console.log('✅ Socket desconectado correctamente');
        }
    }, []);
 
    // ============ EFECTOS DE CICLO DE VIDA CORREGIDOS ============
   
    useEffect(() => {
        console.log('🔄 Efecto useSocket - Estado de autenticación cambió:', {
            isAuthenticated,
            hasUser: !!user,
            userId: user?.id,
            userType: user?.userType
        });
 
        if (isAuthenticated && user && user.id && user.userType) {
            console.log('👤 Usuario autenticado completo, conectando Socket.IO...');
            // ✅ PEQUEÑO DELAY para asegurar que el token esté disponible
            setTimeout(() => {
                connectSocket();
            }, 1000);
        } else {
            console.log('👤 Usuario no autenticado o incompleto, desconectando Socket.IO...');
            disconnectSocket();
        }
 
        return () => {
            console.log('🧹 Cleanup del efecto useSocket...');
            // No desconectar automáticamente en cleanup para evitar reconexiones innecesarias
        };
    }, [isAuthenticated, user?.id, user?.userType, connectSocket, disconnectSocket]);
 
    // ============ FUNCIONES PARA EVENTOS DEL CHAT ============
   
    /**
     * ✅ Une al usuario a una conversación específica
     */
    const joinConversation = useCallback((conversationId) => {
        if (socketRef.current?.connected && conversationId) {
            console.log('🚪 Uniéndose a conversación:', conversationId);
            socketRef.current.emit('join_conversation', conversationId);
        } else {
            console.log('❌ No se puede unir a conversación: socket no conectado o ID inválido');
        }
    }, []);
 
    /**
     * ✅ Saca al usuario de una conversación específica
     */
    const leaveConversation = useCallback((conversationId) => {
        if (socketRef.current?.connected && conversationId) {
            console.log('🚪 Saliendo de conversación:', conversationId);
            socketRef.current.emit('leave_conversation', conversationId);
        }
    }, []);
 
    /**
     * ✅ Indica que el usuario está escribiendo
     */
    const startTyping = useCallback((conversationId) => {
        if (socketRef.current?.connected && conversationId) {
            socketRef.current.emit('typing_start', conversationId);
        }
    }, []);
 
    /**
     * ✅ Indica que el usuario dejó de escribir
     */
    const stopTyping = useCallback((conversationId) => {
        if (socketRef.current?.connected && conversationId) {
            socketRef.current.emit('typing_stop', conversationId);
        }
    }, []);
 
    // ============ EVENTOS ESPECÍFICOS MANTENIDOS (5 eventos) ============
   
    /**
     * ✅ EVENTO 1/6: Suscribe a eventos de nuevos mensajes
     */
    const onNewMessage = useCallback((callback) => {
        if (socketRef.current) {
            console.log('📨 Suscribiéndose a eventos de nuevos mensajes');
            socketRef.current.on('new_message', (data) => {
                console.log('📨 Nuevo mensaje recibido via Socket.IO:', {
                    conversationId: data.conversationId,
                    hasImage: data.message?.media?.type === 'image',
                    timestamp: data.timestamp
                });
                callback(data);
            });
           
            return () => {
                if (socketRef.current) {
                    console.log('🧹 Removiendo listener de nuevos mensajes');
                    socketRef.current.off('new_message', callback);
                }
            };
        }
        return () => {};
    }, []);
 
    /**
     * ✅ EVENTO 2/6: Suscribe a eventos de mensajes eliminados (físicamente)
     */
    const onMessageDeleted = useCallback((callback) => {
        if (socketRef.current) {
            console.log('🗑️ Suscribiéndose a eventos de mensajes eliminados');
            socketRef.current.on('message_deleted', (data) => {
                console.log('🗑️ Mensaje eliminado via Socket.IO:', {
                    messageId: data.messageId,
                    conversationId: data.conversationId,
                    deletionType: data.deletionType,
                    timestamp: data.timestamp
                });
                callback(data);
            });
           
            return () => {
                if (socketRef.current) {
                    console.log('🧹 Removiendo listener de mensajes eliminados');
                    socketRef.current.off('message_deleted', callback);
                }
            };
        }
        return () => {};
    }, []);
 
    /**
     * ✅ EVENTO 3/6: Suscribe a eventos de mensajes leídos
     */
    const onMessagesRead = useCallback((callback) => {
        if (socketRef.current) {
            console.log('👁️ Suscribiéndose a eventos de mensajes leídos');
            socketRef.current.on('messages_read', callback);
           
            return () => {
                if (socketRef.current) {
                    console.log('🧹 Removiendo listener de mensajes leídos');
                    socketRef.current.off('messages_read', callback);
                }
            };
        }
        return () => {};
    }, []);
 
    /**
     * ✅ EVENTO 4/6: Suscribe a eventos de estadísticas del chat
     */
    const onChatStatsUpdated = useCallback((callback) => {
        if (socketRef.current) {
            console.log('📊 Suscribiéndose a eventos de estadísticas del chat');
            socketRef.current.on('chat_stats_updated', callback);
           
            return () => {
                if (socketRef.current) {
                    console.log('🧹 Removiendo listener de estadísticas del chat');
                    socketRef.current.off('chat_stats_updated', callback);
                }
            };
        }
        return () => {};
    }, []);
 
    /**
     * ✅ EVENTO 5/6: Suscribe a eventos de límite aplicado
     */
    const onLimitApplied = useCallback((callback) => {
        if (socketRef.current) {
            console.log('⚠️ Suscribiéndose a eventos de límite aplicado');
            socketRef.current.on('limit_applied', (data) => {
                console.log('⚠️ Límite aplicado via Socket.IO:', {
                    conversationId: data.conversationId,
                    deletedCount: data.deletedCount,
                    deletedFiles: data.deletedFiles,
                    deletionType: data.deletionType,
                    timestamp: data.timestamp
                });
                callback(data);
            });
           
            return () => {
                if (socketRef.current) {
                    console.log('🧹 Removiendo listener de límite aplicado');
                    socketRef.current.off('limit_applied', callback);
                }
            };
        }
        return () => {};
    }, []);
 
    // ============ EVENTO UNIFICADO (3→1) ============
 
    /**
     * ✅ EVENTO 6/6: conversation_updated - UNIFICA 3 EVENTOS ANTERIORES
     */
    const onConversationUpdated = useCallback((callback) => {
        if (socketRef.current) {
            console.log('💬 Suscribiéndose a eventos de conversaciones actualizadas (unificado)');
            socketRef.current.on('conversation_updated', (data) => {
                console.log('💬 Conversación actualizada via Socket.IO:', {
                    conversationId: data.conversationId,
                    action: data.action,
                    timestamp: data.timestamp
                });
               
                // Procesar según el tipo de acción
                switch (data.action) {
                    case 'created':
                        console.log('✨ Nueva conversación creada:', data.conversationId);
                        break;
                    case 'updated':
                        console.log('🔄 Conversación actualizada:', data.conversationId);
                        break;
                    case 'list_updated':
                        console.log('📋 Lista de conversaciones actualizada');
                        break;
                    default:
                        console.log('🔄 Conversación actualizada (acción genérica):', data.conversationId);
                }
               
                callback(data);
            });
           
            return () => {
                if (socketRef.current) {
                    console.log('🧹 Removiendo listener de conversaciones actualizadas');
                    socketRef.current.off('conversation_updated', callback);
                }
            };
        }
        return () => {};
    }, []);
 
    /**
     * ✅ Suscribe a eventos de conversaciones cerradas
     */
    const onConversationClosed = useCallback((callback) => {
        if (socketRef.current) {
            console.log('🔒 Suscribiéndose a eventos de conversaciones cerradas');
            socketRef.current.on('conversation_closed', callback);
           
            return () => {
                if (socketRef.current) {
                    console.log('🧹 Removiendo listener de conversaciones cerradas');
                    socketRef.current.off('conversation_closed', callback);
                }
            };
        }
        return () => {};
    }, []);
 
    /**
     * ✅ Suscribe a eventos de indicadores de escritura
     */
    const onUserTyping = useCallback((callback) => {
        if (socketRef.current) {
            console.log('⌨️ Suscribiéndose a eventos de escritura');
            socketRef.current.on('user_typing', callback);
           
            return () => {
                if (socketRef.current) {
                    console.log('🧹 Removiendo listener de escritura');
                    socketRef.current.off('user_typing', callback);
                }
            };
        }
        return () => {};
    }, []);
 
    /**
     * ✅ Suscribe a eventos de usuarios uniéndose a conversaciones
     */
    const onUserJoinedConversation = useCallback((callback) => {
        if (socketRef.current) {
            console.log('👥 Suscribiéndose a eventos de usuarios uniéndose');
            socketRef.current.on('user_joined_conversation', callback);
           
            return () => {
                if (socketRef.current) {
                    console.log('🧹 Removiendo listener de usuarios uniéndose');
                    socketRef.current.off('user_joined_conversation', callback);
                }
            };
        }
        return () => {};
    }, []);
 
    /**
     * ✅ Suscribe a eventos de usuarios saliendo de conversaciones
     */
    const onUserLeftConversation = useCallback((callback) => {
        if (socketRef.current) {
            console.log('👥 Suscribiéndose a eventos de usuarios saliendo');
            socketRef.current.on('user_left_conversation', callback);
           
            return () => {
                if (socketRef.current) {
                    console.log('🧹 Removiendo listener de usuarios saliendo');
                    socketRef.current.off('user_left_conversation', callback);
                }
            };
        }
        return () => {};
    }, []);
 
    // ============ FUNCIONES DE UTILIDAD ============
   
    /**
     * ✅ Limpia el error de conexión actual
     */
    const clearConnectionError = useCallback(() => {
        setConnectionError(null);
    }, []);
 
    /**
     * ✅ Fuerza una reconexión
     */
    const reconnect = useCallback(() => {
        console.log('🔄 Forzando reconexión...');
        disconnectSocket();
        setTimeout(() => {
            connectSocket();
        }, 1000);
    }, [disconnectSocket, connectSocket]);
 
    // ============ RETORNO DEL HOOK CORREGIDO ============
   
    return {
        // ---- Estado de la conexión ----
        socket: socketRef.current,
        isConnected,
        connectionError,
        isConnecting,
       
        // ---- Acciones de conexión ----
        connectSocket,
        disconnectSocket,
        reconnect,
        clearConnectionError,
       
        // ---- Acciones del chat ----
        joinConversation,
        leaveConversation,
        startTyping,
        stopTyping,
       
        // ---- Eventos específicos mantenidos (5 eventos) ----
        onNewMessage,
        onMessageDeleted,
        onMessagesRead,
        onChatStatsUpdated,
        onLimitApplied,
       
        // ---- Evento unificado (3→1) ----
        onConversationUpdated,
       
        // ---- Otros eventos útiles ----
        onConversationClosed,
        onUserTyping,
        onUserJoinedConversation,
        onUserLeftConversation
    };
};