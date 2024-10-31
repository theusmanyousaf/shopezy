import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth.route.js';
import productRoutes from './routes/product.route.js';
import cartRoutes from './routes/cart.route.js';
import couponRoutes from './routes/coupon.route.js';
import paymentRoutes from './routes/payment.route.js';
import analyticsRoutes from './routes/analytics.route.js';
import { connectDB } from './lib/db.js';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();

// middleware
app.use(express.json());
app.use(cookieParser()); // for cookies access
app.use(cors({
    origin: 'http://localhost:5173', // Allow your frontend origin
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Specify allowed methods
    credentials: true // Include this if you need to send cookies or headers like authorization
}));

// routes
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/coupon', couponRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/analytics', analyticsRoutes)

const port = process.env.PORT || 5000;

app.listen(port, () => {
    connectDB();
    console.log(`Server is running on http://localhost:${port}`);
})