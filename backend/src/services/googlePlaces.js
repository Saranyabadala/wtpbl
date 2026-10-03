/**
 * Google Places (New) Text Search integration.
 *
 * This is entirely OPTIONAL. With no GOOGLE_PLACES_API_KEY the app falls back
 * to the seeded restaurants, so the demo never depends on this service. Kept as
 * a thin, isolated service so the rest of the app stays unaware of the source.
 */

const PLACES_BASE = 'https://places.googleapis.com/v1/places:searchText';

function mapPriceLevel(priceLevel) {
  const table = {
    PRICE_LEVEL_INEXPENSIVE: '$',
    PRICE_LEVEL_MODERATE: '$$',
    PRICE_LEVEL_EXPENSIVE: '$$$',
    PRICE_LEVEL_VERY_EXPENSIVE: '$$$$',
  };
  return table[priceLevel] || '$$';
}

/**
 * Searches for restaurants near the given origin.
 * @returns {Promise<Array<{name,address,cuisineType,priceRange,rating,placeId,location}>>}
 */
export async function searchGooglePlaces({ query, lat, lng, maxResults = 20 }) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return [];

  const body = {
    textQuery: `${query} restaurant in Mumbai`,
    maxResultCount: Math.min(maxResults, 20),
    locationBias: {
      circle: { center: { latitude: lat, longitude: lng }, radius: 8000 },
    },
    languageCode: 'en',
  };

  const res = await fetch(`${PLACES_BASE}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-FieldMask':
        'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.priceLevel,places.primaryType',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Google Places request failed (${res.status}): ${text.slice(0, 200)}`);
  }

  const json = await res.json();
  return (json.places || []).map((place) => ({
    placeId: place.id,
    name: place.displayName?.text || 'Unnamed restaurant',
    address: place.formattedAddress || 'Address unavailable',
    location: {
      lat: place.location?.latitude,
      lng: place.location?.longitude,
    },
    rating: place.rating ?? null,
    priceRange: mapPriceLevel(place.priceLevel),
    cuisineType: place.primaryType ? titleCase(place.primaryType) : 'Other',
  }));
}

function titleCase(str) {
  return String(str)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
