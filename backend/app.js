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

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true
    })
);

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

export default app;