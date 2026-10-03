/**
 * Shared enum definitions. These strings are the contract between the Mongo
 * schemas, the API and the frontend badges, so they live in one place.
 */

export const HEALTH_TAGS = [
  'diabetic_friendly',
  'low_sodium',
  'gluten_free',
  'low_oil',
  'kidney_friendly',
  'heart_healthy',
];

export const ALLERGENS = ['nuts', 'dairy', 'shellfish', 'gluten', 'soy'];

/** Human labels used by the UI and seed data. */
export const HEALTH_TAG_LABELS = {
  diabetic_friendly: 'Diabetic Friendly',
  low_sodium: 'Low Sodium',
  gluten_free: 'Gluten Free',
  low_oil: 'Low Oil',
  kidney_friendly: 'Kidney Friendly',
  heart_healthy: 'Heart Healthy',
};

export const ALLERGEN_LABELS = {
  nuts: 'Nuts',
  dairy: 'Dairy',
  shellfish: 'Shellfish',
  gluten: 'Gluten',
  soy: 'Soy',
};

/**
 * Tailwind class pairs for the health tag badges. Kept here so the palette is
 * defined once and stays consistent between the filter bar and the dish cards.
 */
export const HEALTH_TAG_COLORS = {
  diabetic_friendly: 'bg-emerald-100 text-emerald-800 ring-emerald-600/20',
  low_sodium: 'bg-sky-100 text-sky-800 ring-sky-600/20',
  gluten_free: 'bg-amber-100 text-amber-800 ring-amber-600/20',
  low_oil: 'bg-teal-100 text-teal-800 ring-teal-600/20',
  kidney_friendly: 'bg-violet-100 text-violet-800 ring-violet-600/20',
  heart_healthy: 'bg-rose-100 text-rose-800 ring-rose-600/20',
};

export const ALLERGEN_COLORS = {
  nuts: 'bg-orange-100 text-orange-800 ring-orange-600/20',
  dairy: 'bg-blue-100 text-blue-800 ring-blue-600/20',
  shellfish: 'bg-red-100 text-red-800 ring-red-600/20',
  gluten: 'bg-yellow-100 text-yellow-900 ring-yellow-700/20',
  soy: 'bg-lime-100 text-lime-800 ring-lime-600/20',
};

/** Fallback demo centre: Andheri West, Mumbai. Used when geolocation is unavailable. */
export const DEFAULT_LOCATION = {
  lat: 19.1197,
  lng: 72.8464,
  label: 'Andheri West, Mumbai',
};

export function isValidHealthTag(value) {
  return HEALTH_TAGS.includes(value);
}

export function isValidAllergen(value) {
  return ALLERGENS.includes(value);
}
