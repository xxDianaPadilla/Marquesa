import express from "express";
import salesController from "../controllers/salesController.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';

import verifyToken, { verifyAdmin } from "../middlewares/validateAuthToken.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, '..', 'uploads');
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
        cb(null, file.fieldname + '-' + uniqueSuffix + extension);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos de imagen (JPG, PNG, JPEG, WEBP) o PDF'), false);
        }
    }
});

router.get("/soldProductsStats", salesController.getSoldProductsStats);

router.get("/total", salesController.getTotalSales);

router.get("/dashboardStats", salesController.getDashboardStats);

router.get("/detailed", verifyAdmin, salesController.getSalesDetailed);

router.get("/user/:userId/stats", salesController.getUserOrderStats);
router.get("/user/:userId/orders", salesController.getUserOrders);

router.get("/paymentStatus/:status", salesController.getSalesByPaymentStatus);

router.get("/trackingStatus/:trackingStatus", salesController.getSalesByTrackingStatus);

router.get("/:saleId/details", salesController.getOrderDetails);

router.put("/:saleId/cancel", salesController.cancelOrder);

router.get("/:saleId/cancellationEligibility", salesController.checkCancellationEligibility);

router.patch("/:id/paymentStatus", salesController.updatePaymentStatus);

router.patch("/:id/trackingStatus", salesController.updateTrackingStatus);

router.patch("/:id/paymentProof", upload.single('paymentProofImage'), salesController.updatePaymentProof);

router.route("/:id")
    .get(salesController.getSaleById)
    .put(upload.single('paymentProofImage'), salesController.updateSale)
    .delete(salesController.deleteSale);

router.route("/")
    .get(salesController.getSales)
    .post(upload.single('paymentProofImage'), salesController.createSale);

export default router;