import nodemailer from "nodemailer";
import crypto from "crypto";
import bcryptjs from "bcryptjs";
import clientsModel from "../models/Clients.js";
import passwordResetModel from "../models/PasswordReset.js";
import { config } from "../config.js";

const passwordResetController = {};

// Configuración del transportador de email usando nodemailer
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: config.emailUser.user_email,
            pass: config.emailUser.user_pass
        }
    });
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

        // Validar que el email esté presente
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "El correo electrónico es requerido"
            });
        }

        // Verificar que el cliente existe en la base de datos
        const client = await clientsModel.findOne({ email: email.toLowerCase().trim() });
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

        // Eliminar códigos anteriores para este email
        await passwordResetModel.deleteMany({ email: email.toLowerCase().trim() });

        // Crear nuevo registro de recuperación
        const passwordReset = new passwordResetModel({
            email: email.toLowerCase().trim(),
            verificationCode,
            expiresAt
        });

        await passwordReset.save();

        // Configurar y enviar email
        const transporter = createTransporter();
        const mailOptions = {
            from: {
                name: 'Marquesa - Tienda de Regalos',
                address: config.emailUser.user_email
            },
            to: email,
            subject: '🔐 Código de Recuperación de Contraseña - Marquesa',
            html: getEmailTemplate(verificationCode)
        };

        await transporter.sendMail(mailOptions);

        res.json({
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

        // Validar campos requeridos
        if (!email || !verificationCode) {
            return res.status(400).json({
                success: false,
                message: "Email y código de verificación son requeridos"
            });
        }

        // Buscar código válido y no expirado
        const resetRecord = await passwordResetModel.findOne({
            email: email.toLowerCase().trim(),
            verificationCode,
            expiresAt: { $gt: new Date() },
            isUsed: false
        });

        if (!resetRecord) {
            return res.status(400).json({
                success: false,
                message: "Código de verificación incorrecto o expirado"
            });
        }

        res.json({
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

        // Validar campos requeridos
        if (!email || !verificationCode || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Todos los campos son requeridos"
            });
        }

        // Verificar que el código sigue siendo válido
        const resetRecord = await passwordResetModel.findOne({
            email: email.toLowerCase().trim(),
            verificationCode,
            expiresAt: { $gt: new Date() },
            isUsed: false
        });

        if (!resetRecord) {
            return res.status(400).json({
                success: false,
                message: "Código de verificación incorrecto o expirado"
            });
        }

        // Verificar que el cliente existe
        const client = await clientsModel.findOne({ email: email.toLowerCase().trim() });
        if (!client) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado"
            });
        }

        // Hashear nueva contraseña
        const hashedPassword = await bcryptjs.hash(newPassword, 10);

        // Actualizar contraseña del cliente
        await clientsModel.findByIdAndUpdate(client._id, {
            password: hashedPassword
        });

        // Marcar código como usado
        await passwordResetModel.findByIdAndUpdate(resetRecord._id, {
            isUsed: true
        });

        res.json({
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