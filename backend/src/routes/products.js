import express from "express";
import productsController from "../controllers/productsController.js";
import multer from "multer";

const router = express.Router();

const upload = multer({
    dest: "products/",
    limits: {
        fileSize: 5 * 1024 * 1024, 
    },
    fileFilter: (req, file, cb) => {
        // Validar tipo de archivo
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos de imagen'), false);
        }
    }
});

router.route("/")
    .get(productsController.getProducts)
    .post(upload.array("images", 5), productsController.createProducts); 

router.route("/:id")
    .get(productsController.getProduct)
    .put(upload.array("images", 5), productsController.updateProducts)
    .delete(productsController.deleteProducts);

export default router;