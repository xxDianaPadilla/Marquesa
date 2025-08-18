// Importación de Schema y model desde mongoose para definir el esquema de la base de datos
import { Schema, model } from "mongoose";

// Modelo para manejar códigos de verificación de recuperación de contraseña
// Este esquema gestiona el proceso de restablecimiento de contraseñas mediante códigos temporales de seguridad
const passwordResetSchema = new Schema({
    // Dirección de correo electrónico del usuario que solicita recuperar su contraseña
    email: {
        type: String,
        required: true,
        lowercase: true, // Convierte automáticamente a minúsculas para consistencia
        trim: true       // Elimina espacios en blanco al inicio y final
    },
    // Código de verificación temporal enviado al email (usualmente numérico de 6 dígitos)
    verificationCode: {
        type: String,
        required: true
    },
    // Fecha y hora límite para usar el código de recuperación
    expiresAt: {
        type: Date,
        required: true,
        // Los documentos se eliminarán automáticamente después de la fecha de expiración
        // TTL (Time To Live) index - MongoDB elimina automáticamente códigos expirados por seguridad
        index: { expireAfterSeconds: 0 }
    },
    // Flag que indica si el código ya fue utilizado para restablecer la contraseña
    isUsed: {
        type: Boolean,
        default: false // Por defecto, los códigos nuevos están disponibles para uso
    }
}, {
    timestamps: true, // Agrega automáticamente createdAt y updatedAt para auditoria
    strict: false     // Permite campos no definidos en el schema
});

// Índice compuesto para optimizar búsquedas durante el proceso de recuperación
// Mejora el rendimiento al validar email + código de verificación simultáneamente
passwordResetSchema.index({ email: 1, verificationCode: 1 });

// Exportación del modelo basado en el esquema
export default model("PasswordReset", passwordResetSchema);