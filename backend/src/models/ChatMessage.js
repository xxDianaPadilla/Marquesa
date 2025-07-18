import { Schema, model } from "mongoose";

// Esquema para los mensajes de chat
const chatMessageSchema = new Schema({
    // ID de la conversación a la que pertenece el mensaje
    conversationId: {
        type: String,
        required: true,
        index: true
    },
    // ID del remitente (puede ser 'admin' o el ID del cliente)
    senderId: {
        type: String,
        required: true
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
        required: false, // Cambiar a false para permitir mensajes solo con archivos
        maxLength: 1000,
        trim: true,
        default: ''
    },
    // Archivo multimedia adjunto - ESTRUCTURA CORREGIDA
    media: {
        type: {
            type: String,
            enum: ['image', 'document', 'video', 'audio'],
            required: false // Importante: no requerido para permitir null
        },
        url: {
            type: String,
            required: false
        },
        filename: {
            type: String,
            required: false
        },
        size: {
            type: Number,
            required: false
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
        default: false
    },
    // Fecha y hora en que fue leído
    readAt: {
        type: Date,
        default: null
    },
    // Indica si el mensaje fue eliminado
    isDeleted: {
        type: Boolean,
        default: false
    },
    // Fecha de eliminación
    deletedAt: {
        type: Date,
        default: null
    },
    // Quién eliminó el mensaje
    deletedBy: {
        type: String,
        default: null
    }
}, {
    timestamps: true // Agrega createdAt y updatedAt automáticamente
});

// Validación personalizada para asegurar que hay mensaje o media
chatMessageSchema.pre('validate', function(next) {
    if (!this.message && !this.media?.url) {
        return next(new Error('El mensaje debe tener texto o archivo multimedia'));
    }
    next();
});

// Middleware pre-save para limpiar campos de media cuando no hay archivo
chatMessageSchema.pre('save', function(next) {
    // Si no hay archivo multimedia, eliminar completamente el campo media
    if (!this.media || !this.media.url) {
        this.media = undefined;
    }
    next();
});

// Índices para mejorar el rendimiento de las consultas
chatMessageSchema.index({ conversationId: 1, createdAt: -1 });
chatMessageSchema.index({ senderId: 1 });
chatMessageSchema.index({ isRead: 1 });
chatMessageSchema.index({ isDeleted: 1 });

// Método de instancia para marcar como eliminado
chatMessageSchema.methods.softDelete = function(deletedBy) {
    this.isDeleted = true;
    this.deletedAt = new Date();
    this.deletedBy = deletedBy;
    return this.save();
};

// Método estático para buscar mensajes no eliminados
chatMessageSchema.statics.findNotDeleted = function(query = {}) {
    return this.find({ ...query, isDeleted: { $ne: true } });
};

// Exportar el modelo
export default model("ChatMessage", chatMessageSchema);