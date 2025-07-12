// Importar Express para crear el enrutador
import express from "express";
// Importar el controlador de clientes
import clientsController from "../controllers/clientsController.js";

// Crear una instancia del enrutador de Express
const router = express.Router();

// Ruta para obtener estadísticas de nuevos clientes
// GET /newClientsStats - Obtener métricas sobre registros de nuevos clientes
router.route("/newClientsStats")
.get(clientsController.getNewClientsStats);

// Ruta para obtener el total de clientes
// GET /total - Obtener el número total de clientes registrados
router.route("/total")
.get(clientsController.getTotalClients);

// Exportar el enrutador para ser usado en la aplicación principal
export default router;