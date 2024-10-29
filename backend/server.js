import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.route.js';
import productRoutes from './routes/product.route.js';
import cartRoutes from './routes/cart.route.js';
import { connectDB } from './lib/db.js';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();

// middleware
app.use(express.json());
app.use(cookieParser()); // for cookies access

// routes
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/cart', cartRoutes)

const port = process.env.PORT || 5000;

app.listen(port, () => {
    connectDB();
    console.log(`Server is running on http://localhost:${port}`);
})