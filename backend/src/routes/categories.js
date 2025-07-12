// Importar la librería de Express para crear el enrutador
import express from "express";
// Importar el controlador de categorías
import categoriesController from "../controllers/categoriesController.js";
// Importar la librería de multer para manejo de archivos
import multer from "multer";

// Crear una instancia del enrutador de Express
const router = express.Router();

// Configuración simple de multer para subida de imágenes de categorías
// Usa almacenamiento directo en carpeta local con configuración mínima
const upload = multer({dest: "categories/"});

// Rutas principales CRUD para categorías
router.route("/")
    .get(categoriesController.getCategories) // Obtener todas las categorías
    .post(upload.single("image"), categoriesController.createCategories); // Crear categoría con imagen

// Rutas específicas para una categoría por ID
router.route("/:id")
    .get(categoriesController.getCategoryById) // Obtener categoría específica por ID
    .put(upload.single("image"), categoriesController.updateCategories) // Actualizar categoría con nueva imagen
    .delete(categoriesController.deleteCategories); // Eliminar categoría

// Exportar el enrutador para ser usado en la aplicación principal
export default router;