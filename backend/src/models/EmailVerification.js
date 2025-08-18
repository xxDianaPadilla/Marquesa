// Importación de Schema y model desde mongoose para definir el esquema de la base de datos
import { Schema, model } from "mongoose";

// Modelo para manejar códigos de verificación de email
// Este esquema gestiona el proceso de verificación de correos electrónicos mediante códigos temporales
const emailVerificationSchema = new Schema({
    // Dirección de correo electrónico a verificar
    email: {
        type: String,
        required: true,
        lowercase: true, // Convierte automáticamente a minúsculas para consistencia
        trim: true       // Elimina espacios en blanco al inicio y final
    },
    // Código de verificación generado (usualmente numérico o alfanumérico)
    verificationCode: {
        type: String,
        required: true
    },
    // Fecha y hora de expiración del código de verificación
    expiresAt: {
        type: Date,
        required: true,
        // Los documentos se eliminarán automáticamente después de la fecha de expiración
        // TTL (Time To Live) index - MongoDB eliminará automáticamente los documentos expirados
        index: { expireAfterSeconds: 0 }
    },
    // Indica si el código ya fue utilizado para verificación
    isUsed: {
        type: Boolean,
        default: false // Por defecto, los códigos nuevos no están usados
    }
}, {
    timestamps: true, // Agrega automáticamente createdAt y updatedAt
    strict: false     // Permite campos no definidos en el schema
});

// Índice compuesto para optimizar búsquedas por email y código de verificación
// Mejora el rendimiento en consultas que buscan un código específico para un email
emailVerificationSchema.index({ email: 1, verificationCode: 1 });

// Exportación del modelo basado en el esquema
export default model("EmailVerification", emailVerificationSchema);