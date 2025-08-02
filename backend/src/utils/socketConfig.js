import jwt from 'jsonwebtoken';
import { config } from '../config.js';

// Almacenar usuarios conectados por socket ID
const connectedUsers = new Map();

// Middleware de autenticación para Socket.IO
const authenticateSocket = (socket, next) => {
    try {
        // Obtener token de las cookies o query params
        const token = socket.handshake.auth.token || socket.handshake.headers.cookie?.split('authToken=')[1]?.split(';')[0];
        
        if (!token) {
            return next(new Error('Token de autenticación requerido'));
        }
        
        // Verificar el token
        const decoded = jwt.verify(token, config.JWT.secret);
        
        if (!decoded || !decoded.id || !decoded.userType) {
            return next(new Error('Token inválido'));
        }
        
        // Agregar información del usuario al socket
        socket.user = {
            id: decoded.id,
            userType: decoded.userType,
            email: decoded.email || null
        };
        
        next();
    } catch (error) {
        console.error('Error en autenticación de socket:', error);
        next(new Error('Token inválido o expirado'));
    }
};

// Configuración principal de Socket.IO
export const setupSocketIO = (io) => {
    // Aplicar middleware de autenticación
    io.use(authenticateSocket);
    
    io.on('connection', (socket) => {
        console.log(`Usuario conectado: ${socket.user.id} (${socket.user.userType})`);
        
        // Almacenar información del usuario conectado
        connectedUsers.set(socket.id, {
            userId: socket.user.id,
            userType: socket.user.userType,
            socketId: socket.id
        });
        
        // Unirse a sala personal (para notificaciones directas)
        const personalRoom = `user_${socket.user.id}`;
        socket.join(personalRoom);
        
        // Si es admin, unirse a sala de administradores
        if (socket.user.userType === 'admin') {
            socket.join('admins');
            emitChatStats(io);
        }
        
        // === EVENTOS DEL CHAT ===
        
        // Unirse a una conversación específica
        socket.on('join_conversation', (conversationId) => {
            if (!conversationId) return;
            
            socket.join(`conversation_${conversationId}`);
            console.log(`Usuario ${socket.user.id} se unió a conversación ${conversationId}`);
            
            // Notificar a otros usuarios en la conversación
            socket.to(`conversation_${conversationId}`).emit('user_joined_conversation', {
                userId: socket.user.id,
                userType: socket.user.userType
            });
        });
        
        // Salir de una conversación
        socket.on('leave_conversation', (conversationId) => {
            if (!conversationId) return;
            
            socket.leave(`conversation_${conversationId}`);
            console.log(`Usuario ${socket.user.id} salió de conversación ${conversationId}`);
            
            // Notificar a otros usuarios en la conversación
            socket.to(`conversation_${conversationId}`).emit('user_left_conversation', {
                userId: socket.user.id,
                userType: socket.user.userType
            });
        });
        
        // Indicar que el usuario está escribiendo
        socket.on('typing_start', (conversationId) => {
            socket.to(`conversation_${conversationId}`).emit('user_typing', {
                userId: socket.user.id,
                userType: socket.user.userType,
                isTyping: true
            });
        });
        
        // Indicar que el usuario dejó de escribir
        socket.on('typing_stop', (conversationId) => {
            socket.to(`conversation_${conversationId}`).emit('user_typing', {
                userId: socket.user.id,
                userType: socket.user.userType,
                isTyping: false
            });
        });
        
        // === EVENTOS DE CONEXIÓN ===
        
        // Manejar desconexión
        socket.on('disconnect', (reason) => {
            console.log(`Usuario desconectado: ${socket.user.id} - Razón: ${reason}`);
            
            // Remover de usuarios conectados
            connectedUsers.delete(socket.id);
            
            // Notificar desconexión en todas las conversaciones donde estaba
            const rooms = Array.from(socket.rooms);
            rooms.forEach(room => {
                if (room.startsWith('conversation_')) {
                    socket.to(room).emit('user_left_conversation', {
                        userId: socket.user.id,
                        userType: socket.user.userType
                    });
                }
            });
            
            // Si era admin, actualizar estadísticas
            if (socket.user.userType === 'admin') {
                emitChatStats(io);
            }
        });
        
        // Manejar errores
        socket.on('error', (error) => {
            console.error('Error en socket:', error);
            socket.emit('socket_error', {
                message: 'Error en conexión',
                error: error.message
            });
        });
        
        // Enviar confirmación de conexión
        socket.emit('connected', {
            message: 'Conectado exitosamente al chat',
            userId: socket.user.id,
            userType: socket.user.userType
        });
    });
};

// === FUNCIONES AUXILIARES CORREGIDAS ===

/**
 * ✅ CORREGIDO: Emitir nuevo mensaje a todos los usuarios en una conversación
 * Ahora incluye mejor manejo de datos para actualizaciones en tiempo real
 */
export const emitNewMessage = (io, conversationId, message, excludeSocketId = null) => {
    const eventData = {
        conversationId,
        message,
        timestamp: new Date()
    };
    
    console.log(`🔔 Emitiendo nuevo mensaje en conversación ${conversationId}`);
    
    if (excludeSocketId) {
        // Emitir a todos en la conversación excepto al remitente
        io.to(`conversation_${conversationId}`).except(excludeSocketId).emit('new_message', eventData);
    } else {
        // Emitir a todos en la conversación
        io.to(`conversation_${conversationId}`).emit('new_message', eventData);
    }
    
    // ✅ MEJORADO: Emitir evento más específico para actualizar lista de conversaciones
    const updateData = {
        conversationId,
        lastMessage: message.message || 'Archivo multimedia',
        lastMessageAt: new Date(),
        action: 'new_message'
    };
    
    io.to('admins').emit('conversation_list_updated', updateData);
};

/**
 * ✅ FUNCIÓN CRÍTICA CORREGIDA: Emitir cuando un mensaje es eliminado
 * Ahora obtiene y emite el nuevo último mensaje válido inmediatamente
 */
export const emitMessageDeleted = async (io, conversationId, messageId, deletedBy) => {
    console.log(`🗑️ Emitiendo mensaje eliminado: ${messageId} en conversación ${conversationId}`);
    
    // Emitir evento de mensaje eliminado a la conversación
    io.to(`conversation_${conversationId}`).emit('message_deleted', {
        conversationId,
        messageId,
        deletedBy,
        timestamp: new Date()
    });
    
    // ✅ NUEVA LÓGICA: Obtener el nuevo último mensaje válido desde la base de datos
    try {
        // Importación dinámica para evitar dependencias circulares
        const { default: ChatMessage } = await import('../models/ChatMessage.js');
        const { default: ChatConversation } = await import('../models/ChatConversation.js');
        
        // Buscar el último mensaje NO eliminado de la conversación
        const lastValidMessage = await ChatMessage.findOne({
            conversationId,
            isDeleted: false
        })
        .sort({ createdAt: -1 })
        .lean();
        
        let newLastMessage = '';
        let newLastMessageAt = new Date();
        
        if (lastValidMessage) {
            newLastMessage = lastValidMessage.message || 
                (lastValidMessage.media ? '📎 Archivo multimedia' : 'Sin contenido');
            newLastMessageAt = lastValidMessage.createdAt;
        }
        
        // Actualizar la conversación en la base de datos
        await ChatConversation.findOneAndUpdate(
            { conversationId },
            {
                lastMessage: newLastMessage,
                lastMessageAt: newLastMessageAt
            }
        );
        
        // ✅ CRÍTICO: Emitir actualización específica del último mensaje
        const updateData = {
            conversationId,
            lastMessage: newLastMessage,
            lastMessageAt: newLastMessageAt,
            action: 'message_deleted',
            messageId: messageId // Incluir ID del mensaje eliminado
        };
        
        console.log(`📋 Emitiendo nuevo último mensaje para ${conversationId}: "${newLastMessage}"`);
        
        // Emitir a todos los admins para actualizar la lista
        io.to('admins').emit('conversation_updated', updateData);
        io.to('admins').emit('conversation_list_updated', updateData);
        
    } catch (error) {
        console.error('❌ Error obteniendo nuevo último mensaje:', error);
        
        // En caso de error, emitir evento básico
        io.to('admins').emit('conversation_list_updated', {
            conversationId,
            action: 'message_deleted_error',
            timestamp: new Date()
        });
    }
};

// Emitir cuando una conversación es cerrada
export const emitConversationClosed = (io, conversationId) => {
    io.to(`conversation_${conversationId}`).emit('conversation_closed', {
        conversationId,
        timestamp: new Date()
    });
    
    // Notificar a administradores
    io.to('admins').emit('conversation_updated', {
        conversationId,
        status: 'closed'
    });
};

/**
 * ✅ CORREGIDO: Emitir cuando mensajes son marcados como leídos
 * Ahora actualiza contadores en tiempo real
 */
export const emitMessagesRead = (io, conversationId, readBy) => {
    io.to(`conversation_${conversationId}`).emit('messages_read', {
        conversationId,
        readBy,
        timestamp: new Date()
    });
    
    // ✅ NUEVO: Emitir actualización de contadores para admins
    io.to('admins').emit('conversation_list_updated', {
        conversationId,
        action: 'messages_read',
        readBy: readBy,
        timestamp: new Date()
    });
};

/**
 * ✅ CORREGIDO: Emitir estadísticas del chat a administradores
 * Ahora calcula estadísticas más precisas y en tiempo real
 */
export const emitChatStats = async (io) => {
    try {
        // Importar modelos (importación dinámica para evitar circular dependencies)
        const { default: ChatConversation } = await import('../models/ChatConversation.js');
        const { default: ChatMessage } = await import('../models/ChatMessage.js');
        
        // ✅ MEJORADO: Solo contar conversaciones que tengan mensajes
        const conversationsWithMessages = await ChatConversation.aggregate([
            {
                $lookup: {
                    from: 'chatmessages',
                    localField: 'conversationId',
                    foreignField: 'conversationId',
                    as: 'messages'
                }
            },
            {
                $match: {
                    'messages.0': { $exists: true },
                    'messages': { 
                        $elemMatch: { 
                            isDeleted: false 
                        } 
                    }
                }
            }
        ]);
        
        const [
            totalMessages,
            unreadMessages
        ] = await Promise.all([
            ChatMessage.countDocuments({ isDeleted: false }),
            ChatConversation.aggregate([
                {
                    $lookup: {
                        from: 'chatmessages',
                        localField: 'conversationId',
                        foreignField: 'conversationId',
                        as: 'messages'
                    }
                },
                {
                    $match: {
                        'messages.0': { $exists: true },
                        'messages': { 
                            $elemMatch: { 
                                isDeleted: false 
                            } 
                        }
                    }
                },
                { 
                    $group: { 
                        _id: null, 
                        total: { $sum: '$unreadCountAdmin' } 
                    } 
                }
            ])
        ]);
        
        const totalConversations = conversationsWithMessages.length;
        const activeConversations = conversationsWithMessages.filter(conv => conv.status === 'active').length;
        const unreadCount = unreadMessages.length > 0 ? unreadMessages[0].total : 0;
        
        const stats = {
            totalConversations,
            activeConversations,
            closedConversations: totalConversations - activeConversations,
            totalMessages,
            unreadMessages: unreadCount,
            connectedUsers: connectedUsers.size,
            timestamp: new Date()
        };
        
        console.log(`📊 Emitiendo estadísticas actualizadas:`, stats);
        io.to('admins').emit('chat_stats_updated', stats);
        
    } catch (error) {
        console.error('❌ Error emitiendo estadísticas:', error);
    }
};

/**
 * ✅ NUEVA FUNCIÓN: Emitir actualización específica de conversación
 * Para manejar cambios en tiempo real de conversaciones individuales
 */
export const emitConversationUpdate = (io, conversationData) => {
    console.log(`🔄 Emitiendo actualización de conversación: ${conversationData.conversationId}`);
    
    io.to('admins').emit('conversation_updated', {
        ...conversationData,
        timestamp: new Date()
    });
    
    // También emitir a la conversación específica si hay cambios relevantes
    if (conversationData.lastMessage || conversationData.unreadCountClient || conversationData.unreadCountAdmin) {
        io.to(`conversation_${conversationData.conversationId}`).emit('conversation_data_updated', {
            ...conversationData,
            timestamp: new Date()
        });
    }
};

/**
 * ✅ NUEVA FUNCIÓN: Emitir cuando se crea una nueva conversación
 * Para que aparezca inmediatamente en la lista de admins
 */
export const emitNewConversation = (io, conversationData) => {
    console.log(`✨ Emitiendo nueva conversación: ${conversationData.conversationId}`);
    
    io.to('admins').emit('new_conversation_created', {
        ...conversationData,
        timestamp: new Date()
    });
    
    // Actualizar estadísticas también
    emitChatStats(io);
};

// Obtener usuarios conectados en una conversación
export const getConnectedUsersInConversation = (conversationId) => {
    const users = [];
    
    connectedUsers.forEach((user) => {
        users.push(user);
    });
    
    return users;
};

// Verificar si un usuario está conectado
export const isUserConnected = (userId) => {
    for (const user of connectedUsers.values()) {
        if (user.userId === userId) {
            return true;
        }
    }
    return false;
};