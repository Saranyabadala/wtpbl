import { Router } from 'express';
import * as cartController from '../controllers/cartController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/checkout', requireAuth, cartController.checkout);
router.get('/orders', requireAuth, cartController.listOrders);

export default router;
