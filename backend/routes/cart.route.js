import express from 'express';
import { addToCart, removeAllProducts, updateProductQuantity, getCartProducts } from '../controllers/cart.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', protectRoute, getCartProducts)
router.post('/', protectRoute, addToCart)
router.delete('/', protectRoute, removeAllProducts)
router.put('/:id', protectRoute, updateProductQuantity)

export default router;