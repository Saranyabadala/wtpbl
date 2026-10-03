import { Restaurant } from '../models/Restaurant.js';
import { Dish } from '../models/Dish.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { config } from '../config.js';
import { searchGooglePlaces } from '../services/googlePlaces.js';
import {
  distanceKm,
  formatDistance,
  parseEnumList,
  parseBool,
  resolveOrigin,
} from '../utils/geo.js';
import { HEALTH_TAGS, ALLERGENS } from '../constants.js';

/**
 * Loads dishes that satisfy the active filter set for each restaurant.
 *
 * `healthTags`  - dish must carry at least one of these tags (empty = no constraint)
 * `avoidTags`   - dish must NOT carry any of these tags (used by "Safe for me")
 * `avoidAllergens` - dish must not contain any of the user's allergens
 */
function dishFilter({ healthTags, avoidTags, avoidAllergens, requireAll = false }) {
  const and = [];

  if (healthTags.length) {
    // "Safe for me" is strict: the dish must satisfy every saved condition.
    // The manual filter bar is a discovery tool, so any selected tag matches.
    and.push(
      requireAll
        ? { health_tags: { $all: healthTags } }
        : { health_tags: { $in: healthTags } }
    );
  }
  if (avoidTags.length) {
    and.push({ health_tags: { $nin: avoidTags } });
  }
  if (avoidAllergens.length) {
    and.push({ allergens: { $nin: avoidAllergens } });
  }

  return and.length ? { $and: and } : {};
}

function attachDistance(restaurants, origin) {
  return restaurants.map((restaurant) => {
    const km = distanceKm(origin, restaurant.location);
    return {
      ...restaurant.toJSON(),
      distance_km: km === null ? null : Number(km.toFixed(2)),
      distance_label: formatDistance(km),
    };
  });
}

/**
 * GET /api/restaurants
 * Supports text search, cuisine and price filters, health-tag filters,
 * "Safe for me" mode, radius and sorting.
 */
export const listRestaurants = asyncHandler(async (req, res) => {
  const origin = resolveOrigin(req.query);
  const healthTags = parseEnumList(req.query.health_tags, HEALTH_TAGS);
  const avoidAllergens = parseEnumList(req.query.avoid_allergens, ALLERGENS);
  const safeForMe = parseBool(req.query.safe_for_me);
  const search = (req.query.search || '').trim();
  const cuisines = String(req.query.cuisine || '')
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean);
  const prices = parseEnumList(req.query.price, ['$', '$$', '$$$', '$$$$']);
  const radiusKm = Number(req.query.radius_km);
  const sort = req.query.sort || 'distance';
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 50);

  // "Safe for me" layers the user's saved profile on top of the manual filter:
  // every saved dietary preference must be present, and every saved allergy
  // must be absent.
  let avoidTags = parseEnumList(req.query.exclude_tags, HEALTH_TAGS);
  let requiredTags = healthTags;
  let excludeAllergens = avoidAllergens;
  let requireAll = false;

  if (safeForMe && req.user) {
    const userPrefs = req.user.dietary_preferences || [];
    const userAllergies = req.user.allergies || [];
    requiredTags = [...new Set([...healthTags, ...userPrefs])];
    excludeAllergens = [...new Set([...avoidAllergens, ...userAllergies])];
    requireAll = true;
  }

  const dishQuery = dishFilter({
    healthTags: requiredTags,
    avoidTags,
    avoidAllergens: excludeAllergens,
    requireAll,
  });

  const query = {};

  if (search) {
    query.$text = { $search: search };
  }
  if (cuisines.length) query.cuisine_type = { $in: cuisines };
  if (prices.length) query.price_range = { $in: prices };
  // A restaurant only qualifies if it has at least one dish passing the filter.
  if (Object.keys(dishQuery).length) {
    query._id = {
      $in: await Dish.distinct('restaurant_id', dishQuery),
    };
  }

  let restaurants = await Restaurant.find(query).limit(limit * 4);
  restaurants = attachDistance(restaurants, origin);

  if (Number.isFinite(radiusKm) && radiusKm > 0) {
    restaurants = restaurants.filter(
      (r) => r.distance_km !== null && r.distance_km <= radiusKm
    );
  }

  const sorters = {
    distance: (a, b) => (a.distance_km ?? 1e9) - (b.distance_km ?? 1e9),
    rating: (a, b) => (b.rating ?? 0) - (a.rating ?? 0),
    name: (a, b) => a.name.localeCompare(b.name),
    price_asc: (a, b) => a.price_range.length - b.price_range.length,
    price_desc: (a, b) => b.price_range.length - a.price_range.length,
  };
  restaurants.sort(sorters[sort] || sorters.distance);

  // Attach a dish preview for each restaurant so cards can show badges.
  const ids = restaurants.map((r) => r._id);
  const previews = await Dish.aggregate([
    { $match: { restaurant_id: { $in: ids }, ...dishQuery } },
    { $sort: { 'community_votes.up': -1, 'community_votes.down': 1 } },
    { $group: { _id: '$restaurant_id', dishes: { $push: '$$ROOT' } } },
  ]);
  const previewMap = new Map(previews.map((row) => [String(row._id), row.dishes]));

  const enriched = restaurants.map((r) => ({
    ...r,
    dish_count: previewMap.get(String(r._id))?.length ?? 0,
    preview_dishes: (previewMap.get(String(r._id)) || []).slice(0, 3).map((d) => ({
      id: d._id,
      name: d.name,
      health_tags: d.health_tags,
      allergens: d.allergens,
      tip: d.tip,
      total_votes: (d.community_votes?.up || 0) + (d.community_votes?.down || 0),
    })),
  }));

  const total = enriched.length;
  res.json({
    data: enriched.slice((page - 1) * limit, page * limit),
    meta: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      origin: { ...origin, label: req.query.origin_label || null },
      active_filters: {
        health_tags: requiredTags,
        exclude_tags: avoidTags,
        avoid_allergens: excludeAllergens,
        safe_for_me: safeForMe,
        require_all_tags: requireAll,
        search: search || null,
      },
      data_source: config.useGooglePlaces ? 'mixed' : 'seed',
    },
  });
});

/** GET /api/restaurants/:id - restaurant plus its full filtered dish list. */
export const getRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);
  if (!restaurant) {
    return res.status(404).json({ error: 'Restaurant not found' });
  }

  const origin = resolveOrigin(req.query);
  const healthTags = parseEnumList(req.query.health_tags, HEALTH_TAGS);
  const avoidAllergens = parseEnumList(req.query.avoid_allergens, ALLERGENS);
  const safeForMe = parseBool(req.query.safe_for_me);

  let requiredTags = healthTags;
  let excludeAllergens = avoidAllergens;
  const avoidTags = parseEnumList(req.query.exclude_tags, HEALTH_TAGS);
  let requireAll = false;

  if (safeForMe && req.user) {
    requiredTags = [
      ...new Set([...healthTags, ...(req.user.dietary_preferences || [])]),
    ];
    excludeAllergens = [
      ...new Set([...avoidAllergens, ...(req.user.allergies || [])]),
    ];
    requireAll = true;
  }

  const filter = dishFilter({
    healthTags: requiredTags,
    avoidTags,
    avoidAllergens: excludeAllergens,
    requireAll,
  });

  const dishes = await Dish.find({ restaurant_id: restaurant._id, ...filter }).sort({
    'community_votes.up': -1,
    name: 1,
  });

  const km = distanceKm(origin, restaurant.location);

  res.json({
    data: {
      ...restaurant.toJSON(),
      distance_km: km === null ? null : Number(km.toFixed(2)),
      distance_label: formatDistance(km),
      dish_count: dishes.length,
    },
    dishes,
  });
});

/**
 * POST /api/restaurants/search-nearby
 * Optional live Google Places lookup. Falls back to seeded restaurants when no
 * API key is configured, so the demo never depends on the external service.
 */
export const searchNearby = asyncHandler(async (req, res) => {
  const origin = resolveOrigin(req.query);
  const query = (req.query.query || 'restaurant').trim();

  if (!config.useGooglePlaces) {
    return res.status(200).json({
      data: [],
      meta: {
        source: 'seed',
        message:
          'Google Places is not configured. Showing seeded restaurants instead - set GOOGLE_PLACES_API_KEY to enable live results.',
      },
    });
  }

  const results = await searchGooglePlaces({ query, lat: origin.lat, lng: origin.lng });
  const saved = await upsertGoogleResults(results);

  res.json({
    data: attachDistance(saved, origin),
    meta: { source: 'google_places', count: saved.length },
  });
});

/** Persists Google Places results so dishes can be attached to them. */
async function upsertGoogleResults(results) {
  const docs = results.map((r) => ({
    name: r.name,
    location: { lat: r.location.lat, lng: r.location.lng },
    address: r.address,
    cuisine_type: r.cuisineType || 'Other',
    price_range: r.priceRange || '$$',
    google_place_id: r.placeId,
    rating: r.rating ?? null,
    source: 'google_places',
  }));

  const saved = [];
  for (const doc of docs) {
    saved.push(
      await Restaurant.findOneAndUpdate(
        { google_place_id: doc.google_place_id },
        { $set: doc },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
    );
  }
  return saved;
}

/** GET /api/restaurants/meta/filters - cuisines, price ranges and tag counts. */
export const getFilterOptions = asyncHandler(async (req, res) => {
  const [cuisines, prices, tagCounts] = await Promise.all([
    Restaurant.distinct('cuisine_type'),
    Restaurant.distinct('price_range'),
    Dish.aggregate([{ $unwind: '$health_tags' }, { $group: { _id: '$health_tags', count: { $sum: 1 } } }]),
  ]);

  res.json({
    cuisines: cuisines.sort(),
    prices: ['$', '$$', '$$$', '$$$$'].filter((p) => prices.includes(p)),
    health_tags: tagCounts.map((t) => ({ tag: t._id, count: t.count })),
  });
});
