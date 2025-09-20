import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../../../context/AuthContext';

/**
 * Hook useSocket - CORRECCIÓN CRÍTICA PARA PRIMER MENSAJE
 *
 * CAMBIOS IMPLEMENTADOS:
 * - Conexión diferida hasta que token esté completamente disponible
 * - Verificación de token antes de cada intento de conexión
 * - Delay de seguridad para sincronización
 * - Estado de "realmente conectado" para el chat
 *
 * Ubicación: frontend/src/components/Chat/Hooks/useSocket.jsx
 */
export const useSocket = () => {
    // ============ CONTEXTO Y REFERENCIAS ============
    
    const { user, isAuthenticated, getBestAvailableToken } = useAuth();
    const socketRef = useRef(null);
    
    // ============ ESTADOS DE CONEXIÓN MEJORADOS ============
    
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState(null);
    const [isConnecting, setIsConnecting] = useState(false);
    // ✅ NUEVO: Estado para indicar que Socket.IO está REALMENTE listo para el chat
    const [isSocketReady, setIsSocketReady] = useState(false);
    
    // ✅ REFERENCIAS MEJORADAS: Para evitar múltiples conexiones
    const connectionAttemptRef = useRef(false);
    const lastConnectionAttemptRef = useRef(0);
    const readinessTimeoutRef = useRef(null);

    // ============ FUNCIONES DE AUTENTICACIÓN CORREGIDAS ============
    
    /**
     * ✅ CORRECCIÓN: Obtiene el token con verificación completa
     */
    const getAuthToken = useCallback(() => {
        try {
            // 1. Usar función del contexto (preferido)
            if (getBestAvailableToken) {
                const contextToken = getBestAvailableToken();
                if (contextToken && contextToken.trim() !== '' && contextToken !== 'undefined' && contextToken !== 'null') {
                    console.log('✅ Token válido obtenido del contexto');
                    return contextToken;
                }
            }
            
            // 2. Fallback: verificar cookies directamente
            if (typeof document !== 'undefined') {
                const cookies = document.cookie.split(';');
                for (let cookie of cookies) {
                    const [name, value] = cookie.trim().split('=');
                    if (name === 'authToken' && value && value !== 'undefined' && value !== 'null' && value.trim() !== '') {
                        console.log('✅ Token válido encontrado en cookies como fallback');
                        return value.trim();
                    }
                }
            }
            
            console.log('❌ No se encontró token válido en ninguna fuente');
            return null;
        } catch (error) {
            console.error('❌ Error obteniendo token:', error);
            return null;
        }
    }, [getBestAvailableToken]);

    // ============ FUNCIONES DE CONEXIÓN CORREGIDAS ============
    
    /**
     * ✅ CORRECCIÓN CRÍTICA: Establece conexión solo cuando TODO esté listo
     */
    const connectSocket = useCallback(() => {
        console.log('🔄 === INICIO connectSocket MEJORADO ===');
        
        // ✅ PREVENIR MÚLTIPLES CONEXIONES SIMULTÁNEAS
        const now = Date.now();
        if (connectionAttemptRef.current || (now - lastConnectionAttemptRef.current < 3000)) {
            console.log('⚠️ Conexión en proceso o muy reciente, esperando...');
            return;
        }
        
        // ✅ VERIFICACIONES CRÍTICAS ANTES DE CONECTAR
        if (!isAuthenticated || !user) {
            console.log('❌ Usuario no autenticado, cancelando conexión');
            setConnectionError('Usuario no autenticado');
            setIsSocketReady(false);
            return;
        }

        if (socketRef.current?.connected) {
            console.log('✅ Socket ya conectado, marcando como listo');
            setIsConnected(true);
            setIsSocketReady(true);
            return;
        }

        // ✅ VERIFICACIÓN CRÍTICA: Token debe estar disponible
        const token = getAuthToken();
        if (!token) {
            console.log('❌ No hay token válido disponible, NO conectando Socket.IO');
            setConnectionError('Token de autenticación no disponible');
            setIsSocketReady(false);
            return;
        }

        try {
            connectionAttemptRef.current = true;
            lastConnectionAttemptRef.current = now;
            setIsConnecting(true);
            setConnectionError(null);
            setIsSocketReady(false);
            
            console.log('🚀 Creando conexión Socket.IO con token verificado...');
            console.log('🔍 Datos de conexión:', {
                serverUrl: 'https://marquesa.onrender.com',
                userId: user.id,
                userType: user.userType,
                tokenLength: token.length
            });
            
            // ✅ CONFIGURACIÓN OPTIMIZADA
            socketRef.current = io('https://marquesa.onrender.com', {
                auth: {
                    token: token,
                    userId: user.id,
                    userType: user.userType
                },
                withCredentials: true,
                reconnection: true,
                reconnectionAttempts: 3,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 3000,
                timeout: 15000,
                transports: ['websocket'],
                forceNew: false,
                autoConnect: true,
                upgrade: false,
                query: {
                    userType: user.userType,
                    userId: user.id,
                    timestamp: Date.now()
                }
            });

            setupConnectionEvents();

        } catch (error) {
            console.error('❌ Error creando socket:', error);
            setConnectionError(`Error creando socket: ${error.message}`);
            setIsConnected(false);
            setIsConnecting(false);
            setIsSocketReady(false);
            connectionAttemptRef.current = false;
        }
    }, [isAuthenticated, user, getAuthToken]);

    /**
     * ✅ CORRECCIÓN: Configura eventos con marcador de "realmente listo"
     */
    const setupConnectionEvents = useCallback(() => {
        if (!socketRef.current) {
            console.log('❌ No hay socket para configurar eventos');
            return;
        }

        console.log('⚙️ Configurando eventos Socket.IO mejorados...');

        // ✅ LIMPIAR LISTENERS PREVIOS
        socketRef.current.removeAllListeners();

        // ---- EVENTO: Conexión exitosa ----
        socketRef.current.on('connect', () => {
            console.log('✅ Socket.IO conectado:', socketRef.current.id);
            setIsConnected(true);
            setConnectionError(null);
            setIsConnecting(false);
            connectionAttemptRef.current = false;
            
            // ✅ DELAY CRÍTICO: Asegurar que Socket.IO esté REALMENTE listo
            if (readinessTimeoutRef.current) {
                clearTimeout(readinessTimeoutRef.current);
            }
            
            readinessTimeoutRef.current = setTimeout(() => {
                console.log('🎯 Socket.IO REALMENTE LISTO para chat');
                setIsSocketReady(true);
            }, 1000); // 1 segundo para asegurar estabilidad
        });

        // ---- EVENTO: Confirmación del servidor ----
        socketRef.current.on('connected', (data) => {
            console.log('🎯 Confirmación del servidor recibida:', data);
            setIsConnected(true);
            setConnectionError(null);
            setIsConnecting(false);
            connectionAttemptRef.current = false;
            
            // ✅ Marcar como listo inmediatamente si el servidor confirma
            setIsSocketReady(true);
            if (readinessTimeoutRef.current) {
                clearTimeout(readinessTimeoutRef.current);
            }
        });

        // ---- EVENTO: Desconexión ----
        socketRef.current.on('disconnect', (reason) => {
            console.log('❌ Socket.IO desconectado:', reason);
            setIsConnected(false);
            setIsConnecting(false);
            setIsSocketReady(false); // ✅ CRÍTICO: No está listo si se desconecta
            connectionAttemptRef.current = false;
            
            if (readinessTimeoutRef.current) {
                clearTimeout(readinessTimeoutRef.current);
            }
            
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
            setIsSocketReady(false);
            connectionAttemptRef.current = false;
            
            if (readinessTimeoutRef.current) {
                clearTimeout(readinessTimeoutRef.current);
            }
        });

        // ---- EVENTO: Error de autenticación ----
        socketRef.current.on('unauthorized', (error) => {
            console.error('❌ Error de autenticación Socket.IO:', error);
            setConnectionError('Error de autenticación: Token inválido o expirado');
            setIsConnected(false);
            setIsConnecting(false);
            setIsSocketReady(false);
            connectionAttemptRef.current = false;
            
            if (readinessTimeoutRef.current) {
                clearTimeout(readinessTimeoutRef.current);
            }
        });

        // ---- EVENTO: Reconexión exitosa ----
        socketRef.current.on('reconnect', (attemptNumber) => {
            console.log(`✅ Reconectado exitosamente después de ${attemptNumber} intentos`);
            setIsConnected(true);
            setConnectionError(null);
            setIsConnecting(false);
            connectionAttemptRef.current = false;
            
            // ✅ Dar tiempo para estabilizar después de reconexión
            if (readinessTimeoutRef.current) {
                clearTimeout(readinessTimeoutRef.current);
            }
            
            readinessTimeoutRef.current = setTimeout(() => {
                console.log('🎯 Socket.IO REALMENTE LISTO después de reconexión');
                setIsSocketReady(true);
            }, 1500);
        });

        console.log('✅ Eventos de conexión configurados con estado de readiness');

    }, []);

    /**
     * ✅ CORRECCIÓN: Desconecta y limpia completamente
     */
    const disconnectSocket = useCallback(() => {
        console.log('🔌 Desconectando Socket.IO...');
        
        connectionAttemptRef.current = false;
        setIsSocketReady(false);
        
        if (readinessTimeoutRef.current) {
            clearTimeout(readinessTimeoutRef.current);
            readinessTimeoutRef.current = null;
        }
        
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
            setIsConnected(false);
            setConnectionError(null);
            setIsConnecting(false);
            console.log('✅ Socket desconectado completamente');
        }
    }, []);

    // ============ EFECTO CRÍTICO CORREGIDO ============
    
    /**
     * ✅ CORRECCIÓN CRÍTICA: Conexión solo cuando TODO esté sincronizado
     */
    useEffect(() => {
        console.log('🔄 === EFECTO useSocket CRÍTICO ===', {
            isAuthenticated,
            hasUser: !!user,
            userId: user?.id,
            userType: user?.userType,
            socketConnected: socketRef.current?.connected,
            isSocketReady
        });

        if (isAuthenticated && user && user.id && user.userType) {
            // ✅ VERIFICACIÓN CRÍTICA: Token debe existir
            const token = getAuthToken();
            console.log('🔑 Verificación de token:', {
                hasToken: !!token,
                tokenLength: token?.length
            });
            
            if (token) {
                console.log('👤 Usuario COMPLETAMENTE autenticado con token válido');
                
                // ✅ DELAY CRÍTICO para asegurar sincronización completa
                setTimeout(() => {
                    console.log('⚡ Iniciando conexión Socket.IO después de sincronización');
                    connectSocket();
                }, 800); // Aumentado a 800ms para mayor seguridad
                
            } else {
                console.log('👤 Usuario autenticado pero token no disponible, esperando...');
                setIsSocketReady(false);
                
                // ✅ RETRY: Intentar obtener token después de un tiempo
                setTimeout(() => {
                    const retryToken = getAuthToken();
                    if (retryToken) {
                        console.log('🔄 Token encontrado en retry, conectando...');
                        connectSocket();
                    } else {
                        console.log('❌ Token aún no disponible después de retry');
                    }
                }, 2000);
            }
        } else {
            console.log('👤 Usuario no completamente autenticado, desconectando...');
            disconnectSocket();
        }

        return () => {
            if (readinessTimeoutRef.current) {
                clearTimeout(readinessTimeoutRef.current);
            }
        };
    }, [isAuthenticated, user?.id, user?.userType, connectSocket, disconnectSocket, getAuthToken]);

    // ============ FUNCIONES PARA EVENTOS DEL CHAT (SIN CAMBIOS) ============
    
    const joinConversation = useCallback((conversationId) => {
        if (socketRef.current?.connected && conversationId) {
            console.log('🚪 Uniéndose a conversación:', conversationId);
            socketRef.current.emit('join_conversation', conversationId);
        } else {
            console.log('❌ No se puede unir a conversación: socket no conectado o ID inválido');
        }
    }, []);

    const leaveConversation = useCallback((conversationId) => {
        if (socketRef.current?.connected && conversationId) {
            console.log('🚪 Saliendo de conversación:', conversationId);
            socketRef.current.emit('leave_conversation', conversationId);
        }
    }, []);

    const startTyping = useCallback((conversationId) => {
        if (socketRef.current?.connected && conversationId) {
            socketRef.current.emit('typing_start', conversationId);
        }
    }, []);

    const stopTyping = useCallback((conversationId) => {
        if (socketRef.current?.connected && conversationId) {
            socketRef.current.emit('typing_stop', conversationId);
        }
    }, []);

    // ============ EVENTOS ESPECÍFICOS (SIN CAMBIOS MAYORES) ============
    
    const onNewMessage = useCallback((callback) => {
        if (socketRef.current) {
            console.log('📨 Suscribiéndose a eventos de nuevos mensajes');
            
            const uniqueCallback = (data) => {
                console.log('📨 Nuevo mensaje recibido via Socket.IO:', {
                    conversationId: data.conversationId,
                    messageId: data.message?._id,
                    senderType: data.message?.senderType,
                    isSocketReady,
                    timestamp: data.timestamp
                });
                callback(data);
            };
            
            socketRef.current.on('new_message', uniqueCallback);
            
            return () => {
                if (socketRef.current) {
                    console.log('🧹 Removiendo listener de nuevos mensajes');
                    socketRef.current.off('new_message', uniqueCallback);
                }
            };
        }
        return () => {};
    }, [isSocketReady]);

    const onMessageDeleted = useCallback((callback) => {
        if (socketRef.current) {
            const uniqueCallback = (data) => {
                console.log('🗑️ Mensaje eliminado via Socket.IO:', {
                    messageId: data.messageId,
                    conversationId: data.conversationId
                });
                callback(data);
            };
            
            socketRef.current.on('message_deleted', uniqueCallback);
            
            return () => {
                if (socketRef.current) {
                    socketRef.current.off('message_deleted', uniqueCallback);
                }
            };
        }
        return () => {};
    }, []);

    const onMessagesRead = useCallback((callback) => {
        if (socketRef.current) {
            const uniqueCallback = (data) => {
                callback(data);
            };
            
            socketRef.current.on('messages_read', uniqueCallback);
            
            return () => {
                if (socketRef.current) {
                    socketRef.current.off('messages_read', uniqueCallback);
                }
            };
        }
        return () => {};
    }, []);

    const onChatStatsUpdated = useCallback((callback) => {
        if (socketRef.current) {
            const uniqueCallback = (data) => {
                callback(data);
            };
            
            socketRef.current.on('chat_stats_updated', uniqueCallback);
            
            return () => {
                if (socketRef.current) {
                    socketRef.current.off('chat_stats_updated', uniqueCallback);
                }
            };
        }
        return () => {};
    }, []);

    const onLimitApplied = useCallback((callback) => {
        if (socketRef.current) {
            const uniqueCallback = (data) => {
                callback(data);
            };
            
            socketRef.current.on('limit_applied', uniqueCallback);
            
            return () => {
                if (socketRef.current) {
                    socketRef.current.off('limit_applied', uniqueCallback);
                }
            };
        }
        return () => {};
    }, []);

    const onConversationUpdated = useCallback((callback) => {
        if (socketRef.current) {
            const uniqueCallback = (data) => {
                callback(data);
            };
            
            socketRef.current.on('conversation_updated', uniqueCallback);
            
            return () => {
                if (socketRef.current) {
                    socketRef.current.off('conversation_updated', uniqueCallback);
                }
            };
        }
        return () => {};
    }, []);

    const onConversationClosed = useCallback((callback) => {
        if (socketRef.current) {
            const uniqueCallback = (data) => {
                callback(data);
            };
            
            socketRef.current.on('conversation_closed', uniqueCallback);
            
            return () => {
                if (socketRef.current) {
                    socketRef.current.off('conversation_closed', uniqueCallback);
                }
            };
        }
        return () => {};
    }, []);

    const onUserTyping = useCallback((callback) => {
        if (socketRef.current) {
            const uniqueCallback = (data) => {
                if (data.isTyping) {
                    console.log('⌨️ Usuario escribiendo:', data.userId);
                }
                callback(data);
            };
            
            socketRef.current.on('user_typing', uniqueCallback);
            
            return () => {
                if (socketRef.current) {
                    socketRef.current.off('user_typing', uniqueCallback);
                }
            };
        }
        return () => {};
    }, []);

    const onUserJoinedConversation = useCallback((callback) => {
        if (socketRef.current) {
            const uniqueCallback = (data) => {
                callback(data);
            };
            
            socketRef.current.on('user_joined_conversation', uniqueCallback);
            
            return () => {
                if (socketRef.current) {
                    socketRef.current.off('user_joined_conversation', uniqueCallback);
                }
            };
        }
        return () => {};
    }, []);

    const onUserLeftConversation = useCallback((callback) => {
        if (socketRef.current) {
            const uniqueCallback = (data) => {
                callback(data);
            };
            
            socketRef.current.on('user_left_conversation', uniqueCallback);
            
            return () => {
                if (socketRef.current) {
                    socketRef.current.off('user_left_conversation', uniqueCallback);
                }
            };
        }
        return () => {};
    }, []);

    // ============ FUNCIONES DE UTILIDAD ============
    
    const clearConnectionError = useCallback(() => {
        setConnectionError(null);
    }, []);

    const reconnect = useCallback(() => {
        console.log('🔄 Forzando reconexión...');
        
        connectionAttemptRef.current = false;
        lastConnectionAttemptRef.current = 0;
        setIsSocketReady(false);
        
        disconnectSocket();
        setTimeout(() => {
            connectSocket();
        }, 1000);
    }, [disconnectSocket, connectSocket]);

    // ============ CLEANUP ============
    
    useEffect(() => {
        return () => {
            if (readinessTimeoutRef.current) {
                clearTimeout(readinessTimeoutRef.current);
            }
        };
    }, []);

    // ============ RETORNO CON NUEVO ESTADO ============
    
    return {
        // ---- Estado de la conexión ----
        socket: socketRef.current,
        isConnected,
        connectionError,
        isConnecting,
        isSocketReady, // ✅ NUEVO: Indica que Socket.IO está REALMENTE listo
        
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
        
        // ---- Eventos específicos ----
        onNewMessage,
        onMessageDeleted,
        onMessagesRead,
        onChatStatsUpdated,
        onLimitApplied,
        
        // ---- Evento unificado ----
        onConversationUpdated,
        
        // ---- Otros eventos ----
        onConversationClosed,
        onUserTyping,
        onUserJoinedConversation,
        onUserLeftConversation
    };
};