import nodemailer from "nodemailer";
import crypto from "crypto";
import bcryptjs from "bcryptjs";
import clientsModel from "../models/Clients.js";
import emailVerificationModel from "../models/EmailVerification.js";
import { config } from "../config.js";

const emailVerificationController = {};

// Cache para prevenir múltiples envíos rápidos
const requestCache = new Map();
const CACHE_DURATION = 30000; // 30 segundos

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

// Plantilla HTML para el email de verificación
const getEmailTemplate = (verificationCode, fullName) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Verificación de Correo - Marquesa</title>
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
                <h1 class="title">¡Bienvenido${fullName ? `, ${fullName}` : ''}!</h1>
                <p class="message">
                    Gracias por registrarte en Marquesa. Para completar tu registro y verificar tu correo electrónico, 
                    utiliza el siguiente código de verificación:
                </p>
                
                <div class="code-container">
                    <div class="code">${verificationCode}</div>
                    <div class="code-label">Código de Verificación</div>
                </div>
                
                <div class="timer">
                    ⏰ Este código expira en 10 minutos
                </div>
                
                <div class="warning">
                    <strong>⚠️ Importante:</strong> Si no solicitaste este registro, puedes ignorar este correo. 
                    Tu cuenta no será creada hasta que verifiques este código.
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

// Limpiar cache periódicamente
setInterval(() => {
    const now = Date.now();
    for (const [key, timestamp] of requestCache.entries()) {
        if (now - timestamp > CACHE_DURATION) {
            requestCache.delete(key);
        }
    }
}, CACHE_DURATION);

// Solicitar código de verificación de email
emailVerificationController.requestEmailVerification = async (req, res) => {
    try {
        const { email, fullName } = req.body;

        console.log('=== INICIO requestEmailVerification ===');
        console.log('Datos recibidos:', { email, fullName });
        console.log('Timestamp:', new Date().toISOString());

        // Validar que el email esté presente
        if (!email) {
            console.log('Email faltante');
            return res.status(400).json({
                success: false,
                message: "El correo electrónico es requerido"
            });
        }

        const emailKey = email.toLowerCase().trim();
        const now = Date.now();

        // Verificar si hay una solicitud reciente para este email
        if (requestCache.has(emailKey)) {
            const lastRequest = requestCache.get(emailKey);
            const timeDiff = now - lastRequest;
            
            console.log(`Solicitud duplicada detectada para ${emailKey}`);
            console.log(`Tiempo desde última solicitud: ${timeDiff}ms`);
            
            if (timeDiff < CACHE_DURATION) {
                console.log('Solicitud bloqueada por ser muy reciente');
                return res.status(429).json({
                    success: false,
                    message: "Ya se envió un código recientemente. Espera 30 segundos antes de solicitar otro."
                });
            }
        }

        // Marcar esta solicitud en el cache
        requestCache.set(emailKey, now);

        // Verificar que el cliente no exista ya en la base de datos
        const existingClient = await clientsModel.findOne({ email: emailKey });
        if (existingClient) {
            console.log('Email ya registrado:', emailKey);
            return res.status(400).json({
                success: false,
                message: "Este correo electrónico ya está registrado"
            });
        }

        // Buscar códigos existentes para este email
        const existingCodes = await emailVerificationModel.find({ email: emailKey });
        console.log(`Códigos existentes para ${emailKey}:`, existingCodes.length);

        // Eliminar códigos anteriores para este email
        const deleteResult = await emailVerificationModel.deleteMany({ email: emailKey });
        console.log('Códigos eliminados:', deleteResult.deletedCount);

        // Generar código de verificación
        const verificationCode = generateVerificationCode();
        
        // Calcular tiempo de expiración (10 minutos)
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        console.log('Nuevo código generado:', verificationCode);

        // Crear nuevo registro de verificación
        const emailVerification = new emailVerificationModel({
            email: emailKey,
            verificationCode,
            expiresAt
        });

        await emailVerification.save();
        console.log('Código guardado en BD con ID:', emailVerification._id);

        // Configurar y enviar email
        try {
            console.log('Iniciando envío de email...');
            const transporter = createTransporter();
            const mailOptions = {
                from: {
                    name: 'Marquesa - Tienda de Regalos',
                    address: config.emailUser.user_email
                },
                to: email,
                subject: '🌸 Verifica tu correo electrónico - Marquesa',
                html: getEmailTemplate(verificationCode, fullName)
            };

            const emailResult = await transporter.sendMail(mailOptions);
            console.log('Email enviado exitosamente. MessageId:', emailResult.messageId);
        } catch (emailError) {
            console.error('Error al enviar email:', emailError);
            // Aún así devolver éxito porque el código se guardó en BD
        }

        console.log('=== FIN requestEmailVerification ===');

        res.json({
            success: true,
            message: "Correo de verificación enviado. Tienes 10 minutos para usar el código"
        });

    } catch (error) {
        console.error('Error en requestEmailVerification:', error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
};

// Verificar código de email y completar registro
emailVerificationController.verifyEmailAndRegister = async (req, res) => {
    try {
        const { email, verificationCode, userData } = req.body;

        console.log('=== INICIO verifyEmailAndRegister ===');
        console.log('Datos recibidos:', {
            email,
            verificationCode,
            userData: userData ? 'presente' : 'ausente'
        });

        // Validar campos requeridos
        if (!email || !verificationCode || !userData) {
            console.log('Campos faltantes:', { email: !!email, verificationCode: !!verificationCode, userData: !!userData });
            return res.status(400).json({
                success: false,
                message: "Email, código de verificación y datos de usuario son requeridos"
            });
        }

        // Validar estructura de userData
        const requiredFields = ['fullName', 'phone', 'birthDate', 'address', 'password'];
        const missingFields = requiredFields.filter(field => !userData[field]);
        
        if (missingFields.length > 0) {
            console.log('Campos faltantes en userData:', missingFields);
            return res.status(400).json({
                success: false,
                message: `Campos requeridos faltantes: ${missingFields.join(', ')}`
            });
        }

        const emailKey = email.toLowerCase().trim();
        const codeToVerify = verificationCode.toString().trim();

        // Buscar TODOS los códigos para este email (para debugging)
        const allCodes = await emailVerificationModel.find({ email: emailKey });
        console.log('Todos los códigos para este email:', allCodes.map(c => ({
            id: c._id,
            code: c.verificationCode,
            expiresAt: c.expiresAt,
            isUsed: c.isUsed,
            createdAt: c.createdAt
        })));

        // Buscar código válido y no expirado (el más reciente)
        const verificationRecord = await emailVerificationModel.findOne({
            email: emailKey,
            verificationCode: codeToVerify,
            expiresAt: { $gt: new Date() },
            isUsed: false
        }).sort({ createdAt: -1 }); // Obtener el más reciente

        console.log('Código encontrado para verificación:', verificationRecord ? {
            id: verificationRecord._id,
            code: verificationRecord.verificationCode,
            expiresAt: verificationRecord.expiresAt,
            isUsed: verificationRecord.isUsed
        } : 'Ninguno');

        if (!verificationRecord) {
            return res.status(400).json({
                success: false,
                message: "Código de verificación incorrecto o expirado"
            });
        }

        // Verificar nuevamente que el cliente no exista
        const existingClient = await clientsModel.findOne({ email: emailKey });
        if (existingClient) {
            return res.status(400).json({
                success: false,
                message: "Este correo electrónico ya está registrado"
            });
        }

        // Hashear contraseña
        const hashedPassword = await bcryptjs.hash(userData.password, 10);

        // Crear nuevo cliente
        const newClient = new clientsModel({
            fullName: userData.fullName.trim(),
            phone: userData.phone.trim(),
            birthDate: userData.birthDate,
            email: emailKey,
            password: hashedPassword,
            address: userData.address.trim(),
            favorites: userData.favorites || [],
            discount: userData.discount || null
        });

        await newClient.save();
        console.log('Cliente creado exitosamente:', newClient._id);

        // Marcar código como usado Y eliminar todos los códigos para este email
        await emailVerificationModel.deleteMany({ email: emailKey });
        console.log('Todos los códigos eliminados para:', emailKey);

        // Limpiar cache
        requestCache.delete(emailKey);

        console.log('=== FIN verifyEmailAndRegister ===');

        res.json({
            success: true,
            message: "Correo verificado y registro completado exitosamente"
        });

    } catch (error) {
        console.error('Error en verifyEmailAndRegister:', error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
};

export default emailVerificationController;