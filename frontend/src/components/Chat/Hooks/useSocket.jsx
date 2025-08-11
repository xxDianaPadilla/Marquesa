import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../../../context/AuthContext';

/**
 * Hook useSocket - ACTUALIZADO SEGÚN INFORME
 * 
 * CAMBIOS IMPLEMENTADOS:
 * - Eventos Socket.IO unificados (conversation_updated con actions)
 * - Mejor manejo de reconexión automática
 * - Eventos específicos mantenidos (5 eventos)
 * - Evento unificado conversation_updated (3→1)
 * - Solo imágenes en eventos de archivos
 * 
 * Ubicación: frontend/src/components/Chat/Hooks/useSocket.jsx
 */
export const useSocket = () => {
    // ============ CONTEXTO Y REFERENCIAS ============
    
    const { user, isAuthenticated } = useAuth();
    const socketRef = useRef(null);
    
    // ============ ESTADOS DE CONEXIÓN ============
    
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState(null);

    // ============ FUNCIONES DE AUTENTICACIÓN ============
    
    /**
     * ✅ Obtiene el token de autenticación de las cookies
     */
    const getAuthToken = useCallback(() => {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'authToken') {
                return value;
            }
        }
        return null;
    }, []);

    // ============ FUNCIONES DE CONEXIÓN ============
    
    /**
     * ✅ Establece la conexión con el servidor Socket.IO
     */
    const connectSocket = useCallback(() => {
        console.log('🔄 Intentando conectar Socket.IO...');
        
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
            console.log('🚀 Creando nueva conexión Socket.IO...');
            
            // ✅ CORRECCIÓN: Limpiar errores previos al intentar conectar
            setConnectionError(null);
            
            socketRef.current = io('https://marquesa.onrender.com', {
                auth: {
                    token: token,
                    userId: user.id,
                    userType: user.userType
                },
                withCredentials: true,
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                timeout: 20000,
                transports: ['websocket', 'polling'],
                // ✅ CORRECCIÓN: Configuraciones adicionales para mejor estabilidad
                forceNew: false,
                autoConnect: true
            });

            setupConnectionEvents();

        } catch (error) {
            console.error('❌ Error creando socket:', error);
            setConnectionError(`Error creando socket: ${error.message}`);
            setIsConnected(false);
        }
    }, [isAuthenticated, user, getAuthToken]);

    /**
     * ✅ Configura todos los eventos de conexión Socket.IO
     */
    const setupConnectionEvents = useCallback(() => {
        if (!socketRef.current) return;

        console.log('⚙️ Configurando eventos de conexión Socket.IO...');

        // ✅ CORRECCIÓN: Limpiar listeners previos para evitar duplicados
        socketRef.current.removeAllListeners();

        // ---- EVENTO: Conexión exitosa ----
        socketRef.current.on('connect', () => {
            console.log('✅ Socket.IO conectado exitosamente');
            setIsConnected(true);
            setConnectionError(null);
        });

        // ---- EVENTO: Confirmación del servidor ----
        socketRef.current.on('connected', (data) => {
            console.log('🎯 Confirmación recibida del servidor:', data);
            setIsConnected(true);
            setConnectionError(null);
        });

        // ---- EVENTO: Desconexión ----
        socketRef.current.on('disconnect', (reason) => {
            console.log('❌ Socket.IO desconectado:', reason);
            setIsConnected(false);
            
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
        });

        // ---- EVENTO: Error de autenticación ----
        socketRef.current.on('unauthorized', (error) => {
            console.error('❌ Error de autenticación Socket.IO:', error);
            setConnectionError('Error de autenticación: Token inválido o expirado');
            setIsConnected(false);
        });

        // ---- EVENTO: Error general del socket ----
        socketRef.current.on('error', (error) => {
            console.error('❌ Error en socket:', error);
            setConnectionError(`Error en socket: ${error.message || error}`);
            setIsConnected(false);
        });

        // ✅ CORRECCIÓN: Evento de reconexión exitosa
        socketRef.current.on('reconnect', (attemptNumber) => {
            console.log(`✅ Reconectado exitosamente después de ${attemptNumber} intentos`);
            setIsConnected(true);
            setConnectionError(null);
        });

        // ✅ CORRECCIÓN: Evento de intento de reconexión
        socketRef.current.on('reconnect_attempt', (attemptNumber) => {
            console.log(`🔄 Intento de reconexión #${attemptNumber}`);
            setConnectionError(`Reconectando... Intento ${attemptNumber}/5`);
        });

        // ✅ CORRECCIÓN: Evento de fallo de reconexión
        socketRef.current.on('reconnect_failed', () => {
            console.error('❌ Falló la reconexión después de todos los intentos');
            setConnectionError('No se pudo reconectar. Verifica tu conexión a internet.');
            setIsConnected(false);
        });

    }, []);

    /**
     * ✅ Desconecta el socket y limpia referencias
     */
    const disconnectSocket = useCallback(() => {
        console.log('🔌 Desconectando Socket.IO...');
        
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
            setIsConnected(false);
            setConnectionError(null);
            console.log('✅ Socket desconectado correctamente');
        }
    }, []);

    // ============ EFECTOS DE CICLO DE VIDA ============
    
    useEffect(() => {
        if (isAuthenticated && user) {
            console.log('👤 Usuario autenticado, conectando Socket.IO...');
            connectSocket();
        } else {
            console.log('👤 Usuario no autenticado, desconectando Socket.IO...');
            disconnectSocket();
        }

        return () => {
            console.log('🧹 Limpiando conexión Socket.IO...');
            disconnectSocket();
        };
    }, [isAuthenticated, user?.id, connectSocket, disconnectSocket]);

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
                    hasImage: data.message?.media?.type === 'image', // ✅ Solo imágenes
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
                    deletionType: data.deletionType, // ✅ Siempre será 'physical'
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
                    deletionType: data.deletionType, // ✅ Siempre será 'physical'
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
     * 
     * ANTES (3 eventos separados):
     * - conversation_updated
     * - conversation_list_updated  
     * - new_conversation_created
     * 
     * DESPUÉS (1 evento unificado con actions):
     */
    const onConversationUpdated = useCallback((callback) => {
        if (socketRef.current) {
            console.log('💬 Suscribiéndose a eventos de conversaciones actualizadas (unificado)');
            socketRef.current.on('conversation_updated', (data) => {
                console.log('💬 Conversación actualizada via Socket.IO:', {
                    conversationId: data.conversationId,
                    action: data.action, // ✅ 'created' | 'updated' | 'list_updated'
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

    // ============ EVENTOS ELIMINADOS SEGÚN INFORME ============
    // ❌ onConversationListUpdated - Eliminado (unificado en conversation_updated)
    // ❌ onNewConversationCreated - Eliminado (unificado en conversation_updated)

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

    // ============ RETORNO DEL HOOK ACTUALIZADO ============
    
    return {
        // ---- Estado de la conexión ----
        socket: socketRef.current,
        isConnected,
        connectionError,
        
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
        onNewMessage,                  // ✅ Nuevo mensaje recibido
        onMessageDeleted,              // ✅ Mensaje eliminado (físicamente)
        onMessagesRead,                // ✅ Mensajes marcados como leídos
        onChatStatsUpdated,            // ✅ Estadísticas actualizadas
        onLimitApplied,                // ✅ Límite de 75 mensajes aplicado
        
        // ---- Evento unificado (3→1) ----
        onConversationUpdated,         // ✅ UNIFICA: conversation_updated + conversation_list_updated + new_conversation_created
        
        // ---- Otros eventos útiles ----
        onConversationClosed,          // Conversación cerrada
        onUserTyping,                  // Indicadores de escritura
        onUserJoinedConversation,      // Usuario se unió a conversación
        onUserLeftConversation         // Usuario salió de conversación
    };
};