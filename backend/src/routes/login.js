import express from "express";
import loginController from "../controllers/loginController.js";

const router = express.Router();

// Ruta principal de login - NO necesita middleware (crea el token)
router.route("/").post(loginController.login);

// Ruta para verificar token - NO necesita middleware (verifica manualmente)
router.route("/verify").get(loginController.verifyToken);

// Ruta para obtener información del usuario - NO necesita middleware (verifica manualmente)
router.route("/user-info").get(loginController.getUserInfo);

// Ruta para refrescar token - NO necesita middleware (verifica manualmente)
router.route("/refresh").post(loginController.refreshToken);

export default router;