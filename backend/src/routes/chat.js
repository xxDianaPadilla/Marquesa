import express from 'express';
import chatController, { upload } from '../controllers/chatController.js';
import verifyToken, { verifyAdmin, verifyCustomer } from '../middlewares/validateAuthToken.js';

/**
 * Rutas del Chat - CORREGIDAS PARA PRIMER MENSAJE DE NUEVOS USUARIOS
 * 
 * CAMBIOS IMPLEMENTADOS:
 * - Middleware permisivo para primer mensaje sin conversación previa
 * - Validación especial para nuevos usuarios en ruta de envío de mensajes
 * - Mantenidas todas las 11 rutas existentes según informe
 * - Headers CORS mejorados para cross-domain
 * - Solo imágenes permitidas en rutas de archivos
 * 
 * Ubicación: backend/src/routes/chat.js
 */

const router = express.Router();

// ============ RUTAS PRINCIPALES DEL CHAT (5 rutas básicas) ============

/**
 * ✅ RUTA 1/11: POST /api/chat/message - CORREGIDA PARA NUEVOS USUARIOS
 * Enviar un nuevo mensaje (con archivo opcional)
 * CRÍTICA: Permite crear conversación automáticamente para nuevos usuarios
 */
router.post('/message', 
    verifyToken,
    upload.single('file'),
    // ✅ VALIDACIÓN ESPECIAL: Permitir envío sin conversationId para nuevos usuarios
    (req, res, next) => {
        const { conversationId, message } = req.body;
        const file = req.file;
        
        console.log('📤 Ruta /message recibida:', {
            hasConversationId: !!conversationId,
            hasMessage: !!message?.trim(),
            hasFile: !!file,
            userType: req.user?.userType,
            userId: req.user?.id
        });
        
        // ✅ PERMITIR ENVÍO SIN CONVERSACIÓN PARA CLIENTES (primer mensaje)
        if (!conversationId && req.user.userType === 'Customer') {
            console.log('✨ Nuevo cliente enviando primer mensaje sin conversación');
            
            // Validar que hay contenido
            const hasMessage = message && message.trim();
            const hasFile = file && file.path;
            
            if (!hasMessage && !hasFile) {
                return res.status(400).json({
                    success: false,
                    message: "Debes enviar un mensaje de texto o un archivo",
                    code: "MESSAGE_CONTENT_REQUIRED"
                });
            }
            
            // ✅ PERMITIR CONTINUAR sin conversationId - se creará automáticamente
            console.log('✅ Primer mensaje validado, continuando al controlador');
            next();
        } else if (!conversationId && req.user.userType === 'admin') {
            // Para admins, sí requerir conversationId
            return res.status(400).json({
                success: false,
                message: "ID de conversación es requerido para administradores",
                code: "CONVERSATION_ID_REQUIRED"
            });
        } else {
            // ✅ VALIDACIÓN NORMAL para mensajes con conversación existente
            console.log('✅ Mensaje con conversación existente, continuando');
            next();
        }
    },
    chatController.sendMessage
);

/**
 * ✅ RUTA 2/11: GET /api/chat/conversation/:clientId
 * Obtener o crear conversación para un cliente
 */
router.get('/conversation/:clientId', 
    verifyToken,
    chatController.getOrCreateConversation
);

/**
 * ✅ RUTA 3/11: GET /api/chat/messages/:conversationId
 * Obtener mensajes de una conversación (solo mensajes físicamente existentes)
 */
router.get('/messages/:conversationId', 
    verifyToken,
    chatController.getMessages
);

/**
 * ✅ RUTA 4/11: DELETE /api/chat/message/:messageId
 * Eliminar un mensaje específico (ELIMINACIÓN FÍSICA + limpieza de archivos)
 */
router.delete('/message/:messageId', 
    verifyToken,
    chatController.deleteMessage
);

/**
 * ✅ RUTA 5/11: PUT /api/chat/read/:conversationId
 * Marcar mensajes como leídos
 */
router.put('/read/:conversationId', 
    verifyToken,
    chatController.markAsRead
);

// ============ RUTAS DE ADMINISTRADOR BÁSICAS (3 rutas) ============

/**
 * ✅ RUTA 6/11: GET /api/chat/admin/conversations
 * Obtener todas las conversaciones (solo admin)
 */
router.get('/admin/conversations', 
    verifyAdmin,
    chatController.getAllConversations
);

/**
 * ✅ RUTA 7/11: GET /api/chat/admin/stats
 * Obtener estadísticas generales del chat (solo admin)
 */
router.get('/admin/stats', 
    verifyAdmin,
    chatController.getChatStats
);

/**
 * ✅ RUTA 8/11: POST /api/chat/admin/cleanup
 * Ejecutar limpieza general del sistema (ACTUALIZADA con eliminación física)
 */
router.post('/admin/cleanup', 
    verifyAdmin,
    chatController.scheduledCleanup
);

// ============ RUTAS CRÍTICAS DE ALMACENAMIENTO (3 rutas) ============

/**
 * ✅ RUTA 9/11: GET /api/chat/admin/storageStats
 * Obtener estadísticas de almacenamiento y uso de archivos multimedia
 */
router.get('/admin/storageStats',
    verifyAdmin,
    async (req, res) => {
        try {
            // Importar utilidades de manera dinámica para evitar dependencias circulares
            const { getStorageStats } = await import('../utils/chatUtils.js');
            
            const stats = await getStorageStats();
            
            res.status(200).json({
                success: true,
                storageStats: stats,
                timestamp: new Date()
            });
            
        } catch (error) {
            console.error('Error obteniendo estadísticas de storage:', error);
            res.status(500).json({
                success: false,
                message: "Error obteniendo estadísticas de almacenamiento",
                error: error.message
            });
        }
    }
);

/**
 * ✅ RUTA 10/11: POST /api/chat/admin/cleanup-files
 * Limpiar archivos huérfanos en Cloudinary
 * ÚTIL para: Eliminar archivos que ya no están referenciados en la BD
 */
router.post('/admin/cleanupFiles',
    verifyAdmin,
    async (req, res) => {
        try {
            const { cleanupOrphanedFiles } = await import('../utils/chatUtils.js');
            
            const result = await cleanupOrphanedFiles();
            
            res.status(200).json({
                success: true,
                message: "Limpieza de archivos completada exitosamente",
                result: result,
                timestamp: new Date()
            });
            
        } catch (error) {
            console.error('Error en limpieza de archivos:', error);
            res.status(500).json({
                success: false,
                message: "Error en la limpieza de archivos",
                error: error.message
            });
        }
    }
);

/**
 * ✅ RUTA 11/11: GET /api/chat/admin/system-integrity
 * Validar la integridad del sistema de chat
 * ÚTIL para: Detectar problemas como archivos rotos, conversaciones huérfanas, etc.
 */
router.get('/admin/systemIntegrity',
    verifyAdmin,
    async (req, res) => {
        try {
            const { validateSystemIntegrity } = await import('../utils/chatUtils.js');
            
            const integrity = await validateSystemIntegrity();
            
            const statusCode = integrity.status === 'healthy' ? 200 : 207; // 207 = Multi-Status
            
            res.status(statusCode).json({
                success: true,
                integrity: integrity,
                recommendations: generateRecommendations(integrity.issues)
            });
            
        } catch (error) {
            console.error('Error validando integridad:', error);
            res.status(500).json({
                success: false,
                message: "Error validando integridad del sistema",
                error: error.message
            });
        }
    }
);

// ============ MIDDLEWARE DE OPTIONS PARA CORS ============

/**
 * ✅ NUEVO: Manejo específico de OPTIONS para todas las rutas de chat
 */
router.options('*', (req, res) => {
    console.log('🔧 Petición OPTIONS recibida para chat:', req.path);
    
    res.header('Access-Control-Allow-Origin', 'https://marquesa.vercel.app');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization');
    res.header('Access-Control-Max-Age', '86400'); // 24 horas
    
    res.status(200).end();
});

// ============ MIDDLEWARE DE LOGGING PARA DEBUG ============

/**
 * ✅ NUEVO: Logging específico para rutas de chat
 */
router.use((req, res, next) => {
    console.log(`🗨️ Chat Route: ${req.method} ${req.originalUrl}`, {
        userType: req.user?.userType,
        userId: req.user?.id,
        hasFile: !!req.file,
        bodyKeys: Object.keys(req.body || {}),
        origin: req.headers.origin
    });
    next();
});

// ============ FUNCIONES AUXILIARES ============

/**
 * Genera recomendaciones basadas en los problemas encontrados
 */
function generateRecommendations(issues) {
    const recommendations = [];
    
    for (const issue of issues) {
        switch (issue.type) {
            case 'conversations_without_messages':
                recommendations.push({
                    issue: issue.type,
                    action: "Ejecutar limpieza general para eliminar conversaciones vacías",
                    endpoint: "POST /api/chat/admin/cleanup",
                    priority: "low"
                });
                break;
                
            case 'broken_media_links':
                recommendations.push({
                    issue: issue.type,
                    action: "Ejecutar limpieza de archivos huérfanos",
                    endpoint: "POST /api/chat/admin/cleanup-files",
                    priority: "medium"
                });
                break;
                
            case 'orphaned_conversations':
                recommendations.push({
                    issue: issue.type,
                    action: "Ejecutar limpieza general para eliminar conversaciones huérfanas",
                    endpoint: "POST /api/chat/admin/cleanup",
                    priority: "medium"
                });
                break;
                
            case 'conversations_over_limit':
                recommendations.push({
                    issue: issue.type,
                    action: "Los límites se aplican automáticamente en cada mensaje",
                    endpoint: "Automático al enviar mensajes",
                    priority: "info"
                });
                break;
                
            default:
                recommendations.push({
                    issue: issue.type,
                    action: "Revisar manualmente este problema",
                    endpoint: "N/A",
                    priority: "medium"
                });
        }
    }
    
    return recommendations;
}

// ============ MANEJO DE ERRORES MEJORADO ============

/**
 * Middleware para manejar rutas no encontradas
 */
router.use('*', (req, res) => {
    // ✅ CONFIGURAR HEADERS CORS PARA ERRORES 404 TAMBIÉN
    res.header('Access-Control-Allow-Origin', 'https://marquesa.vercel.app');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    res.status(404).json({
        success: false,
        message: `Ruta ${req.method} ${req.originalUrl} no encontrada`,
        availableRoutes: [
            // Rutas principales (5)
            'POST /message',
            'GET /conversation/:clientId',
            'GET /messages/:conversationId',
            'DELETE /message/:messageId',
            'PUT /read/:conversationId',
            
            // Rutas de admin básicas (3)
            'GET /admin/conversations',
            'GET /admin/stats',
            'POST /admin/cleanup',
            
            // Rutas críticas (3)
            'GET /admin/storageStats',
            'POST /admin/cleanupFiles',
            'GET /admin/systemIntegrity'
        ]
    });
});

/**
 * ✅ MEJORADO: Middleware para manejar errores con CORS
 */
router.use((error, req, res, next) => {
    console.error('❌ Error en rutas de chat:', error);

    // ✅ CONFIGURAR HEADERS CORS PARA ERRORES TAMBIÉN
    res.header('Access-Control-Allow-Origin', 'https://marquesa.vercel.app');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization');

    // Error de Multer (archivos) - ACTUALIZADO PARA SOLO IMÁGENES
    if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            success: false,
            message: "El archivo es demasiado grande (máximo 10MB)",
            code: 'FILE_TOO_LARGE'
        });
    }

    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
            success: false,
            message: "Solo se permiten archivos de imagen (JPG, PNG, GIF, WebP)",
            code: 'FILE_TYPE_NOT_ALLOWED'
        });
    }

    if (error.message && error.message.includes('Solo se permiten archivos de imagen')) {
        return res.status(400).json({
            success: false,
            message: error.message,
            code: 'INVALID_FILE_TYPE'
        });
    }

    // ✅ NUEVO: Error específico para primer mensaje sin conversación
    if (error.message && error.message.includes('Conversación no encontrada') && req.user?.userType === 'Customer') {
        return res.status(400).json({
            success: false,
            message: "Error al crear nueva conversación para primer mensaje",
            code: 'CONVERSATION_CREATION_ERROR'
        });
    }

    // Error de autenticación
    if (error.message?.includes('Token') || error.message?.includes('autenticación')) {
        return res.status(401).json({
            success: false,
            message: "Error de autenticación: " + error.message,
            code: 'AUTH_ERROR'
        });
    }

    // Error de Cloudinary
    if (error.message?.includes('Cloudinary')) {
        return res.status(503).json({
            success: false,
            message: "Error en el servicio de almacenamiento de archivos",
            code: 'STORAGE_ERROR'
        });
    }

    // Error de base de datos
    if (error.name === 'MongoError' || error.name === 'ValidationError') {
        return res.status(500).json({
            success: false,
            message: "Error en la base de datos",
            code: 'DATABASE_ERROR'
        });
    }

    // Error genérico
    res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        code: 'INTERNAL_SERVER_ERROR',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
});

export default router;