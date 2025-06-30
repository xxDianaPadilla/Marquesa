import bcryptjs from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import clientsModel from "../models/Clients.js";
import { config } from "../config.js";

const loginController = {};

loginController.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validar que los campos estén presentes
    if (!email || !password) {
      return res.status(400).json({
        message: "Email y contraseña son requeridos"
      });
    }

    let userFound;
    let userType;

    // Verificar si es el admin
    if (email === config.admin.email && password === config.admin.password) {
      userType = "admin";
      userFound = { _id: "admin" };
    } else {
      // Buscar en customers
      userFound = await clientsModel.findOne({ email });
      userType = "Customer";
    }

    if (!userFound) {
      return res.status(401).json({
        message: "user not found"
      });
    }

    // Verificar contraseña para usuarios no admin
    if (userType !== "admin") {
      const isMatch = await bcryptjs.compare(password, userFound.password);
      if (!isMatch) {
        return res.status(401).json({
          message: "Invalid password"
        });
      }
    }

    // Generar JWT
    jsonwebtoken.sign(
      {
        id: userFound._id,
        userType
      },
      config.JWT.secret,
      { expiresIn: config.JWT.expires },
      (error, token) => {
        if (error) {
          console.error("Error generating token:", error);
          return res.status(500).json({
            message: "Error generating token"
          });
        }

        // Establecer cookie con el token
        res.cookie("authToken", token, {
          httpOnly: false, // Permite acceso desde JavaScript
          secure: false,   // Cambiar a true en producción con HTTPS
          sameSite: 'lax',
          maxAge: 24 * 60 * 60 * 1000 // 24 horas
        });

        console.log(`Successful login for: ${email} as ${userType}`);

        res.json({
          message: "login successful",
          userType: userType
        });
      }
    );
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Internal server error"
    });
  }
};

export default loginController;