import express from "express";
import passwordResetController from "../controllers/passwordResetController.js";

const router = express.Router();

// Ruta para solicitar código de recuperación de contraseña
router.route("/request").post(passwordResetController.requestPasswordReset);

// Ruta para verificar código de recuperación
router.route("/verify").post(passwordResetController.verifyCode);

// Ruta para actualizar contraseña
router.route("/update").post(passwordResetController.updatePassword);

export default router;