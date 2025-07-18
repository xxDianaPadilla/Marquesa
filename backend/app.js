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

// Crea la instancia de la aplicación Express
const app = express();

// ===== CONFIGURACIÓN DE MIDDLEWARE =====

// 1. CORS - Debe ir primero para manejar cookies correctamente
app.use(
   cors({
       origin: "http://localhost:5173",
       credentials: true,  // Habilita el envío de cookies
   })
);

// 2. Middleware de parsing de datos
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.text({ limit: '50mb' }));
app.use(express.raw({ limit: '50mb' }));

// 3. Cookie parser para manejar cookies de autenticación
app.use(cookieParser());

// ===== CONFIGURACIÓN DE RUTAS =====
app.use('/api/products', productsRoutes);
app.use('/api/media', mediaRoutes);
app.use("/api/registerCustomers", registerClientsRoutes);
app.use("/api/login", loginRoutes);
app.use("/api/logout", logoutRoutes);
app.use("/api/customProducts", customProductsRoutes);
app.use("/api/shoppingCart", shoppingCartRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/clients", clientsRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use('/api/passwordReset', passwordResetRoutes);
app.use('/api/emailVerification', emailVerificationRoutes);
app.use('/api/chat', chatRoutes);

export default app;