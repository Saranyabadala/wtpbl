import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as authController from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { config } from '../config.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts, please try again later' },
});

router.post('/signup', authLimiter, authController.signup);
router.post('/login', authLimiter, authController.login);
router.get('/me', requireAuth, authController.me);
router.patch('/me', requireAuth, authController.updateProfile);

router.get('/config', (_req, res) => {
  res.json({
    health_tags: [
      'diabetic_friendly',
      'low_sodium',
      'gluten_free',
      'low_oil',
      'kidney_friendly',
      'heart_healthy',
    ],
    allergens: ['nuts', 'dairy', 'shellfish', 'gluten', 'soy'],
    google_places_enabled: config.useGooglePlaces,
    default_location: { lat: config.defaultLat, lng: config.defaultLng },
  });
});

export default router;
