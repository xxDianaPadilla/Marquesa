import ChatMessage from "../models/ChatMessage.js";
import ChatConversation from "../models/ChatConversation.js";
import clientsModel from "../models/Clients.js";
import { emitNewMessage, emitMessageDeleted, emitMessagesRead, emitChatStats } from "../utils/socketConfig.js";
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config.js';

/**
 * Controlador de Chat - CORREGIDO PARA CONVERSACIONES VACÍAS Y ACTUALIZACIONES EN TIEMPO REAL
 * 
 * FIXES IMPLEMENTADOS:
 * - Conversaciones solo aparecen cuando tienen al menos 1 mensaje
 * - Mejor actualización en tiempo real del último mensaje
 * - Actualización correcta de contadores de mensajes no leídos
 * - Eliminación automática de conversaciones huérfanas
 * - Límite de 75 mensajes funcionando correctamente
 * 
 * Ubicación: backend/src/controllers/chatController.js
 */

// ============ CONFIGURACIÓN CLOUDINARY ============
cloudinary.config({
    cloud_name: config.cloudinary.cloud_name,
    api_key: config.cloudinary.cloudinary_api_key,
    api_secret: config.cloudinary.cloudinary_api_secret
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'chat_media',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'mp4', 'mp3', 'wav'],
        transformation: [{ width: 800, height: 600, crop: 'limit', quality: 'auto' }]
    }
});

export const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }
});

// ============ CONSTANTES ============
const MAX_MESSAGES_PER_CONVERSATION = 75;

// ============ FUNCIONES AUXILIARES ============

/**
 * Genera ID único de conversación
 */
const generateConversationId = (clientId) => {
    return `chat_${clientId}_${Date.now()}`;
};

/**
 * Verifica si un cliente existe
 */
const validateClientExists = async (clientId) => {
    try {
        const client = await clientsModel.findById(clientId).lean();
        return !!client;
    } catch (error) {
        return false;
    }
};

/**
 * FUNCIÓN CORREGIDA: Aplica límite de 75 mensajes y elimina antiguos
 */
const enforceMessageLimit = async (conversationId) => {
    try {
        const messageCount = await ChatMessage.countDocuments({ 
            conversationId, 
            isDeleted: false 
        });
        
        if (messageCount > MAX_MESSAGES_PER_CONVERSATION) {
            const messagesToDelete = messageCount - MAX_MESSAGES_PER_CONVERSATION;
            
            const oldestMessages = await ChatMessage.find({ 
                conversationId, 
                isDeleted: false 
            })
            .sort({ createdAt: 1 })
            .limit(messagesToDelete)
            .select('_id');
            
            const messageIds = oldestMessages.map(msg => msg._id);
            await ChatMessage.updateMany(
                { _id: { $in: messageIds } },
                { 
                    isDeleted: true, 
                    deletedAt: new Date(),
                    deletedBy: 'system'
                }
            );
        }
    } catch (error) {
        console.error('Error aplicando límite:', error);
    }
};

/**
 * FUNCIÓN CORREGIDA: Actualiza el último mensaje válido
 */
const updateConversationLastMessage = async (conversationId) => {
    try {
        // Buscar el último mensaje NO ELIMINADO
        const lastMessage = await ChatMessage.findOne({
            conversationId,
            isDeleted: false
        })
        .sort({ createdAt: -1 })
        .lean();
        
        const updateData = {};
        
        if (lastMessage) {
            updateData.lastMessage = lastMessage.message || 
                (lastMessage.media ? '📎 Archivo multimedia' : 'Sin contenido');
            updateData.lastMessageAt = lastMessage.createdAt;
        } else {
            updateData.lastMessage = '';
            updateData.lastMessageAt = new Date();
        }
        
        await ChatConversation.findOneAndUpdate(
            { conversationId },
            updateData
        );
        
    } catch (error) {
        console.error('Error actualizando último mensaje:', error);
    }
};

/**
 * FUNCIÓN CORREGIDA: Elimina conversaciones de clientes inexistentes
 */
const cleanupOrphanedConversations = async () => {
    try {
        const conversations = await ChatConversation.find({}).lean();
        let deletedCount = 0;
        
        for (const conversation of conversations) {
            const clientExists = await validateClientExists(conversation.clientId);
            
            if (!clientExists) {
                // Eliminar mensajes
                await ChatMessage.deleteMany({ conversationId: conversation.conversationId });
                
                // Eliminar conversación
                await ChatConversation.findOneAndDelete({ conversationId: conversation.conversationId });
                
                deletedCount++;
            }
        }
        
        return deletedCount;
    } catch (error) {
        console.error('Error limpiando conversaciones:', error);
        return 0;
    }
};

// ============ CONTROLADOR PRINCIPAL ============
const chatController = {};

/**
 * CORREGIDO: Obtener o crear conversación - NO CREAR HASTA QUE HAYA MENSAJE
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

        // ✅ CAMBIO PRINCIPAL: Buscar conversación existente CON MENSAJES
        let conversation = await ChatConversation.findOne({
            clientId: clientId,
            status: 'active'
        });

        // ✅ VERIFICAR QUE LA CONVERSACIÓN TENGA AL MENOS UN MENSAJE
        if (conversation) {
            const messageCount = await ChatMessage.countDocuments({
                conversationId: conversation.conversationId,
                isDeleted: false
            });
            
            // Si no tiene mensajes, no devolver la conversación aún
            if (messageCount === 0) {
                conversation = null;
            }
        }

        // ✅ SOLO CREAR CONVERSACIÓN CUANDO SE ENVÍE EL PRIMER MENSAJE
        // No crear automáticamente aquí
        if (!conversation) {
            // Para clientes, devolver null hasta que envíen el primer mensaje
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
 * CORREGIDO: Obtener todas las conversaciones - SOLO CON MENSAJES
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
        
        // PRIMERO: Limpiar conversaciones huérfanas
        await cleanupOrphanedConversations();
        
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // ✅ CAMBIO PRINCIPAL: Solo obtener conversaciones que tengan mensajes
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
                    'messages.0': { $exists: true }, // Solo conversaciones con al menos 1 mensaje
                    'messages': { 
                        $elemMatch: { 
                            isDeleted: false // Al menos un mensaje no eliminado
                        } 
                    }
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

        // SEGUNDO: Filtrar y actualizar último mensaje de cada conversación
        const validConversations = [];
        
        for (const conv of conversationsWithMessages) {
            const client = await clientsModel.findById(conv.clientId).lean();
            
            if (client) {
                // Actualizar último mensaje válido
                await updateConversationLastMessage(conv.conversationId);
                
                // Obtener conversación actualizada
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

        // TERCERO: Contar total válido
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
 * CORREGIDO: Enviar mensaje - CREAR CONVERSACIÓN AL PRIMER MENSAJE
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

        let conversation;
        let actualConversationId = conversationId;

        // ✅ LÓGICA PARA CREAR CONVERSACIÓN AL PRIMER MENSAJE
        if (!conversationId && req.user.userType === 'Customer') {
            // Crear conversación automáticamente para el primer mensaje del cliente
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

        // Verificar que el cliente existe
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

        // APLICAR LÍMITE ANTES DE CREAR MENSAJE
        await enforceMessageLimit(actualConversationId);

        const messageSenderId = req.user.userType === 'admin' ? 'admin' : req.user.id;

        const messageData = {
            conversationId: actualConversationId,
            senderId: messageSenderId,
            senderType: req.user.userType,
            message: message?.trim() || '',
            status: 'sent'
        };

        if (req.file) {
            const fileType = req.file.mimetype.startsWith('image/') ? 'image' :
                           req.file.mimetype.startsWith('video/') ? 'video' :
                           req.file.mimetype.startsWith('audio/') ? 'audio' : 'document';
            
            messageData.media = {
                type: fileType,
                url: req.file.path,
                filename: req.file.originalname,
                size: req.file.size
            };
        }

        const chatMessage = new ChatMessage(messageData);
        await chatMessage.save();

        // ✅ ACTUALIZACIÓN CORREGIDA: Actualizar conversación con último mensaje
        const updateData = {
            lastMessage: message?.trim() || `📎 ${req.file?.originalname || 'Archivo multimedia'}`,
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

        // Preparar información del remitente
        let senderInfo = {
            _id: messageSenderId,
            fullName: req.user.userType === 'admin' ? 'Atención al Cliente' : 'Cliente',
            email: req.user.email || '',
            profilePicture: req.user.userType === 'admin' ? '/assets/marquesaMiniLogo.png' : null
        };

        if (req.user.userType === 'Customer') {
            const clientInfo = await clientsModel.findById(req.user.id, 'fullName email profilePicture').lean();
            if (clientInfo) {
                senderInfo = {
                    _id: req.user.id,
                    fullName: clientInfo.fullName,
                    email: clientInfo.email,
                    profilePicture: clientInfo.profilePicture || null
                };
            }
        }

        const responseMessage = {
            ...chatMessage.toObject(),
            senderId: senderInfo
        };

        // ✅ EMISIÓN CORREGIDA: Emitir eventos de Socket.IO con datos actualizados
        const io = req.app.get('io');
        if (io) {
            // Emitir nuevo mensaje
            emitNewMessage(io, actualConversationId, responseMessage);
            
            // ✅ NUEVO: Emitir actualización de conversación para admins
            io.to('admins').emit('conversation_updated', {
                conversationId: actualConversationId,
                lastMessage: updateData.lastMessage,
                lastMessageAt: updateData.lastMessageAt,
                unreadCountAdmin: updatedConversation.unreadCountAdmin,
                unreadCountClient: updatedConversation.unreadCountClient,
                // ✅ INCLUIR INFO DEL CLIENTE para conversaciones nuevas
                clientId: req.user.userType === 'Customer' ? {
                    _id: req.user.id,
                    fullName: senderInfo.fullName,
                    email: senderInfo.email,
                    profilePicture: senderInfo.profilePicture
                } : null
            });
            
            // Emitir estadísticas actualizadas
            emitChatStats(io);
        }

        res.status(201).json({
            success: true,
            message: responseMessage,
            conversationId: actualConversationId // ✅ Devolver el ID de conversación
        });

    } catch (error) {
        console.error('Error en sendMessage:', error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
};

/**
 * CORREGIDO: Eliminar mensaje y actualizar último mensaje EN TIEMPO REAL
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

        // Eliminar mensaje (soft delete)
        await message.softDelete(messageSenderId);

        // ✅ ACTUALIZACIÓN EN TIEMPO REAL: Actualizar último mensaje inmediatamente
        await updateConversationLastMessage(message.conversationId);
        
        // ✅ OBTENER CONVERSACIÓN ACTUALIZADA para enviar por Socket.IO
        const updatedConversation = await ChatConversation.findOne({
            conversationId: message.conversationId
        }).lean();

        const io = req.app.get('io');
        if (io) {
            // Emitir mensaje eliminado
            emitMessageDeleted(io, message.conversationId, messageId, messageSenderId);
            
            // ✅ NUEVO: Emitir actualización de conversación con último mensaje actualizado
            io.to('admins').emit('conversation_updated', {
                conversationId: message.conversationId,
                lastMessage: updatedConversation?.lastMessage || '',
                lastMessageAt: updatedConversation?.lastMessageAt || new Date()
            });
        }

        res.status(200).json({
            success: true,
            message: "Mensaje eliminado exitosamente"
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
 * Obtener mensajes de una conversación
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
        
        // Solo obtener mensajes NO eliminados
        const messages = await ChatMessage.find({ 
            conversationId,
            isDeleted: false 
        })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip)
            .lean();

        const populatedMessages = await Promise.all(messages.map(async (message) => {
            let senderInfo = {
                _id: message.senderId,
                fullName: message.senderType === 'admin' ? 'Atención al Cliente' : 'Cliente',
                email: '',
                profilePicture: message.senderType === 'admin' ? '/assets/marquesaMiniLogo.png' : null
            };

            if (message.senderType === 'Customer' && message.senderId !== 'admin') {
                try {
                    const clientInfo = await clientsModel.findById(message.senderId, 'fullName email profilePicture').lean();
                    if (clientInfo) {
                        senderInfo = {
                            _id: message.senderId,
                            fullName: clientInfo.fullName,
                            email: clientInfo.email,
                            profilePicture: clientInfo.profilePicture || null
                        };
                    }
                } catch (error) {
                    console.error('Error obteniendo info del cliente:', error);
                }
            }

            return {
                ...message,
                senderId: senderInfo
            };
        }));

        const totalMessages = await ChatMessage.countDocuments({ 
            conversationId,
            isDeleted: false 
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
 * CORREGIDO: Marcar mensajes como leídos CON ACTUALIZACIÓN EN TIEMPO REAL
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
                isRead: false,
                isDeleted: false
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

        // ✅ ACTUALIZACIÓN EN TIEMPO REAL: Actualizar conversación y emitir cambios
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
            
            // ✅ NUEVO: Emitir actualización de contador de no leídos
            io.to('admins').emit('conversation_updated', {
                conversationId,
                unreadCountAdmin: updatedConversation.unreadCountAdmin,
                unreadCountClient: updatedConversation.unreadCountClient
            });
            
            // Actualizar estadísticas
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
 * Obtener estadísticas del chat
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
            ChatMessage.countDocuments({ isDeleted: false }),
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
 * Limpieza programada
 */
chatController.scheduledCleanup = async (req, res) => {
    try {
        if (!req.user || req.user.userType !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Acceso denegado"
            });
        }

        // Limpiar conversaciones huérfanas
        const deletedCount = await cleanupOrphanedConversations();
        
        // Aplicar límites a todas las conversaciones activas
        const activeConversations = await ChatConversation.find({ status: 'active' }).lean();
        
        for (const conversation of activeConversations) {
            await enforceMessageLimit(conversation.conversationId);
            await updateConversationLastMessage(conversation.conversationId);
        }
        
        res.status(200).json({
            success: true,
            message: "Limpieza completada exitosamente",
            results: {
                deletedConversations: deletedCount,
                processedConversations: activeConversations.length
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