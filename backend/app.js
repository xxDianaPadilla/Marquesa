// Importa Express para crear la aplicación del servidor
import express from 'express';

// Importa cookie-parser para manejar cookies en las peticiones
import cookieParser from 'cookie-parser';

// Importa cors para habilitar Cross-Origin Resource Sharing
import cors from "cors";

// Importa todas las rutas de la aplicación
import productsRoutes from './src/routes/products.js';
import mediaRoutes from './src/routes/media.js';
import loginRoutes from './src/routes/login.js';
import logoutRoutes from './src/routes/logout.js';
import registerClientsRoutes from './src/routes/registerClients.js';
import customProductsRoutes from './src/routes/customProducts.js';
import shoppingCartRoutes from './src/routes/shoppingCart.js';
import salesRoutes from './src/routes/sales.js';
import clientsRoutes from './src/routes/clients.js';
import reviewsRoutes from './src/routes/reviews.js';
import categoriesRoutes from './src/routes/categories.js';
import passwordResetRoutes from './src/routes/passwordReset.js';
import emailVerificationRoutes from './src/routes/emailVerification.js';
import chatRoutes from './src/routes/chat.js';
import customProductsMaterialsRoutes from './src/routes/customProductsMaterials.js';
// Crea la instancia de la aplicación Express
const app = express();

// Configuración de CORS para permitir peticiones entre dominios diferentes
// Se especifica el origen exacto del frontend y se habilitan las credenciales
app.use(
    cors({
        origin: ["https://marquesa.vercel.app"], // Como array
        credentials: true, // CRÍTICO: Permitir cookies
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    })
);

// Middleware para parsear diferentes tipos de datos en las peticiones
app.use(express.json({ limit: '50mb' })); // Parsea JSON con límite de 50MB
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // Parsea datos de formularios
app.use(express.text({ limit: '50mb' })); // Parsea texto plano
app.use(express.raw({ limit: '50mb' })); // Parsea datos binarios

// Middleware para manejar cookies de autenticación
app.use(cookieParser());

// Configuración de todas las rutas de la API
app.use('/api/products', productsRoutes); // Rutas para productos
app.use('/api/media', mediaRoutes); // Rutas para medios/archivos
app.use("/api/registerCustomers", registerClientsRoutes); // Registro de clientes
app.use("/api/login", loginRoutes); // Inicio de sesión
app.use("/api/logout", logoutRoutes); // Cierre de sesión
app.use("/api/customProducts", customProductsRoutes); // Productos personalizados
app.use("/api/shoppingCart", shoppingCartRoutes); // Carrito de compras
app.use("/api/sales", salesRoutes); // Ventas
app.use("/api/clients", clientsRoutes); // Gestión de clientes
app.use("/api/reviews", reviewsRoutes); // Reseñas de productos
app.use("/api/categories", categoriesRoutes); // Categorías de productos
app.use('/api/passwordReset', passwordResetRoutes); // Recuperación de contraseña
app.use('/api/emailVerification', emailVerificationRoutes); // Verificación de email
app.use('/api/chat', chatRoutes); // Sistema de chat
app.use('/api/customProductsMaterials', customProductsMaterialsRoutes); // Materiales para productos personalizados

export default app;