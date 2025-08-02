import { Schema, model } from "mongoose";

/**
 * Modelo Principal de Mensajes de Chat - SIMPLIFICADO
 * 
 * Este modelo maneja únicamente la estructura básica de los mensajes.
 * Los métodos complejos y utilidades se han movido a las carpetas correspondientes.
 * 
 * Ubicación: backend/src/models/ChatMessage.js
 */

// Esquema básico para los mensajes de chat
const chatMessageSchema = new Schema({
    // ID de la conversación a la que pertenece el mensaje
    conversationId: {
        type: String,
        required: true,
        index: true,
        trim: true
    },
    
    // ID del remitente (puede ser 'admin' o el ID del cliente)
    senderId: {
        type: String,
        required: true,
        trim: true
    },
    
    // Tipo de usuario que envía el mensaje
    senderType: {
        type: String,
        required: true,
        enum: ['admin', 'Customer']
    },
    
    // Contenido del mensaje
    message: {
        type: String,
        required: false, // Permitir mensajes solo con archivos
        maxLength: 1000,
        trim: true,
        default: ''
    },
    
    // Archivo multimedia adjunto (estructura simplificada)
    media: {
        type: {
            type: String,
            enum: ['image', 'document', 'video', 'audio'],
            required: false
        },
        url: {
            type: String,
            required: false,
            trim: true
        },
        filename: {
            type: String,
            required: false,
            trim: true
        },
        size: {
            type: Number,
            required: false,
            min: 0
        }
    },
    
    // Estado del mensaje
    status: {
        type: String,
        enum: ['sent', 'delivered', 'read'],
        default: 'sent'
    },
    
    // Indica si el mensaje ha sido leído
    isRead: {
        type: Boolean,
        default: false,
        index: true
    },
    
    // Fecha y hora en que fue leído
    readAt: {
        type: Date,
        default: null
    },
    
    // Indica si el mensaje fue eliminado (eliminación suave)
    isDeleted: {
        type: Boolean,
        default: false,
        index: true
    },
    
    // Fecha de eliminación
    deletedAt: {
        type: Date,
        default: null
    },
    
    // Quién eliminó el mensaje
    deletedBy: {
        type: String,
        default: null,
        trim: true
    }
}, {
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
    collection: 'chatmessages' // Nombre explícito de la colección
});

// ============ ÍNDICES BÁSICOS PARA RENDIMIENTO ============

// Índice principal para consultas por conversación y fecha
chatMessageSchema.index({ conversationId: 1, createdAt: -1 });
// Índice para filtrar mensajes no eliminados
chatMessageSchema.index({ conversationId: 1, isDeleted: 1, createdAt: -1 });
// Índice para mensajes no leídos
chatMessageSchema.index({ isRead: 1, isDeleted: 1 });
// Índice para limpieza por fecha
chatMessageSchema.index({ createdAt: 1 });

// ============ VALIDACIONES BÁSICAS ============

/**
 * Validación para asegurar que hay contenido en el mensaje
 */
chatMessageSchema.pre('validate', function(next) {
    // Debe tener texto o archivo multimedia
    if (!this.message && !this.media?.url) {
        return next(new Error('El mensaje debe tener texto o archivo multimedia'));
    }
    next();
});

/**
 * Middleware pre-save para limpiar datos
 */
chatMessageSchema.pre('save', function(next) {
    // Si no hay archivo multimedia, eliminar el campo media
    if (!this.media || !this.media.url) {
        this.media = undefined;
    }
    
    // Asegurar que las fechas sean válidas
    if (this.readAt && !this.isRead) {
        this.readAt = null;
    }
    
    if (this.deletedAt && !this.isDeleted) {
        this.deletedAt = null;
        this.deletedBy = null;
    }
    
    next();
});

// ============ MÉTODOS BÁSICOS DE INSTANCIA ============

/**
 * Marca el mensaje como eliminado (eliminación suave)
 * @param {string} deletedBy - Quien elimina el mensaje
 * @returns {Promise<Object>} Mensaje actualizado
 */
chatMessageSchema.methods.softDelete = function(deletedBy) {
    this.isDeleted = true;
    this.deletedAt = new Date();
    this.deletedBy = deletedBy;
    return this.save();
};

/**
 * Marca el mensaje como leído
 * @returns {Promise<Object>} Mensaje actualizado
 */
chatMessageSchema.methods.markAsRead = function() {
    this.isRead = true;
    this.readAt = new Date();
    return this.save();
};

/**
 * Obtiene un resumen del mensaje para mostrar en listas
 * @returns {string} Resumen del mensaje
 */
chatMessageSchema.methods.getSummary = function() {
    if (this.isDeleted) {
        return 'Mensaje eliminado';
    }
    
    if (this.message && this.message.trim()) {
        return this.message.length > 50 
            ? this.message.substring(0, 50) + '...' 
            : this.message;
    }
    
    if (this.media && this.media.url) {
        return `📎 ${this.media.filename || 'Archivo multimedia'}`;
    }
    
    return 'Sin contenido';
};

// ============ CAMPOS VIRTUALES BÁSICOS ============

/**
 * Campo virtual que indica si el mensaje está activo (no eliminado)
 */
chatMessageSchema.virtual('isActive').get(function() {
    return !this.isDeleted;
});

/**
 * Campo virtual que indica si el mensaje tiene archivo adjunto
 */
chatMessageSchema.virtual('hasMedia').get(function() {
    return !!(this.media && this.media.url);
});

/**
 * Campo virtual para la edad del mensaje en horas
 */
chatMessageSchema.virtual('ageInHours').get(function() {
    const now = new Date();
    const created = this.createdAt;
    return Math.floor((now - created) / (1000 * 60 * 60));
});

// ============ CONFIGURACIÓN DEL SCHEMA ============

// Incluir campos virtuales en la serialización
chatMessageSchema.set('toJSON', { virtuals: true });
chatMessageSchema.set('toObject', { virtuals: true });

// Exportar el modelo
export default model("ChatMessage", chatMessageSchema);