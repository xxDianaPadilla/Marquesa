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
    // Límite de tamaño de archivo: 5MB
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    // Filtro para aceptar solo archivos de imagen
    fileFilter: function (req, file, cb) {
        // Aceptamos solo archivos que empiecen con 'image/' en su mimetype
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos de imagen (JPG, PNG, JPEG)'), false);
        }
    }
});

// Ruta para obtener estadísticas de productos vendidos
router.route("/soldProductsStats")
    .get(salesController.getSoldProductsStats);

// Ruta para obtener el total de ventas
router.route("/total")
    .get(salesController.getTotalSales);

// Ruta para obtener estadísticas del dashboard
router.route("/dashboardStats")
    .get(salesController.getDashboardStats);

// Ruta para obtener ventas por estado de pago específico
router.route("/paymentStatus/:status")
    .get(salesController.getSalesByPaymentStatus);

// Ruta para obtener ventas por estado de seguimiento/tracking específico
router.route("/trackingStatus/:trackingStatus")
    .get(salesController.getSalesByTrackingStatus);

// Ruta para obtener ventas con información detallada
router.route("/detailed")
    .get(salesController.getSalesDetailed);

// Ruta para actualizar el estado de seguimiento de una venta específica
router.route("/:id/tracking")
    .put(salesController.updateTrackingStatus);

// Ruta para obtener ventas por estado general
router.route("/status/:status")
    .get(salesController.getSalesByStatus);

// Ruta para obtener ventas dentro de un rango de fechas
router.route("/dateRange")
    .get(salesController.getSalesByDateRange);

// Ruta para buscar ventas con parámetros de búsqueda
router.route("/search")
    .get(salesController.searchSales);

// Ruta para obtener estadísticas generales de ventas
router.route("/stats")
    .get(salesController.getSalesStats);

// Ruta para actualizar solo el estado de pago de una venta
router.route("/:id/paymentStatus")
    .patch(salesController.updatePaymentStatus);

// Ruta para actualizar solo el estado de seguimiento de una venta
router.route("/:id/trackingStatus")
    .patch(salesController.updateTrackingStatus);

// Ruta para actualizar el comprobante de pago (con subida de imagen)
router.route("/:id/paymentProof")
    .patch(upload.single('paymentProofImage'), salesController.updatePaymentProof);

// Rutas para operaciones específicas de una venta por ID
router.route("/:id")
    .get(salesController.getSaleById) // Obtener una venta específica por ID
    .put(upload.single('paymentProofImage'), salesController.updateSale) // Actualizar una venta completa
    .delete(salesController.deleteSale); // Eliminar una venta específica

// Rutas para operaciones generales de ventas
router.route("/")
    .get(salesController.getSales) // Obtener todas las ventas
    .post(upload.single('paymentProofImage'), salesController.createSale); // Crear una nueva venta

// Exportar el enrutador para ser usado en la aplicación principal
export default router;