import express from 'express';
import { addToCart, removeAllProducts } from '../controllers/cart.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', protectRoute, addToCart)
router.delete('/', protectRoute, removeAllProducts)

export default router;