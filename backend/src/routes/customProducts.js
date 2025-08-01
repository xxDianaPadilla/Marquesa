// Importar Express para crear el enrutador
import express from "express";
// Importar el controlador de productos personalizados
import customProductsController from "../controllers/customProductsController.js";

// Crear una instancia del enrutador de Express
const router = express.Router();

// Rutas principales CRUD para productos personalizados
router.route("/")
    .get(customProductsController.getCustomProducts) // Obtener todos los productos personalizados
    .post(customProductsController.createCustomProducts); // Crear un nuevo producto personalizado

// Ruta para obtener productos personalizados de un cliente específico
router.route("/client/:clientId")
    .get(customProductsController.getCustomProductsByClient); // Obtener productos personalizados por cliente

// Rutas CRUD específicas para un producto personalizado por ID
// Importante: estas rutas van al final porque /:id es genérico
router.route("/:id")
    .get(customProductsController.getCustomProductsById) // Obtener producto personalizado específico por ID
    .delete(customProductsController.deleteCustomProducts) // Eliminar producto personalizado
    .put(customProductsController.updateCustomProduct); // Actualizar producto personalizado completo

// Exportar el enrutador para ser usado en la aplicación principal
export default router;