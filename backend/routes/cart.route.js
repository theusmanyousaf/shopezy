import express from 'express';
import { addToCart, removeAllProducts, updateProductQuantity } from '../controllers/cart.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', protectRoute, addToCart)
router.delete('/', protectRoute, removeAllProducts)
router.put('/:id', protectRoute, updateProductQuantity)

export default router;