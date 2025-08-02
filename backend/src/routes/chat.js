import express from 'express';
import chatController, { upload } from '../controllers/chatController.js';
import verifyToken, { verifyAdmin, verifyCustomer } from '../middlewares/validateAuthToken.js';

/**
 * Rutas del Chat - CORREGIDAS CON MIDDLEWARE DE AUTENTICACIÓN
 * 
 * PROBLEMAS SOLUCIONADOS:
 * - Agregado middleware verifyToken para autenticación básica
 * - Agregado verifyAdmin para rutas administrativas
 * - Agregado verifyCustomer para rutas de cliente específicas
 * - Corregido orden de middlewares para evitar errores 401
 * 
 * Ubicación: backend/src/routes/chat.js
 */

const router = express.Router();

// ============ RUTAS PRINCIPALES DEL CHAT (Requieren autenticación básica) ============

/**
 * POST /api/chat/message
 * Enviar un nuevo mensaje (con archivo opcional)
 * MIDDLEWARE: verifyToken (autenticación básica)
 */
router.post('/message', 
    verifyToken,           // ✅ Agregado: Verificación de autenticación
    upload.single('file'), // Manejo de archivos
    chatController.sendMessage
);

/**
 * GET /api/chat/conversation/:clientId
 * Obtener o crear conversación para un cliente
 * MIDDLEWARE: verifyToken (autenticación básica)
 */
router.get('/conversation/:clientId', 
    verifyToken,           // ✅ Agregado: Verificación de autenticación
    chatController.getOrCreateConversation
);

/**
 * GET /api/chat/messages/:conversationId
 * Obtener mensajes de una conversación
 * MIDDLEWARE: verifyToken (autenticación básica)
 */
router.get('/messages/:conversationId', 
    verifyToken,           // ✅ Agregado: Verificación de autenticación
    chatController.getMessages
);

/**
 * DELETE /api/chat/message/:messageId
 * Eliminar un mensaje específico
 * MIDDLEWARE: verifyToken (autenticación básica)
 */
router.delete('/message/:messageId', 
    verifyToken,           // ✅ Agregado: Verificación de autenticación
    chatController.deleteMessage
);

/**
 * PUT /api/chat/read/:conversationId
 * Marcar mensajes como leídos
 * MIDDLEWARE: verifyToken (autenticación básica)
 */
router.put('/read/:conversationId', 
    verifyToken,           // ✅ Agregado: Verificación de autenticación
    chatController.markAsRead
);

// ============ RUTAS DE ADMINISTRADOR (Requieren permisos de admin) ============

/**
 * GET /api/chat/admin/conversations
 * Obtener todas las conversaciones (solo admin)
 * MIDDLEWARE: verifyAdmin (verificación de admin + autenticación)
 */
router.get('/admin/conversations', 
    verifyAdmin,           // ✅ Cambiado: De requireAdmin a verifyAdmin
    chatController.getAllConversations
);

/**
 * GET /api/chat/admin/stats
 * Obtener estadísticas del chat (solo admin)
 * MIDDLEWARE: verifyAdmin (verificación de admin + autenticación)
 */
router.get('/admin/stats', 
    verifyAdmin,           // ✅ Cambiado: De requireAdmin a verifyAdmin
    chatController.getChatStats
);

/**
 * POST /api/chat/admin/cleanup
 * Ejecutar limpieza manual del sistema (solo admin)
 * MIDDLEWARE: verifyAdmin (verificación de admin + autenticación)
 */
router.post('/admin/cleanup', 
    verifyAdmin,           // ✅ Cambiado: De requireAdmin a verifyAdmin
    chatController.scheduledCleanup
);

// ============ RUTAS ESPECÍFICAS DE CLIENTE (Si las necesitas) ============

/**
 * Ejemplo de ruta específica para clientes
 * GET /api/chat/client/my-conversation
 * MIDDLEWARE: verifyCustomer (verificación de cliente + autenticación)
 */
router.get('/client/my-conversation', 
    verifyCustomer,        // Middleware específico para clientes
    (req, res) => {
        // Lógica específica para clientes
        res.json({
            success: true,
            message: "Ruta específica para clientes",
            clientId: req.user.id
        });
    }
);

// ============ MANEJO DE ERRORES ============

/**
 * Middleware para manejar rutas no encontradas
 */
router.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Ruta ${req.method} ${req.originalUrl} no encontrada`,
        availableRoutes: [
            'POST /message',
            'GET /conversation/:clientId',
            'GET /messages/:conversationId',
            'DELETE /message/:messageId',
            'PUT /read/:conversationId',
            'GET /admin/conversations',
            'GET /admin/stats',
            'POST /admin/cleanup',
            'GET /client/my-conversation'
        ]
    });
});

/**
 * Middleware para manejar errores en las rutas
 */
router.use((error, req, res, next) => {
    console.error('Error en rutas de chat:', error);

    // Error de Multer (archivos)
    if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            success: false,
            message: "El archivo es demasiado grande (máximo 10MB)"
        });
    }

    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
            success: false,
            message: "Tipo de archivo no permitido"
        });
    }

    // Error de autenticación
    if (error.message?.includes('Token') || error.message?.includes('autenticación')) {
        return res.status(401).json({
            success: false,
            message: "Error de autenticación: " + error.message
        });
    }

    // Error genérico
    res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
});

export default router;