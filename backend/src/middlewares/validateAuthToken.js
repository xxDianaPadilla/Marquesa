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
    
    if (isProduction) {
        return {
            httpOnly: false, // Crítico: Permitir acceso desde JavaScript para cross-domain
            secure: true, // HTTPS obligatorio en producción
            sameSite: 'none', // Permitir cookies cross-domain
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días (más duradero)
            domain: undefined, // No especificar domain
            path: '/'
        };
    } else {
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

/**
 * ✅ NUEVA FUNCIÓN: Refrescar cookie en cada request válido
 * Esto mantiene la sesión activa y evita que expire
 */
const refreshAuthCookie = (res, token) => {
    try {
        const cookieConfig = getCookieConfig();
        res.cookie("authToken", token, cookieConfig);
        
        // Log para debugging en desarrollo
        if (process.env.NODE_ENV === 'development') {
            console.log('🔄 Cookie de auth refrescada:', {
                secure: cookieConfig.secure,
                sameSite: cookieConfig.sameSite,
                maxAge: cookieConfig.maxAge
            });
        }
    } catch (error) {
        console.error('Error al refrescar cookie:', error);
    }
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
        // Obtener token de múltiples fuentes (verificación híbrida)
        const { token, source } = getTokenFromRequest(req);
        
        console.log('🔐 verifyToken: Iniciando verificación');
        console.log('🔐 verifyToken: Token source:', source);
        console.log('🔐 verifyToken: Token presente:', !!token);
        
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
        
        // ✅ CORRECCIÓN CRÍTICA: Verificar y decodificar el token JWT con validación mejorada
        let decoded;
        try {
            decoded = jwt.verify(token, config.JWT.secret);
            console.log('🔍 Token decodificado:', {
                id: decoded.id,
                userType: decoded.userType,
                email: decoded.email,
                exp: decoded.exp
            });
        } catch (jwtError) {
            console.log('❌ Error verificando JWT:', jwtError.message);
            res.clearCookie("authToken");
            
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({ 
                    success: false,
                    message: 'Token expirado',
                    code: 'TOKEN_EXPIRED',
                    debug: {
                        expiredAt: jwtError.expiredAt,
                        path: req.path
                    }
                });
            } else if (jwtError.name === 'JsonWebTokenError') {
                return res.status(401).json({ 
                    success: false,
                    message: 'Token inválido',
                    code: 'TOKEN_MALFORMED',
                    debug: {
                        jwtError: jwtError.message,
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
        
        // ✅ VALIDACIÓN CRÍTICA: Verificar estructura del token decodificado
        if (!decoded || !decoded.id || !decoded.userType) {
            console.log('❌ Token inválido: datos incompletos');
            console.log('Decoded payload:', decoded);
            res.clearCookie("authToken");
            return res.status(401).json({ 
                success: false,
                message: 'Token inválido: datos incompletos',
                code: 'TOKEN_INVALID_DATA'
            });
        }
        
        // ✅ VALIDACIÓN NUEVA: Verificar que ID no sea igual a userType
        if (decoded.id === decoded.userType) {
            console.log('❌ Token corrupto: ID es igual al userType');
            console.log('ID:', decoded.id, 'UserType:', decoded.userType);
            res.clearCookie("authToken");
            return res.status(401).json({ 
                success: false,
                message: 'Token corrupto: estructura inválida',
                code: 'TOKEN_CORRUPTED'
            });
        }
        
        // ✅ VALIDACIÓN NUEVA: Verificar que ID tenga formato de ObjectId
        const objectIdRegex = /^[0-9a-fA-F]{24}$/;
        if (!objectIdRegex.test(decoded.id)) {
            console.log('❌ ID no es un ObjectId válido:', decoded.id);
            console.log('Tipo de ID:', typeof decoded.id);
            res.clearCookie("authToken");
            return res.status(401).json({ 
                success: false,
                message: 'Token inválido: ID de usuario corrupto',
                code: 'INVALID_USER_ID'
            });
        }
        
        // ✅ CORRECCIÓN CRÍTICA: Refrescar cookie en cada request válido
        try {
            refreshAuthCookie(res, token);
        } catch (cookieError) {
            console.warn('⚠️ Error refrescando cookie:', cookieError.message);
        }
        
        // Agregar información del usuario a la petición
        req.user = {
            id: decoded.id,
            userType: decoded.userType,
            email: decoded.email || null
        };
        
        console.log('✅ Usuario autenticado correctamente:', {
            id: req.user.id,
            userType: req.user.userType,
            idLength: req.user.id.length
        });
        
        // Continuar con el siguiente middleware
        next();
        
    } catch (error) {
        console.error('❌ Error crítico en verifyToken:', error);
        
        // Limpiar cookie en caso de error
        res.clearCookie("authToken");
        
        return res.status(500).json({ 
            success: false,
            message: 'Error interno del servidor en autenticación',
            code: 'AUTH_INTERNAL_ERROR'
        });
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
        
        console.log('🔍 verifyCustomer: Verificando permisos de cliente');
        console.log('🔍 verifyCustomer: User data:', req.user);
        
        // Verificar que el usuario tenga permisos de cliente
        if (!req.user || req.user.userType !== 'Customer') {
            console.log('❌ verifyCustomer: UserType inválido:', req.user?.userType);
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

        // ✅ VALIDACIÓN ADICIONAL: Verificar que el ID del cliente sea válido
        const objectIdRegex = /^[0-9a-fA-F]{24}$/;
        if (!objectIdRegex.test(req.user.id)) {
            console.log('❌ verifyCustomer: ID de cliente inválido:', req.user.id);
            return res.status(400).json({
                success: false,
                message: 'ID de cliente inválido',
                code: 'INVALID_CLIENT_ID'
            });
        }

        // Establecer cookie con configuración dinámica para mantener sesión
        const { token } = getTokenFromRequest(req);
        if (token) {
            try {
                const cookieConfig = getCookieConfig();
                res.cookie("authToken", token, cookieConfig);
            } catch (cookieError) {
                console.warn('⚠️ Error configurando cookie en verifyCustomer:', cookieError.message);
            }
        }
        
        console.log('✅ verifyCustomer: Cliente válido, continuando');
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