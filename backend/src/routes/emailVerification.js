import express from "express";
import emailVerificationController from "../controllers/emailVerificationController.js";

const router = express.Router();

// Ruta para solicitar código de verificación de email
router.route("/request").post(emailVerificationController.requestEmailVerification);

// Ruta para verificar código y completar registro
router.route("/verify").post(emailVerificationController.verifyEmailAndRegister);

export default router;