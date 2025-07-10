import { Schema, model } from "mongoose";

// Modelo para manejar códigos de verificación de email
const emailVerificationSchema = new Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    verificationCode: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        // Los documentos se eliminarán automáticamente después de la fecha de expiración
        index: { expireAfterSeconds: 0 }
    },
    isUsed: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    strict: false
});

// Índice para optimizar búsquedas por email y código
emailVerificationSchema.index({ email: 1, verificationCode: 1 });

export default model("EmailVerification", emailVerificationSchema);