import nodemailer from "nodemailer";
import crypto from "crypto";
import jsonwebtoken from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import clientsModel from "../models/Clients.js";
import { config } from "../config.js";

const registerClientsController = {};

registerClientsController.register = async (req, res) => {
    const { fullName, phone, birthDate, email, password, address, favorites, discount } = req.body;

    try {
        // Verificar si el cliente ya existe
        const existsClient = await clientsModel.findOne({ email });
        if (existsClient) {
            return res.status(400).json({
                success: false,
                message: "El cliente ya existe"
            });
        }

        // Hashear la contraseña
        const passwordHash = await bcryptjs.hash(password, 10);

        // Crear nuevo cliente con email ya verificado
        const newClient = new clientsModel({
            fullName, phone, birthDate, email, password: passwordHash, address, favorites, discount // Email ya verificado
        });

        await newClient.save();

        // Limpiar cookie de verificación
        res.clearCookie("emailVerificationToken");

        res.json({
            success: true,
            message: "Registro completado exitosamente"
        });

    } catch (error) {
        console.log("Error en registro: ", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
};

/*registerClientsController.verifyCodeEmail = async (req, res) => {
    const { verificationCodeRequest } = req.body;

    const token = req.cookies.verificationToken;

    const decoded = jsonwebtoken.verify(token, config.JWT.secret);
    const { email, verificationCode: storedCode } = decoded;

    if (verificationCodeRequest !== storedCode) {
        res.json({ message: "Invalid code." });
    }

    const client = await clientsModel.findOne({ email });
    client.isVerified = true;
    await client.save();

    res.clearCookie("verificationToken");

    res.json({ message: "Email verified successfully" });
};*/

export default registerClientsController;