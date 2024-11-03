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
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser()); // for cookies access
// Custom CORS Headers
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_URL || '*'); // Change * to CLIENT_URL for stricter control
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // Handle preflight (OPTIONS) requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    next();
});

// routes
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/coupons', couponRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/analytics', analyticsRoutes)
app.get('/', (req, res) => { res.send('Hello World!') })

connectDB();

export default app;