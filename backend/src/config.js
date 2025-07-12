// Importar la librería dotenv para cargar variables de entorno
import dotenv from "dotenv";

// Configurar dotenv para cargar variables desde el archivo .env
dotenv.config();

// Exportar objeto de configuración con todas las variables de entorno
export const config = {
    // Configuración de la base de datos
    db: {
        uri: process.env.DB_URI // URI de conexión a la base de datos
    },
    // Configuración del servidor
    server: {
        port: process.env.PORT // Puerto donde se ejecutará el servidor
    },
    // Configuración de JSON Web Tokens
    JWT: {
        secret: process.env.JWT_SECRET, // Clave secreta para firmar los JWT
        expires: process.env.JWT_EXPIRES // Tiempo de expiración de los tokens
    },
    // Credenciales del administrador
    admin: {
        email: process.env.ADMIN_EMAIL, // Email del administrador
        password: process.env.ADMIN_PASSWORD // Contraseña del administrador
    },
    // Configuración del correo electrónico
    emailUser: {
        user_email: process.env.USER_EMAIL, // Email del usuario para envío de correos
        user_pass: process.env.USER_PASS // Contraseña del email
    },
    // Configuración de Cloudinary para manejo de imágenes
    cloudinary: {
        cloud_name: process.env.CLOUD_NAME, // Nombre del cloud en Cloudinary
        cloudinary_api_key: process.env.CLOUDINARY_API_KEY, // Clave API de Cloudinary
        cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET // Secreto API de Cloudinary
    }
};