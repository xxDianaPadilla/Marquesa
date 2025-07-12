import jwt from 'jsonwebtoken';
import { config } from '../config.js';

// Middleware principal para verificar token
const verifyToken = (req, res, next) => {
    const token = req.cookies.authToken;
    
    if (!token) {
        return res.status(401).json({ 
            success: false,
            message: 'Token de acceso requerido' 
        });
    }
    
    try {
        const decoded = jwt.verify(token, config.JWT.secret);
        req.user = decoded;
        next();
    } catch (error) {
        // Limpiar cookie si el token es inválido
        res.clearCookie("authToken");
        return res.status(401).json({ 
            success: false,
            message: 'Token inválido o expirado' 
        });
    }
};

// Middleware para verificar si el usuario es administrador
const verifyAdmin = (req, res, next) => {
    const token = req.cookies.authToken;
    
    if (!token) {
        return res.status(401).json({ 
            success: false,
            message: 'Token de acceso requerido' 
        });
    }
    
    try {
        const decoded = jwt.verify(token, config.JWT.secret);
        
        if (decoded.userType !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Acceso denegado. Se requieren permisos de administrador'
            });
        }
        
        req.user = decoded;
        next();
    } catch (error) {
        res.clearCookie("authToken");
        return res.status(401).json({ 
            success: false,
            message: 'Token inválido o expirado' 
        });
    }
};

// Middleware para verificar si el usuario es cliente
const verifyCustomer = (req, res, next) => {
    const token = req.cookies.authToken;
    
    if (!token) {
        return res.status(401).json({ 
            success: false,
            message: 'Token de acceso requerido' 
        });
    }
    
    try {
        const decoded = jwt.verify(token, config.JWT.secret);
        
        if (decoded.userType !== 'Customer') {
            return res.status(403).json({
                success: false,
                message: 'Acceso denegado. Se requieren permisos de cliente'
            });
        }
        
        req.user = decoded;
        next();
    } catch (error) {
        res.clearCookie("authToken");
        return res.status(401).json({ 
            success: false,
            message: 'Token inválido o expirado' 
        });
    }
};

// Middleware opcional - no requiere autenticación pero si hay token lo valida
const optionalAuth = (req, res, next) => {
    const token = req.cookies.authToken;
    
    if (!token) {
        req.user = null;
        return next();
    }
    
    try {
        const decoded = jwt.verify(token, config.JWT.secret);
        req.user = decoded;
        next();
    } catch (error) {
        // Si hay error en el token, limpiar cookie y continuar sin usuario
        res.clearCookie("authToken");
        req.user = null;
        next();
    }
};

export default verifyToken;
export { verifyAdmin, verifyCustomer, optionalAuth };