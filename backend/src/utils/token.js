import jwt from 'jsonwebtoken';
import { config } from '../config.js';

const DEV_SECRET = 'dev-only-change-me';

export function assertJwtSecret() {
  const secret = config.jwtSecret;
  if (!secret) {
    throw new Error('JWT_SECRET is not set');
  }
  if (config.nodeEnv === 'production' && secret === DEV_SECRET) {
    throw new Error(
      'JWT_SECRET is still the default dev value. Set a strong secret before deploying to production.'
    );
  }
}

export function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), email: user.email }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

export function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret);
}
