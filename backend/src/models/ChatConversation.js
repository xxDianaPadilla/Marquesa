import { Schema, model } from "mongoose";

// Esquema para las conversaciones de chat
const chatConversationSchema = new Schema({
    // ID único de la conversación
    conversationId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    // ID del cliente participante en la conversación
    clientId: {
        type: String,
        required: true,
        index: true
    },
    // Estado de la conversación
    status: {
        type: String,
        enum: ['active', 'closed'],
        default: 'active'
    },
    // Último mensaje enviado en la conversación
    lastMessage: {
        type: String,
        default: '',
        maxLength: 1000
    },
    // Fecha y hora del último mensaje
    lastMessageAt: {
        type: Date,
        default: Date.now
    },
    // Contador de mensajes no leídos por el administrador
    unreadCountAdmin: {
        type: Number,
        default: 0,
        min: 0
    },
    // Contador de mensajes no leídos por el cliente
    unreadCountClient: {
        type: Number,
        default: 0,
        min: 0
    }
}, {
    timestamps: true // Agrega createdAt y updatedAt automáticamente
});

// Índices para mejorar el rendimiento de las consultas
chatConversationSchema.index({ clientId: 1, status: 1 });
chatConversationSchema.index({ lastMessageAt: -1 });
chatConversationSchema.index({ status: 1 });

// Método estático para encontrar conversación activa por cliente
chatConversationSchema.statics.findActiveByClient = function(clientId) {
    return this.findOne({ 
        clientId: clientId, 
        status: 'active' 
    });
};

// Método de instancia para marcar como cerrada
chatConversationSchema.methods.close = function() {
    this.status = 'closed';
    return this.save();
};

// Método de instancia para actualizar último mensaje
chatConversationSchema.methods.updateLastMessage = function(message) {
    this.lastMessage = message;
    this.lastMessageAt = new Date();
    return this.save();
};

// Exportar el modelo
export default model("ChatConversation", chatConversationSchema);