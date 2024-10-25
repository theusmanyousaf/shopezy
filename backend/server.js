import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.route.js';
import { connectDB } from './lib/db.js';

dotenv.config();

const app = express();

// middleware
app.use(express.json());

// routes
app.use('/api/auth', authRoutes)

const port = process.env.PORT || 5000;

app.listen(port, () => {
    connectDB();
    console.log(`Server is running on http://localhost:${port}`);
})