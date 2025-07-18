import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../../../context/AuthContext';

/**
 * Hook personalizado para manejar la conexión y eventos de Socket.IO
 * Proporciona funcionalidades de chat en tiempo real como:
 * - Conexión/desconexión automática
 * - Unirse/salir de conversaciones
 * - Indicadores de escritura
 * - Listeners para eventos del chat
 * 
 * @returns {Object} Objeto con funciones y estados de Socket.IO
 */
export const useSocket = () => {
    // ============ CONTEXTO Y REFERENCIAS ============
    
    const { user, isAuthenticated } = useAuth(); // Datos del usuario autenticado
    const socketRef = useRef(null); // Referencia al socket de Socket.IO
    
    // ============ ESTADOS DE CONEXIÓN ============
    
    const [isConnected, setIsConnected] = useState(false); // Estado de conexión actual
    const [connectionError, setConnectionError] = useState(null); // Errores de conexión

    // ============ FUNCIONES DE AUTENTICACIÓN ============
    
    /**
     * Obtiene el token de autenticación de las cookies del navegador
     * El token se usa para autenticar la conexión Socket.IO
     * 
     * @returns {string|null} Token de autenticación o null si no existe
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
     * Establece la conexión con el servidor Socket.IO
     * Incluye configuración de autenticación y reintentos automáticos
     */
    const connectSocket = useCallback(() => {
        console.log('🔄 Intentando conectar Socket.IO...');
        
        // Validar prerrequisitos para la conexión
        if (!isAuthenticated || !user) {
            console.log('❌ Usuario no autenticado, cancelando conexión');
            return;
        }

        // Evitar múltiples conexiones simultáneas
        if (socketRef.current?.connected) {
            console.log('✅ Socket ya conectado, saltando conexión');
            return;
        }

        // Verificar que existe un token de autenticación
        const token = getAuthToken();
        if (!token) {
            console.log('❌ No hay token de autenticación disponible');
            setConnectionError('No hay token de autenticación');
            return;
        }

        try {
            console.log('🚀 Creando nueva conexión Socket.IO...');
            
            // Crear nueva instancia de Socket.IO con configuración completa
            socketRef.current = io('http://localhost:4000', {
                auth: {
                    token: token // Token para autenticación en el servidor
                },
                withCredentials: true, // Incluir cookies en las peticiones
                reconnection: true, // Habilitar reconexión automática
                reconnectionAttempts: 5, // Máximo 5 intentos de reconexión
                reconnectionDelay: 1000, // 1 segundo entre intentos
                timeout: 20000, // Timeout de 20 segundos para conexión
                transports: ['websocket', 'polling'] // Transportes permitidos
            });

            // Configurar eventos de conexión y manejo de errores
            setupConnectionEvents();

        } catch (error) {
            console.error('❌ Error creando socket:', error);
            setConnectionError(`Error creando socket: ${error.message}`);
        }
    }, [isAuthenticated, user, getAuthToken]);

    /**
     * Configura todos los eventos relacionados con la conexión Socket.IO
     * Maneja estados de conexión, errores y eventos del servidor
     */
    const setupConnectionEvents = useCallback(() => {
        if (!socketRef.current) return;

        console.log('⚙️ Configurando eventos de conexión Socket.IO...');

        // ---- EVENTO: Conexión exitosa ----
        socketRef.current.on('connect', () => {
            console.log('✅ Socket.IO conectado exitosamente');
            setIsConnected(true);
            setConnectionError(null);
        });

        // ---- EVENTO: Confirmación del servidor ----
        socketRef.current.on('connected', (data) => {
            console.log('🎯 Confirmación recibida del servidor:', data);
            // El servidor confirma que la autenticación fue exitosa
        });

        // ---- EVENTO: Desconexión ----
        socketRef.current.on('disconnect', (reason) => {
            console.log('❌ Socket.IO desconectado:', reason);
            setIsConnected(false);
            
            // Solo mostrar error si no es desconexión intencional del cliente
            if (reason !== 'io client disconnect') {
                setConnectionError('Conexión perdida');
                console.log('🔄 Intentando reconectar automáticamente...');
            }
        });

        // ---- EVENTO: Error de conexión ----
        socketRef.current.on('connect_error', (error) => {
            console.error('❌ Error de conexión Socket.IO:', error);
            setConnectionError(`Error de conexión: ${error.message}`);
            setIsConnected(false);
        });

        // ---- EVENTO: Error general del socket ----
        socketRef.current.on('error', (error) => {
            console.error('❌ Error en socket:', error);
            setConnectionError(`Error en socket: ${error.message || error}`);
        });

    }, []);

    /**
     * Desconecta el socket y limpia todas las referencias
     * Se usa cuando el usuario se desloguea o el componente se desmonta
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
    
    /**
     * Efecto para manejar conexión/desconexión automática basada en autenticación
     * Se ejecuta cuando cambia el estado de autenticación o los datos del usuario
     */
    useEffect(() => {
        if (isAuthenticated && user) {
            console.log('👤 Usuario autenticado, conectando Socket.IO...');
            connectSocket();
        } else {
            console.log('👤 Usuario no autenticado, desconectando Socket.IO...');
            disconnectSocket();
        }

        // Cleanup: desconectar al desmontar el componente
        return () => {
            console.log('🧹 Limpiando conexión Socket.IO...');
            disconnectSocket();
        };
    }, [isAuthenticated, user?.id, connectSocket, disconnectSocket]);

    // ============ FUNCIONES PARA EVENTOS DEL CHAT ============
    
    /**
     * Une al usuario a una conversación específica (sala de Socket.IO)
     * Permite recibir mensajes y eventos específicos de esa conversación
     * 
     * @param {string} conversationId - ID de la conversación a unirse
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
     * Saca al usuario de una conversación específica
     * Deja de recibir eventos de esa conversación
     * 
     * @param {string} conversationId - ID de la conversación a abandonar
     */
    const leaveConversation = useCallback((conversationId) => {
        if (socketRef.current?.connected && conversationId) {
            console.log('🚪 Saliendo de conversación:', conversationId);
            socketRef.current.emit('leave_conversation', conversationId);
        }
    }, []);

    /**
     * Indica al servidor que el usuario está escribiendo un mensaje
     * Activa el indicador de "escribiendo" para otros usuarios
     * 
     * @param {string} conversationId - ID de la conversación donde se escribe
     */
    const startTyping = useCallback((conversationId) => {
        if (socketRef.current?.connected && conversationId) {
            socketRef.current.emit('typing_start', conversationId);
        }
    }, []);

    /**
     * Indica al servidor que el usuario dejó de escribir
     * Desactiva el indicador de "escribiendo"
     * 
     * @param {string} conversationId - ID de la conversación donde se escribía
     */
    const stopTyping = useCallback((conversationId) => {
        if (socketRef.current?.connected && conversationId) {
            socketRef.current.emit('typing_stop', conversationId);
        }
    }, []);

    // ============ FUNCIONES PARA SUSCRIBIRSE A EVENTOS ============
    
    /**
     * Suscribe a eventos de nuevos mensajes recibidos
     * 
     * @param {Function} callback - Función a ejecutar cuando llega un nuevo mensaje
     * @returns {Function} Función de cleanup para remover el listener
     */
    const onNewMessage = useCallback((callback) => {
        if (socketRef.current) {
            console.log('📨 Suscribiéndose a eventos de nuevos mensajes');
            socketRef.current.on('new_message', callback);
            
            // Retornar función de cleanup
            return () => {
                if (socketRef.current) {
                    console.log('🧹 Removiendo listener de nuevos mensajes');
                    socketRef.current.off('new_message', callback);
                }
            };
        }
        return () => {}; // Función vacía si no hay socket
    }, []);

    /**
     * Suscribe a eventos de mensajes eliminados
     * 
     * @param {Function} callback - Función a ejecutar cuando se elimina un mensaje
     * @returns {Function} Función de cleanup
     */
    const onMessageDeleted = useCallback((callback) => {
        if (socketRef.current) {
            console.log('🗑️ Suscribiéndose a eventos de mensajes eliminados');
            socketRef.current.on('message_deleted', callback);
            
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
     * Suscribe a eventos de actualización de conversaciones
     * 
     * @param {Function} callback - Función a ejecutar cuando se actualiza una conversación
     * @returns {Function} Función de cleanup
     */
    const onConversationUpdated = useCallback((callback) => {
        if (socketRef.current) {
            console.log('💬 Suscribiéndose a eventos de conversaciones actualizadas');
            socketRef.current.on('conversation_updated', callback);
            
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
     * Suscribe a eventos de conversaciones cerradas
     * 
     * @param {Function} callback - Función a ejecutar cuando se cierra una conversación
     * @returns {Function} Función de cleanup
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
     * Suscribe a eventos de mensajes marcados como leídos
     * 
     * @param {Function} callback - Función a ejecutar cuando se marcan mensajes como leídos
     * @returns {Function} Función de cleanup
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
     * Suscribe a eventos de indicadores de escritura
     * 
     * @param {Function} callback - Función a ejecutar cuando alguien está escribiendo
     * @returns {Function} Función de cleanup
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
     * Suscribe a eventos de estadísticas del chat (solo para administradores)
     * 
     * @param {Function} callback - Función a ejecutar cuando se actualizan las estadísticas
     * @returns {Function} Función de cleanup
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
     * Suscribe a eventos de usuarios uniéndose a conversaciones
     * 
     * @param {Function} callback - Función a ejecutar cuando un usuario se une
     * @returns {Function} Función de cleanup
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
     * Suscribe a eventos de usuarios saliendo de conversaciones
     * 
     * @param {Function} callback - Función a ejecutar cuando un usuario sale
     * @returns {Function} Función de cleanup
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
     * Limpia el error de conexión actual
     */
    const clearConnectionError = useCallback(() => {
        setConnectionError(null);
    }, []);

    /**
     * Fuerza una reconexión desconectando y conectando nuevamente
     * Útil cuando hay problemas de conectividad
     */
    const reconnect = useCallback(() => {
        console.log('🔄 Forzando reconexión...');
        disconnectSocket();
        setTimeout(() => {
            connectSocket();
        }, 1000); // Esperar 1 segundo antes de reconectar
    }, [disconnectSocket, connectSocket]);

    // ============ RETORNO DEL HOOK ============
    
    return {
        // ---- Estado de la conexión ----
        socket: socketRef.current,     // Instancia del socket (para uso directo si es necesario)
        isConnected,                   // Estado de conexión actual
        connectionError,               // Error de conexión actual (si existe)
        
        // ---- Acciones de conexión ----
        connectSocket,                 // Función para conectar manualmente
        disconnectSocket,              // Función para desconectar manualmente
        reconnect,                     // Función para reconectar forzadamente
        clearConnectionError,          // Función para limpiar errores
        
        // ---- Acciones del chat ----
        joinConversation,              // Unirse a una conversación específica
        leaveConversation,             // Salir de una conversación específica
        startTyping,                   // Iniciar indicador de escritura
        stopTyping,                    // Detener indicador de escritura
        
        // ---- Suscripciones a eventos ----
        onNewMessage,                  // Listener para nuevos mensajes
        onMessageDeleted,              // Listener para mensajes eliminados
        onConversationUpdated,         // Listener para conversaciones actualizadas
        onConversationClosed,          // Listener para conversaciones cerradas
        onMessagesRead,                // Listener para mensajes leídos
        onUserTyping,                  // Listener para indicadores de escritura
        onChatStatsUpdated,            // Listener para estadísticas actualizadas
        onUserJoinedConversation,      // Listener para usuarios uniéndose
        onUserLeftConversation         // Listener para usuarios saliendo
    };
};