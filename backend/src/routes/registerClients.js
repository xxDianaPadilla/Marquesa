// Importar Express para crear el enrutador
import express from "express";
// Importar el controlador de registro de clientes
import registerClientsController from "../controllers/registerClientsController.js";

// Crear una instancia del enrutador de Express
const router = express.Router();

// Ruta para registro de nuevos clientes
// POST / - Registrar un nuevo cliente en el sistema
router.route("/").post(registerClientsController.register);

// Exportar el enrutador para ser usado en la aplicación principal
export default router;