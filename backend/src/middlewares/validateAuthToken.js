import jwt from 'jsonwebtoken';
import { config } from '../config.js';

/**
 * Middleware de Autenticación para verificar tokens JWT
 * Soporta verificación híbrida tanto en cookies como en headers Authorization
 * Implementa el patrón cross-domain requerido para producción
 */

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

// Función para obtener el token de diferentes fuentes en la petición (verificación híbrida)
const getTokenFromRequest = (req) => {
    // Primera prioridad: obtener token de las cookies
    let token = req.cookies?.authToken;
    let source = 'cookie';

    // Segunda prioridad: obtener token del header Authorization
    if (!token) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7); // Remover "Bearer " del inicio
            source = 'authorization_header';
        }
    }

    return { token, source };
};

/**
 * Middleware principal para verificar token de autenticación
 * Verifica la validez del token JWT y agrega información del usuario a la petición
 * Implementa respuesta híbrida (cookies + body) para compatibilidad cross-domain
 */
const verifyToken = (req, res, next) => {
    try {
        // Obtener token de múltiples fuentes posibles (verificación híbrida)
        const { token, source } = getTokenFromRequest(req);
        
        // Verificar si se encontró un token
        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: 'Token de acceso requerido',
                code: 'TOKEN_MISSING',
                debug: {
                    cookiesPresent: !!req.cookies,
                    cookieKeys: req.cookies ? Object.keys(req.cookies) : [],
                    hasAuthHeader: !!req.headers.authorization,
                    path: req.path
                }
            });
        }
        
        // Verificar y decodificar el token JWT
        const decoded = jwt.verify(token, config.JWT.secret);
        
        // Validar que el token contenga la información necesaria
        if (!decoded || !decoded.id || !decoded.userType) {
            // Limpiar cookie en caso de token inválido
            res.clearCookie("authToken");
            return res.status(401).json({ 
                success: false,
                message: 'Token inválido: datos incompletos',
                code: 'TOKEN_INVALID_DATA'
            });
        }
        
        // Agregar información del usuario autenticado a la petición
        req.user = {
            id: decoded.id,
            userType: decoded.userType,
            email: decoded.email || null
        };

        // Establecer cookie con configuración dinámica para mantener sesión
        const cookieConfig = getCookieConfig();
        res.cookie("authToken", token, cookieConfig);
        
        // Continuar con el siguiente middleware
        next();
        
    } catch (error) {
        // Limpiar cookie en caso de error
        res.clearCookie("authToken");
        
        // Manejar diferentes tipos de errores de JWT
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false,
                message: 'Token expirado',
                code: 'TOKEN_EXPIRED',
                debug: {
                    expiredAt: error.expiredAt,
                    path: req.path
                }
            });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false,
                message: 'Token inválido',
                code: 'TOKEN_MALFORMED',
                debug: {
                    jwtError: error.message,
                    path: req.path
                }
            });
        } else {
            return res.status(500).json({ 
                success: false,
                message: 'Error interno del servidor en autenticación',
                code: 'AUTH_INTERNAL_ERROR'
            });
        }
    }
};

/**
 * Middleware para verificar permisos de administrador
 * Primero verifica el token y luego confirma que el usuario sea admin
 * Implementa configuración de cookies y respuesta híbrida
 */
const verifyAdmin = (req, res, next) => {
    // Primero verificar que el token sea válido
    verifyToken(req, res, (err) => {
        if (err) {
            return; // verifyToken ya envió la respuesta de error
        }
        
        // Verificar que el usuario tenga permisos de administrador
        if (!req.user || req.user.userType !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Acceso denegado. Se requieren permisos de administrador',
                code: 'ADMIN_REQUIRED',
                debug: {
                    currentUserType: req.user?.userType,
                    requiredUserType: 'admin',
                    path: req.path
                }
            });
        }

        // Establecer cookie con configuración dinámica para mantener sesión
        const { token } = getTokenFromRequest(req);
        if (token) {
            const cookieConfig = getCookieConfig();
            res.cookie("authToken", token, cookieConfig);
        }
        
        next();
    });
};

/**
 * Middleware para verificar permisos de cliente
 * Primero verifica el token y luego confirma que el usuario sea cliente
 * Implementa configuración de cookies y respuesta híbrida
 */
const verifyCustomer = (req, res, next) => {
    // Primero verificar que el token sea válido
    verifyToken(req, res, (err) => {
        if (err) {
            return; // verifyToken ya envió la respuesta de error
        }
        
        // Verificar que el usuario tenga permisos de cliente
        if (!req.user || req.user.userType !== 'Customer') {
            return res.status(403).json({
                success: false,
                message: 'Acceso denegado. Se requieren permisos de cliente',
                code: 'CUSTOMER_REQUIRED',
                debug: {
                    currentUserType: req.user?.userType,
                    requiredUserType: 'Customer',
                    path: req.path
                }
            });
        }

        // Establecer cookie con configuración dinámica para mantener sesión
        const { token } = getTokenFromRequest(req);
        if (token) {
            const cookieConfig = getCookieConfig();
            res.cookie("authToken", token, cookieConfig);
        }
        
        next();
    });
};

/**
 * Middleware que permite acceso tanto a administradores como a clientes
 * Útil para rutas que pueden ser accedidas por ambos tipos de usuario
 * Implementa configuración de cookies y respuesta híbrida
 */
const verifyAdminOrCustomer = (req, res, next) => {
    // Primero verificar que el token sea válido
    verifyToken(req, res, (err) => {
        if (err) {
            return; // verifyToken ya envió la respuesta de error
        }
        
        // Verificar que el usuario sea admin o customer
        if (!req.user || !['admin', 'Customer'].includes(req.user.userType)) {
            return res.status(403).json({
                success: false,
                message: 'Acceso denegado. Se requieren permisos de administrador o cliente',
                code: 'INVALID_USER_TYPE',
                debug: {
                    currentUserType: req.user?.userType,
                    allowedUserTypes: ['admin', 'Customer'],
                    path: req.path
                }
            });
        }

        // Establecer cookie con configuración dinámica para mantener sesión
        const { token } = getTokenFromRequest(req);
        if (token) {
            const cookieConfig = getCookieConfig();
            res.cookie("authToken", token, cookieConfig);
        }
        
        next();
    });
};

// Exportar el middleware principal como default y los demás como named exports
export default verifyToken;
export { 
    verifyAdmin, 
    verifyCustomer, 
    verifyAdminOrCustomer,
    getTokenFromRequest,
    getCookieConfig
};