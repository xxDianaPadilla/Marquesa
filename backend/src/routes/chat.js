import express from 'express';
import chatController, { upload } from '../controllers/chatController.js';
import verifyToken, { verifyAdmin, verifyCustomer } from '../middlewares/validateAuthToken.js';

/**
 * Rutas del Chat - ACTUALIZADAS SEGÚN INFORME
 * 
 * CAMBIOS IMPLEMENTADOS:
 * - 11 rutas mantenidas (eliminadas 3 innecesarias)
 * - Rutas críticas de almacenamiento y validación mantenidas
 * - Solo imágenes permitidas en rutas de archivos
 * - Eliminación física en todas las operaciones
 * 
 * Ubicación: backend/src/routes/chat.js
 */

const router = express.Router();

// ============ RUTAS PRINCIPALES DEL CHAT (5 rutas básicas) ============

/**
 * ✅ RUTA 1/11: POST /api/chat/message
 * Enviar un nuevo mensaje (con archivo opcional)
 * AHORA CON: Eliminación física automática + solo imágenes
 */
router.post('/message', 
    verifyToken,
    upload.single('file'),
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

// ============ RUTAS ELIMINADAS SEGÚN INFORME ============
// ❌ /admin/conversation/:id/stats - Eliminada (no solicitada por cliente)
// ❌ /admin/conversation/:id/force-limit - Eliminada (límite automático suficiente)  
// ❌ /admin/cleanup-preview - Eliminada (no solicitada preview)

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

// ============ MANEJO DE ERRORES ============

/**
 * Middleware para manejar rutas no encontradas
 */
router.use('*', (req, res) => {
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
 * Middleware para manejar errores en las rutas
 */
router.use((error, req, res, next) => {
    console.error('Error en rutas de chat:', error);

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