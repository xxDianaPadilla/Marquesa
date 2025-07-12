// Importar Express para crear el enrutador
import express from "express";
// Importar el controlador de verificación de email
import emailVerificationController from "../controllers/emailVerificationController.js";

// Crear una instancia del enrutador de Express
const router = express.Router();

// Ruta para solicitar código de verificación de email
// POST /request - Envía un código de verificación al email del usuario durante el registro
router.route("/request").post(emailVerificationController.requestEmailVerification);

// Ruta para verificar código y completar registro
// POST /verify - Verifica el código enviado y completa el proceso de registro del usuario
router.route("/verify").post(emailVerificationController.verifyEmailAndRegister);

// Exportar el enrutador para ser usado en la aplicación principal
export default router;