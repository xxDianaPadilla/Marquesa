import ChatMessage from "../models/ChatMessage.js";
import ChatConversation from "../models/ChatConversation.js";
import clientsModel from "../models/Clients.js";
import { emitNewMessage, emitMessageDeleted, emitMessagesRead, emitChatStats, emitConversationUpdated } from "../utils/socketConfig.js";
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config.js';
import { 
    enforceMessageLimit, 
    updateConversationLastMessage, 
    cleanupOrphanedConversations,
    validateClientExists,
    generateConversationId
} from '../utils/chatUtils.js';

/**
 * Controlador de Chat - CORREGIDO PARA ACTUALIZACIONES EN TIEMPO REAL
 * 
 * PROBLEMAS SOLUCIONADOS:
 * - Último mensaje se actualiza correctamente al eliminar desde cliente
 * - Contador de no leídos se resetea correctamente al eliminar
 * - Eventos Socket.IO emitidos correctamente para sincronización
 * - Eliminación física completa con limpieza de archivos
 * 
 * Ubicación: backend/src/controllers/chatController.js
 */

// ============ CONFIGURACIÓN CLOUDINARY CON FILTRO DE SOLO IMÁGENES ============

cloudinary.config({
    cloud_name: config.cloudinary.cloud_name,
    api_key: config.cloudinary.cloudinary_api_key,
    api_secret: config.cloudinary.cloudinary_api_secret
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'chat_media',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [{ width: 800, height: 600, crop: 'limit', quality: 'auto' }]
    }
});

export const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Solo se permiten archivos de imagen (JPG, PNG, GIF, WebP)'), false);
        }
        cb(null, true);
    }
});

// ============ CONSTANTES ============
const MAX_MESSAGES_PER_CONVERSATION = 75;

// ============ CONTROLADOR PRINCIPAL ============
const chatController = {};

/**
 * ✅ FUNCIÓN 1/8: Obtener o crear conversación
 */
chatController.getOrCreateConversation = async (req, res) => {
    try {
        const { clientId } = req.params;
        
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Usuario no autenticado"
            });
        }

        if (req.user.userType === 'Customer' && req.user.id !== clientId) {
            return res.status(403).json({
                success: false,
                message: "No tienes permisos para acceder a esta conversación"
            });
        }
        
        const client = await clientsModel.findById(clientId).lean();
        if (!client) {
            await cleanupOrphanedConversations();
            return res.status(404).json({
                success: false,
                message: "Cliente no encontrado"
            });
        }

        let conversation = await ChatConversation.findOne({
            clientId: clientId,
            status: 'active'
        });

        if (conversation) {
            const messageCount = await ChatMessage.countDocuments({
                conversationId: conversation.conversationId
            });
            
            if (messageCount === 0) {
                conversation = null;
            }
        }

        if (!conversation) {
            if (req.user.userType === 'Customer') {
                return res.status(200).json({
                    success: true,
                    conversation: null,
                    message: "No hay conversación activa. Se creará al enviar el primer mensaje."
                });
            }
        }

        const response = {
            ...conversation.toObject(),
            clientId: {
                _id: client._id,
                fullName: client.fullName,
                email: client.email,
                profilePicture: client.profilePicture || null
            }
        };

        res.status(200).json({
            success: true,
            conversation: response
        });

    } catch (error) {
        console.error('Error en getOrCreateConversation:', error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
};

/**
 * ✅ FUNCIÓN 2/8: Obtener todas las conversaciones
 */
chatController.getAllConversations = async (req, res) => {
    try {
        if (!req.user || req.user.userType !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Acceso denegado"
            });
        }

        const { page = 1, limit = 20 } = req.query;
        
        await cleanupOrphanedConversations();
        
        const skip = (parseInt(page) - 1) * parseInt(limit);

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
                    'messages.0': { $exists: true }
                }
            },
            {
                $sort: { lastMessageAt: -1 }
            },
            {
                $skip: skip
            },
            {
                $limit: parseInt(limit)
            }
        ]);

        const validConversations = [];
        
        for (const conv of conversationsWithMessages) {
            const client = await clientsModel.findById(conv.clientId).lean();
            
            if (client) {
                await updateConversationLastMessage(conv.conversationId);
                
                const updatedConv = await ChatConversation.findOne({ 
                    conversationId: conv.conversationId 
                }).lean();
                
                validConversations.push({
                    ...updatedConv,
                    clientId: {
                        _id: client._id,
                        fullName: client.fullName,
                        email: client.email,
                        profilePicture: client.profilePicture || null
                    }
                });
            }
        }

        const totalConversations = validConversations.length;

        res.status(200).json({
            success: true,
            conversations: validConversations,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalConversations / parseInt(limit)),
                totalConversations,
                hasNextPage: skip + validConversations.length < totalConversations,
                hasPrevPage: parseInt(page) > 1
            }
        });

    } catch (error) {
        console.error('Error en getAllConversations:', error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
};

/**
 * ✅ FUNCIÓN 3/8: Enviar mensaje
 */
chatController.sendMessage = async (req, res) => {
    try {
        const { conversationId, message } = req.body;
        
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Usuario no autenticado"
            });
        }

        if (!message?.trim() && !req.file) {
            return res.status(400).json({
                success: false,
                message: "Debes enviar un mensaje de texto o un archivo"
            });
        }

        if (req.file && !req.file.mimetype.startsWith('image/')) {
            return res.status(400).json({
                success: false,
                message: "Solo se permiten archivos de imagen (JPG, PNG, GIF, WebP)",
                code: "INVALID_FILE_TYPE"
            });
        }

        let conversation;
        let actualConversationId = conversationId;

        if (!conversationId && req.user.userType === 'Customer') {
            const newConversationId = generateConversationId(req.user.id);
            
            conversation = new ChatConversation({
                conversationId: newConversationId,
                clientId: req.user.id
            });
            await conversation.save();
            
            actualConversationId = newConversationId;
            console.log(`✅ Nueva conversación creada: ${actualConversationId}`);
        } else {
            conversation = await ChatConversation.findOne({ 
                conversationId: actualConversationId 
            });
        }
        
        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversación no encontrada"
            });
        }

        if (req.user.userType === 'Customer') {
            const clientExists = await validateClientExists(conversation.clientId);
            if (!clientExists) {
                await cleanupOrphanedConversations();
                return res.status(404).json({
                    success: false,
                    message: "La cuenta del cliente no existe"
                });
            }
        }

        if (req.user.userType === 'Customer' && conversation.clientId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "No tienes permisos para enviar mensajes a esta conversación"
            });
        }

        const limitResult = await enforceMessageLimit(actualConversationId);
        console.log('🗑️ Resultado del límite físico:', limitResult);

        const messageSenderId = req.user.userType === 'admin' ? 'admin' : req.user.id;

        const messageData = {
            conversationId: actualConversationId,
            senderId: messageSenderId,
            senderType: req.user.userType,
            message: message?.trim() || '',
            status: 'sent'
        };

        if (req.file) {
            messageData.media = {
                type: 'image',
                url: req.file.path,
                filename: req.file.originalname,
                size: req.file.size
            };
        }

        const chatMessage = new ChatMessage(messageData);
        await chatMessage.save();

        const updateData = {
            lastMessage: message?.trim() || `📷 ${req.file?.originalname || 'Imagen'}`,
            lastMessageAt: new Date()
        };

        if (req.user.userType === 'admin') {
            updateData.unreadCountClient = (conversation.unreadCountClient || 0) + 1;
        } else {
            updateData.unreadCountAdmin = (conversation.unreadCountAdmin || 0) + 1;
        }

        const updatedConversation = await ChatConversation.findOneAndUpdate(
            { conversationId: actualConversationId }, 
            updateData,
            { new: true }
        );

        let senderInfo;
        
        if (req.user.userType === 'admin') {
            // Para mensajes de admin, SIEMPRE usar datos fijos del admin
            senderInfo = {
                _id: 'admin',
                fullName: 'Atención al Cliente',
                email: 'soporte@marquesa.com', // o usar req.user.email si tienes email del admin
                profilePicture: '/assets/marquesaMiniLogo.png'
            };
        } else {
            // Para mensajes de cliente, usar datos del cliente
            const clientInfo = await clientsModel.findById(req.user.id, 'fullName email profilePicture').lean();
            if (clientInfo) {
                senderInfo = {
                    _id: req.user.id,
                    fullName: clientInfo.fullName,
                    email: clientInfo.email,
                    profilePicture: clientInfo.profilePicture || null
                };
            } else {
                // Fallback si no se encuentra el cliente
                senderInfo = {
                    _id: req.user.id,
                    fullName: 'Cliente',
                    email: req.user.email || '',
                    profilePicture: null
                };
            }
        }

        const responseMessage = {
            ...chatMessage.toObject(),
            senderId: senderInfo  // ✅ Usar el senderInfo construido correctamente
        };

        const io = req.app.get('io');
        if (io) {
            emitNewMessage(io, actualConversationId, responseMessage);
            
            emitConversationUpdated(io, {
                conversationId: actualConversationId,
                action: conversationId ? 'updated' : 'created',
                lastMessage: updateData.lastMessage,
                lastMessageAt: updateData.lastMessageAt,
                unreadCountAdmin: updatedConversation.unreadCountAdmin,
                unreadCountClient: updatedConversation.unreadCountClient,
                clientId: req.user.userType === 'Customer' ? {
                    _id: req.user.id,
                    fullName: senderInfo.fullName,
                    email: senderInfo.email,
                    profilePicture: senderInfo.profilePicture
                } : null
            });
            
            emitChatStats(io);
        }

        const response = {
            success: true,
            message: responseMessage,
            conversationId: actualConversationId
        };

        if (limitResult.action === 'messages_permanently_deleted') {
            response.limitInfo = {
                deletedMessages: limitResult.deletedCount,
                deletedFiles: limitResult.deletedFiles,
                remainingMessages: limitResult.remainingCount
            };
        }

        res.status(201).json(response);

    } catch (error) {
        console.error('Error en sendMessage:', error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
};

/**
 * ✅ FUNCIÓN 4/8: Obtener mensajes
 */
chatController.getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { page = 1, limit = 50 } = req.query;
        
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Usuario no autenticado"
            });
        }

        const conversation = await ChatConversation.findOne({ 
            conversationId: conversationId 
        }).lean();
        
        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversación no encontrada"
            });
        }

        if (req.user.userType === 'Customer' && conversation.clientId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "No tienes permisos para acceder a esta conversación"
            });
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const messages = await ChatMessage.find({ 
            conversationId
        })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip)
            .lean();

        const populatedMessages = await Promise.all(messages.map(async (message) => {
            let senderInfo;

            if (message.senderType === 'admin') {
                // ✅ CORRECCIÓN: Para mensajes de admin, SIEMPRE usar datos fijos
                senderInfo = {
                    _id: 'admin',
                    fullName: 'Atención al Cliente',
                    email: 'soporte@marquesa.com',
                    profilePicture: '/assets/marquesaMiniLogo.png'
                };
            } else {
                // Para mensajes de cliente, obtener datos reales del cliente
                try {
                    const clientInfo = await clientsModel.findById(message.senderId, 'fullName email profilePicture').lean();
                    if (clientInfo) {
                        senderInfo = {
                            _id: message.senderId,
                            fullName: clientInfo.fullName,
                            email: clientInfo.email,
                            profilePicture: clientInfo.profilePicture || null
                        };
                    } else {
                        // Fallback si no se encuentra el cliente
                        senderInfo = {
                            _id: message.senderId,
                            fullName: 'Cliente',
                            email: '',
                            profilePicture: null
                        };
                    }
                } catch (error) {
                    console.error('Error obteniendo info del cliente:', error);
                    senderInfo = {
                        _id: message.senderId,
                        fullName: 'Cliente',
                        email: '',
                        profilePicture: null
                    };
                }
            }

            return {
                ...message,
                senderId: senderInfo
            };
        }));

        const totalMessages = await ChatMessage.countDocuments({ 
            conversationId
        });

        res.status(200).json({
            success: true,
            messages: populatedMessages.reverse(),
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalMessages / parseInt(limit)),
                totalMessages,
                hasNextPage: skip + messages.length < totalMessages,
                hasPrevPage: parseInt(page) > 1
            }
        });

    } catch (error) {
        console.error('Error en getMessages:', error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
};

/**
 * ✅ FUNCIÓN 5/8: Eliminar mensaje - CORREGIDA PARA ACTUALIZACIONES CORRECTAS
 */
chatController.deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Usuario no autenticado"
            });
        }

        const message = await ChatMessage.findById(messageId);
        if (!message) {
            return res.status(404).json({
                success: false,
                message: "Mensaje no encontrado"
            });
        }

        const messageSenderId = req.user.userType === 'admin' ? 'admin' : req.user.id;
        
        if (message.senderId !== messageSenderId && req.user.userType !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "No tienes permisos para eliminar este mensaje"
            });
        }

        const conversationId = message.conversationId;

        // ✅ LIMPIAR ARCHIVO MULTIMEDIA SI EXISTE
        if (message.media && message.media.url) {
            try {
                const urlParts = message.media.url.split('/');
                const fileWithExt = urlParts[urlParts.length - 1];
                const publicId = `chat_media/${fileWithExt.split('.')[0]}`;
                
                const result = await cloudinary.uploader.destroy(publicId);
                if (result.result === 'ok') {
                    console.log(`✅ Archivo eliminado de Cloudinary: ${publicId}`);
                } else {
                    console.warn(`⚠️ No se pudo eliminar archivo de Cloudinary: ${publicId}`);
                }
            } catch (error) {
                console.error(`❌ Error eliminando archivo de Cloudinary:`, error);
            }
        }

        // ✅ ELIMINACIÓN FÍSICA DEL MENSAJE
        await ChatMessage.findByIdAndDelete(messageId);

        // ✅ FIX CRÍTICO: Calcular nuevo último mensaje ANTES de emitir eventos
        const remainingMessages = await ChatMessage.find({ 
            conversationId 
        }).sort({ createdAt: -1 }).limit(1).lean();

        let newLastMessage = '';
        let newLastMessageAt = new Date();
        let shouldResetUnreadCount = false;

        if (remainingMessages.length > 0) {
            const latestMessage = remainingMessages[0];
            newLastMessage = latestMessage.message || 
                (latestMessage.media?.url ? '📷 Imagen' : 'Sin contenido');
            newLastMessageAt = latestMessage.createdAt;
        } else {
            // ✅ FIX CRÍTICO: Si no quedan mensajes, resetear contadores
            shouldResetUnreadCount = true;
        }

        // ✅ ACTUALIZAR CONVERSACIÓN CON NUEVO ÚLTIMO MENSAJE
        const updateData = {
            lastMessage: newLastMessage,
            lastMessageAt: newLastMessageAt
        };

        // ✅ FIX CRÍTICO: Resetear contadores si no hay mensajes
        if (shouldResetUnreadCount) {
            updateData.unreadCountAdmin = 0;
            updateData.unreadCountClient = 0;
        }

        const updatedConversation = await ChatConversation.findOneAndUpdate(
            { conversationId },
            updateData,
            { new: true }
        );

        const io = req.app.get('io');
        if (io) {
            // ✅ EMITIR EVENTO DE MENSAJE ELIMINADO
            emitMessageDeleted(io, conversationId, messageId, messageSenderId);
            
            // ✅ FIX CRÍTICO: EMITIR EVENTO DE CONVERSACIÓN ACTUALIZADA CON ÚLTIMO MENSAJE CORRECTO
            emitConversationUpdated(io, {
                conversationId,
                action: 'updated',
                lastMessage: newLastMessage,
                lastMessageAt: newLastMessageAt,
                unreadCountAdmin: updatedConversation.unreadCountAdmin,
                unreadCountClient: updatedConversation.unreadCountClient
            });
            
            // ✅ EMITIR ESTADÍSTICAS ACTUALIZADAS
            emitChatStats(io);
        }

        res.status(200).json({
            success: true,
            message: "Mensaje eliminado permanentemente",
            conversationUpdates: {
                lastMessage: newLastMessage,
                lastMessageAt: newLastMessageAt,
                unreadCountAdmin: updatedConversation.unreadCountAdmin,
                unreadCountClient: updatedConversation.unreadCountClient
            }
        });

    } catch (error) {
        console.error('Error en deleteMessage:', error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
};

/**
 * ✅ FUNCIÓN 6/8: Marcar mensajes como leídos
 */
chatController.markAsRead = async (req, res) => {
    try {
        const { conversationId } = req.params;
        
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Usuario no autenticado"
            });
        }

        const queryUserId = req.user.userType === 'admin' ? 'admin' : req.user.id;

        await ChatMessage.updateMany(
            { 
                conversationId,
                senderId: { $ne: queryUserId },
                isRead: false
            },
            { 
                isRead: true,
                readAt: new Date()
            }
        );

        const conversationUpdate = {};
        if (req.user.userType === 'admin') {
            conversationUpdate.unreadCountAdmin = 0;
        } else {
            conversationUpdate.unreadCountClient = 0;
        }

        const updatedConversation = await ChatConversation.findOneAndUpdate(
            { conversationId }, 
            conversationUpdate,
            { new: true }
        );

        const io = req.app.get('io');
        if (io) {
            emitMessagesRead(io, conversationId, {
                userId: req.user.id,
                userType: req.user.userType
            });
            
            emitConversationUpdated(io, {
                conversationId,
                action: 'updated',
                unreadCountAdmin: updatedConversation.unreadCountAdmin,
                unreadCountClient: updatedConversation.unreadCountClient
            });
            
            emitChatStats(io);
        }

        res.status(200).json({
            success: true,
            message: "Mensajes marcados como leídos"
        });

    } catch (error) {
        console.error('Error en markAsRead:', error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
};

/**
 * ✅ FUNCIÓN 7/8: Obtener estadísticas del chat
 */
chatController.getChatStats = async (req, res) => {
    try {
        if (!req.user || req.user.userType !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Acceso denegado"
            });
        }

        const [
            totalConversations,
            activeConversations,
            totalMessages,
            unreadMessages
        ] = await Promise.all([
            ChatConversation.countDocuments(),
            ChatConversation.countDocuments({ status: 'active' }),
            ChatMessage.countDocuments(),
            ChatConversation.aggregate([
                { $group: { _id: null, total: { $sum: '$unreadCountAdmin' } } }
            ])
        ]);

        const unreadCount = unreadMessages.length > 0 ? unreadMessages[0].total : 0;

        res.status(200).json({
            success: true,
            stats: {
                totalConversations,
                activeConversations,
                closedConversations: totalConversations - activeConversations,
                totalMessages,
                unreadMessages: unreadCount
            }
        });

    } catch (error) {
        console.error('Error en getChatStats:', error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
};

/**
 * ✅ FUNCIÓN 8/8: Limpieza programada con eliminación física
 */
chatController.scheduledCleanup = async (req, res) => {
    try {
        if (!req.user || req.user.userType !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Acceso denegado"
            });
        }

        const deletedCount = await cleanupOrphanedConversations();
        
        const activeConversations = await ChatConversation.find({ status: 'active' }).lean();
        let totalDeletedMessages = 0;
        let totalDeletedFiles = 0;
        
        for (const conversation of activeConversations) {
            const result = await enforceMessageLimit(conversation.conversationId);
            if (result.action === 'messages_permanently_deleted') {
                totalDeletedMessages += result.deletedCount;
                totalDeletedFiles += result.deletedFiles;
            }
            await updateConversationLastMessage(conversation.conversationId);
        }
        
        res.status(200).json({
            success: true,
            message: "Limpieza física completada exitosamente",
            results: {
                deletedConversations: deletedCount,
                processedConversations: activeConversations.length,
                totalDeletedMessages,
                totalDeletedFiles,
                cleanupType: 'hard_delete'
            }
        });
        
    } catch (error) {
        console.error('Error en limpieza programada:', error);
        res.status(500).json({
            success: false,
            message: "Error en la limpieza programada"
        });
    }
};

export default chatController;