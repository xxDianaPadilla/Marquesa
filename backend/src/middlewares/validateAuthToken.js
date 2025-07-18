import jwt from 'jsonwebtoken';
import { config } from '../config.js';

// Middleware para verificar token de autenticación
const verifyToken = (req, res, next) => {
    try {
        // Obtener token de las cookies
        const token = req.cookies.authToken;
        
        // Verificar si existe el token
        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: 'Token de acceso requerido'
            });
        }
        
        // Verificar y decodificar el token
        const decoded = jwt.verify(token, config.JWT.secret);
        
        // Validar que el token contenga la información necesaria
        if (!decoded || !decoded.id || !decoded.userType) {
            res.clearCookie("authToken");
            return res.status(401).json({ 
                success: false,
                message: 'Token inválido: datos incompletos'
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
        // Limpiar cookie en caso de error
        res.clearCookie("authToken");
        
        // Manejar diferentes tipos de errores de JWT
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false,
                message: 'Token expirado'
            });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false,
                message: 'Token inválido'
            });
        } else {
            console.error('Error en autenticación:', error);
            return res.status(500).json({ 
                success: false,
                message: 'Error interno del servidor en autenticación'
            });
        }
    }
};

// Middleware para verificar permisos de administrador
const verifyAdmin = (req, res, next) => {
    // Primero verificar el token
    verifyToken(req, res, (err) => {
        if (err) return;
        
        // Verificar que el usuario sea administrador
        if (req.user.userType !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Acceso denegado. Se requieren permisos de administrador'
            });
        }
        
        next();
    });
};

// Middleware para verificar permisos de cliente
const verifyCustomer = (req, res, next) => {
    // Primero verificar el token
    verifyToken(req, res, (err) => {
        if (err) return;
        
        // Verificar que el usuario sea cliente
        if (req.user.userType !== 'Customer') {
            return res.status(403).json({
                success: false,
                message: 'Acceso denegado. Se requieren permisos de cliente'
            });
        }
        
        next();
    });
};

export default verifyToken;
export { verifyAdmin, verifyCustomer };