import ChatMessage from "../models/ChatMessage.js";
import ChatConversation from "../models/ChatConversation.js";
import clientsModel from "../models/Clients.js";
import { emitNewMessage, emitMessageDeleted, emitMessagesRead, emitChatStats } from "../utils/socketConfig.js";
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config.js';

// Configurar Cloudinary
cloudinary.config({
    cloud_name: config.cloudinary.cloud_name,
    api_key: config.cloudinary.cloudinary_api_key,
    api_secret: config.cloudinary.cloudinary_api_secret
});

// Configurar almacenamiento en Cloudinary para archivos multimedia
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'chat_media',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'mp4', 'mp3', 'wav'],
        transformation: [
            { width: 800, height: 600, crop: 'limit', quality: 'auto' }
        ]
    }
});

export const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB límite
    }
});

const chatController = {};

// Función para generar ID único de conversación
const generateConversationId = (clientId) => {
    return `chat_${clientId}_${Date.now()}`;
};

// Obtener o crear conversación
chatController.getOrCreateConversation = async (req, res) => {
    try {
        const { clientId } = req.params;
        
        console.log('Obteniendo conversación para cliente:', clientId);
        console.log('Usuario autenticado:', req.user);
        
        // Validar usuario autenticado
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Usuario no autenticado"
            });
        }

        // Verificar permisos - los clientes solo pueden acceder a su propia conversación
        if (req.user.userType === 'Customer' && req.user.id !== clientId) {
            return res.status(403).json({
                success: false,
                message: "No tienes permisos para acceder a esta conversación"
            });
        }
        
        // Verificar que el cliente existe
        const client = await clientsModel.findById(clientId).lean();
        if (!client) {
            return res.status(404).json({
                success: false,
                message: "Cliente no encontrado"
            });
        }

        // Buscar conversación existente activa usando el método estático
        let conversation = await ChatConversation.findActiveByClient(clientId);

        // Si no existe, crear nueva conversación
        if (!conversation) {
            const conversationId = generateConversationId(clientId);
            conversation = new ChatConversation({
                conversationId,
                clientId: clientId
            });
            await conversation.save();
            console.log('Nueva conversación creada:', conversationId);
        } else {
            console.log('Conversación existente encontrada:', conversation.conversationId);
        }

        // Preparar respuesta con información del cliente
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
            message: "Error interno del servidor",
            error: error.message
        });
    }
};

// Enviar mensaje (con archivo multimedia opcional) - CORREGIDO
chatController.sendMessage = async (req, res) => {
    try {
        console.log('=== ENVIAR MENSAJE ===');
        console.log('Body:', req.body);
        console.log('File:', req.file);
        console.log('User:', req.user);
        
        const { conversationId, message } = req.body;
        
        // Validar usuario autenticado
        if (!req.user) {
            console.error('Usuario no autenticado');
            return res.status(401).json({
                success: false,
                message: "Usuario no autenticado"
            });
        }

        const { id: senderId, userType: senderType } = req.user;

        // Validar datos requeridos (mensaje o archivo)
        if (!conversationId) {
            console.error('ConversationId requerido');
            return res.status(400).json({
                success: false,
                message: "ID de conversación es requerido"
            });
        }

        if (!message?.trim() && !req.file) {
            console.error('Mensaje o archivo requerido');
            return res.status(400).json({
                success: false,
                message: "Debes enviar un mensaje de texto o un archivo"
            });
        }

        // Verificar que la conversación existe
        const conversation = await ChatConversation.findOne({ 
            conversationId: conversationId 
        });
        
        if (!conversation) {
            console.error('Conversación no encontrada:', conversationId);
            return res.status(404).json({
                success: false,
                message: "Conversación no encontrada"
            });
        }

        // Verificar permisos - los clientes solo pueden enviar mensajes a su conversación
        if (senderType === 'Customer' && conversation.clientId !== senderId) {
            console.error('Permisos insuficientes:', { senderType, conversationClientId: conversation.clientId, senderId });
            return res.status(403).json({
                success: false,
                message: "No tienes permisos para enviar mensajes a esta conversación"
            });
        }

        // Crear mensaje con el ID del remitente
        const messageSenderId = senderType === 'admin' ? 'admin' : senderId;

        const messageData = {
            conversationId,
            senderId: messageSenderId,
            senderType,
            message: message?.trim() || '',
            status: 'sent'
        };

        // CORRECCIÓN: Solo agregar media si hay archivo
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
            console.log('Archivo adjunto:', messageData.media);
        }
        // IMPORTANTE: No agregar media si no hay archivo (esto evita el error de null)

        console.log('Datos del mensaje a guardar:', messageData);

        const chatMessage = new ChatMessage(messageData);
        await chatMessage.save();

        console.log('Mensaje guardado exitosamente:', chatMessage._id);

        // Actualizar la conversación con el último mensaje
        const updateData = {
            lastMessage: message?.trim() || `📎 ${req.file?.originalname || 'Archivo multimedia'}`,
            lastMessageAt: new Date(),
            status: 'active'
        };

        // Incrementar contador de mensajes no leídos según el tipo de usuario
        if (senderType === 'admin') {
            updateData.unreadCountClient = (conversation.unreadCountClient || 0) + 1;
        } else {
            updateData.unreadCountAdmin = (conversation.unreadCountAdmin || 0) + 1;
        }

        await ChatConversation.findOneAndUpdate(
            { conversationId },
            updateData
        );

        // Obtener información del remitente
        let senderInfo = {
            _id: messageSenderId,
            fullName: senderType === 'admin' ? 'Atención al Cliente' : 'Cliente',
            email: req.user.email || '',
            profilePicture: null
        };

        if (senderType === 'Customer') {
            const clientInfo = await clientsModel.findById(senderId, 'fullName email profilePicture').lean();
            if (clientInfo) {
                senderInfo = {
                    _id: senderId,
                    fullName: clientInfo.fullName,
                    email: clientInfo.email,
                    profilePicture: clientInfo.profilePicture || null
                };
            }
        } else {
            // Para admin, usar imagen de marquesa
            senderInfo.profilePicture = '/assets/marquesaMiniLogo.png';
        }

        // Preparar respuesta del mensaje
        const responseMessage = {
            ...chatMessage.toObject(),
            senderId: senderInfo
        };

        console.log('Mensaje preparado para respuesta:', responseMessage._id);

        // ===== EMISIÓN EN TIEMPO REAL =====
        // Obtener instancia de Socket.IO
        const io = req.app.get('io');
        if (io) {
            console.log('Emitiendo mensaje via Socket.IO...');
            // Emitir nuevo mensaje a todos los usuarios en la conversación
            emitNewMessage(io, conversationId, responseMessage);
            
            // Emitir estadísticas actualizadas a administradores
            emitChatStats(io);
        } else {
            console.warn('Socket.IO no disponible');
        }

        res.status(201).json({
            success: true,
            message: responseMessage
        });

    } catch (error) {
        console.error('Error en sendMessage:', error);
        
        // Manejo específico del error de validación de Mongoose
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: "Error de validación en los datos del mensaje",
                details: error.message
            });
        }
        
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: error.message
        });
    }
};

// Eliminar mensaje
chatController.deleteMessage = async (req, res) => {
    try {
        console.log('=== ELIMINAR MENSAJE ===');
        const { messageId } = req.params;
        console.log('ID del mensaje a eliminar:', messageId);
        console.log('Usuario:', req.user);
        
        // Validar usuario autenticado
        if (!req.user) {
            console.error('Usuario no autenticado');
            return res.status(401).json({
                success: false,
                message: "Usuario no autenticado"
            });
        }

        const { id: userId, userType } = req.user;

        // Buscar el mensaje
        const message = await ChatMessage.findById(messageId);
        if (!message) {
            console.error('Mensaje no encontrado:', messageId);
            return res.status(404).json({
                success: false,
                message: "Mensaje no encontrado"
            });
        }

        console.log('Mensaje encontrado:', {
            id: message._id,
            senderId: message.senderId,
            senderType: message.senderType,
            conversationId: message.conversationId
        });

        // Verificar permisos - solo el remitente o admin puede eliminar
        const messageSenderId = userType === 'admin' ? 'admin' : userId;
        
        console.log('Verificando permisos:', {
            messageSenderId,
            messageOriginalSender: message.senderId,
            userType,
            canDelete: message.senderId === messageSenderId || userType === 'admin'
        });

        if (message.senderId !== messageSenderId && userType !== 'admin') {
            console.error('Permisos insuficientes para eliminar mensaje');
            return res.status(403).json({
                success: false,
                message: "No tienes permisos para eliminar este mensaje"
            });
        }

        // Marcar como eliminado
        await message.softDelete(messageSenderId);
        console.log('Mensaje marcado como eliminado exitosamente');

        // ===== EMISIÓN EN TIEMPO REAL =====
        const io = req.app.get('io');
        if (io) {
            console.log('Emitiendo eliminación via Socket.IO...');
            emitMessageDeleted(io, message.conversationId, messageId, messageSenderId);
        } else {
            console.warn('Socket.IO no disponible');
        }

        res.status(200).json({
            success: true,
            message: "Mensaje eliminado exitosamente"
        });

    } catch (error) {
        console.error('Error en deleteMessage:', error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: error.message
        });
    }
};

// Obtener mensajes de una conversación
chatController.getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { page = 1, limit = 50 } = req.query;
        
        console.log('Obteniendo mensajes:', { conversationId, page, limit });
        
        // Validar usuario autenticado
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Usuario no autenticado"
            });
        }

        const { id: userId, userType } = req.user;

        // Verificar que la conversación existe
        const conversation = await ChatConversation.findOne({ 
            conversationId: conversationId 
        }).lean();
        
        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversación no encontrada"
            });
        }

        // Verificar permisos - los clientes solo pueden ver mensajes de su conversación
        if (userType === 'Customer' && conversation.clientId !== userId) {
            return res.status(403).json({
                success: false,
                message: "No tienes permisos para acceder a esta conversación"
            });
        }

        // Obtener mensajes con paginación (incluyendo eliminados para mostrar placeholder)
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const messages = await ChatMessage.find({ conversationId })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip)
            .lean();

        console.log(`Encontrados ${messages.length} mensajes`);

        // Población manual de la información del remitente
        const populatedMessages = await Promise.all(messages.map(async (message) => {
            let senderInfo = {
                _id: message.senderId,
                fullName: message.senderType === 'admin' ? 'Atención al Cliente' : 'Cliente',
                email: '',
                profilePicture: null
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
            } else if (message.senderType === 'admin') {
                senderInfo.profilePicture = '/assets/marquesaMiniLogo.png';
            }

            return {
                ...message,
                senderId: senderInfo
            };
        }));

        // Contar total de mensajes para paginación
        const totalMessages = await ChatMessage.countDocuments({ conversationId });

        res.status(200).json({
            success: true,
            messages: populatedMessages.reverse(), // Revertir para mostrar cronológicamente
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
            message: "Error interno del servidor",
            error: error.message
        });
    }
};

// Marcar mensajes como leídos
chatController.markAsRead = async (req, res) => {
    try {
        const { conversationId } = req.params;
        
        // Validar usuario autenticado
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Usuario no autenticado"
            });
        }

        const { id: userId, userType } = req.user;
        const queryUserId = userType === 'admin' ? 'admin' : userId;

        // Marcar mensajes como leídos (excepto los propios)
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

        // Resetear contador de mensajes no leídos en la conversación
        const conversationUpdate = {};
        if (userType === 'admin') {
            conversationUpdate.unreadCountAdmin = 0;
        } else {
            conversationUpdate.unreadCountClient = 0;
        }

        await ChatConversation.findOneAndUpdate(
            { conversationId },
            conversationUpdate
        );

        // ===== EMISIÓN EN TIEMPO REAL =====
        // Obtener instancia de Socket.IO
        const io = req.app.get('io');
        if (io) {
            // Emitir evento de mensajes leídos
            emitMessagesRead(io, conversationId, {
                userId: userId,
                userType: userType
            });
        }

        res.status(200).json({
            success: true,
            message: "Mensajes marcados como leídos"
        });

    } catch (error) {
        console.error('Error en markAsRead:', error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: error.message
        });
    }
};

// Obtener todas las conversaciones (solo administradores)
chatController.getAllConversations = async (req, res) => {
    try {
        // Validar que sea administrador
        if (!req.user || req.user.userType !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Acceso denegado"
            });
        }

        const { page = 1, limit = 20, status = 'all' } = req.query;
        
        // Construir filtro de búsqueda
        const filter = {};
        if (status !== 'all') {
            filter.status = status;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Obtener conversaciones ordenadas por último mensaje
        const conversations = await ChatConversation.find(filter)
            .sort({ lastMessageAt: -1 })
            .limit(parseInt(limit))
            .skip(skip)
            .lean();

        // Población manual de información del cliente para cada conversación
        const populatedConversations = await Promise.all(
            conversations.map(async (conv) => {
                try {
                    const client = await clientsModel.findById(conv.clientId, 'fullName email profilePicture').lean();
                    return {
                        ...conv,
                        clientId: client || { 
                            _id: conv.clientId, 
                            fullName: 'Cliente desconocido', 
                            email: '',
                            profilePicture: null
                        }
                    };
                } catch (error) {
                    return {
                        ...conv,
                        clientId: { 
                            _id: conv.clientId, 
                            fullName: 'Cliente con error', 
                            email: '',
                            profilePicture: null
                        }
                    };
                }
            })
        );

        // Contar total de conversaciones para paginación
        const totalConversations = await ChatConversation.countDocuments(filter);

        res.status(200).json({
            success: true,
            conversations: populatedConversations,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalConversations / parseInt(limit)),
                totalConversations,
                hasNextPage: skip + conversations.length < totalConversations,
                hasPrevPage: parseInt(page) > 1
            }
        });

    } catch (error) {
        console.error('Error en getAllConversations:', error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: error.message
        });
    }
};

// Obtener estadísticas del chat (solo administradores)
chatController.getChatStats = async (req, res) => {
    try {
        // Validar que sea administrador
        if (!req.user || req.user.userType !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Acceso denegado"
            });
        }

        // Ejecutar consultas en paralelo para mejor rendimiento
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
            message: "Error interno del servidor",
            error: error.message
        });
    }
};

export default chatController;