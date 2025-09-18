import nodemailer from "nodemailer";
import bcryptjs from "bcryptjs";
import clientsModel from "../models/Clients.js";
import emailVerificationModel from "../models/EmailVerification.js";
import { config } from "../config.js";
import { getEmailTemplate } from "../utils/emailVerificationDesign.js";

const emailVerificationController = {};

// Función helper para configuración dinámica de cookies basada en el entorno
const getCookieConfig = () => {
    const isProduction = process.env.NODE_ENV === 'production';
    
    // ✅ CORRECCIÓN CRÍTICA: Configuración específica para Render + Vercel
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

// Función para validar fecha de nacimiento (CORREGIDA)
const validateBirthDate = (dateString) => {
    if (!dateString) {
        return { isValid: false, error: 'Fecha de nacimiento es requerida' };
    }
    
    try {
        // Parsear fecha en formato DD/MM/YYYY
        const [day, month, year] = dateString.split('/').map(num => parseInt(num, 10));
        const date = new Date(year, month - 1, day);

        // Validar que sea una fecha válida
        if (
            isNaN(date.getTime()) ||
            date.getDate() !== day ||
            date.getMonth() !== month - 1 ||
            date.getFullYear() !== year
        ) {
            return { isValid: false, error: 'Fecha de nacimiento no válida' };
        }

        // Verificar que no sea en el futuro
        const today = new Date();
        if (date > today) {
            return { isValid: false, error: 'Fecha de nacimiento no puede ser en el futuro' };
        }

        // Calcular edad correctamente
        let age = today.getFullYear() - date.getFullYear();
        const monthDiff = today.getMonth() - date.getMonth();
        
        // Si no ha llegado el mes de cumpleaños, o si es el mes pero no ha llegado el día, restar 1 año
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
            age--;
        }

        // Verificar edad mínima (12 años)
        if (age < 12) {
            return { isValid: false, error: 'Debe tener al menos 12 años' };
        }

        // Verificar edad máxima (120 años)
        if (age > 120) {
            return { isValid: false, error: 'Fecha de nacimiento no válida' };
        }

        return { isValid: true, value: date.toISOString() };
    } catch (error) {
        console.error('Error validando fecha:', error);
        return { isValid: false, error: 'Fecha de nacimiento no válida' };
    }
};

// Función helper para validar datos de usuario (CORREGIDA)
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

    // CORRECCIÓN: Usar la función de validación correcta para fecha de nacimiento
    const birthDateValidation = validateBirthDate(userData.birthDate);
    if (!birthDateValidation.isValid) {
        return { isValid: false, error: birthDateValidation.error };
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
// Configuración del transportador de email usando nodemailer
// Configuración del transportador de email usando nodemailer
const createTransporter = () => {
    try {
        console.log('Configurando transportador de email...');
        console.log('Email user:', config.emailUser.user_email ? 'configurado' : 'NO configurado');
        console.log('Email pass:', config.emailUser.user_pass ? 'configurado' : 'NO configurado');

        if (!config.emailUser.user_email || !config.emailUser.user_pass) {
            throw new Error('Configuración de email incompleta - verificar variables de entorno');
        }

        // CORRECCIÓN: usar createTransport (sin 'er' al final)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: config.emailUser.user_email,
                pass: config.emailUser.user_pass
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        console.log('Transportador de email configurado correctamente');
        return transporter;
    } catch (error) {
        console.error('Error creando transportador de email:', error);
        throw error;
    }
};

// Generar código de verificación de 6 dígitos
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
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

            console.log('Enviando email a:', emailKey);
            const emailResult = await transporter.sendMail(mailOptions);
            console.log('Email enviado exitosamente. MessageId:', emailResult.messageId);

        } catch (emailError) {
            console.error('Error detallado al enviar email:', {
                message: emailError.message,
                code: emailError.code,
                command: emailError.command,
                response: emailError.response
            });

            // Determinar el tipo de error
            let errorMessage = "Error enviando correo de verificación. Inténtalo de nuevo.";

            if (emailError.code === 'EAUTH') {
                errorMessage = "Error de autenticación de email. Contacta al administrador.";
            } else if (emailError.code === 'ECONNECTION') {
                errorMessage = "Error de conexión. Verifica tu conexión a internet.";
            }

            return res.status(502).json({
                success: false,
                message: errorMessage,
                details: process.env.NODE_ENV === 'development' ? emailError.message : undefined
            });
        }

        console.log('=== FIN requestEmailVerification ===');

        // Configurar cookies con configuración dinámica
        const cookieConfig = getCookieConfig();
        res.cookie("emailVerificationToken", "verification_in_progress", cookieConfig);

        res.status(200).json({
            success: true,
            message: "Correo de verificación enviado. Tienes 10 minutos para usar el código",
            token: "verification_in_progress" // También en el body para mayor compatibilidad
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

        // CORRECCIÓN: Usar la fecha procesada correctamente
        const birthDateValidation = validateBirthDate(userData.birthDate);
        
        // Crear nuevo cliente
        try {
            const newClient = new clientsModel({
                fullName: userData.fullName.trim(),
                phone: userData.phone.trim(),
                birthDate: birthDateValidation.value, // Usar la fecha ISO procesada
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

        // Configurar cookies con configuración dinámica
        const cookieConfig = getCookieConfig();
        res.clearCookie("emailVerificationToken"); // Limpiar cookie de verificación
        res.cookie("registrationComplete", "success", cookieConfig);

        res.status(201).json({
            success: true,
            message: "Correo verificado y registro completado exitosamente",
            token: "registration_complete" // También en el body para mayor compatibilidad
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