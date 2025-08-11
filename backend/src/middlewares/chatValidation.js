import { ChatValidators, ChatConstants } from '../utils/chatUtils.js';
import ChatConversation from '../models/ChatConversation.js';

/**
 * Middlewares de Validación para el Sistema de Chat
 * 
 * Este archivo contiene todos los middlewares de validación
 * específicos para las operaciones del chat con soporte cross-domain.
 * 
 * Ubicación: backend/src/middlewares/chatValidation.js
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

// Función helper para obtener token de múltiples fuentes en la petición
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

// ============ VALIDACIÓN DE AUTENTICACIÓN ============

/**
 * Middleware para validar que el usuario esté autenticado
 * Implementa verificación híbrida de tokens y configuración de cookies cross-domain
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 * @param {Function} next - Función next de Express
 */
export const requireAuth = (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Usuario no autenticado",
                code: "AUTH_REQUIRED"
            });
        }

        // Validar que el usuario tenga los campos requeridos
        if (!req.user.id || !req.user.userType) {
            return res.status(401).json({
                success: false,
                message: "Datos de usuario incompletos",
                code: "INVALID_USER_DATA"
            });
        }

        // Establecer cookie con configuración dinámica para mantener sesión
        const { token } = getTokenFromRequest(req);
        if (token) {
            const cookieConfig = getCookieConfig();
            res.cookie("authToken", token, cookieConfig);
        }

        next();
    } catch (error) {
        console.error('Error en validación de autenticación:', error);
        return res.status(500).json({
            success: false,
            message: "Error interno de autenticación",
            code: "AUTH_ERROR"
        });
    }
};

/**
 * Middleware para validar que el usuario sea administrador
 * Implementa configuración de cookies cross-domain
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 * @param {Function} next - Función next de Express
 */
export const requireAdmin = (req, res, next) => {
    try {
        if (!req.user || req.user.userType !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Acceso denegado - Se requieren permisos de administrador",
                code: "ADMIN_REQUIRED"
            });
        }

        // Establecer cookie con configuración dinámica para mantener sesión
        const { token } = getTokenFromRequest(req);
        if (token) {
            const cookieConfig = getCookieConfig();
            res.cookie("authToken", token, cookieConfig);
        }

        next();
    } catch (error) {
        console.error('Error en validación de administrador:', error);
        return res.status(500).json({
            success: false,
            message: "Error interno de autorización",
            code: "AUTH_ERROR"
        });
    }
};

/**
 * Middleware para validar que el usuario sea cliente
 * Implementa configuración de cookies cross-domain
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 * @param {Function} next - Función next de Express
 */
export const requireCustomer = (req, res, next) => {
    try {
        if (!req.user || req.user.userType !== 'Customer') {
            return res.status(403).json({
                success: false,
                message: "Acceso denegado - Se requieren permisos de cliente",
                code: "CUSTOMER_REQUIRED"
            });
        }

        // Establecer cookie con configuración dinámica para mantener sesión
        const { token } = getTokenFromRequest(req);
        if (token) {
            const cookieConfig = getCookieConfig();
            res.cookie("authToken", token, cookieConfig);
        }

        next();
    } catch (error) {
        console.error('Error en validación de cliente:', error);
        return res.status(500).json({
            success: false,
            message: "Error interno de autorización",
            code: "AUTH_ERROR"
        });
    }
};

// ============ VALIDACIÓN DE CONVERSACIONES ============

/**
 * Middleware para validar que existe una conversación
 * Implementa configuración de cookies cross-domain
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 * @param {Function} next - Función next de Express
 */
export const validateConversationExists = async (req, res, next) => {
    try {
        const { conversationId } = req.params;

        if (!conversationId) {
            return res.status(400).json({
                success: false,
                message: "ID de conversación requerido",
                code: "CONVERSATION_ID_REQUIRED"
            });
        }

        // Buscar la conversación
        const conversation = await ChatConversation.findOne({ 
            conversationId: conversationId 
        }).lean();

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversación no encontrada",
                code: "CONVERSATION_NOT_FOUND"
            });
        }

        // Agregar la conversación al request para uso posterior
        req.conversation = conversation;

        // Establecer cookie con configuración dinámica para mantener sesión
        const { token } = getTokenFromRequest(req);
        if (token) {
            const cookieConfig = getCookieConfig();
            res.cookie("authToken", token, cookieConfig);
        }

        next();

    } catch (error) {
        console.error('Error validando conversación:', error);
        return res.status(500).json({
            success: false,
            message: "Error interno validando conversación",
            code: "VALIDATION_ERROR"
        });
    }
};

/**
 * Middleware para validar acceso a una conversación específica
 * Implementa configuración de cookies cross-domain
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 * @param {Function} next - Función next de Express
 */
export const validateConversationAccess = (req, res, next) => {
    try {
        const { user, conversation } = req;

        if (!conversation) {
            return res.status(400).json({
                success: false,
                message: "Conversación no encontrada en el contexto",
                code: "CONVERSATION_CONTEXT_MISSING"
            });
        }

        // Verificar permisos usando la utilidad
        const hasAccess = ChatValidators.canAccessConversation(
            conversation, 
            user.id, 
            user.userType
        );

        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                message: "No tienes permisos para acceder a esta conversación",
                code: "CONVERSATION_ACCESS_DENIED"
            });
        }

        // Establecer cookie con configuración dinámica para mantener sesión
        const { token } = getTokenFromRequest(req);
        if (token) {
            const cookieConfig = getCookieConfig();
            res.cookie("authToken", token, cookieConfig);
        }

        next();

    } catch (error) {
        console.error('Error validando acceso a conversación:', error);
        return res.status(500).json({
            success: false,
            message: "Error interno validando acceso",
            code: "ACCESS_VALIDATION_ERROR"
        });
    }
};

/**
 * Middleware para validar que el cliente de la conversación existe
 * Implementa configuración de cookies cross-domain
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 * @param {Function} next - Función next de Express
 */
export const validateConversationClient = async (req, res, next) => {
    try {
        const { conversation } = req;

        if (!conversation) {
            return res.status(400).json({
                success: false,
                message: "Conversación no encontrada en el contexto",
                code: "CONVERSATION_CONTEXT_MISSING"
            });
        }

        // Verificar que el cliente existe
        const clientExists = await ChatValidators.validateClientExists(conversation.clientId);

        if (!clientExists) {
            return res.status(404).json({
                success: false,
                message: "El cliente de esta conversación no existe",
                code: "CLIENT_NOT_FOUND"
            });
        }

        // Establecer cookie con configuración dinámica para mantener sesión
        const { token } = getTokenFromRequest(req);
        if (token) {
            const cookieConfig = getCookieConfig();
            res.cookie("authToken", token, cookieConfig);
        }

        next();

    } catch (error) {
        console.error('Error validando cliente de conversación:', error);
        return res.status(500).json({
            success: false,
            message: "Error interno validando cliente",
            code: "CLIENT_VALIDATION_ERROR"
        });
    }
};

// ============ VALIDACIÓN DE MENSAJES ============

/**
 * Middleware para validar datos de mensaje antes de crearlo
 * Implementa configuración de cookies cross-domain
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 * @param {Function} next - Función next de Express
 */
export const validateMessageData = (req, res, next) => {
    try {
        const { conversationId, message } = req.body;
        const file = req.file;

        // Validar conversationId
        if (!conversationId) {
            return res.status(400).json({
                success: false,
                message: "ID de conversación es requerido",
                code: "CONVERSATION_ID_REQUIRED"
            });
        }

        // Validar que hay contenido (mensaje o archivo)
        const hasMessage = message && message.trim();
        const hasFile = file && file.path;

        if (!hasMessage && !hasFile) {
            return res.status(400).json({
                success: false,
                message: "Debes enviar un mensaje de texto o un archivo",
                code: "MESSAGE_CONTENT_REQUIRED"
            });
        }

        // Validar longitud del mensaje
        if (hasMessage && message.length > ChatConstants.MAX_MESSAGE_LENGTH) {
            return res.status(400).json({
                success: false,
                message: `El mensaje no puede exceder ${ChatConstants.MAX_MESSAGE_LENGTH} caracteres`,
                code: "MESSAGE_TOO_LONG"
            });
        }

        // Validar tamaño del archivo
        if (hasFile && file.size > ChatConstants.MAX_FILE_SIZE) {
            return res.status(400).json({
                success: false,
                message: `El archivo no puede exceder ${ChatConstants.MAX_FILE_SIZE / 1024 / 1024}MB`,
                code: "FILE_TOO_LARGE"
            });
        }

        // Establecer cookie con configuración dinámica para mantener sesión
        const { token } = getTokenFromRequest(req);
        if (token) {
            const cookieConfig = getCookieConfig();
            res.cookie("authToken", token, cookieConfig);
        }

        next();

    } catch (error) {
        console.error('Error validando datos de mensaje:', error);
        return res.status(500).json({
            success: false,
            message: "Error interno validando mensaje",
            code: "MESSAGE_VALIDATION_ERROR"
        });
    }
};

/**
 * Middleware para validar parámetros de paginación
 * Implementa configuración de cookies cross-domain
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 * @param {Function} next - Función next de Express
 */
export const validatePagination = (req, res, next) => {
    try {
        let { page = 1, limit = 50 } = req.query;

        // Convertir a números
        page = parseInt(page);
        limit = parseInt(limit);

        // Validar que son números válidos
        if (isNaN(page) || page < 1) {
            return res.status(400).json({
                success: false,
                message: "Número de página inválido",
                code: "INVALID_PAGE_NUMBER"
            });
        }

        if (isNaN(limit) || limit < 1 || limit > 100) {
            return res.status(400).json({
                success: false,
                message: "Límite de elementos inválido (debe estar entre 1 y 100)",
                code: "INVALID_LIMIT"
            });
        }

        // Agregar los valores validados al request
        req.pagination = { page, limit };

        // Establecer cookie con configuración dinámica para mantener sesión
        const { token } = getTokenFromRequest(req);
        if (token) {
            const cookieConfig = getCookieConfig();
            res.cookie("authToken", token, cookieConfig);
        }

        next();

    } catch (error) {
        console.error('Error validando paginación:', error);
        return res.status(500).json({
            success: false,
            message: "Error interno validando paginación",
            code: "PAGINATION_VALIDATION_ERROR"
        });
    }
};

// ============ VALIDACIÓN DE PARÁMETROS ============

/**
 * Middleware para validar parámetros de URL
 * Implementa configuración de cookies cross-domain
 * @param {Array<string>} requiredParams - Lista de parámetros requeridos
 * @returns {Function} Middleware de Express
 */
export const validateUrlParams = (requiredParams) => {
    return (req, res, next) => {
        try {
            const missingParams = [];

            for (const param of requiredParams) {
                if (!req.params[param]) {
                    missingParams.push(param);
                }
            }

            if (missingParams.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Parámetros requeridos faltantes: ${missingParams.join(', ')}`,
                    code: "MISSING_URL_PARAMS",
                    missingParams: missingParams
                });
            }

            // Establecer cookie con configuración dinámica para mantener sesión
            const { token } = getTokenFromRequest(req);
            if (token) {
                const cookieConfig = getCookieConfig();
                res.cookie("authToken", token, cookieConfig);
            }

            next();

        } catch (error) {
            console.error('Error validando parámetros de URL:', error);
            return res.status(500).json({
                success: false,
                message: "Error interno validando parámetros",
                code: "URL_PARAMS_VALIDATION_ERROR"
            });
        }
    };
};

/**
 * Middleware para validar que un ID tiene formato válido
 * Implementa configuración de cookies cross-domain
 * @param {string} paramName - Nombre del parámetro a validar
 * @returns {Function} Middleware de Express
 */
export const validateIdFormat = (paramName) => {
    return (req, res, next) => {
        try {
            const id = req.params[paramName];

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: `Parámetro ${paramName} es requerido`,
                    code: "ID_REQUIRED"
                });
            }

            // Validar que no esté vacío y tenga un formato razonable
            if (typeof id !== 'string' || id.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: `Formato de ${paramName} inválido`,
                    code: "INVALID_ID_FORMAT"
                });
            }

            // Para IDs de MongoDB (ObjectId), validar formato hex de 24 caracteres
            if (paramName.includes('Id') && id.length === 24 && !/^[0-9a-fA-F]{24}$/.test(id)) {
                return res.status(400).json({
                    success: false,
                    message: `Formato de ${paramName} de MongoDB inválido`,
                    code: "INVALID_MONGODB_ID"
                });
            }

            // Establecer cookie con configuración dinámica para mantener sesión
            const { token } = getTokenFromRequest(req);
            if (token) {
                const cookieConfig = getCookieConfig();
                res.cookie("authToken", token, cookieConfig);
            }

            next();

        } catch (error) {
            console.error('Error validando formato de ID:', error);
            return res.status(500).json({
                success: false,
                message: "Error interno validando ID",
                code: "ID_VALIDATION_ERROR"
            });
        }
    };
};

// ============ MIDDLEWARE COMBINADO ============

/**
 * Middleware combinado para validaciones comunes del chat
 * Implementa configuración de cookies cross-domain
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 * @param {Function} next - Función next de Express
 */
export const chatCommonValidation = [
    requireAuth,
    validateUrlParams(['conversationId']),
    validateConversationExists,
    validateConversationAccess,
    validateConversationClient
];

/**
 * Middleware para rutas de administrador
 * Implementa configuración de cookies cross-domain
 */
export const adminChatValidation = [
    requireAuth,
    requireAdmin
];

/**
 * Middleware para rutas de cliente
 * Implementa configuración de cookies cross-domain
 */
export const customerChatValidation = [
    requireAuth,
    requireCustomer
];

// ============ EXPORTACIÓN POR DEFECTO ============

export default {
    // Autenticación
    requireAuth,
    requireAdmin,
    requireCustomer,
    
    // Conversaciones
    validateConversationExists,
    validateConversationAccess,
    validateConversationClient,
    
    // Mensajes
    validateMessageData,
    validatePagination,
    
    // Parámetros
    validateUrlParams,
    validateIdFormat,
    
    // Combinados
    chatCommonValidation,
    adminChatValidation,
    customerChatValidation,
    
    // Utilidades
    getCookieConfig,
    getTokenFromRequest
};