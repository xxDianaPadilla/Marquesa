import express from 'express';
import cookieParser from 'cookie-parser';
import cors from "cors";
import productsRoutes from './src/routes/products.js';
import mediaRoutes from './src/routes/media.js';

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


export default app;