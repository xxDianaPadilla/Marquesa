/**
 * Configuración de eventos Socket.IO - CORREGIDA PARA RENDER + VERCEL
 *
 * PROBLEMAS SOLUCIONADOS:
 * - CORS configurado específicamente para Render + Vercel
 * - Transports configurados para funcionar en producción
 * - Headers de conexión optimizados para cross-domain
 * - Manejo de errores de conexión mejorado
 *
 * Ubicación: backend/src/utils/socketConfig.js
 */
 
// ============ EVENTOS ESPECÍFICOS MANTENIDOS (5 eventos) ============
 
/**
 * ✅ EVENTO 1/6: Emitir nuevo mensaje recibido
 */
export const emitNewMessage = (io, conversationId, messageData) => {
    try {
        console.log(`📨 Emitiendo nuevo mensaje para conversación: ${conversationId}`);
       
        const eventData = {
            conversationId,
            message: messageData,
            timestamp: new Date()
        };
       
        // Emitir a la sala específica de la conversación
        io.to(`conversation_${conversationId}`).emit('new_message', eventData);
       
        // También emitir a administradores para notificaciones
        io.to('admins').emit('new_message', eventData);
       
        console.log(`✅ Nuevo mensaje emitido exitosamente`);
    } catch (error) {
        console.error('❌ Error emitiendo nuevo mensaje:', error);
    }
};
 
/**
 * ✅ EVENTO 2/6: Emitir mensaje eliminado - CORREGIDO PARA SINCRONIZACIÓN
 */
export const emitMessageDeleted = (io, conversationId, messageId, deletedBy) => {
    try {
        console.log(`🗑️ Emitiendo mensaje eliminado: ${messageId} por ${deletedBy}`);
       
        const deleteData = {
            conversationId,
            messageId,
            deletedBy,
            deletionType: 'physical',
            timestamp: new Date()
        };
       
        // ✅ FIX CRÍTICO: Emitir a TODOS los clientes y admins para sincronización perfecta
        io.to(`conversation_${conversationId}`).emit('message_deleted', deleteData);
        io.to('admins').emit('message_deleted', deleteData);
       
        // ✅ TAMBIÉN emitir a clientes específicos para asegurar que reciban la notificación
        io.emit('message_deleted', deleteData);
       
        console.log(`✅ Mensaje eliminado emitido exitosamente a todas las salas`);
    } catch (error) {
        console.error('❌ Error emitiendo mensaje eliminado:', error);
    }
};
 
/**
 * ✅ EVENTO 3/6: Emitir mensajes marcados como leídos
 */
export const emitMessagesRead = (io, conversationId, readData) => {
    try {
        console.log(`👁️ Emitiendo mensajes leídos para conversación: ${conversationId}`);
       
        const readEventData = {
            conversationId,
            userId: readData.userId,
            userType: readData.userType,
            timestamp: new Date()
        };
       
        io.to(`conversation_${conversationId}`).emit('messages_read', readEventData);
        io.to('admins').emit('messages_read', readEventData);
       
        console.log(`✅ Mensajes leídos emitido exitosamente`);
    } catch (error) {
        console.error('❌ Error emitiendo mensajes leídos:', error);
    }
};
 
/**
 * ✅ EVENTO 4/6: Emitir estadísticas del chat actualizadas
 */
export const emitChatStats = (io) => {
    try {
        console.log(`📊 Emitiendo estadísticas del chat actualizadas`);
       
        io.to('admins').emit('chat_stats_updated', {
            timestamp: new Date(),
            message: 'Estadísticas del chat actualizadas'
        });
       
        console.log(`✅ Estadísticas del chat emitidas exitosamente`);
    } catch (error) {
        console.error('❌ Error emitiendo estadísticas del chat:', error);
    }
};
 
/**
 * ✅ EVENTO 5/6: Emitir límite de mensajes aplicado
 */
export const emitLimitApplied = (io, conversationId, limitData) => {
    try {
        console.log(`⚠️ Emitiendo límite aplicado para conversación: ${conversationId}`);
       
        const limitEventData = {
            conversationId,
            action: 'limit_applied',
            deletedCount: limitData.deletedCount || 0,
            deletedFiles: limitData.deletedFiles || 0,
            remainingCount: limitData.remainingCount || 0,
            limit: limitData.limit || 75,
            deletionType: 'physical',
            timestamp: new Date()
        };
       
        io.to(`conversation_${conversationId}`).emit('limit_applied', limitEventData);
        io.to('admins').emit('limit_applied', limitEventData);
       
        console.log(`✅ Límite aplicado emitido exitosamente`);
    } catch (error) {
        console.error('❌ Error emitiendo límite aplicado:', error);
    }
};
 
// ============ EVENTO UNIFICADO CORREGIDO (3→1) ============
 
/**
 * ✅ EVENTO 6/6: Conversación actualizada - CORREGIDO PARA ACTUALIZACIONES PERFECTAS
 */
export const emitConversationUpdated = (io, updateData) => {
    try {
        const { conversationId, action = 'updated' } = updateData;
       
        console.log(`🔄 Emitiendo conversación actualizada: ${conversationId} (${action})`);
       
        const eventData = {
            ...updateData,
            timestamp: new Date()
        };
       
        // ✅ FIX CRÍTICO: Asegurar que las actualizaciones lleguen a TODOS los lugares necesarios
        switch (action) {
            case 'created':
                console.log(`✨ Nueva conversación creada: ${conversationId}`);
                // Emitir a administradores para nueva conversación
                io.to('admins').emit('conversation_updated', {
                    ...eventData,
                    action: 'created'
                });
                break;
               
            case 'updated':
                console.log(`🔄 Conversación actualizada: ${conversationId}`);
                // ✅ FIX CRÍTICO: Emitir a TODAS las salas para sincronización perfecta
                io.to(`conversation_${conversationId}`).emit('conversation_updated', {
                    ...eventData,
                    action: 'updated'
                });
                io.to('admins').emit('conversation_updated', {
                    ...eventData,
                    action: 'updated'
                });
               
                // ✅ TAMBIÉN emitir globalmente para asegurar que TODOS reciban la actualización
                io.emit('conversation_updated', {
                    ...eventData,
                    action: 'updated'
                });
                break;
               
            case 'list_updated':
                console.log(`📋 Lista de conversaciones actualizada`);
                io.to('admins').emit('conversation_updated', {
                    ...eventData,
                    action: 'list_updated'
                });
                break;
               
            default:
                // Comportamiento por defecto (updated) con emisión global
                io.to(`conversation_${conversationId}`).emit('conversation_updated', eventData);
                io.to('admins').emit('conversation_updated', eventData);
                io.emit('conversation_updated', eventData); // ✅ Emisión global adicional
        }
       
        console.log(`✅ Conversación actualizada emitida exitosamente (${action}) a todas las salas`);
    } catch (error) {
        console.error('❌ Error emitiendo conversación actualizada:', error);
    }
};
 
// ============ FUNCIONES AUXILIARES MEJORADAS ============
 
/**
 * ✅ Hacer que un usuario se una a una sala de conversación
 */
export const joinConversationRoom = (socket, conversationId) => {
    try {
        const roomName = `conversation_${conversationId}`;
        socket.join(roomName);
        console.log(`🚪 Usuario ${socket.userId} unido a sala: ${roomName}`);
       
        // Notificar a otros en la sala
        socket.to(roomName).emit('user_joined_conversation', {
            conversationId,
            userId: socket.userId,
            userType: socket.userType,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('❌ Error uniendo usuario a sala:', error);
    }
};
 
/**
 * ✅ Hacer que un usuario salga de una sala de conversación
 */
export const leaveConversationRoom = (socket, conversationId) => {
    try {
        const roomName = `conversation_${conversationId}`;
        socket.leave(roomName);
        console.log(`🚪 Usuario ${socket.userId} salió de sala: ${roomName}`);
       
        // Notificar a otros en la sala
        socket.to(roomName).emit('user_left_conversation', {
            conversationId,
            userId: socket.userId,
            userType: socket.userType,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('❌ Error saliendo de sala:', error);
    }
};
 
/**
 * ✅ Hacer que un usuario se una a la sala de administradores
 */
export const joinAdminRoom = (socket) => {
    try {
        socket.join('admins');
        console.log(`👨‍💼 Administrador ${socket.userId} unido a sala de admins`);
    } catch (error) {
        console.error('❌ Error uniendo administrador a sala:', error);
    }
};
 
/**
 * ✅ Emitir indicador de escritura
 */
export const emitTypingIndicator = (socket, conversationId, isTyping) => {
    try {
        const roomName = `conversation_${conversationId}`;
       
        socket.to(roomName).emit('user_typing', {
            conversationId,
            userId: socket.userId,
            userType: socket.userType,
            isTyping,
            timestamp: new Date()
        });
       
        console.log(`⌨️ Indicador de escritura emitido: ${isTyping ? 'escribiendo' : 'dejó de escribir'}`);
    } catch (error) {
        console.error('❌ Error emitiendo indicador de escritura:', error);
    }
};
 
// ============ CONFIGURACIÓN PRINCIPAL DE SOCKET.IO CORREGIDA PARA RENDER + VERCEL ============
 
/**
 * ✅ Configurar eventos y middleware de Socket.IO - OPTIMIZADO PARA PRODUCCIÓN
 */
export const setupSocketIO = (io) => {
    console.log('⚙️ Configurando Socket.IO para Render + Vercel...');
   
    // ✅ CONFIGURACIÓN DE CORS ESPECÍFICA PARA RENDER + VERCEL
    io.engine.on("headers", (headers, req) => {
        headers["Access-Control-Allow-Origin"] = "https://marquesa.vercel.app";
        headers["Access-Control-Allow-Credentials"] = "true";
        headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE,OPTIONS";
        headers["Access-Control-Allow-Headers"] = "Origin,X-Requested-With,Content-Type,Accept,Authorization,x-client-id,x-client-secret,x-client-token";
    });
   
    // ✅ MIDDLEWARE DE AUTENTICACIÓN MEJORADO PARA PRODUCCIÓN
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            const userId = socket.handshake.auth.userId;
            const userType = socket.handshake.auth.userType;
           
            console.log('🔐 Intento de autenticación Socket.IO:', {
                hasToken: !!token,
                userId: userId,
                userType: userType,
                origin: socket.handshake.headers.origin,
                userAgent: socket.handshake.headers['user-agent']?.substring(0, 50) + '...'
            });
           
            if (!token) {
                console.error('❌ Token de autenticación faltante');
                return next(new Error('Token de autenticación requerido'));
            }
           
            // Validar que tenemos los datos necesarios
            if (!userId || !userType) {
                console.error('❌ Datos de usuario incompletos');
                return next(new Error('Datos de usuario incompletos'));
            }
           
            socket.userId = userId;
            socket.userType = userType;
           
            console.log(`✅ Usuario autenticado: ${socket.userId} (${socket.userType})`);
            next();
        } catch (error) {
            console.error('❌ Error en autenticación Socket.IO:', error);
            next(new Error('Error de autenticación'));
        }
    });
   
    // ✅ EVENTOS DE CONEXIÓN MEJORADOS PARA PRODUCCIÓN
    io.on('connection', (socket) => {
        console.log(`🔗 Nueva conexión Socket.IO: ${socket.id} - Usuario: ${socket.userId} (${socket.userType})`);
        console.log(`🌐 Origen de conexión: ${socket.handshake.headers.origin}`);
        console.log(`📡 Transport utilizado: ${socket.conn.transport.name}`);
       
        // Unir a sala de administradores si es admin
        if (socket.userType === 'admin') {
            joinAdminRoom(socket);
        }
       
        // ✅ EVENTOS DE CONVERSACIONES CON LOGGING MEJORADO
        socket.on('join_conversation', (conversationId) => {
            console.log(`🚪 ${socket.userId} quiere unirse a conversación: ${conversationId}`);
            joinConversationRoom(socket, conversationId);
        });
       
        socket.on('leave_conversation', (conversationId) => {
            console.log(`🚪 ${socket.userId} quiere salir de conversación: ${conversationId}`);
            leaveConversationRoom(socket, conversationId);
        });
       
        // ✅ EVENTOS DE ESCRITURA CON LOGGING
        socket.on('typing_start', (conversationId) => {
            console.log(`⌨️ ${socket.userId} empezó a escribir en conversación: ${conversationId}`);
            emitTypingIndicator(socket, conversationId, true);
        });
       
        socket.on('typing_stop', (conversationId) => {
            console.log(`⌨️ ${socket.userId} dejó de escribir en conversación: ${conversationId}`);
            emitTypingIndicator(socket, conversationId, false);
        });
       
        // ✅ EVENTOS DE DESCONEXIÓN CON CLEANUP MEJORADO
        socket.on('disconnect', (reason) => {
            console.log(`🔌 Desconexión Socket.IO: ${socket.id} (${socket.userId}) - Razón: ${reason}`);
            console.log(`📊 Estadísticas de conexión:`, {
                uptime: socket.conn?.server?.uptime || 'N/A',
                transport: socket.conn?.transport?.name || 'N/A'
            });
           
            // Cleanup: asegurar que el usuario salga de todas las salas
            const rooms = Array.from(socket.rooms);
            rooms.forEach(room => {
                if (room.startsWith('conversation_')) {
                    const conversationId = room.replace('conversation_', '');
                    socket.to(room).emit('user_left_conversation', {
                        conversationId,
                        userId: socket.userId,
                        userType: socket.userType,
                        timestamp: new Date()
                    });
                }
            });
        });
       
        // ✅ MANEJO DE ERRORES DE SOCKET MEJORADO
        socket.on('error', (error) => {
            console.error(`❌ Error en socket ${socket.id}:`, error);
        });
       
        socket.on('connect_error', (error) => {
            console.error(`❌ Error de conexión en socket ${socket.id}:`, error);
        });
       
        // ✅ CONFIRMAR CONEXIÓN EXITOSA CON INFORMACIÓN DETALLADA
        socket.emit('connected', {
            message: 'Conectado al sistema de chat',
            userId: socket.userId,
            userType: socket.userType,
            socketId: socket.id,
            timestamp: new Date(),
            serverInfo: {
                environment: process.env.NODE_ENV || 'development',
                cors: {
                    origin: 'https://marquesa.vercel.app',
                    credentials: true
                }
            }
        });
       
        console.log(`✅ Socket.IO configurado exitosamente para usuario: ${socket.userId} (${socket.userType})`);
    });
   
    // ✅ EVENTOS DE ERROR DEL SERVIDOR MEJORADOS
    io.engine.on("connection_error", (err) => {
        console.error('❌ Error de conexión del motor Socket.IO:', {
            code: err.code,
            message: err.message,
            context: err.context,
            req: {
                url: err.req?.url,
                method: err.req?.method,
                headers: {
                    origin: err.req?.headers?.origin,
                    userAgent: err.req?.headers?.['user-agent']?.substring(0, 50) + '...'
                }
            }
        });
    });
   
    console.log('✅ Socket.IO configurado exitosamente para producción (Render + Vercel)');
};
 
// ============ EXPORTACIÓN POR DEFECTO ============
 
export default {
    // Eventos específicos
    emitNewMessage,
    emitMessageDeleted,
    emitMessagesRead,
    emitChatStats,
    emitLimitApplied,
   
    // Evento unificado
    emitConversationUpdated,
   
    // Funciones auxiliares
    joinConversationRoom,
    leaveConversationRoom,
    joinAdminRoom,
    emitTypingIndicator,
   
    // Configuración principal
    setupSocketIO
};