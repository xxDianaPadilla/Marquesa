// importamos la lib de express
import express from "express";
// importamos el controlador
import categoriesController from "../controllers/categoriesController.js";
//importamos la lib de multer
import multer from "multer";

// Creamos el router
const router = express.Router();

// Configurar carpeta local temporal para subir imágenes
const upload = multer({dest: "categories/"});

// Rutas
router.route("/")
    .get(categoriesController.getCategories)
    .post(upload.single("image"), categoriesController.createCategories);

router.route("/:id")
    .get(categoriesController.getCategoryById)
    .put(upload.single("image"), categoriesController.updateCategories)
    .delete(categoriesController.deleteCategories);

export default router;