// Importar Express para crear el enrutador
import express from "express";
// Importar el controlador de ventas
import salesController from "../controllers/salesController.js";
// Importar multer para manejo de archivos
import multer from "multer";
// Importar path para manejo de rutas de archivos
import path from "path";
// Importar fs para operaciones del sistema de archivos
import fs from "fs";
// Importar fileURLToPath para obtener la ruta del archivo actual en ES modules
import { fileURLToPath } from 'url';

// Crear una instancia del enrutador de Express
const router = express.Router();

// Obtenemos el directorio actual en ES modules (necesario porque __dirname no existe en ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Definir la ruta del directorio de uploads
const uploadsDir = path.join(__dirname, '..', 'uploads');
// Crear la carpeta uploads si no existe (con opción recursive para crear subdirectorios)
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuración de almacenamiento de multer para subida de archivos
const storage = multer.diskStorage({
    // Definir el directorio de destino para los archivos subidos
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    // Definir el nombre del archivo con timestamp y número random para evitar colisiones
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + extension);
    }
});

// Configuración principal de multer
const upload = multer({
    storage: storage,
    // Límite de tamaño de archivo: 10MB
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
    // Filtro para aceptar archivos de imagen y PDF
    fileFilter: function (req, file, cb) {
        // Aceptamos archivos que empiecen con 'image/' en su mimetype o PDF
        if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos de imagen (JPG, PNG, JPEG, WEBP) o PDF'), false);
        }
    }
});

// ===== RUTAS ESPECÍFICAS PRIMERO (para evitar conflictos con :id) =====

// Ruta para obtener estadísticas de productos vendidos
router.get("/soldProductsStats", salesController.getSoldProductsStats);

// Ruta para obtener el total de ventas
router.get("/total", salesController.getTotalSales);

// Ruta para obtener estadísticas del dashboard
router.get("/dashboardStats", salesController.getDashboardStats);

// Ruta para obtener ventas con información detallada
router.get("/detailed", salesController.getSalesDetailed);

// Ruta para obtener ventas por estado de pago específico
router.get("/paymentStatus/:status", salesController.getSalesByPaymentStatus);

// Ruta para obtener ventas por estado de seguimiento/tracking específico
router.get("/trackingStatus/:trackingStatus", salesController.getSalesByTrackingStatus);

// ===== RUTAS CON PARÁMETROS :id =====

// Ruta para actualizar solo el estado de pago de una venta
router.patch("/:id/paymentStatus", salesController.updatePaymentStatus);

// Ruta para actualizar solo el estado de seguimiento de una venta
router.patch("/:id/trackingStatus", salesController.updateTrackingStatus);

// Ruta para actualizar el comprobante de pago (con subida de imagen)
router.patch("/:id/paymentProof", upload.single('paymentProofImage'), salesController.updatePaymentProof);

// Rutas para operaciones específicas de una venta por ID
router.route("/:id")
    .get(salesController.getSaleById) // Obtener una venta específica por ID
    .put(upload.single('paymentProofImage'), salesController.updateSale) // Actualizar una venta completa
    .delete(salesController.deleteSale); // Eliminar una venta específica

// ===== RUTAS GENERALES =====

// Rutas para operaciones generales de ventas
router.route("/")
    .get(salesController.getSales) // Obtener todas las ventas
    .post(upload.single('paymentProofImage'), salesController.createSale); // Crear una nueva venta

// Exportar el enrutador para ser usado en la aplicación principal
export default router;