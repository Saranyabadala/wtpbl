import { Router } from 'express';
import * as dishController from '../controllers/dishController.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', optionalAuth, dishController.listDishes);
router.post('/', requireAuth, dishController.createDish);
router.get('/:id', optionalAuth, dishController.getDish);
router.patch('/:id', requireAuth, dishController.updateDish);
router.post('/:id/vote', requireAuth, dishController.voteDish);

export default router;
