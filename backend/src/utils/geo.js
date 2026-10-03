import { config } from '../config.js';
import { DEFAULT_LOCATION } from '../constants.js';

const EARTH_RADIUS_KM = 6371;

/** Haversine great-circle distance in kilometres. */
export function distanceKm(a, b) {
  if (!a?.lat || !a?.lng || !b?.lat || !b?.lng) return null;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

export function formatDistance(km) {
  if (km === null || km === undefined) return null;
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

/**
 * Resolves the search centre from the request, falling back to the configured
 * demo location so the UI always has a usable origin.
 */
export function resolveOrigin(query) {
  const lat = Number(query.lat);
  const lng = Number(query.lng);
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return { lat, lng, source: 'browser' };
  }
  return {
    lat: config.defaultLat || DEFAULT_LOCATION.lat,
    lng: config.defaultLng || DEFAULT_LOCATION.lng,
    source: 'default',
  };
}

/** Parses a repeatable/comma-separated query param into a validated enum list. */
export function parseEnumList(value, allowed) {
  if (value === undefined || value === null || value === '') return [];
  const raw = Array.isArray(value) ? value : String(value).split(',');
  return [...new Set(raw.map((item) => String(item).trim()).filter((item) => allowed.includes(item)))];
}

export function parseBool(value) {
  if (value === undefined || value === null || value === '') return false;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}
