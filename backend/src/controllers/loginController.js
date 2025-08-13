import bcryptjs from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import clientsModel from "../models/Clients.js";
import { config } from "../config.js";

const loginController = {};

// Configuración del sistema de límite de intentos de login
const RATE_LIMIT_CONFIG = {
    maxAttempts: 5, // Máximo número de intentos fallidos permitidos
    lockoutDuration: 15 * 60, // Duración del bloqueo en segundos (15 minutos)
    warningThreshold: 3 // Número de intentos después del cual se muestra advertencia
};

// Función para determinar la configuración de cookies según el entorno
const getCookieConfig = () => {
    const isProduction = process.env.NODE_ENV === 'production';

    // Seguir intentando cookies pero no depender de ellas
    if (isProduction) {
        return {
            httpOnly: false,
            secure: true,
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
            path: '/',
        };
    } else {
        return {
            httpOnly: false,
            secure: false,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/',
        };
    }
};

// Almacenamiento en memoria para los intentos de login fallidos
const loginAttempts = new Map();

// Utilidades para el manejo del sistema de límite de intentos
const RateLimitUtils = {
    // Genera una clave única para almacenar los intentos por email
    getStorageKey: (email) => `login_attempts_${email.toLowerCase()}`,

    // Obtiene los datos de intentos almacenados para un email
    getAttemptData: (email) => {
        const key = RateLimitUtils.getStorageKey(email);
        return loginAttempts.get(key) || { attempts: 0, lockedUntil: null };
    },

    // Guarda los datos de intentos para un email
    saveAttemptData: (email, data) => {
        const key = RateLimitUtils.getStorageKey(email);
        loginAttempts.set(key, data);
    },

    // Verifica si una cuenta está bloqueada
    isAccountLocked: (email) => {
        const data = RateLimitUtils.getAttemptData(email);
        if (!data.lockedUntil) return false;

        const now = Date.now();
        if (now >= data.lockedUntil) {
            // El bloqueo ha expirado, limpiar los datos
            RateLimitUtils.clearAttempts(email);
            return false;
        }
        return true;
    },

    // Obtiene el tiempo restante de bloqueo en segundos
    getRemainingLockTime: (email) => {
        const data = RateLimitUtils.getAttemptData(email);
        if (!data.lockedUntil) return 0;

        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((data.lockedUntil - now) / 1000));
        return remaining;
    },

    // Registra un intento fallido y determina si se debe bloquear la cuenta
    recordFailedAttempt: (email) => {
        const data = RateLimitUtils.getAttemptData(email);
        const newAttempts = data.attempts + 1;

        let newData = {
            attempts: newAttempts,
            lockedUntil: data.lockedUntil,
            lastAttempt: Date.now()
        };

        // Si se alcanza el máximo de intentos, bloquear la cuenta
        if (newAttempts >= RATE_LIMIT_CONFIG.maxAttempts) {
            const lockDuration = RATE_LIMIT_CONFIG.lockoutDuration * 1000;
            newData.lockedUntil = Date.now() + lockDuration;
        }

        RateLimitUtils.saveAttemptData(email, newData);
        return newData;
    },

    // Limpia los intentos después de un login exitoso
    clearAttempts: (email) => {
        const key = RateLimitUtils.getStorageKey(email);
        loginAttempts.delete(key);
    },

    // Formatea el tiempo restante en un formato legible
    formatRemainingTime: (seconds) => {
        if (seconds <= 0) return '';

        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    },

    // Obtiene un mensaje de advertencia sobre intentos restantes
    getAttemptsWarning: (email) => {
        const data = RateLimitUtils.getAttemptData(email);

        if (data.attempts >= RATE_LIMIT_CONFIG.warningThreshold &&
            data.attempts < RATE_LIMIT_CONFIG.maxAttempts) {
            const remaining = RATE_LIMIT_CONFIG.maxAttempts - data.attempts;
            return `Te quedan ${remaining} intento${remaining === 1 ? '' : 's'} antes de que tu cuenta sea bloqueada temporalmente.`;
        }
        return null;
    }
};

// Función para validar el formato del email
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

// Función para validar la contraseña
const validatePassword = (password) => {
    if (!password || typeof password !== 'string') {
        return { isValid: false, error: "Contraseña es requerida" };
    }

    if (password.length === 0) {
        return { isValid: false, error: "Contraseña no puede estar vacía" };
    }

    if (password.length < 8) {
        return { isValid: false, error: "Contraseña debe tener al menos 8 caracteres" };
    }

    if (password.length > 128) {
        return { isValid: false, error: "Contraseña demasiado larga" };
    }

    return { isValid: true };
};

// Función para generar un token JWT de forma asíncrona
const generateJWT = (payload) => {
    return new Promise((resolve, reject) => {
        jsonwebtoken.sign(
            payload,
            config.JWT.secret,
            { expiresIn: config.JWT.expires },
            (error, token) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(token);
                }
            }
        );
    });
};

// Función principal de inicio de sesión
loginController.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Validar el formato del email
        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: emailValidation.error
            });
        }

        // Validar el formato de la contraseña
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: passwordValidation.error
            });
        }

        const cleanEmail = emailValidation.value;

        // Verificar si la cuenta está bloqueada por intentos fallidos
        if (RateLimitUtils.isAccountLocked(cleanEmail)) {
            const remainingTime = RateLimitUtils.getRemainingLockTime(cleanEmail);
            const formattedTime = RateLimitUtils.formatRemainingTime(remainingTime);

            return res.status(429).json({
                success: false,
                message: `Tu cuenta está temporalmente bloqueada debido a múltiples intentos fallidos. Inténtalo nuevamente en ${formattedTime}.`,
                isAccountLocked: true,
                remainingTime: remainingTime,
                formattedTime: formattedTime
            });
        }

        // Verificar las credenciales del usuario
        let userFound;
        let userType;

        // Verificar si es el administrador
        if (cleanEmail === config.admin.email && password === config.admin.password) {
            userType = "admin";
            userFound = { _id: "admin" };
        } else {
            // Buscar el usuario en la base de datos de clientes
            try {
                userFound = await clientsModel.findOne({ email: cleanEmail });
                userType = "Customer";
            } catch (dbError) {
                return res.status(503).json({
                    success: false,
                    message: "Servicio de base de datos no disponible temporalmente"
                });
            }
        }

        // Verificar si el usuario existe
        if (!userFound) {
            const attemptData = RateLimitUtils.recordFailedAttempt(cleanEmail);
            let errorMessage = "user not found";

            // Agregar advertencia si está cerca del límite
            if (attemptData.attempts < RATE_LIMIT_CONFIG.maxAttempts) {
                const warning = RateLimitUtils.getAttemptsWarning(cleanEmail);
                if (warning) {
                    errorMessage += `\n\n${warning}`;
                }
            } else {
                // Cuenta bloqueada con este intento
                const lockDuration = Math.ceil(RATE_LIMIT_CONFIG.lockoutDuration / 60);
                errorMessage = `Tu cuenta ha sido bloqueada temporalmente por ${lockDuration} minutos debido a múltiples intentos fallidos.`;
            }

            return res.status(401).json({
                success: false,
                message: errorMessage,
                isAccountLocked: attemptData.attempts >= RATE_LIMIT_CONFIG.maxAttempts,
                remainingAttempts: Math.max(0, RATE_LIMIT_CONFIG.maxAttempts - attemptData.attempts)
            });
        }

        // Verificar la contraseña para usuarios que no son administradores
        if (userType !== "admin") {
            try {
                const isMatch = await bcryptjs.compare(password, userFound.password);
                if (!isMatch) {
                    const attemptData = RateLimitUtils.recordFailedAttempt(cleanEmail);
                    let errorMessage = "Invalid password";

                    // Agregar advertencia si está cerca del límite
                    if (attemptData.attempts < RATE_LIMIT_CONFIG.maxAttempts) {
                        const warning = RateLimitUtils.getAttemptsWarning(cleanEmail);
                        if (warning) {
                            errorMessage += `\n\n${warning}`;
                        }
                    } else {
                        // Cuenta bloqueada con este intento
                        const lockDuration = Math.ceil(RATE_LIMIT_CONFIG.lockoutDuration / 60);
                        errorMessage = `Tu cuenta ha sido bloqueada temporalmente por ${lockDuration} minutos debido a múltiples intentos fallidos.`;
                    }

                    return res.status(401).json({
                        success: false,
                        message: errorMessage,
                        isAccountLocked: attemptData.attempts >= RATE_LIMIT_CONFIG.maxAttempts,
                        remainingAttempts: Math.max(0, RATE_LIMIT_CONFIG.maxAttempts - attemptData.attempts)
                    });
                }
            } catch (hashError) {
                return res.status(500).json({
                    success: false,
                    message: "Error en verificación de credenciales"
                });
            }
        }

        // Verificar que la configuración JWT esté completa
        if (!config.JWT.secret || !config.JWT.expires) {
            return res.status(500).json({
                success: false,
                message: "Error de configuración del servidor"
            });
        }

        // Login exitoso - generar token y establecer cookie
        try {
            // Limpiar los intentos fallidos
            RateLimitUtils.clearAttempts(cleanEmail);

            // ✅ NUEVO: Generar token con expiración más larga para compensar falta de cookies
            const tokenPayload = {
                id: userFound._id,
                userType,
                email: cleanEmail, // ✅ NUEVO: Incluir email para mejor identificación
                iat: Math.floor(Date.now() / 1000), // ✅ NUEVO: Timestamp de creación
            };

            const token = await generateJWT(tokenPayload);

            console.log('🍪 Intentando establecer cookie (puede fallar en cross-domain)');

            // ✅ ESTRATEGIA DUAL: Intentar cookie pero no depender de ella
            try {
                const cookieConfig = getCookieConfig();
                res.cookie("authToken", token, cookieConfig);
                console.log('✅ Cookie establecida (si el navegador la acepta)');
            } catch (cookieError) {
                console.log('⚠️ Error al establecer cookie (esperado en cross-domain):', cookieError.message);
            }

            // ✅ HEADERS MEJORADOS: Para cross-domain
            if (process.env.NODE_ENV === 'production') {
                res.header('Access-Control-Allow-Credentials', 'true');
                res.header('Access-Control-Allow-Origin', 'https://marquesa.vercel.app');
                res.header('Access-Control-Expose-Headers', 'Authorization, Set-Cookie');
            }

            console.log('✅ Login exitoso - enviando respuesta con token');

            // ✅ RESPUESTA OPTIMIZADA: Token como fuente principal de verdad
            res.status(200).json({
                success: true,
                message: "login successful",
                userType: userType,
                token: token, // ✅ CRÍTICO: Token siempre en el body
                tokenExpiry: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 días desde ahora
                cookieAttempted: true,
                user: {
                    id: userFound._id,
                    userType: userType,
                    email: cleanEmail
                },
                sessionInfo: {
                    loginTime: new Date().toISOString(),
                    expiresIn: '7 days',
                    persistent: true // ✅ NUEVO: Indicar que es sesión persistente
                }
            });
        } catch (jwtError) {
            console.error('❌ Error generando token:', jwtError);
            return res.status(500).json({
                success: false,
                message: "Error generating authentication token"
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Función para verificar la validez de un token JWT
loginController.verifyToken = (req, res) => {
    try {
        // Intentar obtener el token de las cookies
        let token = req.cookies.authToken;

        // Si no hay token en cookies, buscar en el header Authorization
        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

        // Si no se encuentra token en ningún lugar
        if (!token) {
            return res.status(200).json({
                success: false,
                message: 'No token provided',
                isAuthenticated: false
            });
        }

        // Verificar que la configuración JWT esté disponible
        if (!config.JWT.secret) {
            return res.status(200).json({
                success: false,
                message: 'Server configuration error',
                isAuthenticated: false
            });
        }

        try {
            // Verificar y decodificar el token
            const decoded = jsonwebtoken.verify(token, config.JWT.secret);

            // Validar que el token contenga los datos necesarios
            if (!decoded.id || !decoded.userType) {
                return res.status(200).json({
                    success: false,
                    message: 'Invalid token structure',
                    isAuthenticated: false
                });
            }

            // Responder con los datos del usuario autenticado
            res.status(200).json({
                success: true,
                id: decoded.id,
                userType: decoded.userType,
                isAuthenticated: true
            });
        } catch (jwtError) {
            // Limpiar la cookie si el token es inválido
            res.clearCookie("authToken");

            let message = 'Invalid or expired token';
            if (jwtError.name === 'TokenExpiredError') {
                message = 'Token has expired';
            } else if (jwtError.name === 'JsonWebTokenError') {
                message = 'Invalid token format';
            }

            res.status(200).json({
                success: false,
                message: message,
                isAuthenticated: false
            });
        }
    } catch (error) {
        // Limpiar cookie en caso de error general
        res.clearCookie("authToken");

        res.status(200).json({
            success: false,
            message: 'Internal server error',
            isAuthenticated: false
        });
    }
};

// Función para obtener la información completa del usuario autenticado
loginController.getUserInfo = async (req, res) => {
    try {
        // Intentar obtener el token de las cookies
        let token = req.cookies.authToken;

        // Si no hay token en cookies, buscar en el header Authorization
        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token de autenticación requerido'
            });
        }

        if (!config.JWT.secret) {
            return res.status(500).json({
                success: false,
                message: 'Error de configuración del servidor'
            });
        }

        let decoded;
        try {
            // Verificar y decodificar el token
            decoded = jsonwebtoken.verify(token, config.JWT.secret);
        } catch (jwtError) {
            // Limpiar cookie si el token es inválido
            res.clearCookie("authToken");

            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token expirado'
                });
            }

            return res.status(401).json({
                success: false,
                message: 'Token inválido'
            });
        }

        const { id, userType } = decoded;

        // Validar que el token contenga los datos necesarios
        if (!id || !userType) {
            return res.status(401).json({
                success: false,
                message: 'Token con estructura inválida'
            });
        }

        // Si es administrador, devolver información del admin
        if (userType === 'admin') {
            if (!config.admin.email) {
                return res.status(500).json({
                    success: false,
                    message: 'Configuración de administrador incompleta'
                });
            }

            const adminInfo = {
                id: 'admin',
                name: 'Administrador',
                email: config.admin.email,
                userType: 'admin'
            };

            return res.status(200).json({
                success: true,
                user: adminInfo
            });
        } else {
            // Si es cliente, buscar información en la base de datos
            try {
                const client = await clientsModel.findById(id).select('-password');

                if (!client) {
                    res.clearCookie("authToken");
                    return res.status(404).json({
                        success: false,
                        message: 'Usuario no encontrado'
                    });
                }

                // Preparar información del cliente para enviar
                const clientInfo = {
                    id: client._id,
                    name: client.fullName,
                    email: client.email,
                    phone: client.phone,
                    address: client.address,
                    birthDate: client.birthDate,
                    profilePicture: client.profilePicture,
                    favorites: client.favorites,
                    discount: client.discount,
                    userType: 'Customer',
                    createdAt: client.createdAt
                };

                return res.status(200).json({
                    success: true,
                    user: clientInfo
                });
            } catch (dbError) {
                return res.status(503).json({
                    success: false,
                    message: 'Servicio de base de datos no disponible'
                });
            }
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Función para renovar un token JWT existente
loginController.refreshToken = async (req, res) => {
    try {
        // Intentar obtener el token de las cookies
        let token = req.cookies.authToken;

        // Si no hay token en cookies, buscar en el header Authorization
        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token no proporcionado'
            });
        }

        if (!config.JWT.secret || !config.JWT.expires) {
            return res.status(500).json({
                success: false,
                message: 'Error de configuración del servidor'
            });
        }

        let decoded;
        try {
            // Verificar el token actual
            decoded = jsonwebtoken.verify(token, config.JWT.secret);
        } catch (jwtError) {
            res.clearCookie("authToken");

            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token expirado, inicia sesión nuevamente'
                });
            }

            return res.status(401).json({
                success: false,
                message: 'Token inválido'
            });
        }

        // Validar que el token contenga los datos necesarios
        if (!decoded.id || !decoded.userType) {
            res.clearCookie("authToken");
            return res.status(401).json({
                success: false,
                message: 'Token con estructura inválida'
            });
        }

        try {
            // Generar un nuevo token con los mismos datos
            const newToken = await generateJWT({
                id: decoded.id,
                userType: decoded.userType
            });

            // Establecer el nuevo token en la cookie
            const cookieConfig = getCookieConfig();
            res.cookie("authToken", newToken, cookieConfig);

            // Responder con éxito incluyendo el nuevo token
            res.status(200).json({
                success: true,
                message: "Token refreshed successfully",
                token: newToken
            });
        } catch (jwtError) {
            return res.status(500).json({
                success: false,
                message: 'Error generando nuevo token'
            });
        }

    } catch (error) {
        res.clearCookie("authToken");
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Función para verificar el estado de bloqueo de una cuenta
loginController.checkLockStatus = (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email es requerido"
            });
        }

        // Validar el formato del email
        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: emailValidation.error
            });
        }

        const cleanEmail = emailValidation.value;
        const isLocked = RateLimitUtils.isAccountLocked(cleanEmail);
        const attemptData = RateLimitUtils.getAttemptData(cleanEmail);

        // Si la cuenta está bloqueada
        if (isLocked) {
            const remainingTime = RateLimitUtils.getRemainingLockTime(cleanEmail);
            const formattedTime = RateLimitUtils.formatRemainingTime(remainingTime);

            return res.status(200).json({
                success: true,
                isLocked: true,
                remainingTime: remainingTime,
                formattedTime: formattedTime,
                attempts: attemptData.attempts,
                maxAttempts: RATE_LIMIT_CONFIG.maxAttempts
            });
        }

        // Si la cuenta no está bloqueada
        const warning = RateLimitUtils.getAttemptsWarning(cleanEmail);

        res.status(200).json({
            success: true,
            isLocked: false,
            attempts: attemptData.attempts,
            maxAttempts: RATE_LIMIT_CONFIG.maxAttempts,
            remainingAttempts: RATE_LIMIT_CONFIG.maxAttempts - attemptData.attempts,
            warning: warning
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Función para limpiar manualmente los intentos de login de una cuenta
loginController.clearLoginAttempts = (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email es requerido"
            });
        }

        // Validar el formato del email
        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: emailValidation.error
            });
        }

        const cleanEmail = emailValidation.value;
        // Limpiar los intentos fallidos para este email
        RateLimitUtils.clearAttempts(cleanEmail);

        res.status(200).json({
            success: true,
            message: `Intentos de login limpiados para: ${cleanEmail}`
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export default loginController;