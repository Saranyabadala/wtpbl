import { Router } from 'express';
import * as restaurantController from '../controllers/restaurantController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

// Public reads, but attach the user when a token is present so that
// "Safe for me" can read their saved profile preferences.
router.use(optionalAuth);

router.get('/meta/filters', restaurantController.getFilterOptions);
router.get('/', restaurantController.listRestaurants);
router.post('/search-nearby', restaurantController.searchNearby);
router.get('/:id', restaurantController.getRestaurant);

export default router;
