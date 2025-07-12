import bcryptjs from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import clientsModel from "../models/Clients.js";
import { config } from "../config.js";

const loginController = {};

// Función de login - MANTIENE ESTRUCTURA ORIGINAL EXACTA
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
          httpOnly: false,
          secure: false,
          sameSite: 'lax',
          maxAge: 24 * 60 * 60 * 1000
        });

        console.log(`Successful login for: ${email} as ${userType}`);

        // RESPUESTA EXACTA COMO ESPERA EL FRONTEND
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

// Verificar token - DEVUELVE 200 SIEMPRE
loginController.verifyToken = (req, res) => {
  try {
    const token = req.cookies.authToken;
    
    if (!token) {
      return res.status(200).json({ 
        message: 'No token provided',
        isAuthenticated: false 
      });
    }

    const decoded = jsonwebtoken.verify(token, config.JWT.secret);
    
    res.status(200).json({
      id: decoded.id,
      userType: decoded.userType,
      isAuthenticated: true
    });
    
  } catch (error) {
    console.error('Error verificando token:', error);
    res.clearCookie("authToken");
    
    res.status(200).json({ 
      message: 'Invalid or expired token',
      isAuthenticated: false 
    });
  }
};

// Obtener información del usuario
loginController.getUserInfo = async (req, res) => {
  try {
    const token = req.cookies.authToken;
    
    if (!token) {
      return res.status(401).json({
        message: 'Token de autenticación requerido'
      });
    }

    const decoded = jsonwebtoken.verify(token, config.JWT.secret);
    const { id, userType } = decoded;

    if (userType === 'admin') {
      const adminInfo = {
        id: 'admin',
        name: 'Administrador',
        email: config.admin.email,
        userType: 'admin'
      };

      return res.json({
        success: true, 
        user: adminInfo
      });
    } else {
      const client = await clientsModel.findById(id).select('-password');
      
      if (!client) {
        return res.status(404).json({
          message: 'Usuario no encontrado'
        });
      }

      const clientInfo = {
        id: client._id,
        name: client.fullName,
        email: client.email,
        phone: client.phone,
        address: client.address,
        birthDate: client.birthDate,
        profilePicture: client.profilePicture,
        favorites: client.favorites,
        discount: client.discount,
        userType: 'Customer'
      };

      return res.json({
        success: true,
        user: clientInfo
      });
    }
  } catch (error) {
    console.error('Error obteniendo información del usuario:', error);
    
    if (error.name === 'JsonWebTokenError') {
      res.clearCookie("authToken");
      return res.status(401).json({
        message: 'Invalid token'
      });
    }
    
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

// Refrescar token
loginController.refreshToken = async (req, res) => {
  try {
    const token = req.cookies.authToken;
    
    if (!token) {
      return res.status(401).json({
        message: 'No token provided'
      });
    }

    const decoded = jsonwebtoken.verify(token, config.JWT.secret);
    
    const newToken = jsonwebtoken.sign(
      {
        id: decoded.id,
        userType: decoded.userType
      },
      config.JWT.secret,
      { expiresIn: config.JWT.expires }
    );

    res.cookie("authToken", newToken, {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.json({
      message: "Token refreshed successfully"
    });

  } catch (error) {
    console.error('Error refrescando token:', error);
    res.clearCookie("authToken");
    res.status(401).json({
      message: 'Error refreshing token'
    });
  }
};

export default loginController;