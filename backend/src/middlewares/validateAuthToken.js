import jwt from 'jsonwebtoken';
import { config } from '../config.js';

/**
 * Middleware de Autenticación Mejorado - VERSIÓN CORREGIDA
 * 
 * PROBLEMAS SOLUCIONADOS:
 * - Mejor logging para debug de errores 401
 * - Manejo más robusto de cookies
 * - Validación mejorada de tokens
 * - Respuestas de error más específicas
 * 
 * Ubicación: backend/src/middlewares/validateAuthToken.js
 */

/**
 * Middleware principal para verificar token de autenticación
 * ✅ MEJORADO: Mejor logging y manejo de errores
 */
const verifyToken = (req, res, next) => {
    try {
        
        // Obtener token de las cookies
        const token = req.cookies?.authToken;
        
        
        // Verificar si existe el token
        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: 'Token de acceso requerido',
                code: 'TOKEN_MISSING',
                debug: {
                    cookiesPresent: !!req.cookies,
                    cookieKeys: req.cookies ? Object.keys(req.cookies) : [],
                    path: req.path
                }
            });
        }
        
        
        // Verificar y decodificar el token
        const decoded = jwt.verify(token, config.JWT.secret);
        
        
        // Validar que el token contenga la información necesaria
        if (!decoded || !decoded.id || !decoded.userType) {
            res.clearCookie("authToken");
            return res.status(401).json({ 
                success: false,
                message: 'Token inválido: datos incompletos',
                code: 'TOKEN_INVALID_DATA'
            });
        }
        
        // Agregar información del usuario a la request
        req.user = {
            id: decoded.id,
            userType: decoded.userType,
            email: decoded.email || null
        };
        
        
        next();
        
    } catch (error) {
        console.error(`❌ Error en autenticación para ${req.path}:`, error.message);
        
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
            console.error(`💥 Error interno de autenticación para ${req.path}:`, error);
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
 * ✅ MEJORADO: Mejor logging y validación
 */
const verifyAdmin = (req, res, next) => {
    
    // Primero verificar el token
    verifyToken(req, res, (err) => {
        if (err) {
            return; // verifyToken ya envió la respuesta
        }
        
        
        // Verificar que el usuario sea administrador
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
        next();
    });
};

/**
 * Middleware para verificar permisos de cliente
 * ✅ MEJORADO: Mejor logging y validación
 */
const verifyCustomer = (req, res, next) => {
    
    // Primero verificar el token
    verifyToken(req, res, (err) => {
        if (err) {
            return; // verifyToken ya envió la respuesta
        }
        
        
        // Verificar que el usuario sea cliente
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
        
        next();
    });
};

/**
 * ✅ NUEVO: Middleware opcional que permite tanto admin como customer
 */
const verifyAdminOrCustomer = (req, res, next) => {
    
    // Primero verificar el token
    verifyToken(req, res, (err) => {
        if (err) {
            return; // verifyToken ya envió la respuesta
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
        
        next();
    });
};

// Exportaciones
export default verifyToken;
export { 
    verifyAdmin, 
    verifyCustomer, 
    verifyAdminOrCustomer
};