// Importar Express para crear el enrutador
import express from "express";
// Importar multer para manejo de archivos
import multer from "multer";
// Importar fs y path para manejo de carpetas
import fs from "fs";
import path from "path";
// Importar el controlador de productos personalizados
import customProductsController from "../controllers/customProductsController.js";

// Función para asegurar que la carpeta existe
const ensureDirectoryExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`Carpeta creada: ${dirPath}`);
    }
};

// Configuración de multer para manejar la subida de archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = 'uploads/temp';
        // Asegurar que la carpeta existe antes de usarla
        ensureDirectoryExists(uploadPath);
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Generar nombre único para el archivo
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB límite
    },
    fileFilter: function (req, file, cb) {
        // Verificar que sea una imagen
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos de imagen'), false);
        }
    }
});

// Crear una instancia del enrutador de Express
const router = express.Router();

// Middleware para manejar errores de multer
const handleMulterError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'El archivo es demasiado grande. Máximo 5MB permitidos.'
            });
        }
    }
    if (error.message === 'Solo se permiten archivos de imagen') {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
    next(error);
};

// Rutas principales CRUD para productos personalizados
router.route("/")
    .get(customProductsController.getCustomProducts) // Obtener todos los productos personalizados
    // RUTA ACTUALIZADA: Crear producto personalizado con imagen
    .post(
        upload.single('referenceImage'), 
        handleMulterError, 
        customProductsController.createCustomProducts
    ); // Crear un nuevo producto personalizado

// Ruta para obtener productos personalizados de un cliente específico
router.route("/client/:clientId")
    .get(customProductsController.getCustomProductsByClient); // Obtener productos personalizados por cliente

// Rutas CRUD específicas para un producto personalizado por ID
router.route("/:id")
    .get(customProductsController.getCustomProductsById) // Obtener producto personalizado específico por ID
    .delete(customProductsController.deleteCustomProducts) // Eliminar producto personalizado

// Exportar el enrutador para ser usado en la aplicación principal
export default router;