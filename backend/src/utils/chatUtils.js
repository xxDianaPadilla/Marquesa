import ChatMessage from "../models/ChatMessage.js";
import ChatConversation from "../models/ChatConversation.js";
import clientsModel from "../models/Clients.js";
import { v2 as cloudinary } from 'cloudinary';

/**
 * Utilidades para el Sistema de Chat - VERSIÓN ACTUALIZADA SEGÚN INFORME
 * 
 * CAMBIOS IMPLEMENTADOS:
 * - 16 funciones totales (15 esenciales + 1 unificada)
 * - Función formatChatContent unificada (3→1)
 * - Eliminadas 4 funciones redundantes
 * - Solo imágenes permitidas en validaciones
 * - Eliminación física de mensajes
 * 
 * Ubicación: backend/src/utils/chatUtils.js
 */

// ============ CONSTANTES ============

export const CHAT_CONSTANTS = {
    MAX_MESSAGES_PER_CONVERSATION: 75,
    MAX_MESSAGE_LENGTH: 1000,
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    CLEANUP_INTERVAL_HOURS: 24,
    MESSAGE_RETENTION_DAYS: 365,
    BACKUP_ENABLED: false, // Cambiar a true si quieres habilitar backups
    ALLOWED_IMAGE_FORMATS: ['jpg', 'jpeg', 'png', 'gif', 'webp'] // ✅ SOLO IMÁGENES
};

// ============ FUNCIONES DE ELIMINACIÓN FÍSICA ============

/**
 * ✅ FUNCIÓN ESENCIAL 1/16: Limpia archivos multimedia de Cloudinary
 */
export const cleanupCloudinaryFiles = async (messages) => {
    const deletedFiles = [];
    
    for (const message of messages) {
        if (message.media && message.media.url) {
            try {
                // Extraer public_id de la URL de Cloudinary
                const urlParts = message.media.url.split('/');
                const fileWithExt = urlParts[urlParts.length - 1];
                const publicId = `chat_media/${fileWithExt.split('.')[0]}`;
                
                // Eliminar de Cloudinary
                const result = await cloudinary.uploader.destroy(publicId);
                
                if (result.result === 'ok') {
                    deletedFiles.push({
                        publicId,
                        filename: message.media.filename,
                        originalUrl: message.media.url
                    });
                    console.log(`✅ Archivo eliminado de Cloudinary: ${publicId}`);
                } else {
                    console.warn(`⚠️ No se pudo eliminar archivo de Cloudinary: ${publicId} - ${result.result}`);
                }
            } catch (error) {
                console.error(`❌ Error eliminando archivo de Cloudinary para mensaje ${message._id}:`, error);
            }
        }
    }
    
    return deletedFiles;
};

/**
 * ✅ FUNCIÓN ESENCIAL 2/16: Crea backup de mensajes antes de eliminarlos
 */
export const createMessagesBackup = async (messages, reason = 'message_limit_exceeded') => {
    try {
        if (!messages || messages.length === 0 || !CHAT_CONSTANTS.BACKUP_ENABLED) {
            return [];
        }
        
        // Preparar datos del backup
        const backupData = messages.map(msg => ({
            originalId: msg._id,
            conversationId: msg.conversationId,
            senderId: msg.senderId,
            senderType: msg.senderType,
            message: msg.message,
            media: msg.media,
            status: msg.status,
            isRead: msg.isRead,
            readAt: msg.readAt,
            originalCreatedAt: msg.createdAt,
            originalUpdatedAt: msg.updatedAt,
            deletedAt: new Date(),
            deletedBy: 'system_hard_delete',
            backupReason: reason,
            backupVersion: '1.0'
        }));
        
        console.log(`📦 Backup preparado para ${messages.length} mensajes (guardado: ${CHAT_CONSTANTS.BACKUP_ENABLED})`);
        return backupData;
        
    } catch (error) {
        console.error('❌ Error creando backup de mensajes:', error);
        return [];
    }
};

/**
 * ✅ FUNCIÓN ESENCIAL 3/16: Aplica límite con eliminación física
 */
export const enforceMessageLimit = async (conversationId) => {
    try {
        console.log(`🗑️ Aplicando límite físico de mensajes para conversación: ${conversationId}`);
        
        // Contar todos los mensajes físicos existentes
        const messageCount = await ChatMessage.countDocuments({
            conversationId
        });
        
        console.log(`📊 Mensajes actuales: ${messageCount}, Límite: ${CHAT_CONSTANTS.MAX_MESSAGES_PER_CONVERSATION}`);
        
        if (messageCount <= CHAT_CONSTANTS.MAX_MESSAGES_PER_CONVERSATION) {
            return {
                action: 'no_action_needed',
                messageCount,
                limit: CHAT_CONSTANTS.MAX_MESSAGES_PER_CONVERSATION
            };
        }
        
        const messagesToDelete = messageCount - CHAT_CONSTANTS.MAX_MESSAGES_PER_CONVERSATION;
        console.log(`🗑️ Eliminando físicamente ${messagesToDelete} mensajes antiguos`);
        
        // Obtener los mensajes más antiguos para eliminar FÍSICAMENTE
        const oldestMessages = await ChatMessage.find({
            conversationId
        })
        .sort({ createdAt: 1 }) // Más antiguos primero
        .limit(messagesToDelete);
        
        if (oldestMessages.length === 0) {
            return {
                action: 'no_messages_to_delete',
                messageCount,
                limit: CHAT_CONSTANTS.MAX_MESSAGES_PER_CONVERSATION
            };
        }
        
        // PASO 1: Crear backup si está habilitado
        const backup = await createMessagesBackup(oldestMessages);
        
        // PASO 2: Limpiar archivos multimedia de Cloudinary
        const deletedFiles = await cleanupCloudinaryFiles(oldestMessages);
        
        // PASO 3: ELIMINACIÓN FÍSICA de la base de datos
        const messageIds = oldestMessages.map(msg => msg._id);
        const deleteResult = await ChatMessage.deleteMany({
            _id: { $in: messageIds }
        });
        
        console.log(`✅ Eliminados físicamente ${deleteResult.deletedCount} mensajes`);
        console.log(`🗂️ Archivos multimedia eliminados: ${deletedFiles.length}`);
        console.log(`📦 Backup creado: ${backup.length > 0 ? 'Sí' : 'No'}`);
        
        return {
            action: 'messages_permanently_deleted',
            deletedCount: deleteResult.deletedCount,
            deletedFiles: deletedFiles.length,
            backupCreated: backup.length > 0,
            backupCount: backup.length,
            remainingCount: messageCount - deleteResult.deletedCount,
            limit: CHAT_CONSTANTS.MAX_MESSAGES_PER_CONVERSATION,
            deletedMessageIds: messageIds
        };
        
    } catch (error) {
        console.error('❌ Error aplicando límite físico de mensajes:', error);
        throw new Error(`Error al aplicar límite físico de mensajes: ${error.message}`);
    }
};

// ============ GENERADORES DE ID ============

/**
 * ✅ FUNCIÓN ESENCIAL 4/16: Genera ID único para una nueva conversación
 */
export const generateConversationId = (clientId) => {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    return `chat_${clientId}_${timestamp}_${randomSuffix}`;
};

// ❌ FUNCIÓN ELIMINADA: generateMessageId - No se usa en el código

// ============ VALIDACIONES ============

/**
 * ✅ FUNCIÓN ESENCIAL 5/16: Valida si un cliente existe
 */
export const validateClientExists = async (clientId) => {
    try {
        if (!clientId || typeof clientId !== 'string') {
            return false;
        }
        
        const client = await clientsModel.findById(clientId).lean();
        return !!client;
    } catch (error) {
        console.error('Error validando cliente:', error);
        return false;
    }
};

/**
 * ✅ FUNCIÓN ESENCIAL 6/16: Valida los datos de un mensaje antes de guardarlo
 */
export const validateMessageData = (messageData) => {
    const errors = [];
    
    if (!messageData.conversationId) {
        errors.push('ID de conversación es requerido');
    }
    
    if (!messageData.senderId) {
        errors.push('ID del remitente es requerido');
    }
    
    if (!['admin', 'Customer'].includes(messageData.senderType)) {
        errors.push('Tipo de remitente inválido');
    }
    
    const hasMessage = messageData.message && messageData.message.trim();
    const hasMedia = messageData.media && messageData.media.url;
    
    if (!hasMessage && !hasMedia) {
        errors.push('El mensaje debe tener texto o archivo multimedia');
    }
    
    if (hasMessage && messageData.message.length > CHAT_CONSTANTS.MAX_MESSAGE_LENGTH) {
        errors.push(`El mensaje no puede exceder ${CHAT_CONSTANTS.MAX_MESSAGE_LENGTH} caracteres`);
    }
    
    // ✅ VALIDACIÓN ADICIONAL: Solo imágenes
    if (hasMedia && messageData.media.type && messageData.media.type !== 'image') {
        errors.push('Solo se permiten archivos de imagen');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
};

/**
 * ✅ FUNCIÓN ESENCIAL 7/16: Verifica permisos para eliminar mensaje
 */
export const canDeleteMessage = (message, userId, userType) => {
    if (!message || !userId || !userType) return false;
    
    if (userType === 'admin') {
        return true;
    }
    
    if (userType === 'Customer') {
        return message.senderType === 'Customer' && message.senderId === userId;
    }
    
    return false;
};

/**
 * ✅ FUNCIÓN ESENCIAL 8/16: Verifica acceso a conversación
 */
export const canAccessConversation = (conversation, userId, userType) => {
    if (!conversation || !userId || !userType) return false;
    
    if (userType === 'admin') {
        return true;
    }
    
    if (userType === 'Customer') {
        return conversation.clientId === userId;
    }
    
    return false;
};

// ============ UTILIDADES DE MENSAJES ============

/**
 * ✅ FUNCIÓN ESENCIAL 9/16: Obtiene el último mensaje válido
 */
export const getLastValidMessage = async (conversationId) => {
    try {
        // Solo buscar mensajes que existen físicamente
        return await ChatMessage.findOne({
            conversationId
        })
        .sort({ createdAt: -1 })
        .lean();
    } catch (error) {
        console.error('Error obteniendo último mensaje válido:', error);
        return null;
    }
};

/**
 * ✅ FUNCIÓN ESENCIAL 10/16: Actualiza el último mensaje de una conversación
 */
export const updateConversationLastMessage = async (conversationId) => {
    try {
        console.log(`🔄 Actualizando último mensaje para conversación: ${conversationId}`);
        
        const lastMessage = await getLastValidMessage(conversationId);
        
        const updateData = {};
        
        if (lastMessage) {
            updateData.lastMessage = lastMessage.message || 
                (lastMessage.media?.url ? '📷 Imagen' : 'Sin contenido'); // ✅ Icono específico para imágenes
            updateData.lastMessageAt = lastMessage.createdAt;
        } else {
            updateData.lastMessage = '';
            updateData.lastMessageAt = new Date();
        }
        
        await ChatConversation.findOneAndUpdate(
            { conversationId },
            updateData
        );
        
        console.log(`✅ Último mensaje actualizado para ${conversationId}:`, updateData.lastMessage);
        return true;
        
    } catch (error) {
        console.error('❌ Error actualizando último mensaje:', error);
        return false;
    }
};

// ============ UTILIDADES DE CONVERSACIONES ============

/**
 * ✅ FUNCIÓN ESENCIAL 11/16: Elimina conversaciones huérfanas con limpieza completa
 */
export const cleanupOrphanedConversations = async (specificClientId = null) => {
    try {
        console.log('🧹 Iniciando limpieza completa de conversaciones huérfanas...');
        
        let conversationsToCheck;
        
        if (specificClientId) {
            conversationsToCheck = await ChatConversation.find({ 
                clientId: specificClientId 
            }).lean();
        } else {
            conversationsToCheck = await ChatConversation.find({}).lean();
        }
        
        if (conversationsToCheck.length === 0) {
            return { 
                deletedConversations: 0, 
                deletedMessages: 0, 
                deletedFiles: 0 
            };
        }
        
        const orphanedConversations = [];
        let deletedMessages = 0;
        let deletedFiles = 0;
        
        for (const conversation of conversationsToCheck) {
            const clientExists = await validateClientExists(conversation.clientId);
            
            if (!clientExists) {
                console.log(`🗑️ Cliente ${conversation.clientId} no existe, marcando conversación como huérfana`);
                orphanedConversations.push(conversation);
            }
        }
        
        // Eliminar mensajes y archivos de conversaciones huérfanas
        for (const conversation of orphanedConversations) {
            // Obtener mensajes para limpiar archivos multimedia
            const messages = await ChatMessage.find({ 
                conversationId: conversation.conversationId 
            });
            
            if (messages.length > 0) {
                // Limpiar archivos multimedia
                const cleanedFiles = await cleanupCloudinaryFiles(messages);
                deletedFiles += cleanedFiles.length;
                
                // Crear backup si está habilitado
                if (CHAT_CONSTANTS.BACKUP_ENABLED) {
                    await createMessagesBackup(messages, 'orphaned_conversation_cleanup');
                }
                
                // Eliminar todos los mensajes físicamente
                const messagesResult = await ChatMessage.deleteMany({ 
                    conversationId: conversation.conversationId 
                });
                deletedMessages += messagesResult.deletedCount;
            }
            
            // Eliminar la conversación
            await ChatConversation.findOneAndDelete({ 
                conversationId: conversation.conversationId 
            });
            
            console.log(`✅ Eliminada conversación ${conversation.conversationId} con ${messages.length} mensajes y ${deletedFiles} archivos`);
        }
        
        console.log(`✅ Limpieza completa: ${orphanedConversations.length} conversaciones, ${deletedMessages} mensajes, ${deletedFiles} archivos eliminados`);
        
        return {
            deletedConversations: orphanedConversations.length,
            deletedMessages: deletedMessages,
            deletedFiles: deletedFiles,
            orphanedConversationIds: orphanedConversations.map(c => c.conversationId)
        };
        
    } catch (error) {
        console.error('❌ Error en limpieza completa de conversaciones:', error);
        throw new Error(`Error en limpieza completa: ${error.message}`);
    }
};

/**
 * ✅ FUNCIÓN ESENCIAL 12/16: Ejecuta limpieza general del sistema
 */
export const performChatCleanup = async () => {
    try {
        console.log('🧹 Iniciando limpieza general del sistema de chat (eliminación física)...');
        
        const results = {
            orphanedConversations: 0,
            deletedMessages: 0,
            deletedFiles: 0,
            appliedLimits: 0,
            errors: []
        };
        
        // 1. Limpiar conversaciones huérfanas
        try {
            const orphanedResult = await cleanupOrphanedConversations();
            results.orphanedConversations = orphanedResult.deletedConversations;
            results.deletedMessages += orphanedResult.deletedMessages;
            results.deletedFiles += orphanedResult.deletedFiles;
        } catch (error) {
            results.errors.push(`Error limpiando conversaciones huérfanas: ${error.message}`);
        }
        
        // 2. Aplicar límites físicos a conversaciones activas
        try {
            const activeConversations = await ChatConversation.find({ 
                status: 'active' 
            }).lean();
            
            for (const conversation of activeConversations) {
                try {
                    const limitResult = await enforceMessageLimit(conversation.conversationId);
                    if (limitResult.action === 'messages_permanently_deleted') {
                        results.appliedLimits++;
                        results.deletedMessages += limitResult.deletedCount;
                        results.deletedFiles += limitResult.deletedFiles;
                    }
                    
                    // Actualizar último mensaje de cada conversación
                    await updateConversationLastMessage(conversation.conversationId);
                    
                } catch (error) {
                    results.errors.push(`Error en conversación ${conversation.conversationId}: ${error.message}`);
                }
            }
        } catch (error) {
            results.errors.push(`Error aplicando límites: ${error.message}`);
        }
        
        console.log('✅ Limpieza general completada:', results);
        return results;
        
    } catch (error) {
        console.error('❌ Error en limpieza general:', error);
        throw new Error(`Error en limpieza general: ${error.message}`);
    }
};

// ============ FUNCIÓN UNIFICADA DE FORMATO (3→1) ============

/**
 * ✅ FUNCIÓN UNIFICADA 13/16: formatChatContent - Reemplaza 3 funciones anteriores
 * 
 * ANTES (3 funciones separadas):
 * - formatMessageTime(date)
 * - formatMessageDate(date) 
 * - formatMessageForDisplay(msg)
 * 
 * DESPUÉS (1 función unificada):
 */
export const formatChatContent = (data, options = {}) => {
    // Función interna para formatear tiempo
    const formatTime = (date) => {
        if (!date) return '';
        return new Date(date).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    
    // Función interna para formatear fecha
    const formatDate = (date) => {
        if (!date) return '';
        
        const messageDate = new Date(date);
        const now = new Date();
        const diffTime = Math.abs(now - messageDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            return 'Hoy';
        } else if (diffDays === 2) {
            return 'Ayer';
        } else if (diffDays <= 7) {
            return `Hace ${diffDays - 1} días`;
        } else {
            return messageDate.toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                year: messageDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
            });
        }
    };
    
    // Función interna para formatear mensaje
    const formatMessage = (message, maxLength = 50) => {
        if (!message) return 'Sin mensaje';
        
        if (message.message && message.message.trim()) {
            const text = message.message.trim();
            return text.length > maxLength 
                ? text.substring(0, maxLength) + '...' 
                : text;
        }
        
        if (message.media && message.media.url) {
            // ✅ SOLO IMÁGENES: Icono específico para imágenes
            return `📷 ${message.media.filename || 'Imagen'}`;
        }
        
        return 'Sin contenido';
    };
    
    // Determinar qué retornar basado en opciones
    if (options.timeOnly) return formatTime(data);
    if (options.dateOnly) return formatDate(data);
    if (options.messageOnly) return formatMessage(data, options.maxLength);
    
    // Por defecto: formato completo
    return {
        time: formatTime(data),
        date: formatDate(data),
        message: formatMessage(data, options.maxLength)
    };
};

// ============ NUEVAS UTILIDADES PARA GESTIÓN DE ARCHIVOS ============

/**
 * ✅ FUNCIÓN ESENCIAL 14/16: Obtiene estadísticas de almacenamiento
 */
export const getStorageStats = async () => {
    try {
        const [
            totalMessages,
            messagesWithMedia,
            totalConversations
        ] = await Promise.all([
            ChatMessage.countDocuments(),
            ChatMessage.countDocuments({ 'media.url': { $exists: true } }),
            ChatConversation.countDocuments()
        ]);
        
        // Calcular tamaño total de archivos multimedia (aproximado)
        const messagesWithFiles = await ChatMessage.find({ 
            'media.size': { $exists: true } 
        }).select('media.size');
        
        const totalFileSize = messagesWithFiles.reduce((sum, msg) => 
            sum + (msg.media?.size || 0), 0
        );
        
        return {
            totalMessages,
            messagesWithMedia,
            totalConversations,
            totalFileSize,
            totalFileSizeMB: Math.round(totalFileSize / 1024 / 1024),
            averageFilesPerConversation: totalConversations > 0 ? 
                Math.round(messagesWithMedia / totalConversations) : 0,
            storageType: 'physical_only',
            allowedFormats: CHAT_CONSTANTS.ALLOWED_IMAGE_FORMATS // ✅ Solo imágenes
        };
        
    } catch (error) {
        console.error('Error obteniendo estadísticas de storage:', error);
        throw new Error(`Error en estadísticas de storage: ${error.message}`);
    }
};

/**
 * ✅ FUNCIÓN ESENCIAL 15/16: Limpia archivos huérfanos en Cloudinary
 */
export const cleanupOrphanedFiles = async () => {
    try {
        console.log('🧹 Iniciando limpieza de archivos huérfanos en Cloudinary...');
        
        // Obtener todos los archivos en Cloudinary (folder chat_media)
        const cloudinaryFiles = await cloudinary.api.resources({
            type: 'upload',
            prefix: 'chat_media/',
            max_results: 500
        });
        
        // Obtener todas las URLs de archivos en la base de datos
        const dbFiles = await ChatMessage.find({ 
            'media.url': { $exists: true } 
        }).select('media.url');
        
        const dbUrls = new Set(dbFiles.map(msg => msg.media.url));
        const orphanedFiles = [];
        
        // Comparar archivos de Cloudinary con la base de datos
        for (const file of cloudinaryFiles.resources) {
            const fileUrl = file.secure_url;
            if (!dbUrls.has(fileUrl)) {
                orphanedFiles.push({
                    publicId: file.public_id,
                    url: fileUrl,
                    size: file.bytes
                });
            }
        }
        
        // Eliminar archivos huérfanos
        let deletedCount = 0;
        let deletedSize = 0;
        
        for (const file of orphanedFiles) {
            try {
                const result = await cloudinary.uploader.destroy(file.publicId);
                if (result.result === 'ok') {
                    deletedCount++;
                    deletedSize += file.size;
                    console.log(`✅ Archivo huérfano eliminado: ${file.publicId}`);
                }
            } catch (error) {
                console.error(`❌ Error eliminando archivo huérfano ${file.publicId}:`, error);
            }
        }
        
        console.log(`✅ Limpieza de archivos huérfanos completada: ${deletedCount} archivos eliminados (${Math.round(deletedSize / 1024 / 1024)}MB)`);
        
        return {
            totalCloudinaryFiles: cloudinaryFiles.resources.length,
            totalDbFiles: dbFiles.length,
            orphanedFiles: orphanedFiles.length,
            deletedFiles: deletedCount,
            deletedSizeMB: Math.round(deletedSize / 1024 / 1024)
        };
        
    } catch (error) {
        console.error('❌ Error en limpieza de archivos huérfanos:', error);
        throw new Error(`Error en limpieza de archivos: ${error.message}`);
    }
};

/**
 * ✅ FUNCIÓN ESENCIAL 16/16: Configuración de limpieza automática
 */
export const setupAutomaticCleanup = (intervalHours = 24) => {
    console.log(`⏰ Configurando limpieza automática cada ${intervalHours} horas`);
    
    const intervalMs = intervalHours * 60 * 60 * 1000;
    
    const cleanupInterval = setInterval(async () => {
        console.log('🕐 Ejecutando limpieza automática programada...');
        
        try {
            const results = await performChatCleanup();
            console.log('✅ Limpieza automática completada:', results);
            
            // También limpiar archivos huérfanos una vez por semana
            const now = new Date();
            if (now.getDay() === 0 && now.getHours() === 2) { // Domingo a las 2 AM
                console.log('🧹 Ejecutando limpieza semanal de archivos huérfanos...');
                const fileResults = await cleanupOrphanedFiles();
                console.log('✅ Limpieza de archivos completada:', fileResults);
            }
            
        } catch (error) {
            console.error('❌ Error en limpieza automática:', error);
        }
    }, intervalMs);
    
    return cleanupInterval;
};

/**
 * ✅ FUNCIÓN ADICIONAL: Validar integridad del sistema
 */
export const validateSystemIntegrity = async () => {
    try {
        console.log('🔍 Validando integridad del sistema de chat...');
        
        const issues = [];
        
        // 1. Verificar conversaciones sin mensajes
        const conversationsWithoutMessages = await ChatConversation.aggregate([
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
                    'messages': { $size: 0 }
                }
            }
        ]);
        
        if (conversationsWithoutMessages.length > 0) {
            issues.push({
                type: 'conversations_without_messages',
                count: conversationsWithoutMessages.length,
                severity: 'warning'
            });
        }
        
        // 2. Verificar mensajes con archivos que no existen en Cloudinary
        const messagesWithMedia = await ChatMessage.find({
            'media.url': { $exists: true }
        }).select('_id media.url conversationId');
        
        let brokenFiles = 0;
        for (const message of messagesWithMedia.slice(0, 100)) { // Verificar solo los primeros 100
            try {
                const response = await fetch(message.media.url, { method: 'HEAD' });
                if (!response.ok) {
                    brokenFiles++;
                }
            } catch (error) {
                brokenFiles++;
            }
        }
        
        if (brokenFiles > 0) {
            issues.push({
                type: 'broken_media_links',
                count: brokenFiles,
                total_checked: Math.min(100, messagesWithMedia.length),
                severity: 'error'
            });
        }
        
        // 3. Verificar conversaciones con clientes que no existen
        const conversations = await ChatConversation.find({}).select('conversationId clientId');
        let orphanedConversations = 0;
        
        for (const conv of conversations) {
            const clientExists = await validateClientExists(conv.clientId);
            if (!clientExists) {
                orphanedConversations++;
            }
        }
        
        if (orphanedConversations > 0) {
            issues.push({
                type: 'orphaned_conversations',
                count: orphanedConversations,
                severity: 'warning'
            });
        }
        
        // 4. Verificar límites de mensajes
        const conversationsOverLimit = await ChatConversation.aggregate([
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
                    $expr: { $gt: [{ $size: '$messages' }, CHAT_CONSTANTS.MAX_MESSAGES_PER_CONVERSATION] }
                }
            }
        ]);
        
        if (conversationsOverLimit.length > 0) {
            issues.push({
                type: 'conversations_over_limit',
                count: conversationsOverLimit.length,
                severity: 'error'
            });
        }
        
        const integrity = {
            status: issues.length === 0 ? 'healthy' : 'issues_found',
            timestamp: new Date(),
            issues: issues,
            summary: {
                total_conversations: conversations.length,
                total_messages: await ChatMessage.countDocuments(),
                messages_with_media: messagesWithMedia.length,
                issues_found: issues.length
            }
        };
        
        console.log('🔍 Validación de integridad completada:', integrity);
        return integrity;
        
    } catch (error) {
        console.error('❌ Error validando integridad del sistema:', error);
        throw new Error(`Error en validación de integridad: ${error.message}`);
    }
};

// ============ FUNCIONES ELIMINADAS SEGÚN INFORME ============
// ❌ cleanupFiles - Duplicado exacto (reemplazado por cleanupCloudinaryFiles)
// ❌ generateMessageId - No se usa en código  
// ❌ createMessagesBackup - Movido arriba como función esencial
// ❌ cleanupPreview - No solicitado preview

// ============ EXPORTACIONES ORGANIZADAS ============

/**
 * Objeto con todas las constantes del chat para fácil acceso
 */
export const ChatConstants = CHAT_CONSTANTS;

/**
 * Objeto con todas las utilidades de validación
 */
export const ChatValidators = {
    validateClientExists,
    validateMessageData,
    canDeleteMessage,
    canAccessConversation
};

/**
 * Objeto con utilidades de formato unificadas
 */
export const ChatFormatters = {
    formatChatContent // ✅ Función unificada que reemplaza 3 anteriores
};

/**
 * Objeto con todas las utilidades de limpieza (ACTUALIZADO)
 */
export const ChatCleanup = {
    enforceMessageLimit,
    cleanupOrphanedConversations,
    performChatCleanup,
    cleanupCloudinaryFiles,
    cleanupOrphanedFiles,
    createMessagesBackup
};

/**
 * Objeto con todas las utilidades de mensajes
 */
export const MessageUtils = {
    getLastValidMessage,
    updateConversationLastMessage,
    getStorageStats
};

// Exportación por defecto con todas las utilidades organizadas
export default {
    Constants: CHAT_CONSTANTS,
    Generators: {
        generateConversationId
        // ❌ generateMessageId - Eliminado (no se usa)
    },
    Validators: ChatValidators,
    Formatters: ChatFormatters,
    Cleanup: ChatCleanup,
    Messages: MessageUtils,
    Storage: {
        getStorageStats,
        cleanupOrphanedFiles
    },
    System: {
        setupAutomaticCleanup,
        validateSystemIntegrity
    }
};