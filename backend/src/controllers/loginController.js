import bcryptjs from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import clientsModel from "../models/Clients.js";
import { config } from "../config.js";

const loginController = {};

// Función helper para validar email
const validateEmail = (email) => {
    if (!email || typeof email !== 'string') {
        return { isValid: false, error: "Email es requerido" };
    }
    
    const trimmedEmail = email.trim().toLowerCase();
    
    if (trimmedEmail.length === 0) {
        return { isValid: false, error: "Email no puede estar vacío" };
    }
    
    // Validación básica de formato de email
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

// Función helper para generar JWT
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

// Función de login - MANTIENE ESTRUCTURA ORIGINAL EXACTA CON VALIDACIONES
loginController.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Validar que los campos estén presentes
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

        let userFound;
        let userType;

        // Verificar si es el admin
        if (emailValidation.value === config.admin.email && password === config.admin.password) {
            userType = "admin";
            userFound = { _id: "admin" };
        } else {
            // Buscar en customers
            try {
                userFound = await clientsModel.findOne({ email: emailValidation.value });
                userType = "Customer";
            } catch (dbError) {
                console.error("Error en consulta de base de datos:", dbError);
                return res.status(503).json({
                    success: false,
                    message: "Servicio de base de datos no disponible temporalmente"
                });
            }
        }

        if (!userFound) {
            return res.status(401).json({
                success: false,
                message: "user not found"
            });
        }

        // Verificar contraseña para usuarios no admin
        if (userType !== "admin") {
            try {
                const isMatch = await bcryptjs.compare(password, userFound.password);
                if (!isMatch) {
                    return res.status(401).json({
                        success: false,
                        message: "Invalid password"
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

        // Verificar configuración JWT
        if (!config.JWT.secret || !config.JWT.expires) {
            console.error("Configuración JWT incompleta");
            return res.status(500).json({
                success: false,
                message: "Error de configuración del servidor"
            });
        }

        // Generar JWT
        try {
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

            console.log(`Successful login for: ${emailValidation.value} as ${userType}`);

            // RESPUESTA EXACTA COMO ESPERA EL FRONTEND
            res.status(200).json({
                success: true,
                message: "login successful",
                userType: userType
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

// Verificar token - DEVUELVE 200 SIEMPRE CON VALIDACIONES
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

        // Verificar que existe la configuración JWT
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
            
            // Validar estructura del token decodificado
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
            
            // Determinar tipo de error JWT
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

// Obtener información del usuario CON VALIDACIONES
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

        // Validar estructura del token
        if (!id || !userType) {
            return res.status(401).json({
                success: false,
                message: 'Token con estructura inválida'
            });
        }

        if (userType === 'admin') {
            // Verificar que el admin existe en configuración
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

// Refrescar token CON VALIDACIONES
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

        // Validar estructura del token
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