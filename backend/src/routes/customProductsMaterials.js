// Importar la librería de Express para crear el enrutador
import express from "express";
// Importar el controlador de materiales de productos personalizados
import customProductsMaterialsController from "../controllers/customProductsMaterialsController.js";
// Importar la librería de multer para manejo de archivos
import multer from "multer";

// Crear una instancia del enrutador de Express
const router = express.Router();

// Configuración simple de multer para subida de imágenes de materiales
// Usa almacenamiento directo en carpeta local con configuración mínima
const upload = multer({ dest: "customProductsMaterials/" });

// Rutas principales CRUD para materiales de productos personalizados
router.route("/")
    .get(customProductsMaterialsController.getCustomProductsMaterials) // Obtener todos los materiales
    .post(upload.single("image"), customProductsMaterialsController.createCustomProductsMaterial); // Crear material con imagen

// Rutas específicas para un material por ID
router.route("/:id")
    .get(customProductsMaterialsController.getCustomProductsMaterialById) // Obtener material específico por ID
    .put(upload.single("image"), customProductsMaterialsController.updateCustomProductsMaterial) // Actualizar material con nueva imagen
    .delete(customProductsMaterialsController.deleteCustomProductsMaterial); // Eliminar material

// Exportar el enrutador para ser usado en la aplicación principal
export default router;