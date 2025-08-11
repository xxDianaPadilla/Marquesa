import jsonwebtoken from "jsonwebtoken";
import { config } from "../config.js";

const logoutController = {};

/**
 * Función helper para configuración dinámica de cookies basada en el entorno
 * Aplica configuración específica para producción cross-domain y desarrollo local
 */
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

/**
 * Función helper para obtener token de múltiples fuentes en la petición
 * Soporta verificación tanto en cookies como en headers Authorization
 */
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

/**
 * Función principal de logout
 * Implementa el patrón híbrido para limpiar tokens tanto en cookies como headers
 * Funciona tanto en desarrollo local como en producción cross-domain
 */
logoutController.logout = async (req, res) => {
    try {
        console.log('=== INICIO LOGOUT ===');
        console.log('User-Agent:', req.get('User-Agent'));
        console.log('Origin:', req.get('Origin'));
        console.log('Referer:', req.get('Referer'));
        
        // Obtener token de múltiples fuentes posibles
        const { token, source } = getTokenFromRequest(req);
        
        console.log('Token encontrado:', !!token);
        console.log('Fuente del token:', source);
        
        // Verificar si existe token
        if (!token) {
            console.log('No hay token para cerrar sesión');
            return res.status(400).json({
                success: false,
                message: "No hay sesión activa para cerrar"
            });
        }

        // Verificar configuración JWT
        if (!config.JWT.secret) {
            console.error("JWT secret no configurado");
            return res.status(500).json({
                success: false,
                message: "Error de configuración del servidor"
            });
        }

        // Verificar validez del token antes de cerrar sesión
        let tokenValidation = null;
        try {
            const decoded = jsonwebtoken.verify(token, config.JWT.secret);
            
            // Validar estructura del token
            if (!decoded.id || !decoded.userType) {
                console.log("Token con estructura inválida al cerrar sesión");
                tokenValidation = {
                    isValid: false,
                    reason: 'estructura_invalida'
                };
            } else {
                console.log("Token válido para usuario:", decoded.id, "tipo:", decoded.userType);
                tokenValidation = {
                    isValid: true,
                    userId: decoded.id,
                    userType: decoded.userType
                };
            }
        } catch (jwtError) {
            // El token es inválido pero aún así limpiamos la cookie
            console.log("Token inválido al cerrar sesión:", jwtError.message);
            tokenValidation = {
                isValid: false,
                reason: jwtError.name,
                message: jwtError.message
            };
        }

        // Obtener configuración de cookies para el entorno actual
        const cookieConfig = getCookieConfig();
        
        console.log('Configuración de cookies para logout:', {
            isProduction: process.env.NODE_ENV === 'production',
            secure: cookieConfig.secure,
            sameSite: cookieConfig.sameSite
        });

        // Limpiar cookie de autenticación con configuración apropiada para el entorno
        res.clearCookie("authToken", {
            httpOnly: cookieConfig.httpOnly,
            secure: cookieConfig.secure,
            sameSite: cookieConfig.sameSite,
            domain: cookieConfig.domain,
            path: '/' // Asegurar que se limpie en todas las rutas
        });

        // También intentar limpiar con configuraciones alternativas para mayor compatibilidad
        // Esto es especialmente importante en entornos cross-domain
        if (cookieConfig.secure && cookieConfig.sameSite === 'none') {
            // Limpiar también con configuración de desarrollo por si acaso
            res.clearCookie("authToken", {
                httpOnly: false,
                secure: false,
                sameSite: 'lax',
                path: '/'
            });
        }

        console.log('Cookie de autenticación limpiada');

        // Preparar respuesta exitosa con información adicional
        const responseData = {
            success: true,
            message: "Sesión cerrada exitosamente",
            timestamp: new Date().toISOString(),
            tokenInfo: {
                wasValid: tokenValidation?.isValid || false,
                source: source,
                userId: tokenValidation?.userId || null
            }
        };

        // Incluir información adicional si el token era válido
        if (tokenValidation?.isValid) {
            responseData.user = {
                loggedOutAt: new Date().toISOString(),
                userId: tokenValidation.userId,
                userType: tokenValidation.userType
            };
        }

        // En desarrollo, incluir información de debugging
        if (process.env.NODE_ENV === 'development') {
            responseData.debug = {
                cookieConfig: cookieConfig,
                tokenValidation: tokenValidation,
                headers: {
                    origin: req.get('Origin'),
                    userAgent: req.get('User-Agent'),
                    referer: req.get('Referer')
                }
            };
        }

        console.log('=== FIN LOGOUT EXITOSO ===');

        res.status(200).json(responseData);

    } catch (error) {
        console.error("Error en logout:", error);
        
        // Aún así limpiar la cookie en caso de error
        // Esto es crítico para asegurar que el usuario pueda cerrar sesión
        try {
            const cookieConfig = getCookieConfig();
            
            res.clearCookie("authToken", {
                httpOnly: cookieConfig.httpOnly,
                secure: cookieConfig.secure,
                sameSite: cookieConfig.sameSite,
                domain: cookieConfig.domain,
                path: '/'
            });

            // Limpiar con configuraciones alternativas
            res.clearCookie("authToken", {
                httpOnly: false,
                secure: false,
                sameSite: 'lax',
                path: '/'
            });

            console.log('Cookie limpiada a pesar del error');
        } catch (cookieError) {
            console.error('Error al limpiar cookie:', cookieError);
        }

        // Manejar diferentes tipos de errores
        let errorMessage = "Error interno del servidor";
        let errorCode = 500;

        if (error.name === 'JsonWebTokenError') {
            errorMessage = "Error en el token de autenticación";
            errorCode = 401;
        } else if (error.name === 'TokenExpiredError') {
            errorMessage = "Token expirado - sesión cerrada";
            errorCode = 200; // Considerar esto como éxito
        }

        res.status(errorCode).json({
            success: errorCode === 200,
            message: errorMessage,
            timestamp: new Date().toISOString(),
            cookiesCleared: true, // Siempre verdadero porque limpiamos las cookies
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export default logoutController;