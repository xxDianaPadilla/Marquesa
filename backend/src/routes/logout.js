// Importación del framework Express para crear el router
import express from "express";
// Importación del controlador que maneja la lógica de cierre de sesión
import logoutController from "../controllers/logoutController.js";

// Creación de una instancia del router de Express
const router = express.Router();

// Definición de la ruta para cerrar sesión de usuarios
// POST / - Endpoint para procesar solicitudes de logout
// Utiliza el método POST por seguridad (evita logout accidental por GET)
router.route("/").post(logoutController.logout);

// Exportación del router para ser usado en la aplicación principal
export default router;