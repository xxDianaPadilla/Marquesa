import { Schema, model } from "mongoose";

/**
 * Modelo Principal de Conversaciones de Chat - SIMPLIFICADO
 * 
 * Este modelo maneja únicamente la estructura básica de las conversaciones.
 * Los métodos complejos y utilidades se han movido a las carpetas correspondientes.
 * 
 * Ubicación: backend/src/models/ChatConversation.js
 */

// Esquema básico para las conversaciones de chat
const chatConversationSchema = new Schema({
    // ID único de la conversación
    conversationId: {
        type: String,
        required: true,
        unique: true,
        index: true,
        trim: true
    },
    
    // ID del cliente participante en la conversación
    clientId: {
        type: String,
        required: true,
        index: true,
        trim: true
    },
    
    // Estado de la conversación (simplificado)
    status: {
        type: String,
        enum: ['active', 'closed'],
        default: 'active',
        index: true
    },
    
    // Último mensaje enviado en la conversación
    lastMessage: {
        type: String,
        default: '',
        maxLength: 1000,
        trim: true
    },
    
    // Fecha y hora del último mensaje
    lastMessageAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    
    // Contador de mensajes no leídos por el administrador
    unreadCountAdmin: {
        type: Number,
        default: 0,
        min: 0,
        max: 999 // Límite razonable
    },
    
    // Contador de mensajes no leídos por el cliente
    unreadCountClient: {
        type: Number,
        default: 0,
        min: 0,
        max: 999 // Límite razonable
    }
}, {
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
    collection: 'chatconversations' // Nombre explícito de la colección
});

// ============ ÍNDICES BÁSICOS PARA RENDIMIENTO ============

// Índice compuesto para búsquedas frecuentes
chatConversationSchema.index({ clientId: 1, status: 1 });
// Índice para ordenamiento por fecha
chatConversationSchema.index({ lastMessageAt: -1 });
// Índice para limpieza por fecha de creación
chatConversationSchema.index({ createdAt: -1 });

// ============ VALIDACIONES BÁSICAS ============

/**
 * Validación pre-guardado para limpiar y validar datos
 */
chatConversationSchema.pre('save', function(next) {
    // Asegurar que los contadores no sean negativos
    if (this.unreadCountAdmin < 0) this.unreadCountAdmin = 0;
    if (this.unreadCountClient < 0) this.unreadCountClient = 0;

    // Truncar el último mensaje si es muy largo
    if (this.lastMessage && this.lastMessage.length > 1000) {
        this.lastMessage = this.lastMessage.substring(0, 997) + '...';
    }

    // Asegurar que lastMessageAt no sea nulo
    if (!this.lastMessageAt) {
        this.lastMessageAt = new Date();
    }

    next();
});

// ============ MÉTODOS BÁSICOS DE INSTANCIA ============

/**
 * Marca la conversación como cerrada
 * @returns {Promise<Object>} Conversación actualizada
 */
chatConversationSchema.methods.close = function() {
    this.status = 'closed';
    return this.save();
};

/**
 * Actualiza el último mensaje de la conversación
 * @param {string} message - Texto del último mensaje
 * @param {Date} messageDate - Fecha del mensaje (opcional)
 * @returns {Promise<Object>} Conversación actualizada
 */
chatConversationSchema.methods.updateLastMessage = function(message, messageDate = null) {
    this.lastMessage = message || '';
    this.lastMessageAt = messageDate || new Date();
    return this.save();
};

// ============ CAMPOS VIRTUALES BÁSICOS ============

/**
 * Campo virtual que indica si la conversación está activa
 */
chatConversationSchema.virtual('isActive').get(function() {
    return this.status === 'active';
});

/**
 * Campo virtual para el total de mensajes no leídos
 */
chatConversationSchema.virtual('totalUnread').get(function() {
    return (this.unreadCountAdmin || 0) + (this.unreadCountClient || 0);
});

// ============ CONFIGURACIÓN DEL SCHEMA ============

// Incluir campos virtuales en la serialización
chatConversationSchema.set('toJSON', { virtuals: true });
chatConversationSchema.set('toObject', { virtuals: true });

// Exportar el modelo
export default model("ChatConversation", chatConversationSchema);