// Reemplazamos nodemailer por Brevo API
import { sendPasswordResetEmail } from "../middlewares/envioCorreo.js";
import bcryptjs from "bcryptjs";
import clientsModel from "../models/Clients.js";
import passwordResetModel from "../models/PasswordReset.js";
import { getEmailTemplate } from "../utils/passwordResetDesign.js";

const passwordResetController = {};

// Función helper para configuración dinámica de cookies basada en el entorno
const getCookieConfig = () => {
    const isProduction = process.env.NODE_ENV === 'production';

    // Configuración específica para Render + Vercel
    if (isProduction) {
        return {
            httpOnly: false, // Permitir acceso desde JavaScript (crítico para cross-domain)
            secure: true, // HTTPS obligatorio en producción
            sameSite: 'none', // Permitir cookies cross-domain
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días (más duradero)
            domain: undefined, // No especificar domain para cross-domain
            path: '/'
        };
    } else {
        // Configuración para desarrollo local
        return {
            httpOnly: false,
            secure: false,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
            domain: undefined,
            path: '/'
        };
    }
};

// Función helper para obtener token de múltiples fuentes en la petición
const getTokenFromRequest = (req) => {
    let token = req.cookies?.authToken;
    let source = 'cookie';

    if (!token) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
            source = 'authorization_header';
        }
    }

    return { token, source };
};

// Cache para prevenir múltiples envíos rápidos de recuperación de contraseña
const resetRequestCache = new Map();
const CACHE_DURATION = 60000; // 60 segundos (más estricto para recuperación)

// Función helper para validar email
const validateEmail = (email) => {
    if (!email || typeof email !== 'string') {
        return { isValid: false, error: "Email es requerido" };
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (trimmedEmail.length === 0) {
        return { isValid: false, error: "Email no puede estar vacío" };
    }

    // Validación de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
        return { isValid: false, error: "Formato de email no válido" };
    }

    if (trimmedEmail.length > 254) {
        return { isValid: false, error: "Email demasiado largo" };
    }

    return { isValid: true, value: trimmedEmail };
};

// Función helper para validar código de verificación
const validateVerificationCode = (code) => {
    if (!code || typeof code !== 'string') {
        return { isValid: false, error: "Código de verificación es requerido" };
    }

    const trimmedCode = code.toString().trim();

    if (!/^\d{6}$/.test(trimmedCode)) {
        return { isValid: false, error: "Código debe ser exactamente 6 dígitos" };
    }

    return { isValid: true, value: trimmedCode };
};

// Función helper para validar contraseña
const validatePassword = (password) => {
    if (!password || typeof password !== 'string') {
        return { isValid: false, error: "Contraseña es requerida" };
    }

    if (password.length < 8) {
        return { isValid: false, error: "Contraseña debe tener al menos 8 caracteres" };
    }

    if (password.length > 128) {
        return { isValid: false, error: "Contraseña demasiado larga" };
    }

    // Validar complejidad de contraseña
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);

    if (!hasUppercase || !hasLowercase || !hasNumbers) {
        return {
            isValid: false,
            error: "Contraseña debe contener al menos una mayúscula, una minúscula y un número"
        };
    }

    return { isValid: true };
};

// Generar código de verificación de 6 dígitos
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Limpiar cache de recuperación periódicamente
setInterval(() => {
    const now = Date.now();
    for (const [key, timestamp] of resetRequestCache.entries()) {
        if (now - timestamp > CACHE_DURATION) {
            resetRequestCache.delete(key);
        }
    }
}, CACHE_DURATION);

// Solicitar código de recuperación de contraseña
passwordResetController.requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;

        console.log('=== INICIO requestPasswordReset (BREVO) ===');
        console.log('Email recibido:', email);
        console.log('Timestamp:', new Date().toISOString());

        // Validar email
        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: emailValidation.error
            });
        }

        const emailKey = emailValidation.value;
        const now = Date.now();

        // Verificar si hay una solicitud reciente para este email (más estricto que verificación)
        if (resetRequestCache.has(emailKey)) {
            const lastRequest = resetRequestCache.get(emailKey);
            const timeDiff = now - lastRequest;

            console.log(`Solicitud duplicada detectada para ${emailKey}`);
            console.log(`Tiempo desde última solicitud: ${timeDiff}ms`);

            if (timeDiff < CACHE_DURATION) {
                console.log('Solicitud bloqueada por ser muy reciente');
                return res.status(429).json({
                    success: false,
                    message: "Ya se envió un código recientemente. Espera 60 segundos antes de solicitar otro."
                });
            }
        }

        // Marcar esta solicitud en el cache
        resetRequestCache.set(emailKey, now);

        // Verificar que el cliente existe en la base de datos
        let client;
        try {
            client = await clientsModel.findOne({ email: emailKey });
        } catch (dbError) {
            console.error('Error verificando cliente:', dbError);
            return res.status(503).json({
                success: false,
                message: "Servicio de base de datos no disponible temporalmente"
            });
        }

        if (!client) {
            console.log('Cliente no encontrado:', emailKey);
            return res.status(404).json({
                success: false,
                message: "Usuario no existe"
            });
        }

        // Generar código de verificación
        const verificationCode = generateVerificationCode();

        // Calcular tiempo de expiración (5 minutos)
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        console.log('Código de recuperación generado:', verificationCode);

        try {
            // Eliminar códigos anteriores para este email
            const deleteResult = await passwordResetModel.deleteMany({ email: emailKey });
            console.log('Códigos anteriores eliminados:', deleteResult.deletedCount);

            // Crear nuevo registro de recuperación
            const passwordReset = new passwordResetModel({
                email: emailKey,
                verificationCode,
                expiresAt
            });

            await passwordReset.save();
            console.log('Código de recuperación guardado en BD con ID:', passwordReset._id);
        } catch (dbError) {
            console.error('Error guardando código de reset:', dbError);
            return res.status(503).json({
                success: false,
                message: "Error en el servicio de recuperación"
            });
        }

        // Configurar y enviar email usando Brevo
        try {
            console.log('Iniciando envío de email de recuperación con BREVO...');

            // Generar template HTML
            const htmlTemplate = getEmailTemplate(verificationCode);

            console.log('Enviando email de recuperación a:', emailKey);

            // Llamar a la función de Brevo en lugar de nodemailer
            const emailResult = await sendPasswordResetEmail(
                emailKey,
                verificationCode,
                client.fullName, // Usar nombre del cliente de la BD
                htmlTemplate
            );

            console.log('Email de recuperación enviado exitosamente con BREVO. MessageId:', emailResult.messageId);

        } catch (emailError) {
            console.error('Error detallado al enviar email de recuperación con BREVO:', {
                message: emailError.message,
                service: emailError.service,
                originalError: emailError.originalError
            });

            // Determinar el tipo de error específico para recuperación
            let errorMessage = "Error enviando correo de recuperación. Inténtalo de nuevo.";

            if (emailError.message?.includes('api-key')) {
                errorMessage = "Error de configuración del servicio de email. Contacta al administrador.";
            } else if (emailError.message?.includes('network') || emailError.message?.includes('fetch')) {
                errorMessage = "Error de conexión. Verifica tu conexión a internet.";
            } else if (emailError.message?.includes('Invalid email')) {
                errorMessage = "Formato de correo electrónico no válido.";
            }

            return res.status(502).json({
                success: false,
                message: errorMessage,
                details: process.env.NODE_ENV === 'development' ? emailError.message : undefined
            });
        }

        console.log('=== FIN requestPasswordReset (BREVO) ===');

        // Configurar cookies con configuración dinámica
        const cookieConfig = getCookieConfig();
        res.cookie("passwordResetToken", "reset_in_progress", cookieConfig);

        res.status(200).json({
            success: true,
            message: "Correo enviado, tienes 5 minutos para usar el código",
            token: "reset_in_progress" // También en el body para mayor compatibilidad
        });

    } catch (error) {
        console.error('Error en requestPasswordReset:', error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
};

// Verificar código de recuperación
passwordResetController.verifyCode = async (req, res) => {
    try {
        const { email, verificationCode } = req.body;

        console.log('=== INICIO verifyCode ===');
        console.log('Datos recibidos:', { email, verificationCode });

        // Validar email
        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: emailValidation.error
            });
        }

        // Validar código de verificación
        const codeValidation = validateVerificationCode(verificationCode);
        if (!codeValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: codeValidation.error
            });
        }

        const emailKey = emailValidation.value;
        const codeToVerify = codeValidation.value;

        // Buscar código válido y no expirado
        let resetRecord;
        try {
            resetRecord = await passwordResetModel.findOne({
                email: emailKey,
                verificationCode: codeToVerify,
                expiresAt: { $gt: new Date() },
                isUsed: false
            }).sort({ createdAt: -1 }); // Obtener el más reciente

            console.log('Código encontrado para verificación:', resetRecord ? {
                id: resetRecord._id,
                code: resetRecord.verificationCode,
                expiresAt: resetRecord.expiresAt,
                isUsed: resetRecord.isUsed
            } : 'Ninguno');
        } catch (dbError) {
            console.error('Error verificando código de reset:', dbError);
            return res.status(503).json({
                success: false,
                message: "Error en el servicio de verificación"
            });
        }

        if (!resetRecord) {
            return res.status(400).json({
                success: false,
                message: "Código de verificación incorrecto o expirado"
            });
        }

        console.log('=== FIN verifyCode ===');

        // Configurar cookies con configuración dinámica para indicar verificación exitosa
        const cookieConfig = getCookieConfig();
        res.cookie("passwordResetVerified", "code_verified", cookieConfig);

        res.status(200).json({
            success: true,
            message: "Código verificado correctamente",
            token: "code_verified" // También en el body para mayor compatibilidad
        });

    } catch (error) {
        console.error('Error en verifyCode:', error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
};

// Actualizar contraseña
passwordResetController.updatePassword = async (req, res) => {
    try {
        const { email, verificationCode, newPassword } = req.body;

        console.log('=== INICIO updatePassword ===');
        console.log('Datos recibidos:', { email, verificationCode, newPassword: 'presente' });

        // Validar email
        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: emailValidation.error
            });
        }

        // Validar código de verificación
        const codeValidation = validateVerificationCode(verificationCode);
        if (!codeValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: codeValidation.error
            });
        }

        // Validar nueva contraseña
        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: passwordValidation.error
            });
        }

        const emailKey = emailValidation.value;
        const codeToVerify = codeValidation.value;

        // Verificar que el código sigue siendo válido
        let resetRecord;
        try {
            resetRecord = await passwordResetModel.findOne({
                email: emailKey,
                verificationCode: codeToVerify,
                expiresAt: { $gt: new Date() },
                isUsed: false
            }).sort({ createdAt: -1 }); // Obtener el más reciente

            console.log('Código encontrado para actualización:', resetRecord ? {
                id: resetRecord._id,
                code: resetRecord.verificationCode,
                expiresAt: resetRecord.expiresAt,
                isUsed: resetRecord.isUsed
            } : 'Ninguno');
        } catch (dbError) {
            console.error('Error verificando código de reset:', dbError);
            return res.status(503).json({
                success: false,
                message: "Error en el servicio de verificación"
            });
        }

        if (!resetRecord) {
            return res.status(400).json({
                success: false,
                message: "Código de verificación incorrecto o expirado"
            });
        }

        // Verificar que el cliente existe
        let client;
        try {
            client = await clientsModel.findOne({ email: emailKey });
        } catch (dbError) {
            console.error('Error verificando cliente:', dbError);
            return res.status(503).json({
                success: false,
                message: "Error verificando usuario"
            });
        }

        if (!client) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado"
            });
        }

        // Hashear nueva contraseña
        let hashedPassword;
        try {
            hashedPassword = await bcryptjs.hash(newPassword, 10);
        } catch (hashError) {
            console.error('Error hasheando nueva contraseña:', hashError);
            return res.status(500).json({
                success: false,
                message: "Error procesando nueva contraseña"
            });
        }

        // Actualizar contraseña del cliente
        try {
            await clientsModel.findByIdAndUpdate(client._id, {
                password: hashedPassword
            });
            console.log('Contraseña actualizada para cliente:', client._id);
        } catch (dbError) {
            console.error('Error actualizando contraseña:', dbError);
            return res.status(503).json({
                success: false,
                message: "Error actualizando contraseña"
            });
        }

        // Marcar código como usado y eliminar todos los códigos para este email
        try {
            await passwordResetModel.deleteMany({ email: emailKey });
            console.log('Todos los códigos de recuperación eliminados para:', emailKey);
        } catch (dbError) {
            console.error('Error limpiando códigos de recuperación:', dbError);
            // No fallar por esto
        }

        // Limpiar cache
        resetRequestCache.delete(emailKey);

        console.log('=== FIN updatePassword ===');

        // Configurar cookies con configuración dinámica
        const cookieConfig = getCookieConfig();
        res.clearCookie("passwordResetToken");
        res.clearCookie("passwordResetVerified");
        res.cookie("passwordResetComplete", "success", cookieConfig);

        res.status(200).json({
            success: true,
            message: "Contraseña actualizada correctamente",
            token: "password_reset_complete" // También en el body para mayor compatibilidad
        });

    } catch (error) {
        console.error('Error en updatePassword:', error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
};

export default passwordResetController;