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
import path from 'path';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();

const __dirname = path.resolve();

// middleware
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser()); // for cookies access
app.use(cors({
    origin: `${process.env.CLIENT_URL}`, // Allow your frontend origin
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Specify allowed methods
    credentials: true // Include this if you need to send cookies or headers like authorization
}));

// routes
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/coupons', couponRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/analytics', analyticsRoutes)

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/client/dist")));

	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"));
	});
}

const port = process.env.PORT || 5000;

app.listen(port, () => {
    connectDB();
    console.log(`Server is running on http://localhost:${port}`);
})