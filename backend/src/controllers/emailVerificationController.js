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

// Función helper para validar fullName
const validateFullName = (fullName) => {
    if (!fullName || typeof fullName !== 'string') {
        return { isValid: true, value: null }; // Es opcional
    }
    
    const trimmedName = fullName.trim();
    
    if (trimmedName.length > 100) {
        return { isValid: false, error: "Nombre demasiado largo" };
    }
    
    // Validar caracteres no permitidos
    const invalidChars = /[<>{}()[\]]/;
    if (invalidChars.test(trimmedName)) {
        return { isValid: false, error: "Nombre contiene caracteres no válidos" };
    }
    
    return { isValid: true, value: trimmedName };
};

// Función helper para validar datos de usuario
const validateUserData = (userData) => {
    if (!userData || typeof userData !== 'object') {
        return { isValid: false, error: "Datos de usuario son requeridos" };
    }

    const requiredFields = ['fullName', 'phone', 'birthDate', 'address', 'password'];
    const missingFields = requiredFields.filter(field => !userData[field]);
    
    if (missingFields.length > 0) {
        return { 
            isValid: false, 
            error: `Campos requeridos faltantes: ${missingFields.join(', ')}` 
        };
    }

    // Validar nombre completo
    if (typeof userData.fullName !== 'string' || userData.fullName.trim().length < 10) {
        return { isValid: false, error: "Nombre completo debe tener al menos 10 caracteres" };
    }

    // Validar teléfono
    if (typeof userData.phone !== 'string' || userData.phone.trim().length < 8) {
        return { isValid: false, error: "Teléfono debe tener al menos 8 caracteres" };
    }

    // Validar fecha de nacimiento
    const birthDate = new Date(userData.birthDate);
    if (isNaN(birthDate.getTime())) {
        return { isValid: false, error: "Fecha de nacimiento no válida" };
    }

    // Validar que sea mayor de edad (18 años)
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 13) {
        return { isValid: false, error: "Debe ser mayor de 13 años para registrarse" };
    }

    // Validar dirección
    if (typeof userData.address !== 'string' || userData.address.trim().length < 10) {
        return { isValid: false, error: "Dirección debe tener al menos 10 caracteres" };
    }

    // Validar contraseña
    if (typeof userData.password !== 'string' || userData.password.length < 8) {
        return { isValid: false, error: "Contraseña debe tener al menos 8 caracteres" };
    }

    return { isValid: true };
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

        // Validar email
        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: emailValidation.error
            });
        }

        // Validar fullName si está presente
        const nameValidation = validateFullName(fullName);
        if (!nameValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: nameValidation.error
            });
        }

        const emailKey = emailValidation.value;
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
        let existingClient;
        try {
            existingClient = await clientsModel.findOne({ email: emailKey });
        } catch (dbError) {
            console.error('Error verificando cliente existente:', dbError);
            return res.status(503).json({
                success: false,
                message: "Servicio de base de datos no disponible temporalmente"
            });
        }

        if (existingClient) {
            console.log('Email ya registrado:', emailKey);
            return res.status(409).json({
                success: false,
                message: "Este correo electrónico ya está registrado"
            });
        }

        // Buscar códigos existentes para este email
        let existingCodes;
        try {
            existingCodes = await emailVerificationModel.find({ email: emailKey });
            console.log(`Códigos existentes para ${emailKey}:`, existingCodes.length);

            // Eliminar códigos anteriores para este email
            const deleteResult = await emailVerificationModel.deleteMany({ email: emailKey });
            console.log('Códigos eliminados:', deleteResult.deletedCount);
        } catch (dbError) {
            console.error('Error gestionando códigos existentes:', dbError);
            return res.status(503).json({
                success: false,
                message: "Error en el servicio de verificación"
            });
        }

        // Generar código de verificación
        const verificationCode = generateVerificationCode();
        
        // Calcular tiempo de expiración (10 minutos)
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        console.log('Nuevo código generado:', verificationCode);

        // Crear nuevo registro de verificación
        try {
            const emailVerification = new emailVerificationModel({
                email: emailKey,
                verificationCode,
                expiresAt
            });

            await emailVerification.save();
            console.log('Código guardado en BD con ID:', emailVerification._id);
        } catch (dbError) {
            console.error('Error guardando código de verificación:', dbError);
            return res.status(503).json({
                success: false,
                message: "Error guardando código de verificación"
            });
        }

        // Configurar y enviar email
        try {
            console.log('Iniciando envío de email...');
            const transporter = createTransporter();
            const mailOptions = {
                from: {
                    name: 'Marquesa - Tienda de Regalos',
                    address: config.emailUser.user_email
                },
                to: emailKey,
                subject: '🌸 Verifica tu correo electrónico - Marquesa',
                html: getEmailTemplate(verificationCode, nameValidation.value)
            };

            const emailResult = await transporter.sendMail(mailOptions);
            console.log('Email enviado exitosamente. MessageId:', emailResult.messageId);
        } catch (emailError) {
            console.error('Error al enviar email:', emailError);
            // Aún así devolver éxito porque el código se guardó en BD
            return res.status(502).json({
                success: false,
                message: "Error enviando correo de verificación. Inténtalo de nuevo."
            });
        }

        console.log('=== FIN requestEmailVerification ===');

        res.status(200).json({
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

        // Validar userData
        const userDataValidation = validateUserData(userData);
        if (!userDataValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: userDataValidation.error
            });
        }

        const emailKey = emailValidation.value;
        const codeToVerify = codeValidation.value;

        // Buscar código válido y no expirado (el más reciente)
        let verificationRecord;
        try {
            verificationRecord = await emailVerificationModel.findOne({
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
        } catch (dbError) {
            console.error('Error buscando código de verificación:', dbError);
            return res.status(503).json({
                success: false,
                message: "Error en el servicio de verificación"
            });
        }

        if (!verificationRecord) {
            return res.status(400).json({
                success: false,
                message: "Código de verificación incorrecto o expirado"
            });
        }

        // Verificar nuevamente que el cliente no exista
        let existingClient;
        try {
            existingClient = await clientsModel.findOne({ email: emailKey });
        } catch (dbError) {
            console.error('Error verificando cliente existente:', dbError);
            return res.status(503).json({
                success: false,
                message: "Error verificando datos existentes"
            });
        }

        if (existingClient) {
            return res.status(409).json({
                success: false,
                message: "Este correo electrónico ya está registrado"
            });
        }

        // Hashear contraseña
        let hashedPassword;
        try {
            hashedPassword = await bcryptjs.hash(userData.password, 10);
        } catch (hashError) {
            console.error('Error hasheando contraseña:', hashError);
            return res.status(500).json({
                success: false,
                message: "Error procesando datos de seguridad"
            });
        }

        // Crear nuevo cliente
        try {
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
        } catch (dbError) {
            console.error('Error creando cliente:', dbError);
            
            if (dbError.code === 11000) {
                return res.status(409).json({
                    success: false,
                    message: "Este correo electrónico ya está registrado"
                });
            }
            
            if (dbError.name === 'ValidationError') {
                return res.status(400).json({
                    success: false,
                    message: "Datos de usuario no válidos",
                    details: Object.values(dbError.errors).map(err => err.message)
                });
            }
            
            return res.status(503).json({
                success: false,
                message: "Error creando cuenta de usuario"
            });
        }

        // Marcar código como usado Y eliminar todos los códigos para este email
        try {
            await emailVerificationModel.deleteMany({ email: emailKey });
            console.log('Todos los códigos eliminados para:', emailKey);
        } catch (dbError) {
            console.error('Error limpiando códigos:', dbError);
            // No fallar por esto
        }

        // Limpiar cache
        requestCache.delete(emailKey);

        console.log('=== FIN verifyEmailAndRegister ===');

        res.status(201).json({
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