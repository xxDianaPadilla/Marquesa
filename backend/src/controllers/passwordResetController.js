import nodemailer from "nodemailer";
import bcryptjs from "bcryptjs";
import clientsModel from "../models/Clients.js";
import passwordResetModel from "../models/PasswordReset.js";
import { config } from "../config.js";
import { getEmailTemplate } from "../utils/passwordResetDesign.js";

const passwordResetController = {};

// Función helper para configuración dinámica de cookies basada en el entorno
const getCookieConfig = () => {
    const isProduction = process.env.NODE_ENV === 'production';
    return {
        httpOnly: false, // Permitir acceso desde JavaScript
        secure: isProduction, // Solo HTTPS en producción
        sameSite: isProduction ? 'none' : 'lax', // Cross-domain en producción
        maxAge: 24 * 60 * 60 * 1000, // 24 horas
        domain: undefined // Dejar que el navegador determine
    };
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

// Configuración del transportador de email usando nodemailer
const createTransporter = () => {
    try {
        if (!config.emailUser.user_email || !config.emailUser.user_pass) {
            throw new Error('Configuración de email incompleta');
        }

        // CORRECCIÓN: usar createTransport (sin 'er' al final)
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: config.emailUser.user_email,
                pass: config.emailUser.user_pass
            },
            tls: {
                rejectUnauthorized: false
            }
        });
    } catch (error) {
        console.error('Error creando transportador de email:', error);
        throw error;
    }
};

// Generar código de verificación de 6 dígitos
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Solicitar código de recuperación de contraseña
passwordResetController.requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;

        // Validar email
        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: emailValidation.error
            });
        }

        const emailKey = emailValidation.value;

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
            return res.status(404).json({
                success: false,
                message: "Usuario no existe"
            });
        }

        // Generar código de verificación
        const verificationCode = generateVerificationCode();
        
        // Calcular tiempo de expiración (5 minutos)
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        try {
            // Eliminar códigos anteriores para este email
            await passwordResetModel.deleteMany({ email: emailKey });

            // Crear nuevo registro de recuperación
            const passwordReset = new passwordResetModel({
                email: emailKey,
                verificationCode,
                expiresAt
            });

            await passwordReset.save();
        } catch (dbError) {
            console.error('Error guardando código de reset:', dbError);
            return res.status(503).json({
                success: false,
                message: "Error en el servicio de recuperación"
            });
        }

        // Configurar y enviar email
        try {
            const transporter = createTransporter();
            const mailOptions = {
                from: {
                    name: 'Marquesa - Tienda de Regalos',
                    address: config.emailUser.user_email
                },
                to: emailKey,
                subject: '🔐 Código de Recuperación de Contraseña - Marquesa',
                html: getEmailTemplate(verificationCode)
            };

            await transporter.sendMail(mailOptions);
        } catch (emailError) {
            console.error('Error enviando email de recuperación:', emailError);
            return res.status(502).json({
                success: false,
                message: "Error enviando correo de recuperación. Inténtalo de nuevo."
            });
        }

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
            });
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
            });
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
        } catch (dbError) {
            console.error('Error actualizando contraseña:', dbError);
            return res.status(503).json({
                success: false,
                message: "Error actualizando contraseña"
            });
        }

        // Marcar código como usado
        try {
            await passwordResetModel.findByIdAndUpdate(resetRecord._id, {
                isUsed: true
            });
        } catch (dbError) {
            console.error('Error marcando código como usado:', dbError);
            // No fallar por esto
        }

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