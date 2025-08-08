import express from "express";
import loginController from "../controllers/loginController.js";

const router = express.Router();

// Ruta principal de login - AHORA CON SISTEMA DE BLOQUEO
router.route("/").post(loginController.login);

// Ruta para verificar token - NO necesita middleware (verifica manualmente)
router.route("/verify").get(loginController.verifyToken);

// Ruta para obtener información del usuario - NO necesita middleware (verifica manualmente)
router.route("/user-info").get(loginController.getUserInfo);

// Ruta para refrescar token - NO necesita middleware (verifica manualmente)
router.route("/refresh").post(loginController.refreshToken);

// ===== NUEVAS RUTAS PARA SISTEMA DE BLOQUEO =====

// Ruta para verificar el estado de bloqueo de una cuenta
// GET /api/login/lock-status?email=usuario@email.com
router.route("/lock-status").get(loginController.checkLockStatus);

// Ruta para limpiar intentos de login (uso administrativo)
// POST /api/login/clear-attempts
// Body: { "email": "usuario@email.com" }
router.route("/clear-attempts").post(loginController.clearLoginAttempts);

export default router;