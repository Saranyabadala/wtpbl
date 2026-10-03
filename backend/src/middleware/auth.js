import { User } from '../models/User.js';
import { verifyToken } from '../utils/token.js';

function extractToken(req) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7).trim();
  return null;
}

/** Rejects the request when there is no valid JWT. */
export async function requireAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    const payload = verifyToken(token);
    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json({ error: 'User no longer exists' });
    }
    req.user = user;
    return next();
  } catch (err) {
    const message =
      err.name === 'TokenExpiredError' ? 'Session expired, please log in again' : 'Invalid token';
    return res.status(401).json({ error: message });
  }
}

/** Attaches req.user when a token is present but never blocks the request. */
export async function optionalAuth(req, _res, next) {
  const token = extractToken(req);
  if (!token) return next();
  try {
    const payload = verifyToken(token);
    req.user = await User.findById(payload.sub);
  } catch {
    // Ignore an invalid token on public endpoints.
  }
  return next();
}
