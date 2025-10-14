// Importar Express para crear el enrutador
import express from "express";
import clientsController from "../controllers/clientsController.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';
import verifyToken, { verifyAdmin } from "../middlewares/validateAuthToken.js";

// Configuración de multer para imágenes de perfil
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, '..', 'uploads', 'profiles');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, 'profile-' + uniqueSuffix + extension);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB límite
    },
    fileFilter: (req, file, cb) => {
        // Validar tipo de archivo
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de archivo no permitido. Solo se aceptan JPG, PNG y WEBP'), false);
        }
    }
});

// Crear una instancia del enrutador de Express
const router = express.Router();

// ==================== RUTAS DE FAVORITOS CORREGIDAS ====================

// ✅ CORRECCIÓN CRÍTICA: Cambiar el orden de las rutas
// Las rutas más específicas deben ir ANTES que las rutas con parámetros

// Ruta para obtener favoritos del usuario - DEBE IR PRIMERA
router.get("/favorites", 
    verifyToken, 
    clientsController.getFavorites
);

// Ruta para agregar a favoritos - DEBE IR SEGUNDA
router.post("/favorites/add", 
    verifyToken, 
    clientsController.addToFavorites
);

// Ruta para remover de favoritos - DEBE IR TERCERA
router.delete("/favorites/remove", 
    verifyToken, 
    clientsController.removeFromFavorites
);

// Ruta para toggle favoritos - DEBE IR CUARTA
router.post("/favorites/toggle", 
    verifyToken, 
    clientsController.toggleFavorite
);

// ==================== RUTAS EXISTENTES ====================

// Ruta para actualizar perfil - requiere autenticación
router.put("/profile",
    verifyToken,
    upload.single('profilePicture'),
    clientsController.updateProfile
);

// Ruta para obtener estadísticas de nuevos clientes
router.get("/newClientsStats", clientsController.getNewClientsStats);

// Ruta para obtener el total de clientes
router.get("/total", clientsController.getTotalClients);

// Ruta para estadísticas detalladas
router.get("/detailedStats", clientsController.getDetailedClientsStats);

// ==================== RUTAS PARA CONTROL DE RULETA (NUEVAS) ====================

// ✅ NUEVA: Obtener estado de la ruleta (público, sin autenticación)
router.get("/ruleta/status", 
    clientsController.getRuletaStatus
);

// ✅ NUEVA: Activar/Desactivar ruleta (solo admin)
router.put("/ruleta/toggle", 
    verifyAdmin, // Solo administradores pueden cambiar el estado
    clientsController.toggleRuletaStatus
);

// ==================== RUTAS PARA CÓDIGOS DE RULETA ====================

// Ruta para generar un nuevo código de descuento desde la ruleta
router.post("/ruleta/generate", 
    verifyToken, 
    clientsController.generateRuletaCode
);

// Ruta para obtener todos los códigos de descuento del usuario
router.get("/ruleta/codes", 
    verifyToken, 
    clientsController.getUserRuletaCodes
);

// Ruta para validar un código de descuento específico
router.get("/ruleta/validate/:code", 
    verifyToken, 
    clientsController.validateRuletaCode
);

// Ruta para marcar un código como utilizado
router.put("/ruleta/use", 
    verifyToken, 
    clientsController.useRuletaCode
);

// ==================== RUTAS CON PARÁMETROS (VAN AL FINAL) ====================

router.route("/:clientId/validateCode")
    .post(clientsController.validatePromotionalCode);

router.route("/:clientId/useCode")
    .put(clientsController.usePromotionalCode);

router.route("/:clientId/promotionalCodes")
    .get(clientsController.getClientPromotionalCodes);

// Manejo de errores de multer
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: "Archivo demasiado grande. Máximo 5MB permitidos"
            });
        }
        return res.status(400).json({
            success: false,
            message: "Error al subir archivo: " + error.message
        });
    }
    next(error);
});

export default router;