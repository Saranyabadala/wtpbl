/** Centralised config so env vars are read and validated in exactly one place. */

const DEV_SECRET = 'dev-only-change-me';

function bool(value, fallback = false) {
  if (value === undefined || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  jwtSecret: process.env.JWT_SECRET || DEV_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY || '',
  defaultLat: Number(process.env.DEFAULT_LAT) || 19.1197,
  defaultLng: Number(process.env.DEFAULT_LNG) || 72.8464,

  get clientOrigins() {
    return (process.env.CLIENT_URL || 'http://localhost:5173')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);
  },

  get isProduction() {
    return this.nodeEnv === 'production';
  },

  get useGooglePlaces() {
    return bool(this.googlePlacesApiKey);
  },
};

export { DEV_SECRET };
