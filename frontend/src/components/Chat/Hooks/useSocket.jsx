import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../../../context/AuthContext';

export const useSocket = () => {
    const { user, isAuthenticated } = useAuth();
    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState(null);

    // Función para obtener token de autenticación de las cookies
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

    // Conectar a Socket.IO
    const connectSocket = useCallback(() => {
        // Validar prerrequisitos
        if (!isAuthenticated || !user) {
            return;
        }

        // Evitar múltiples conexiones
        if (socketRef.current?.connected) {
            return;
        }

        // Verificar token de autenticación
        const token = getAuthToken();
        if (!token) {
            setConnectionError('No hay token de autenticación');
            return;
        }

        try {
            // Crear nueva conexión Socket.IO
            socketRef.current = io('http://localhost:4000', {
                auth: {
                    token: token
                },
                withCredentials: true,
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                timeout: 20000,
                transports: ['websocket', 'polling']
            });

            // Configurar eventos de conexión
            setupConnectionEvents();

        } catch (error) {
            console.error('Error creando socket:', error);
            setConnectionError(`Error creando socket: ${error.message}`);
        }
    }, [isAuthenticated, user, getAuthToken]);

    // Configurar eventos de conexión Socket.IO
    const setupConnectionEvents = useCallback(() => {
        if (!socketRef.current) return;

        // Evento: Conexión exitosa
        socketRef.current.on('connect', () => {
            setIsConnected(true);
            setConnectionError(null);
        });

        // Evento: Confirmación del servidor
        socketRef.current.on('connected', (data) => {
            // Confirmación recibida del servidor
        });

        // Evento: Desconexión
        socketRef.current.on('disconnect', (reason) => {
            setIsConnected(false);
            
            // Solo mostrar error si no es desconexión intencional
            if (reason !== 'io client disconnect') {
                setConnectionError('Conexión perdida');
            }
        });

        // Evento: Error de conexión
        socketRef.current.on('connect_error', (error) => {
            console.error('Error de conexión Socket.IO:', error);
            setConnectionError(`Error de conexión: ${error.message}`);
            setIsConnected(false);
        });

        // Evento: Error general del socket
        socketRef.current.on('error', (error) => {
            console.error('Error en socket:', error);
            setConnectionError(`Error en socket: ${error.message || error}`);
        });

        // Evento: Error de autenticación
        socketRef.current.on('connect_error', (error) => {
            if (error.message.includes('Token')) {
                setConnectionError('Error de autenticación');
            }
        });

    }, []);

    // Desconectar Socket.IO
    const disconnectSocket = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
            setIsConnected(false);
            setConnectionError(null);
        }
    }, []);

    // Efecto para manejar conexión/desconexión automática
    useEffect(() => {
        if (isAuthenticated && user) {
            connectSocket();
        } else {
            disconnectSocket();
        }

        // Cleanup al desmontar el componente
        return () => {
            disconnectSocket();
        };
    }, [isAuthenticated, user?.id, connectSocket, disconnectSocket]);

    // === FUNCIONES PARA EVENTOS DEL CHAT ===

    // Unirse a una conversación específica
    const joinConversation = useCallback((conversationId) => {
        if (socketRef.current?.connected && conversationId) {
            socketRef.current.emit('join_conversation', conversationId);
        }
    }, []);

    // Salir de una conversación
    const leaveConversation = useCallback((conversationId) => {
        if (socketRef.current?.connected && conversationId) {
            socketRef.current.emit('leave_conversation', conversationId);
        }
    }, []);

    // Indicar que el usuario está escribiendo
    const startTyping = useCallback((conversationId) => {
        if (socketRef.current?.connected && conversationId) {
            socketRef.current.emit('typing_start', conversationId);
        }
    }, []);

    // Indicar que el usuario dejó de escribir
    const stopTyping = useCallback((conversationId) => {
        if (socketRef.current?.connected && conversationId) {
            socketRef.current.emit('typing_stop', conversationId);
        }
    }, []);

    // === FUNCIONES PARA SUSCRIBIRSE A EVENTOS ===

    // Escuchar nuevos mensajes
    const onNewMessage = useCallback((callback) => {
        if (socketRef.current) {
            socketRef.current.on('new_message', callback);
            // Retornar función de cleanup
            return () => {
                if (socketRef.current) {
                    socketRef.current.off('new_message', callback);
                }
            };
        }
        return () => {}; // Función vacía si no hay socket
    }, []);

    // Escuchar mensajes eliminados
    const onMessageDeleted = useCallback((callback) => {
        if (socketRef.current) {
            socketRef.current.on('message_deleted', callback);
            return () => {
                if (socketRef.current) {
                    socketRef.current.off('message_deleted', callback);
                }
            };
        }
        return () => {};
    }, []);

    // Escuchar actualizaciones de conversaciones
    const onConversationUpdated = useCallback((callback) => {
        if (socketRef.current) {
            socketRef.current.on('conversation_updated', callback);
            return () => {
                if (socketRef.current) {
                    socketRef.current.off('conversation_updated', callback);
                }
            };
        }
        return () => {};
    }, []);

    // Escuchar cuando una conversación es cerrada
    const onConversationClosed = useCallback((callback) => {
        if (socketRef.current) {
            socketRef.current.on('conversation_closed', callback);
            return () => {
                if (socketRef.current) {
                    socketRef.current.off('conversation_closed', callback);
                }
            };
        }
        return () => {};
    }, []);

    // Escuchar cuando mensajes son marcados como leídos
    const onMessagesRead = useCallback((callback) => {
        if (socketRef.current) {
            socketRef.current.on('messages_read', callback);
            return () => {
                if (socketRef.current) {
                    socketRef.current.off('messages_read', callback);
                }
            };
        }
        return () => {};
    }, []);

    // Escuchar indicadores de escritura
    const onUserTyping = useCallback((callback) => {
        if (socketRef.current) {
            socketRef.current.on('user_typing', callback);
            return () => {
                if (socketRef.current) {
                    socketRef.current.off('user_typing', callback);
                }
            };
        }
        return () => {};
    }, []);

    // Escuchar actualizaciones de estadísticas (solo admin)
    const onChatStatsUpdated = useCallback((callback) => {
        if (socketRef.current) {
            socketRef.current.on('chat_stats_updated', callback);
            return () => {
                if (socketRef.current) {
                    socketRef.current.off('chat_stats_updated', callback);
                }
            };
        }
        return () => {};
    }, []);

    // Escuchar cuando un usuario se une a la conversación
    const onUserJoinedConversation = useCallback((callback) => {
        if (socketRef.current) {
            socketRef.current.on('user_joined_conversation', callback);
            return () => {
                if (socketRef.current) {
                    socketRef.current.off('user_joined_conversation', callback);
                }
            };
        }
        return () => {};
    }, []);

    // Escuchar cuando un usuario sale de la conversación
    const onUserLeftConversation = useCallback((callback) => {
        if (socketRef.current) {
            socketRef.current.on('user_left_conversation', callback);
            return () => {
                if (socketRef.current) {
                    socketRef.current.off('user_left_conversation', callback);
                }
            };
        }
        return () => {};
    }, []);

    // Función para limpiar error de conexión
    const clearConnectionError = useCallback(() => {
        setConnectionError(null);
    }, []);

    // Función para reconectar manualmente
    const reconnect = useCallback(() => {
        disconnectSocket();
        setTimeout(() => {
            connectSocket();
        }, 1000);
    }, [disconnectSocket, connectSocket]);

    return {
        // Estado de la conexión
        socket: socketRef.current,
        isConnected,
        connectionError,
        
        // Acciones de conexión
        connectSocket,
        disconnectSocket,
        reconnect,
        clearConnectionError,
        
        // Acciones del chat
        joinConversation,
        leaveConversation,
        startTyping,
        stopTyping,
        
        // Suscripciones a eventos
        onNewMessage,
        onMessageDeleted,
        onConversationUpdated,
        onConversationClosed,
        onMessagesRead,
        onUserTyping,
        onChatStatsUpdated,
        onUserJoinedConversation,
        onUserLeftConversation
    };
};