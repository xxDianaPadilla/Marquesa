import ChatMessage from "../models/ChatMessage.js";
import ChatConversation from "../models/ChatConversation.js";
import clientsModel from "../models/Clients.js";

/**
 * Utilidades para el Sistema de Chat
 * 
 * Este archivo contiene todas las funciones auxiliares y utilidades
 * para el manejo del sistema de chat, separadas de los modelos principales.
 * 
 * Ubicación: backend/src/utils/chatUtils.js
 */

// ============ CONSTANTES ============

export const CHAT_CONSTANTS = {
    MAX_MESSAGES_PER_CONVERSATION: 75,
    MAX_MESSAGE_LENGTH: 1000,
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    CLEANUP_INTERVAL_HOURS: 24,
    MESSAGE_RETENTION_DAYS: 365
};

// ============ GENERADORES DE ID ============

/**
 * Genera un ID único para una nueva conversación
 * @param {string} clientId - ID del cliente
 * @returns {string} ID único de conversación
 */
export const generateConversationId = (clientId) => {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    return `chat_${clientId}_${timestamp}_${randomSuffix}`;
};

/**
 * Genera un ID único para un mensaje
 * @param {string} conversationId - ID de la conversación
 * @returns {string} ID único de mensaje
 */
export const generateMessageId = (conversationId) => {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    return `msg_${conversationId}_${timestamp}_${randomSuffix}`;
};

// ============ VALIDACIONES ============

/**
 * Valida si un cliente existe en el sistema
 * @param {string} clientId - ID del cliente a verificar
 * @returns {Promise<boolean>} true si el cliente existe
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
 * Valida los datos de un mensaje antes de guardarlo
 * @param {Object} messageData - Datos del mensaje
 * @returns {Object} Resultado de la validación
 */
export const validateMessageData = (messageData) => {
    const errors = [];
    
    // Validar conversationId
    if (!messageData.conversationId) {
        errors.push('ID de conversación es requerido');
    }
    
    // Validar senderId
    if (!messageData.senderId) {
        errors.push('ID del remitente es requerido');
    }
    
    // Validar senderType
    if (!['admin', 'Customer'].includes(messageData.senderType)) {
        errors.push('Tipo de remitente inválido');
    }
    
    // Validar contenido (debe tener mensaje o archivo)
    const hasMessage = messageData.message && messageData.message.trim();
    const hasMedia = messageData.media && messageData.media.url;
    
    if (!hasMessage && !hasMedia) {
        errors.push('El mensaje debe tener texto o archivo multimedia');
    }
    
    // Validar longitud del mensaje
    if (hasMessage && messageData.message.length > CHAT_CONSTANTS.MAX_MESSAGE_LENGTH) {
        errors.push(`El mensaje no puede exceder ${CHAT_CONSTANTS.MAX_MESSAGE_LENGTH} caracteres`);
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
};

// ============ UTILIDADES DE MENSAJES ============

/**
 * Aplica el límite de mensajes por conversación
 * Elimina automáticamente los mensajes más antiguos si se excede el límite
 * @param {string} conversationId - ID de la conversación
 * @returns {Promise<Object>} Resultado de la operación
 */
export const enforceMessageLimit = async (conversationId) => {
    try {
        console.log(`⚙️ Aplicando límite de mensajes para conversación: ${conversationId}`);
        
        // Contar mensajes válidos (no eliminados)
        const messageCount = await ChatMessage.countDocuments({
            conversationId,
            isDeleted: false
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
        console.log(`🗑️ Eliminando ${messagesToDelete} mensajes antiguos`);
        
        // Obtener los mensajes más antiguos para eliminar
        const oldestMessages = await ChatMessage.find({
            conversationId,
            isDeleted: false
        })
        .sort({ createdAt: 1 }) // Más antiguos primero
        .limit(messagesToDelete)
        .select('_id');
        
        if (oldestMessages.length === 0) {
            return {
                action: 'no_messages_to_delete',
                messageCount,
                limit: CHAT_CONSTANTS.MAX_MESSAGES_PER_CONVERSATION
            };
        }
        
        // Marcar como eliminados (eliminación suave)
        const messageIds = oldestMessages.map(msg => msg._id);
        const updateResult = await ChatMessage.updateMany(
            { _id: { $in: messageIds } },
            {
                isDeleted: true,
                deletedAt: new Date(),
                deletedBy: 'system'
            }
        );
        
        console.log(`✅ Eliminados ${updateResult.modifiedCount} mensajes por límite`);
        
        return {
            action: 'messages_deleted',
            deletedCount: updateResult.modifiedCount,
            remainingCount: messageCount - updateResult.modifiedCount,
            limit: CHAT_CONSTANTS.MAX_MESSAGES_PER_CONVERSATION,
            deletedMessageIds: messageIds
        };
        
    } catch (error) {
        console.error('❌ Error aplicando límite de mensajes:', error);
        throw new Error(`Error al aplicar límite de mensajes: ${error.message}`);
    }
};

/**
 * Obtiene el último mensaje válido de una conversación
 * @param {string} conversationId - ID de la conversación
 * @returns {Promise<Object|null>} Último mensaje válido o null
 */
export const getLastValidMessage = async (conversationId) => {
    try {
        return await ChatMessage.findOne({
            conversationId,
            isDeleted: false
        })
        .sort({ createdAt: -1 })
        .lean();
    } catch (error) {
        console.error('Error obteniendo último mensaje válido:', error);
        return null;
    }
};

/**
 * Actualiza el último mensaje de una conversación basándose en mensajes válidos
 * @param {string} conversationId - ID de la conversación
 * @returns {Promise<boolean>} true si se actualizó correctamente
 */
export const updateConversationLastMessage = async (conversationId) => {
    try {
        console.log(`🔄 Actualizando último mensaje para conversación: ${conversationId}`);
        
        // Buscar el último mensaje válido
        const lastMessage = await getLastValidMessage(conversationId);
        
        const updateData = {};
        
        if (lastMessage) {
            // Si hay mensaje válido, usar el texto o indicar multimedia
            updateData.lastMessage = lastMessage.message || 
                (lastMessage.media?.url ? '📎 Archivo multimedia' : 'Sin contenido');
            updateData.lastMessageAt = lastMessage.createdAt;
        } else {
            // Si no hay mensajes válidos, limpiar
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
 * Elimina conversaciones de clientes que ya no existen
 * @param {string|null} specificClientId - ID de cliente específico (opcional)
 * @returns {Promise<Object>} Resultado de la limpieza
 */
export const cleanupOrphanedConversations = async (specificClientId = null) => {
    try {
        console.log('🧹 Iniciando limpieza de conversaciones huérfanas...');
        
        let conversationsToCheck;
        
        if (specificClientId) {
            // Verificar solo conversaciones de un cliente específico
            conversationsToCheck = await ChatConversation.find({ 
                clientId: specificClientId 
            }).lean();
        } else {
            // Verificar todas las conversaciones
            conversationsToCheck = await ChatConversation.find({}).lean();
        }
        
        if (conversationsToCheck.length === 0) {
            return { deletedConversations: 0, deletedMessages: 0 };
        }
        
        const orphanedConversations = [];
        let deletedMessages = 0;
        
        // Verificar existencia de cada cliente
        for (const conversation of conversationsToCheck) {
            const clientExists = await validateClientExists(conversation.clientId);
            
            if (!clientExists) {
                console.log(`🗑️ Cliente ${conversation.clientId} no existe, marcando conversación como huérfana`);
                orphanedConversations.push(conversation);
            }
        }
        
        // Eliminar mensajes y conversaciones huérfanas
        for (const conversation of orphanedConversations) {
            // Eliminar todos los mensajes de la conversación
            const messagesResult = await ChatMessage.deleteMany({ 
                conversationId: conversation.conversationId 
            });
            deletedMessages += messagesResult.deletedCount;
            
            // Eliminar la conversación
            await ChatConversation.findOneAndDelete({ 
                conversationId: conversation.conversationId 
            });
            
            console.log(`✅ Eliminada conversación ${conversation.conversationId} y ${messagesResult.deletedCount} mensajes`);
        }
        
        console.log(`✅ Limpieza completada: ${orphanedConversations.length} conversaciones y ${deletedMessages} mensajes eliminados`);
        
        return {
            deletedConversations: orphanedConversations.length,
            deletedMessages: deletedMessages,
            orphanedConversationIds: orphanedConversations.map(c => c.conversationId)
        };
        
    } catch (error) {
        console.error('❌ Error en limpieza de conversaciones:', error);
        throw new Error(`Error en limpieza: ${error.message}`);
    }
};

/**
 * Obtiene estadísticas de una conversación
 * @param {string} conversationId - ID de la conversación
 * @returns {Promise<Object>} Estadísticas de la conversación
 */
export const getConversationStats = async (conversationId) => {
    try {
        const [
            totalMessages,
            validMessages,
            deletedMessages,
            unreadMessages,
            adminMessages,
            customerMessages
        ] = await Promise.all([
            ChatMessage.countDocuments({ conversationId }),
            ChatMessage.countDocuments({ conversationId, isDeleted: false }),
            ChatMessage.countDocuments({ conversationId, isDeleted: true }),
            ChatMessage.countDocuments({ conversationId, isRead: false, isDeleted: false }),
            ChatMessage.countDocuments({ conversationId, senderType: 'admin', isDeleted: false }),
            ChatMessage.countDocuments({ conversationId, senderType: 'Customer', isDeleted: false })
        ]);
        
        return {
            conversationId,
            totalMessages,
            validMessages,
            deletedMessages,
            unreadMessages,
            adminMessages,
            customerMessages,
            isNearLimit: validMessages >= 70,
            isAtLimit: validMessages >= CHAT_CONSTANTS.MAX_MESSAGES_PER_CONVERSATION,
            utilizationPercentage: Math.round((validMessages / CHAT_CONSTANTS.MAX_MESSAGES_PER_CONVERSATION) * 100)
        };
        
    } catch (error) {
        console.error('Error obteniendo estadísticas de conversación:', error);
        throw new Error(`Error en estadísticas: ${error.message}`);
    }
};

// ============ UTILIDADES DE LIMPIEZA ============

/**
 * Ejecuta limpieza general del sistema de chat
 * @returns {Promise<Object>} Resultado de la limpieza
 */
export const performChatCleanup = async () => {
    try {
        console.log('🧹 Iniciando limpieza general del sistema de chat...');
        
        const results = {
            orphanedConversations: 0,
            deletedMessages: 0,
            appliedLimits: 0,
            errors: []
        };
        
        // 1. Limpiar conversaciones huérfanas
        try {
            const orphanedResult = await cleanupOrphanedConversations();
            results.orphanedConversations = orphanedResult.deletedConversations;
            results.deletedMessages += orphanedResult.deletedMessages;
        } catch (error) {
            results.errors.push(`Error limpiando conversaciones huérfanas: ${error.message}`);
        }
        
        // 2. Aplicar límites a conversaciones activas
        try {
            const activeConversations = await ChatConversation.find({ 
                status: 'active' 
            }).lean();
            
            for (const conversation of activeConversations) {
                try {
                    const limitResult = await enforceMessageLimit(conversation.conversationId);
                    if (limitResult.action === 'messages_deleted') {
                        results.appliedLimits++;
                        results.deletedMessages += limitResult.deletedCount;
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

// ============ UTILIDADES DE FORMATO ============

/**
 * Formatea un mensaje para mostrar en listas o notificaciones
 * @param {Object} message - Objeto de mensaje
 * @param {number} maxLength - Longitud máxima (por defecto 50)
 * @returns {string} Mensaje formateado
 */
export const formatMessageForDisplay = (message, maxLength = 50) => {
    if (!message) return 'Sin mensaje';
    
    if (message.isDeleted) {
        return 'Mensaje eliminado';
    }
    
    if (message.message && message.message.trim()) {
        const text = message.message.trim();
        return text.length > maxLength 
            ? text.substring(0, maxLength) + '...' 
            : text;
    }
    
    if (message.media && message.media.url) {
        return `📎 ${message.media.filename || 'Archivo multimedia'}`;
    }
    
    return 'Sin contenido';
};

/**
 * Formatea la fecha de un mensaje para mostrar en la UI
 * @param {Date} date - Fecha del mensaje
 * @returns {string} Fecha formateada
 */
export const formatMessageDate = (date) => {
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

/**
 * Formatea la hora de un mensaje para mostrar en la UI
 * @param {Date} date - Fecha del mensaje
 * @returns {string} Hora formateada
 */
export const formatMessageTime = (date) => {
    if (!date) return '';
    
    return new Date(date).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
    });
};

// ============ UTILIDADES DE PERMISOS ============

/**
 * Verifica si un usuario puede eliminar un mensaje específico
 * @param {Object} message - Mensaje a verificar
 * @param {string} userId - ID del usuario
 * @param {string} userType - Tipo de usuario ('admin' o 'Customer')
 * @returns {boolean} true si puede eliminar el mensaje
 */
export const canDeleteMessage = (message, userId, userType) => {
    if (!message || !userId || !userType) return false;
    
    // Los administradores pueden eliminar cualquier mensaje
    if (userType === 'admin') {
        return true;
    }
    
    // Los clientes solo pueden eliminar sus propios mensajes
    if (userType === 'Customer') {
        return message.senderType === 'Customer' && message.senderId === userId;
    }
    
    return false;
};

/**
 * Verifica si un usuario puede acceder a una conversación
 * @param {Object} conversation - Conversación a verificar
 * @param {string} userId - ID del usuario
 * @param {string} userType - Tipo de usuario ('admin' o 'Customer')
 * @returns {boolean} true si puede acceder
 */
export const canAccessConversation = (conversation, userId, userType) => {
    if (!conversation || !userId || !userType) return false;
    
    // Los administradores pueden acceder a todas las conversaciones
    if (userType === 'admin') {
        return true;
    }
    
    // Los clientes solo pueden acceder a su propia conversación
    if (userType === 'Customer') {
        return conversation.clientId === userId;
    }
    
    return false;
};

// ============ EXPORTACIONES ADICIONALES ============

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
 * Objeto con todas las utilidades de formato
 */
export const ChatFormatters = {
    formatMessageForDisplay,
    formatMessageDate,
    formatMessageTime
};

/**
 * Objeto con todas las utilidades de limpieza
 */
export const ChatCleanup = {
    enforceMessageLimit,
    cleanupOrphanedConversations,
    performChatCleanup
};

/**
 * Objeto con todas las utilidades de mensajes
 */
export const MessageUtils = {
    getLastValidMessage,
    updateConversationLastMessage,
    getConversationStats
};

// Exportación por defecto con todas las utilidades organizadas
export default {
    Constants: CHAT_CONSTANTS,
    Generators: {
        generateConversationId,
        generateMessageId
    },
    Validators: ChatValidators,
    Formatters: ChatFormatters,
    Cleanup: ChatCleanup,
    Messages: MessageUtils
};