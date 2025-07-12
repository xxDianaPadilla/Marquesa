import jsonwebtoken from "jsonwebtoken";
import { config } from "../config.js";

const logoutController = {};

logoutController.logout = async (req, res) => {
    try {
        const token = req.cookies.authToken;
        
        // Verificar si existe token
        if (!token) {
            return res.status(400).json({
                success: false,
                message: "No hay sesión activa para cerrar"
            });
        }

        // Verificar configuración JWT
        if (!config.JWT.secret) {
            console.error("JWT secret no configurado");
            return res.status(500).json({
                success: false,
                message: "Error de configuración del servidor"
            });
        }

        // Verificar validez del token antes de cerrar sesión
        try {
            const decoded = jsonwebtoken.verify(token, config.JWT.secret);
            
            // Validar estructura del token
            if (!decoded.id || !decoded.userType) {
                console.log("Token con estructura inválida al cerrar sesión");
            }
        } catch (jwtError) {
            // El token es inválido pero aún así limpiamos la cookie
            console.log("Token inválido al cerrar sesión:", jwtError.message);
        }

        // Limpiar cookie de autenticación
        res.clearCookie("authToken", {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });

        res.status(200).json({
            success: true,
            message: "Sesión cerrada exitosamente"
        });

    } catch (error) {
        console.error("Error en logout:", error);
        
        // Aún así limpiar la cookie en caso de error
        res.clearCookie("authToken", {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });

        res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
};

export default logoutController;