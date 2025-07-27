import express from "express";
import productsController from "../controllers/productsController.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// Crear directorio si no existe
const uploadDir = "products/";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración corregida de multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generar nombre único para evitar conflictos
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, 'product-' + uniqueSuffix + extension);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB por archivo
        files: 5 // Máximo 5 archivos
    },
    fileFilter: (req, file, cb) => {
        console.log('Procesando archivo:', file.originalname, 'Tipo:', file.mimetype);
        
        // Validar tipo de archivo
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos de imagen'), false);
        }
    }
});

// Nueva ruta para obtener productos por categoría
router.get('/by-category/:categoryId', productsController.getProductsByCategory);

router.route("/")
    .get(productsController.getProducts)
    .post(upload.array("images", 5), productsController.createProducts); 

router.route("/:id")
    .get(productsController.getProduct)
    .put(upload.array("images", 5), productsController.updateProducts)
    .delete(productsController.deleteProducts);

export default router;