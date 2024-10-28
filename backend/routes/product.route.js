import express from 'express';
import { getAllProducts, getFeaturedProducts, createProduct, deleteProduct } from '../controllers/product.controller.js';
import { protectRoute, adminRoute } from '../middleware/auth.middleware.js';

const router = express.Router();


router.get('/',[protectRoute, adminRoute ], getAllProducts);
router.post('/', [protectRoute, adminRoute ], createProduct);
router.delete('/:id', [protectRoute, adminRoute ], deleteProduct);
router.get('/featured',  getFeaturedProducts);

export default router;