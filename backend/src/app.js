import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes.js';
import restaurantRoutes from './routes/restaurantRoutes.js';
import dishRoutes from './routes/dishRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import { config } from './config.js';
import { DEFAULT_LOCATION } from './constants.js';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        // Allow same-origin/non-browser callers (curl, health checks).
        if (!origin) return callback(null, true);
        if (config.clientOrigins.includes(origin)) return callback(null, true);
        return callback(new Error(`Origin ${origin} is not allowed by CORS`));
      },
      credentials: true,
    })
  );
  app.use(express.json({ limit: '100kb' }));
  if (!config.isProduction) app.use(morgan('dev'));

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'healthplate-api',
      environment: config.nodeEnv,
      google_places: config.useGooglePlaces ? 'enabled' : 'disabled (using seed data)',
      default_location: DEFAULT_LOCATION,
      time: new Date().toISOString(),
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/restaurants', restaurantRoutes);
  app.use('/api/dishes', dishRoutes);
  app.use('/api/cart', cartRoutes);
  app.use('/api', orderRoutes);

  app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    const status = err.status || 500;
    if (status >= 500) console.error('[error]', err);
    res.status(status).json({
      error: status >= 500 && config.isProduction ? 'Internal server error' : err.message,
    });
  });

  return app;
}
