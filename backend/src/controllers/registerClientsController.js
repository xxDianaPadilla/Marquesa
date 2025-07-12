import nodemailer from "nodemailer";
import crypto from "crypto";
import jsonwebtoken from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import clientsModel from "../models/Clients.js";
import { config } from "../config.js";

const registerClientsController = {};

// Función helper para validar email
const validateEmail = (email) => {
    if (!email || typeof email !== 'string') {
        return { isValid: false, error: "Email es requerido" };
    }
    
    const trimmedEmail = email.trim().toLowerCase();
    
    if (trimmedEmail.length === 0) {
        return { isValid: false, error: "Email no puede estar vacío" };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
        return { isValid: false, error: "Formato de email no válido" };
    }
    
    if (trimmedEmail.length > 254) {
        return { isValid: false, error: "Email demasiado largo" };
    }
    
    return { isValid: true, value: trimmedEmail };
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
    
    // Validar complejidad
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

// Función helper para validar nombre completo
const validateFullName = (fullName) => {
    if (!fullName || typeof fullName !== 'string') {
        return { isValid: false, error: "Nombre completo es requerido" };
    }
    
    const trimmedName = fullName.trim();
    
    if (trimmedName.length === 0) {
        return { isValid: false, error: "Nombre completo no puede estar vacío" };
    }
    
    if (trimmedName.length < 2) {
        return { isValid: false, error: "Nombre completo debe tener al menos 2 caracteres" };
    }
    
    if (trimmedName.length > 100) {
        return { isValid: false, error: "Nombre completo demasiado largo" };
    }
    
    // Validar que solo contenga letras, espacios y algunos caracteres especiales
    const nameRegex = /^[a-zA-ZàáâäèéêëìíîïòóôöùúûüÀÁÂÄÈÉÊËÌÍÎÏÒÓÔÖÙÚÛÜñÑ\s\-\.\']+$/;
    if (!nameRegex.test(trimmedName)) {
        return { isValid: false, error: "Nombre completo contiene caracteres no válidos" };
    }
    
    return { isValid: true, value: trimmedName };
};

// Función helper para validar teléfono
const validatePhone = (phone) => {
    if (!phone || typeof phone !== 'string') {
        return { isValid: false, error: "Teléfono es requerido" };
    }
    
    const trimmedPhone = phone.trim();
    
    if (trimmedPhone.length === 0) {
        return { isValid: false, error: "Teléfono no puede estar vacío" };
    }
    
    // Validar formato de teléfono (permite números, espacios, guiones y paréntesis)
    const phoneRegex = /^[\d\s\-\(\)\+]+$/;
    if (!phoneRegex.test(trimmedPhone)) {
        return { isValid: false, error: "Formato de teléfono no válido" };
    }
    
    // Extraer solo números para validar longitud
    const numbersOnly = trimmedPhone.replace(/\D/g, '');
    if (numbersOnly.length < 8 || numbersOnly.length > 15) {
        return { isValid: false, error: "Teléfono debe tener entre 8 y 15 dígitos" };
    }
    
    return { isValid: true, value: trimmedPhone };
};

// Función helper para validar fecha de nacimiento
const validateBirthDate = (birthDate) => {
    if (!birthDate) {
        return { isValid: false, error: "Fecha de nacimiento es requerida" };
    }
    
    const date = new Date(birthDate);
    
    // Verificar que sea una fecha válida
    if (isNaN(date.getTime())) {
        return { isValid: false, error: "Fecha de nacimiento no válida" };
    }
    
    // Verificar que no sea en el futuro
    if (date > new Date()) {
        return { isValid: false, error: "Fecha de nacimiento no puede ser en el futuro" };
    }
    
    // Verificar edad mínima (13 años)
    const minAge = 13;
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - minAge);
    
    if (date > minDate) {
        return { isValid: false, error: `Debe tener al menos ${minAge} años` };
    }
    
    // Verificar edad máxima (120 años)
    const maxAge = 120;
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() - maxAge);
    
    if (date < maxDate) {
        return { isValid: false, error: "Fecha de nacimiento no válida" };
    }
    
    return { isValid: true, value: date };
};

// Función helper para validar dirección
const validateAddress = (address) => {
    if (!address || typeof address !== 'string') {
        return { isValid: false, error: "Dirección es requerida" };
    }
    
    const trimmedAddress = address.trim();
    
    if (trimmedAddress.length === 0) {
        return { isValid: false, error: "Dirección no puede estar vacía" };
    }
    
    if (trimmedAddress.length < 5) {
        return { isValid: false, error: "Dirección debe tener al menos 5 caracteres" };
    }
    
    if (trimmedAddress.length > 200) {
        return { isValid: false, error: "Dirección demasiado larga" };
    }
    
    return { isValid: true, value: trimmedAddress };
};

registerClientsController.register = async (req, res) => {
    try {
        const { fullName, phone, birthDate, email, password, address, favorites, discount } = req.body;

        // Validar campos requeridos
        const fullNameValidation = validateFullName(fullName);
        if (!fullNameValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: fullNameValidation.error
            });
        }

        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: emailValidation.error
            });
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: passwordValidation.error
            });
        }

        const phoneValidation = validatePhone(phone);
        if (!phoneValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: phoneValidation.error
            });
        }

        const birthDateValidation = validateBirthDate(birthDate);
        if (!birthDateValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: birthDateValidation.error
            });
        }

        const addressValidation = validateAddress(address);
        if (!addressValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: addressValidation.error
            });
        }

        // Validar campos opcionales
        if (favorites !== undefined && (!Array.isArray(favorites) || favorites.length > 50)) {
            return res.status(400).json({
                success: false,
                message: "Favoritos debe ser un array con máximo 50 elementos"
            });
        }

        if (discount !== undefined && (typeof discount !== 'number' || discount < 0 || discount > 100)) {
            return res.status(400).json({
                success: false,
                message: "Descuento debe ser un número entre 0 y 100"
            });
        }

        // Verificar si el cliente ya existe
        let existsClient;
        try {
            existsClient = await clientsModel.findOne({ email: emailValidation.value });
        } catch (dbError) {
            console.error("Error verificando cliente existente:", dbError);
            return res.status(503).json({
                success: false,
                message: "Servicio de base de datos no disponible temporalmente"
            });
        }

        if (existsClient) {
            return res.status(409).json({
                success: false,
                message: "El cliente ya existe con este email"
            });
        }

        // Verificar si el teléfono ya existe
        try {
            const existsPhone = await clientsModel.findOne({ phone: phoneValidation.value });
            if (existsPhone) {
                return res.status(409).json({
                    success: false,
                    message: "El teléfono ya está registrado"
                });
            }
        } catch (dbError) {
            console.error("Error verificando teléfono existente:", dbError);
            return res.status(503).json({
                success: false,
                message: "Servicio de base de datos no disponible temporalmente"
            });
        }

        // Hashear la contraseña
        let passwordHash;
        try {
            passwordHash = await bcryptjs.hash(password, 10);
        } catch (hashError) {
            console.error("Error hasheando contraseña:", hashError);
            return res.status(500).json({
                success: false,
                message: "Error procesando contraseña"
            });
        }

        // Crear nuevo cliente
        const newClient = new clientsModel({
            fullName: fullNameValidation.value,
            phone: phoneValidation.value,
            birthDate: birthDateValidation.value,
            email: emailValidation.value,
            password: passwordHash,
            address: addressValidation.value,
            favorites: favorites || [],
            discount: discount || 0
        });

        try {
            await newClient.save();
        } catch (dbError) {
            console.error("Error guardando cliente:", dbError);
            
            // Manejar errores de validación de Mongoose
            if (dbError.name === 'ValidationError') {
                return res.status(400).json({
                    success: false,
                    message: "Error de validación",
                    details: Object.values(dbError.errors).map(err => err.message)
                });
            }
            
            // Manejar errores de duplicado
            if (dbError.code === 11000) {
                return res.status(409).json({
                    success: false,
                    message: "El cliente ya existe"
                });
            }
            
            return res.status(503).json({
                success: false,
                message: "Error guardando cliente"
            });
        }

        // Limpiar cookie de verificación si existe
        res.clearCookie("emailVerificationToken");

        console.log(`Cliente registrado exitosamente: ${emailValidation.value}`);

        res.status(201).json({
            success: true,
            message: "Cliente registrado exitosamente"
        });

    } catch (error) {
        console.error("Error en registro:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
};

export default registerClientsController;