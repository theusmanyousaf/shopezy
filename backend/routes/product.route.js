import express from 'express';
import { getAllProducts, getFeaturedProducts, createProduct } from '../controllers/product.controller.js';
import { protectRoute, adminRoute } from '../middleware/auth.middleware.js';

const router = express.Router();


router.route('/').get([protectRoute, adminRoute ], getAllProducts).post([protectRoute, adminRoute ], createProduct);
router.get('/featured',  getFeaturedProducts);

export default router;