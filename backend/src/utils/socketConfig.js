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

// === FUNCIONES AUXILIARES ===

// Emitir nuevo mensaje a todos los usuarios en una conversación
export const emitNewMessage = (io, conversationId, message, excludeSocketId = null) => {
    const eventData = {
        conversationId,
        message,
        timestamp: new Date()
    };
    
    console.log(`Emitiendo nuevo mensaje en conversación ${conversationId}`);
    
    if (excludeSocketId) {
        // Emitir a todos en la conversación excepto al remitente
        io.to(`conversation_${conversationId}`).except(excludeSocketId).emit('new_message', eventData);
    } else {
        // Emitir a todos en la conversación
        io.to(`conversation_${conversationId}`).emit('new_message', eventData);
    }
    
    // Emitir a todos los administradores para actualizar lista de conversaciones
    io.to('admins').emit('conversation_updated', {
        conversationId,
        lastMessage: message.message || 'Archivo multimedia',
        lastMessageAt: new Date()
    });
};

// Emitir cuando un mensaje es eliminado
export const emitMessageDeleted = (io, conversationId, messageId, deletedBy) => {
    console.log(`Emitiendo mensaje eliminado: ${messageId} en conversación ${conversationId}`);
    
    io.to(`conversation_${conversationId}`).emit('message_deleted', {
        conversationId,
        messageId,
        deletedBy,
        timestamp: new Date()
    });
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

// Emitir cuando mensajes son marcados como leídos
export const emitMessagesRead = (io, conversationId, readBy) => {
    io.to(`conversation_${conversationId}`).emit('messages_read', {
        conversationId,
        readBy,
        timestamp: new Date()
    });
};

// Emitir estadísticas del chat a administradores
export const emitChatStats = async (io) => {
    try {
        // Importar modelos (importación dinámica para evitar circular dependencies)
        const { default: ChatConversation } = await import('../models/ChatConversation.js');
        const { default: ChatMessage } = await import('../models/ChatMessage.js');
        
        const [
            totalConversations,
            activeConversations,
            totalMessages,
            unreadMessages
        ] = await Promise.all([
            ChatConversation.countDocuments(),
            ChatConversation.countDocuments({ status: 'active' }),
            ChatMessage.countDocuments({ isDeleted: false }),
            ChatConversation.aggregate([
                { $group: { _id: null, total: { $sum: '$unreadCountAdmin' } } }
            ])
        ]);
        
        const unreadCount = unreadMessages.length > 0 ? unreadMessages[0].total : 0;
        
        const stats = {
            totalConversations,
            activeConversations,
            closedConversations: totalConversations - activeConversations,
            totalMessages,
            unreadMessages: unreadCount,
            connectedUsers: connectedUsers.size
        };
        
        io.to('admins').emit('chat_stats_updated', stats);
    } catch (error) {
        console.error('Error emitiendo estadísticas:', error);
    }
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