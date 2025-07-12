// Importar Express para crear el enrutador
import express from "express";
// Importar el controlador de restablecimiento de contraseña
import passwordResetController from "../controllers/passwordResetController.js";

// Crear una instancia del enrutador de Express
const router = express.Router();

// Ruta para solicitar código de recuperación de contraseña
// POST /request - Envía un código de recuperación al email del usuario
router.route("/request").post(passwordResetController.requestPasswordReset);

// Ruta para verificar código de recuperación
// POST /verify - Verifica si el código enviado es válido y no ha expirado
router.route("/verify").post(passwordResetController.verifyCode);

// Ruta para actualizar contraseña
// POST /update - Actualiza la contraseña del usuario después de verificar el código
router.route("/update").post(passwordResetController.updatePassword);

// Exportar el enrutador para ser usado en la aplicación principal
export default router;