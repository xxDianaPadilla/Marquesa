// Importar Express para crear el enrutador
import express from "express";
// Importar el controlador de clientes
import clientsController from "../controllers/clientsController.js";

// Crear una instancia del enrutador de Express
const router = express.Router();

// Ruta para obtener estadísticas de nuevos clientes
// GET /newClientsStats - Obtener métricas sobre registros de nuevos clientes
router.get("/newClientsStats", clientsController.getNewClientsStats);

// Ruta para obtener el total de clientes
// GET /total - Obtener el número total de clientes registrados
router.get("/total", clientsController.getTotalClients);

// Ruta adicional para estadísticas detalladas (si existe la función)
router.get("/detailedStats", (req, res) => {
    // Verificar si la función existe antes de llamarla
    if (typeof clientsController.getDetailedClientsStats === 'function') {
        return clientsController.getDetailedClientsStats(req, res);
    } else {
        // Si no existe, devolver estadísticas básicas
        return res.status(200).json({
            success: true,
            message: "Función de estadísticas detalladas no implementada",
            data: {}
        });
    }
});

// Exportar el enrutador para ser usado en la aplicación principal
export default router;