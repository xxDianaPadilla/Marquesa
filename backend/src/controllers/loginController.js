import bcryptjs from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import clientsModel from "../models/Clients.js";
import { config } from "../config.js";

const loginController = {};

// ===== CONFIGURACIÓN DEL SISTEMA DE BLOQUEO =====
const RATE_LIMIT_CONFIG = {
    maxAttempts: 5,              // Máximo 5 intentos fallidos
    lockoutDuration: 15 * 60,    // 15 minutos de bloqueo (en segundos)
    warningThreshold: 3          // Mostrar advertencia después de 3 intentos
};

// ===== ALMACENAMIENTO EN MEMORIA PARA INTENTOS =====
// En producción, considera usar Redis o una base de datos
const loginAttempts = new Map();

// ===== UTILIDADES PARA MANEJO DE INTENTOS =====
const RateLimitUtils = {
    /**
     * Obtiene la clave para almacenar intentos por email
     */
    getStorageKey: (email) => `login_attempts_${email.toLowerCase()}`,

    /**
     * Obtiene los datos de intentos desde memoria
     */
    getAttemptData: (email) => {
        const key = RateLimitUtils.getStorageKey(email);
        return loginAttempts.get(key) || { attempts: 0, lockedUntil: null };
    },

    /**
     * Guarda los datos de intentos en memoria
     */
    saveAttemptData: (email, data) => {
        const key = RateLimitUtils.getStorageKey(email);
        loginAttempts.set(key, data);
    },

    /**
     * Verifica si una cuenta está bloqueada
     */
    isAccountLocked: (email) => {
        const data = RateLimitUtils.getAttemptData(email);

        if (!data.lockedUntil) return false;

        const now = Date.now();
        if (now >= data.lockedUntil) {
            // El bloqueo ha expirado, limpiar datos
            RateLimitUtils.clearAttempts(email);
            return false;
        }

        return true;
    },

    /**
     * Obtiene el tiempo restante de bloqueo en segundos
     */
    getRemainingLockTime: (email) => {
        const data = RateLimitUtils.getAttemptData(email);

        if (!data.lockedUntil) return 0;

        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((data.lockedUntil - now) / 1000));

        return remaining;
    },

    /**
     * Registra un intento fallido
     */
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
            const lockDuration = RATE_LIMIT_CONFIG.lockoutDuration * 1000; // Convertir a millisegundos
            newData.lockedUntil = Date.now() + lockDuration;

            console.warn(`Cuenta bloqueada por ${RATE_LIMIT_CONFIG.lockoutDuration / 60} minutos: ${email}`);
        }

        RateLimitUtils.saveAttemptData(email, newData);
        return newData;
    },

    /**
     * Limpia los intentos después de un login exitoso
     */
    clearAttempts: (email) => {
        const key = RateLimitUtils.getStorageKey(email);
        loginAttempts.delete(key);
        console.log(`Intentos de login limpiados para: ${email}`);
    },

    /**
     * Formatea el tiempo restante para mostrar al usuario
     */
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

    /**
     * Obtiene información de advertencia sobre intentos restantes
     */
    getAttemptsWarning: (email) => {
        const data = RateLimitUtils.getAttemptData(email);

        if (data.attempts >= RATE_LIMIT_CONFIG.warningThreshold && data.attempts < RATE_LIMIT_CONFIG.maxAttempts) {
            const remaining = RATE_LIMIT_CONFIG.maxAttempts - data.attempts;
            return `⚠️ Te quedan ${remaining} intento${remaining === 1 ? '' : 's'} antes de que tu cuenta sea bloqueada temporalmente.`;
        }

        return null;
    }
};

// ===== FUNCIONES DE VALIDACIÓN (SIN CAMBIOS) =====
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

// ===== FUNCIÓN DE LOGIN CON SISTEMA DE BLOQUEO =====
loginController.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. VALIDACIONES BÁSICAS
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

        const cleanEmail = emailValidation.value;

        // 2. VERIFICAR SI LA CUENTA ESTÁ BLOQUEADA
        if (RateLimitUtils.isAccountLocked(cleanEmail)) {
            const remainingTime = RateLimitUtils.getRemainingLockTime(cleanEmail);
            const formattedTime = RateLimitUtils.formatRemainingTime(remainingTime);

            console.warn(`Intento de login en cuenta bloqueada: ${cleanEmail}`);

            return res.status(429).json({ // 429 Too Many Requests
                success: false,
                message: `Tu cuenta está temporalmente bloqueada debido a múltiples intentos fallidos. Inténtalo nuevamente en ${formattedTime}.`,
                isAccountLocked: true,
                remainingTime: remainingTime,
                formattedTime: formattedTime
            });
        }

        // 3. VERIFICAR CREDENCIALES
        let userFound;
        let userType;

        // Verificar si es el admin
        if (cleanEmail === config.admin.email && password === config.admin.password) {
            userType = "admin";
            userFound = { _id: "admin" };
        } else {
            // Buscar en customers
            try {
                userFound = await clientsModel.findOne({ email: cleanEmail });
                userType = "Customer";
            } catch (dbError) {
                console.error("Error en consulta de base de datos:", dbError);
                return res.status(503).json({
                    success: false,
                    message: "Servicio de base de datos no disponible temporalmente"
                });
            }
        }

        // 4. VERIFICAR SI EL USUARIO EXISTE
        if (!userFound) {
            // REGISTRAR INTENTO FALLIDO - Usuario no encontrado
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

        // 5. VERIFICAR CONTRASEÑA PARA USUARIOS NO ADMIN
        if (userType !== "admin") {
            try {
                const isMatch = await bcryptjs.compare(password, userFound.password);
                if (!isMatch) {
                    // REGISTRAR INTENTO FALLIDO - Contraseña incorrecta  
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
                console.error("Error en comparación de contraseña:", hashError);
                return res.status(500).json({
                    success: false,
                    message: "Error en verificación de credenciales"
                });
            }
        }

        // 6. VERIFICAR CONFIGURACIÓN JWT
        if (!config.JWT.secret || !config.JWT.expires) {
            console.error("Configuración JWT incompleta");
            return res.status(500).json({
                success: false,
                message: "Error de configuración del servidor"
            });
        }

        // 7. LOGIN EXITOSO - LIMPIAR INTENTOS Y GENERAR TOKEN
        try {
            // LIMPIAR INTENTOS FALLIDOS
            RateLimitUtils.clearAttempts(cleanEmail);

            const token = await generateJWT({
                id: userFound._id,
                userType
            });

            // Establecer cookie con el token
            res.cookie("authToken", token, {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000 // 24 horas
            });

            console.log(`Successful login for: ${cleanEmail} as ${userType}`);

            // RESPUESTA EXACTA COMO ESPERA EL FRONTEND
            res.status(200).json({
                success: true,
                message: "login successful",
                userType: userType,
                token: token
            });
        } catch (jwtError) {
            console.error("Error generating token:", jwtError);
            return res.status(500).json({
                success: false,
                message: "Error generating authentication token"
            });
        }
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// ===== ENDPOINT ADICIONAL PARA VERIFICAR ESTADO DE BLOQUEO =====
loginController.checkLockStatus = (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email es requerido"
            });
        }

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
        console.error("Error checking lock status:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// ===== ENDPOINT PARA LIMPIAR INTENTOS (USO ADMINISTRATIVO) =====
loginController.clearLoginAttempts = (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email es requerido"
            });
        }

        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: emailValidation.error
            });
        }

        const cleanEmail = emailValidation.value;
        RateLimitUtils.clearAttempts(cleanEmail);

        res.status(200).json({
            success: true,
            message: `Intentos de login limpiados para: ${cleanEmail}`
        });

    } catch (error) {
        console.error("Error clearing login attempts:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// ===== RESTO DE FUNCIONES SIN CAMBIOS =====
loginController.verifyToken = (req, res) => {
    try {
        const token = req.cookies.authToken;
        
        if (!token) {
            return res.status(200).json({ 
                success: false,
                message: 'No token provided',
                isAuthenticated: false 
            });
        }

        if (!config.JWT.secret) {
            console.error("JWT secret no configurado");
            return res.status(200).json({
                success: false,
                message: 'Server configuration error',
                isAuthenticated: false
            });
        }

        try {
            const decoded = jsonwebtoken.verify(token, config.JWT.secret);
            
            if (!decoded.id || !decoded.userType) {
                return res.status(200).json({
                    success: false,
                    message: 'Invalid token structure',
                    isAuthenticated: false
                });
            }
            
            res.status(200).json({
                success: true,
                id: decoded.id,
                userType: decoded.userType,
                isAuthenticated: true
            });
        } catch (jwtError) {
            console.error('JWT verification error:', jwtError);
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
        console.error('Error verificando token:', error);
        res.clearCookie("authToken");
        
        res.status(200).json({ 
            success: false,
            message: 'Internal server error',
            isAuthenticated: false 
        });
    }
};

loginController.getUserInfo = async (req, res) => {
    try {
        const token = req.cookies.authToken;
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token de autenticación requerido'
            });
        }

        if (!config.JWT.secret) {
            console.error("JWT secret no configurado");
            return res.status(500).json({
                success: false,
                message: 'Error de configuración del servidor'
            });
        }

        let decoded;
        try {
            decoded = jsonwebtoken.verify(token, config.JWT.secret);
        } catch (jwtError) {
            console.error('Error verificando token:', jwtError);
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

        if (!id || !userType) {
            return res.status(401).json({
                success: false,
                message: 'Token con estructura inválida'
            });
        }

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
            try {
                const client = await clientsModel.findById(id).select('-password');
                
                if (!client) {
                    res.clearCookie("authToken");
                    return res.status(404).json({
                        success: false,
                        message: 'Usuario no encontrado'
                    });
                }

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
                    userType: 'Customer'
                };

                return res.status(200).json({
                    success: true,
                    user: clientInfo
                });
            } catch (dbError) {
                console.error('Error consultando base de datos:', dbError);
                return res.status(503).json({
                    success: false,
                    message: 'Servicio de base de datos no disponible'
                });
            }
        }
    } catch (error) {
        console.error('Error obteniendo información del usuario:', error);
        
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

loginController.refreshToken = async (req, res) => {
    try {
        const token = req.cookies.authToken;
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token no proporcionado'
            });
        }

        if (!config.JWT.secret || !config.JWT.expires) {
            console.error("Configuración JWT incompleta");
            return res.status(500).json({
                success: false,
                message: 'Error de configuración del servidor'
            });
        }

        let decoded;
        try {
            decoded = jsonwebtoken.verify(token, config.JWT.secret);
        } catch (jwtError) {
            console.error('Error verificando token para refresh:', jwtError);
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

        if (!decoded.id || !decoded.userType) {
            res.clearCookie("authToken");
            return res.status(401).json({
                success: false,
                message: 'Token con estructura inválida'
            });
        }

        try {
            const newToken = await generateJWT({
                id: decoded.id,
                userType: decoded.userType
            });

            res.cookie("authToken", newToken, {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000 // 24 horas
            });

            res.status(200).json({
                success: true,
                message: "Token refreshed successfully"
            });
        } catch (jwtError) {
            console.error('Error generando nuevo token:', jwtError);
            return res.status(500).json({
                success: false,
                message: 'Error generando nuevo token'
            });
        }

    } catch (error) {
        console.error('Error refrescando token:', error);
        res.clearCookie("authToken");
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

export default loginController;