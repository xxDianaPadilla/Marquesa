import nodemailer from "nodemailer";
import crypto from "crypto";
import bcryptjs from "bcryptjs";
import clientsModel from "../models/Clients.js";
import passwordResetModel from "../models/PasswordReset.js";
import { config } from "../config.js";

const passwordResetController = {};

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

        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: config.emailUser.user_email,
                pass: config.emailUser.user_pass
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

// Plantilla HTML para el email de recuperación
const getEmailTemplate = (verificationCode) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Recuperación de Contraseña - Marquesa</title>
        <style>
            body { margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f8f9fa; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background: linear-gradient(135deg, #FDB4B7 0%, #F2C6C2 100%); padding: 40px 20px; text-align: center; }
            .logo { color: #FFFFFF; font-size: 28px; font-weight: bold; letter-spacing: 3px; margin-bottom: 10px; }
            .subtitle { color: #FFFFFF; font-size: 14px; opacity: 0.9; }
            .content { padding: 40px 30px; text-align: center; }
            .title { color: #333333; font-size: 24px; font-weight: 600; margin-bottom: 20px; }
            .message { color: #666666; font-size: 16px; line-height: 1.6; margin-bottom: 30px; }
            .code-container { background-color: #FADDDD; border-radius: 10px; padding: 25px; margin: 30px 0; }
            .code { font-size: 36px; font-weight: bold; color: #333333; letter-spacing: 8px; margin-bottom: 10px; }
            .code-label { color: #666666; font-size: 14px; }
            .timer { background-color: #F2C6C2; color: #FFFFFF; padding: 15px; border-radius: 8px; margin: 20px 0; font-weight: 600; }
            .footer { background-color: #f8f9fa; padding: 30px; text-align: center; color: #999999; font-size: 14px; }
            .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">● MARQUESA ●</div>
                <div class="subtitle">TIENDA DE REGALOS</div>
            </div>
            
            <div class="content">
                <h1 class="title">Recuperación de Contraseña</h1>
                <p class="message">
                    Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. 
                    Utiliza el siguiente código de verificación para continuar con el proceso:
                </p>
                
                <div class="code-container">
                    <div class="code">${verificationCode}</div>
                    <div class="code-label">Código de Verificación</div>
                </div>
                
                <div class="timer">
                    ⏰ Este código expira en 5 minutos
                </div>
                
                <div class="warning">
                    <strong>⚠️ Importante:</strong> Si no solicitaste este cambio, ignora este correo. 
                    Tu contraseña permanecerá sin cambios.
                </div>
                
                <p class="message">
                    Por tu seguridad, nunca compartas este código con nadie. El equipo de Marquesa 
                    nunca te pedirá tu código de verificación por teléfono o email.
                </p>
            </div>
            
            <div class="footer">
                <p>© 2025 Marquesa - Tienda de Regalos</p>
                <p>Este es un email automático, por favor no respondas a este mensaje.</p>
            </div>
        </div>
    </body>
    </html>
    `;
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

        res.status(200).json({
            success: true,
            message: "Correo enviado, tienes 5 minutos para usar el código"
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

        res.status(200).json({
            success: true,
            message: "Código verificado correctamente"
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

        res.status(200).json({
            success: true,
            message: "Contraseña actualizada correctamente"
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