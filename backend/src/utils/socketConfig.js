/**
* Configuración de eventos Socket.IO - CORREGIDA PARA EVENTOS ÚNICOS
 *
 * PROBLEMAS SOLUCIONADOS:
 * - Eventos cruzados entre conversaciones diferentes
 * - Mensajes que aparecen en chats incorrectos
 * - Mejor targeting de eventos por conversación
 * - Prevención de eventos duplicados
 *
 * Ubicación: backend/src/utils/socketConfig.js
 */
 
// ============ EVENTOS ESPECÍFICOS MANTENIDOS Y MEJORADOS (5 eventos) ============
 
/**
 * ✅ EVENTO 1/6: Emitir nuevo mensaje recibido - TARGETING ULTRA ESPECÍFICO
 */
export const emitNewMessage = (io, conversationId, messageData) => {
    try {
        console.log(`📨 Emitiendo nuevo mensaje para conversación: ${conversationId}`);
        console.log(`📨 Tipo de remitente: ${messageData.senderType}, ID: ${messageData.senderId?._id}`);
       
        const eventData = {
            conversationId,
            message: messageData,
            timestamp: new Date()
        };
       
        // ✅ CORRECCIÓN ULTRA CRÍTICA: Targeting más específico
        
        // 1. SIEMPRE emitir a la sala específica de la conversación
        const conversationRoom = `conversation_${conversationId}`;
        console.log(`📨 Emitiendo a sala de conversación: ${conversationRoom}`);
        io.to(conversationRoom).emit('new_message', eventData);
       
        // 2. Para mensajes de CLIENTES: también notificar a admins (para lista de conversaciones)
        if (messageData.senderType === 'Customer') {
            console.log(`📨 Mensaje de cliente - notificando a sala de admins`);
            // ✅ SOLO emitir a admins que NO están en la conversación activa para evitar duplicados
            io.to('admins').emit('new_message', eventData);
        }
        
        // 3. Para mensajes de ADMIN: NO notificar a otros admins (evita duplicados)
        if (messageData.senderType === 'admin') {
            console.log(`📨 Mensaje de admin - NO notificando a otros admins`);
        }
       
        console.log(`✅ Nuevo mensaje emitido con targeting específico`);
    } catch (error) {
        console.error('❌ Error emitiendo nuevo mensaje:', error);
    }
};
 
/**
 * ✅ EVENTO 2/6: Emitir mensaje eliminado - CORREGIDO PARA SINCRONIZACIÓN ESPECÍFICA
 */
export const emitMessageDeleted = (io, conversationId, messageId, deletedBy) => {
    try {
        console.log(`🗑️ Emitiendo mensaje eliminado: ${messageId} por ${deletedBy} en conversación: ${conversationId}`);
       
        const deleteData = {
            conversationId,
            messageId,
            deletedBy,
            deletionType: 'physical',
            timestamp: new Date()
        };
       
        // ✅ CORRECCIÓN CRÍTICA: Targeting específico para evitar eliminaciones cruzadas
        
        // 1. Emitir SOLO a la sala específica de la conversación
        const conversationRoom = `conversation_${conversationId}`;
        console.log(`🗑️ Emitiendo eliminación a sala específica: ${conversationRoom}`);
        io.to(conversationRoom).emit('message_deleted', deleteData);
        
        // 2. Emitir a administradores para actualización de lista
        io.to('admins').emit('message_deleted', deleteData);
       
        // ✅ NO emitir globalmente para evitar eliminaciones en conversaciones incorrectas
       
        console.log(`✅ Mensaje eliminado emitido exitosamente a targets específicos`);
    } catch (error) {
        console.error('❌ Error emitiendo mensaje eliminado:', error);
    }
};
 
/**
 * ✅ EVENTO 3/6: Emitir mensajes marcados como leídos - MEJORADO
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
       
        // ✅ CORRECCIÓN: Targeting específico
        const conversationRoom = `conversation_${conversationId}`;
        io.to(conversationRoom).emit('messages_read', readEventData);
        io.to('admins').emit('messages_read', readEventData);
       
        console.log(`✅ Mensajes leídos emitido exitosamente`);
    } catch (error) {
        console.error('❌ Error emitiendo mensajes leídos:', error);
    }
};
 
/**
 * ✅ EVENTO 4/6: Emitir estadísticas del chat actualizadas - OPTIMIZADO
 */
export const emitChatStats = (io) => {
    try {
        console.log(`📊 Emitiendo estadísticas del chat actualizadas`);
       
        // ✅ CORRECCIÓN: Solo a administradores, no global
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
 * ✅ EVENTO 5/6: Emitir límite de mensajes aplicado - MEJORADO
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
       
        // ✅ CORRECCIÓN: Targeting específico
        const conversationRoom = `conversation_${conversationId}`;
        io.to(conversationRoom).emit('limit_applied', limitEventData);
        io.to('admins').emit('limit_applied', limitEventData);
       
        console.log(`✅ Límite aplicado emitido exitosamente`);
    } catch (error) {
        console.error('❌ Error emitiendo límite aplicado:', error);
    }
};
 
// ============ EVENTO UNIFICADO CORREGIDO (3→1) ============
 
/**
 * ✅ EVENTO 6/6: Conversación actualizada - CORREGIDO PARA TARGETING ESPECÍFICO
 */
export const emitConversationUpdated = (io, updateData) => {
    try {
        const { conversationId, action = 'updated' } = updateData;
       
        console.log(`🔄 Emitiendo conversación actualizada: ${conversationId} (${action})`);
       
        const eventData = {
            ...updateData,
            timestamp: new Date()
        };
       
        // ✅ CORRECCIÓN CRÍTICA: Targeting más específico según la acción
        switch (action) {
            case 'created':
                console.log(`✨ Nueva conversación creada: ${conversationId}`);
                
                // Nueva conversación: solo notificar a administradores
                io.to('admins').emit('conversation_updated', {
                    ...eventData,
                    action: 'created'
                });
                
                // También notificar a la sala de la nueva conversación si alguien está conectado
                const newConversationRoom = `conversation_${conversationId}`;
                io.to(newConversationRoom).emit('conversation_updated', {
                    ...eventData,
                    action: 'created'
                });
                break;
               
            case 'updated':
                console.log(`🔄 Conversación actualizada: ${conversationId}`);
                
                // Actualización: emitir a la conversación específica y a admins
                const conversationRoom = `conversation_${conversationId}`;
                io.to(conversationRoom).emit('conversation_updated', {
                    ...eventData,
                    action: 'updated'
                });
                
                // Solo a admins para actualización de lista
                io.to('admins').emit('conversation_updated', {
                    ...eventData,
                    action: 'updated'
                });
                
                break;
               
            case 'list_updated':
                console.log(`📋 Lista de conversaciones actualizada`);
                
                // Solo a administradores para actualización de lista
                io.to('admins').emit('conversation_updated', {
                    ...eventData,
                    action: 'list_updated'
                });
                break;
               
            default:
                // Comportamiento por defecto: targeting específico
                const defaultRoom = `conversation_${conversationId}`;
                io.to(defaultRoom).emit('conversation_updated', eventData);
                io.to('admins').emit('conversation_updated', eventData);
        }
       
        console.log(`✅ Conversación actualizada emitida exitosamente (${action}) a targets específicos`);
    } catch (error) {
        console.error('❌ Error emitiendo conversación actualizada:', error);
    }
};
 
// ============ FUNCIONES AUXILIARES MEJORADAS ============
 
/**
 * ✅ Hacer que un usuario se una a una sala de conversación - MEJORADO
 */
export const joinConversationRoom = (socket, conversationId) => {
    try {
        const roomName = `conversation_${conversationId}`;
        socket.join(roomName);
        console.log(`🚪 Usuario ${socket.userId} (${socket.userType}) unido a sala: ${roomName}`);
       
        // ✅ CORRECCIÓN: Solo notificar a otros en la misma sala, no globalmente
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
 * ✅ Hacer que un usuario salga de una sala de conversación - MEJORADO
 */
export const leaveConversationRoom = (socket, conversationId) => {
    try {
        const roomName = `conversation_${conversationId}`;
        socket.leave(roomName);
        console.log(`🚪 Usuario ${socket.userId} (${socket.userType}) salió de sala: ${roomName}`);
       
        // ✅ CORRECCIÓN: Solo notificar a otros en la misma sala
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
 * ✅ Hacer que un usuario se una a la sala de administradores - MEJORADO
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
 * ✅ Emitir indicador de escritura - CORREGIDO PARA TARGETING ESPECÍFICO
 */
export const emitTypingIndicator = (socket, conversationId, isTyping) => {
    try {
        const roomName = `conversation_${conversationId}`;
       
        // ✅ CORRECCIÓN: Solo emitir a la sala específica de la conversación
        socket.to(roomName).emit('user_typing', {
            conversationId,
            userId: socket.userId,
            userType: socket.userType,
            isTyping,
            timestamp: new Date()
        });
       
        // Solo log cuando empieza a escribir para reducir spam
        if (isTyping) {
            console.log(`⌨️ Usuario ${socket.userId} escribiendo en conversación: ${conversationId}`);
        }
    } catch (error) {
        console.error('❌ Error emitiendo indicador de escritura:', error);
    }
};
 
// ============ CONFIGURACIÓN PRINCIPAL DE SOCKET.IO CORREGIDA ============
 
/**
 * ✅ Configurar eventos y middleware de Socket.IO - OPTIMIZADO PARA TARGETING
 */
export const setupSocketIO = (io) => {
    console.log('⚙️ Configurando Socket.IO con targeting específico...');
   
    // ✅ CONFIGURACIÓN DE CORS ESPECÍFICA PARA RENDER + VERCEL
    io.engine.on("headers", (headers, req) => {
        headers["Access-Control-Allow-Origin"] = "https://marquesa.vercel.app";
        headers["Access-Control-Allow-Credentials"] = "true";
        headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE,OPTIONS";
        headers["Access-Control-Allow-Headers"] = "Origin,X-Requested-With,Content-Type,Accept,Authorization,x-client-id,x-client-secret,x-client-token";
    });
   
    // ✅ MIDDLEWARE DE AUTENTICACIÓN MEJORADO
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            const userId = socket.handshake.auth.userId;
            const userType = socket.handshake.auth.userType;
           
            console.log('🔐 Intento de autenticación Socket.IO:', {
                hasToken: !!token,
                userId: userId,
                userType: userType,
                origin: socket.handshake.headers.origin
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
   
    // ✅ EVENTOS DE CONEXIÓN MEJORADOS
    io.on('connection', (socket) => {
        console.log(`🔗 Nueva conexión Socket.IO: ${socket.id} - Usuario: ${socket.userId} (${socket.userType})`);
        console.log(`🌐 Origen de conexión: ${socket.handshake.headers.origin}`);
       
        // Unir a sala de administradores si es admin
        if (socket.userType === 'admin') {
            joinAdminRoom(socket);
        }
       
        // ✅ EVENTOS DE CONVERSACIONES CON TARGETING MEJORADO
        socket.on('join_conversation', (conversationId) => {
            console.log(`🚪 ${socket.userId} (${socket.userType}) quiere unirse a conversación: ${conversationId}`);
            joinConversationRoom(socket, conversationId);
        });
       
        socket.on('leave_conversation', (conversationId) => {
            console.log(`🚪 ${socket.userId} (${socket.userType}) quiere salir de conversación: ${conversationId}`);
            leaveConversationRoom(socket, conversationId);
        });
       
        // ✅ EVENTOS DE ESCRITURA CON TARGETING ESPECÍFICO
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
           
            // ✅ CORRECCIÓN: Cleanup más específico - solo notificar a salas relevantes
            const rooms = Array.from(socket.rooms);
            rooms.forEach(room => {
                if (room.startsWith('conversation_')) {
                    const conversationId = room.replace('conversation_', '');
                    // Solo notificar a otros en esa conversación específica
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
       
        // ✅ CONFIRMAR CONEXIÓN EXITOSA CON TARGETING INFO
        socket.emit('connected', {
            message: 'Conectado al sistema de chat con targeting específico',
            userId: socket.userId,
            userType: socket.userType,
            socketId: socket.id,
            timestamp: new Date(),
            targeting: {
                conversationRooms: 'conversation_{id}',
                adminRoom: 'admins',
                globalEvents: 'minimized'
            }
        });
       
        console.log(`✅ Socket.IO configurado exitosamente para usuario: ${socket.userId} (${socket.userType})`);
    });
   
    // ✅ EVENTOS DE ERROR DEL SERVIDOR MEJORADOS
    io.engine.on("connection_error", (err) => {
        console.error('❌ Error de conexión del motor Socket.IO:', {
            code: err.code,
            message: err.message,
            context: err.context
        });
    });
   
    console.log('✅ Socket.IO configurado exitosamente con targeting específico');
};

// ============ EXPORTACIÓN POR DEFECTO ============
 
export default {
    // Eventos específicos con targeting mejorado
    emitNewMessage,
    emitMessageDeleted,
    emitMessagesRead,
    emitChatStats,
    emitLimitApplied,
   
    // Evento unificado con targeting específico
    emitConversationUpdated,
   
    // Funciones auxiliares con targeting
    joinConversationRoom,
    leaveConversationRoom,
    joinAdminRoom,
    emitTypingIndicator,
   
    // Configuración principal optimizada
    setupSocketIO
};