import express from 'express';
import cookieParser from 'cookie-parser';
import cors from "cors";
import productsRoutes from './src/routes/products.js';
import mediaRoutes from './src/routes/media.js';
import loginRoutes from './src/routes/login.js';
import logoutRoutes from './src/routes/logout.js';
import registerClientsRoutes from './src/routes/registerClients.js';
import authRoutes from './src/routes/auth.js';
import customProductsRoutes from './src/routes/customProducts.js';
import shoppingCartRoutes from './src/routes/shoppingCart.js';
import salesRoutes from './src/routes/sales.js';
import clientsRoutes from './src/routes/clients.js';
import reviewsRoutes from './src/routes/reviews.js';
import categoriesRoutes from './src/routes/categories.js';
// NUEVA LÍNEA - Importar rutas de recuperación de contraseña
import passwordResetRoutes from './src/routes/passwordReset.js';

const app = express();

app.use(express.json({ limit: '50mb' }));

app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(express.text({ limit: '50mb' }));

app.use(express.raw({ limit: '50mb' }));

app.use(cookieParser());

// CORS (ya lo tenías)
app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true
    })
);

// RUTAS 
app.use('/api/products', productsRoutes);
app.use('/api/media', mediaRoutes);
app.use("/api/registerCustomers", registerClientsRoutes);
app.use("/api/login", loginRoutes);
app.use("/api/logout", logoutRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/customProducts", customProductsRoutes);
app.use("/api/shoppingCart", shoppingCartRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/clients", clientsRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/categories", categoriesRoutes);

// NUEVA LÍNEA - Usar rutas de recuperación de contraseña
app.use('/api/password-reset', passwordResetRoutes);

export default app;