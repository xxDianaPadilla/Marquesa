// Importar la librería dotenv para cargar variables de entorno
import dotenv from "dotenv";

// Configurar dotenv para cargar variables desde el archivo .env
dotenv.config();

// Exportar objeto de configuración con todas las variables de entorno
export const config = {
    // Configuración de la base de datos
    db: {
        uri: process.env.DB_URI
    },
    // Configuración del servidor
    server: {
        port: process.env.PORT
    },
    // Configuración de JSON Web Tokens
    JWT: {
        secret: process.env.JWT_SECRET,
        expires: process.env.JWT_EXPIRES
    },
    // Credenciales del administrador
    admin: {
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD
    },
    // Aunque ahora usamos Brevo, mantenemos para el sender email
    emailUser: {
        user_email: process.env.USER_EMAIL,
        user_pass: process.env.USER_PASS
    },
    // Configuración de Cloudinary para manejo de imágenes
    cloudinary: {
        cloud_name: process.env.CLOUD_NAME,
        cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
        cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET
    },
    brevo: {
        brevo_api: process.env.TU_API_KEY // Verificar que esta variable esté en .env
    }
};