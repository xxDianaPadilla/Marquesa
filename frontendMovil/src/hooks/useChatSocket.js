import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

/**
 * Hook personalizado para manejar la conexión Socket.IO del chat
 * Gestiona eventos en tiempo real y mantiene la conexión sincronizada
 */
export const useChatSocket = () => {
    const { user, isAuthenticated, getBestAvailableToken } = useAuth();
    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState(null);
    const [reconnectAttempts, setReconnectAttempts] = useState(0);

    // Configuración de la conexión
    const SOCKET_URL = 'https://marquesa.onrender.com';
    const MAX_RECONNECT_ATTEMPTS = 5;

    /**
     * Inicializa la conexión Socket.IO con autenticación
     */
    const initializeSocket = useCallback(async () => {
        try {
            if (!isAuthenticated || !user?.id) {
                console.log('🔌 Usuario no autenticado, no conectando socket');
                return;
            }

            // Desconectar socket existente si existe
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }

            console.log('🔌 Inicializando conexión Socket.IO...');
            
            // Obtener token para autenticación
            const token = await getBestAvailableToken();
            if (!token) {
                console.error('❌ No hay token disponible para socket');
                setConnectionError('Token de autenticación no disponible');
                return;
            }

            // Configurar socket con autenticación
            const socket = io(SOCKET_URL, {
                auth: {
                    token: token,
                    userId: user.id,
                    userType: user.userType
                },
                transports: ['websocket', 'polling'],
                forceNew: true,
                timeout: 10000,
                reconnection: true,
                reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
                reconnectionDelay: 2000
            });

            socketRef.current = socket;

            // Event listeners para conexión
            socket.on('connect', () => {
                console.log('✅ Socket conectado:', socket.id);
                setIsConnected(true);
                setConnectionError(null);
                setReconnectAttempts(0);
            });

            socket.on('disconnect', (reason) => {
                console.log('🔌 Socket desconectado:', reason);
                setIsConnected(false);
                
                if (reason === 'io server disconnect') {
                    // El servidor desconectó, reconectar manualmente
                    setTimeout(() => {
                        if (socketRef.current) {
                            socketRef.current.connect();
                        }
                    }, 1000);
                }
            });

            socket.on('connect_error', (error) => {
                console.error('❌ Error de conexión socket:', error);
                setIsConnected(false);
                setConnectionError(error.message);
                setReconnectAttempts(prev => prev + 1);
            });

            socket.on('reconnect', (attemptNumber) => {
                console.log('🔄 Socket reconectado después de', attemptNumber, 'intentos');
                setIsConnected(true);
                setConnectionError(null);
                setReconnectAttempts(0);
            });

            socket.on('reconnect_failed', () => {
                console.error('❌ Falló la reconexión del socket');
                setConnectionError('No se pudo reconectar al servidor');
            });

            // Confirmación de conexión exitosa
            socket.on('connected', (data) => {
                console.log('✅ Confirmación del servidor:', data.message);
            });

        } catch (error) {
            console.error('❌ Error inicializando socket:', error);
            setConnectionError(error.message);
        }
    }, [isAuthenticated, user?.id, user?.userType, getBestAvailableToken]);

    /**
     * Desconecta el socket
     */
    const disconnectSocket = useCallback(() => {
        if (socketRef.current) {
            console.log('🔌 Desconectando socket...');
            socketRef.current.disconnect();
            socketRef.current = null;
            setIsConnected(false);
            setConnectionError(null);
        }
    }, []);

    /**
     * Une el usuario a una sala de conversación
     */
    const joinConversation = useCallback((conversationId) => {
        if (socketRef.current && isConnected) {
            console.log('🚪 Uniéndose a conversación:', conversationId);
            socketRef.current.emit('join_conversation', conversationId);
        }
    }, [isConnected]);

    /**
     * Sale de una sala de conversación
     */
    const leaveConversation = useCallback((conversationId) => {
        if (socketRef.current && isConnected) {
            console.log('🚪 Saliendo de conversación:', conversationId);
            socketRef.current.emit('leave_conversation', conversationId);
        }
    }, [isConnected]);

    /**
     * Emite indicador de escritura
     */
    const emitTyping = useCallback((conversationId, isTyping) => {
        if (socketRef.current && isConnected) {
            const eventName = isTyping ? 'typing_start' : 'typing_stop';
            socketRef.current.emit(eventName, conversationId);
        }
    }, [isConnected]);

    /**
     * Suscribirse a un evento específico
     */
    const subscribeToEvent = useCallback((eventName, callback) => {
        if (socketRef.current) {
            socketRef.current.on(eventName, callback);
            
            // Retornar función de cleanup
            return () => {
                if (socketRef.current) {
                    socketRef.current.off(eventName, callback);
                }
            };
        }
    }, []);

    /**
     * Desuscribirse de un evento
     */
    const unsubscribeFromEvent = useCallback((eventName, callback) => {
        if (socketRef.current) {
            socketRef.current.off(eventName, callback);
        }
    }, []);

    // Effect para manejar la conexión automática
    useEffect(() => {
        if (isAuthenticated && user?.id) {
            initializeSocket();
        } else {
            disconnectSocket();
        }

        // Cleanup al desmontar
        return () => {
            disconnectSocket();
        };
    }, [isAuthenticated, user?.id, initializeSocket, disconnectSocket]);

    // Effect para reconexión automática cuando falla
    useEffect(() => {
        if (!isConnected && isAuthenticated && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            const timeoutId = setTimeout(() => {
                console.log(`🔄 Intento de reconexión ${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS}`);
                initializeSocket();
            }, 3000 * (reconnectAttempts + 1)); // Delay incremental

            return () => clearTimeout(timeoutId);
        }
    }, [isConnected, isAuthenticated, reconnectAttempts, initializeSocket]);

    return {
        socket: socketRef.current,
        isConnected,
        connectionError,
        reconnectAttempts,
        joinConversation,
        leaveConversation,
        emitTyping,
        subscribeToEvent,
        unsubscribeFromEvent,
        initializeSocket,
        disconnectSocket
    };
};