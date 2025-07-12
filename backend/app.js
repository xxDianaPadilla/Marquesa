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

// NUEVA LÍNEA - Importar rutas de recuperación de contraseña
import passwordResetRoutes from './src/routes/passwordReset.js';

// NUEVA LÍNEA - Importar rutas de verificación de email
import emailVerificationRoutes from './src/routes/emailVerification.js';

// Crea la instancia de la aplicación Express
const app = express();

// Middleware para parsear JSON con límite de 50MB
app.use(express.json({ limit: '50mb' }));

// Middleware para parsear datos URL-encoded con límite de 50MB
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Middleware para parsear texto plano con límite de 50MB
app.use(express.text({ limit: '50mb' }));

// Middleware para parsear datos raw con límite de 50MB
app.use(express.raw({ limit: '50mb' }));

// Middleware para parsear cookies
app.use(cookieParser());

// CORS - Configura CORS para permitir peticiones desde localhost:5173
app.use(
   cors({
       origin: "http://localhost:5173",
       credentials: true,
   })
);

// RUTAS - Configuración de todas las rutas de la API
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

// NUEVA LÍNEA - Usar rutas de recuperación de contraseña
app.use('/api/passwordReset', passwordResetRoutes);

// NUEVA LÍNEA - Usar rutas de verificación de email (después de las otras rutas)
app.use('/api/emailVerification', emailVerificationRoutes);

// Exporta la aplicación para ser utilizada en otros módulos
export default app;