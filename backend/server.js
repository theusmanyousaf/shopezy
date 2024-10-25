import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.route.js';
import { connectDB } from './db/connect.js';

dotenv.config();

const app = express();

app.use('/api/auth', authRoutes)

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    connectDB();
})