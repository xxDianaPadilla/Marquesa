import express from "express";
import salesController from "../controllers/salesController.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';

const router = express.Router();

// Obtenemos el directorio actual en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Creamos la carpeta uploads si no existe
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + extension);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: function (req, file, cb) {
        // Aceptamos solo imágenes
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos de imagen (JPG, PNG, JPEG)'), false);
        }
    }
});

router.route("/sold-products-stats")
    .get(salesController.getSoldProductsStats);

router.route("/total")
    .get(salesController.getTotalSales);

router.route("/dashboard-stats")
    .get(salesController.getDashboardStats);

router.route("/payment-status/:status")
    .get(salesController.getSalesByPaymentStatus);

router.route("/tracking-status/:trackingStatus")
    .get(salesController.getSalesByTrackingStatus);

router.route("/detailed")
    .get(salesController.getSalesDetailed);

router.route("/:id/tracking")
    .put(salesController.updateTrackingStatus);

router.route("/status/:status")
    .get(salesController.getSalesByStatus);

router.route("/date-range")
    .get(salesController.getSalesByDateRange);

router.route("/search")
    .get(salesController.searchSales);

router.route("/stats")
    .get(salesController.getSalesStats);

router.route("/:id/payment-status")
    .patch(salesController.updatePaymentStatus);

router.route("/:id/tracking-status")
    .patch(salesController.updateTrackingStatus);

router.route("/:id/payment-proof")
    .patch(upload.single('paymentProofImage'), salesController.updatePaymentProof);

router.route("/:id")
    .get(salesController.getSaleById)
    .put(upload.single('paymentProofImage'), salesController.updateSale)
    .delete(salesController.deleteSale);

router.route("/")
    .get(salesController.getSales)
    .post(upload.single('paymentProofImage'), salesController.createSale);

export default router;