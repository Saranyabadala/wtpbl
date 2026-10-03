import { Dish } from '../models/Dish.js';
import { Restaurant } from '../models/Restaurant.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { HEALTH_TAGS, ALLERGENS } from '../constants.js';
import { parseEnumList, parseBool } from '../utils/geo.js';

function validateTags(values, allowed, field) {
  if (!Array.isArray(values)) return [];
  const clean = [...new Set(values.map((v) => String(v).trim()).filter(Boolean))];
  const invalid = clean.filter((v) => !allowed.includes(v));
  if (invalid.length) {
    const err = new Error(`Invalid ${field}: ${invalid.join(', ')}`);
    err.status = 400;
    throw err;
  }
  return clean;
}

/**
 * GET /api/dishes
 * Lists dishes across all restaurants with optional tag/allergen filtering,
 * search and vote-confidence sorting.
 */
export const listDishes = asyncHandler(async (req, res) => {
  const healthTags = parseEnumList(req.query.health_tags, HEALTH_TAGS);
  const excludeTags = parseEnumList(req.query.exclude_tags, HEALTH_TAGS);
  const avoidAllergens = parseEnumList(req.query.avoid_allergens, ALLERGENS);
  const search = (req.query.search || '').trim();
  const sort = req.query.sort || 'confidence';
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 50);

  const and = [];
  if (healthTags.length) and.push({ health_tags: { $in: healthTags } });
  if (excludeTags.length) and.push({ health_tags: { $nin: excludeTags } });
  if (avoidAllergens.length) and.push({ allergens: { $nin: avoidAllergens } });
  if (search) and.push({ name: new RegExp(escapeRegex(search), 'i') });
  if (req.query.restaurant_id) {
    and.push({ restaurant_id: req.query.restaurant_id });
  }

  const filter = and.length ? { $and: and } : {};

  // Score in the pipeline so confidence ordering happens server-side.
  const matchStage = { $match: filter };
  const scoreStage = {
    $addFields: {
      total_votes: {
        $add: [{ $ifNull: ['$community_votes.up', 0] }, { $ifNull: ['$community_votes.down', 0] }],
      },
    },
  };
  scoreStage.$addFields.confidence = {
    $divide: [
      { $subtract: [{ $ifNull: ['$community_votes.up', 0] }, { $ifNull: ['$community_votes.down', 0] }] },
      { $add: ['$total_votes', 5] },
    ],
  };

  const sortStage = {
    confidence: { confidence: -1, total_votes: -1 },
    most_voted: { total_votes: -1 },
    newest: { created_at: -1 },
    name: { name: 1 },
  }[sort] || { confidence: -1, total_votes: -1 };

  const pipeline = [
    matchStage,
    scoreStage,
    { $sort: sortStage },
    {
      $facet: {
        results: [{ $skip: (page - 1) * limit }, { $limit: limit }],
        counted: [{ $count: 'total' }],
      },
    },
  ];

  const [facet] = await Dish.aggregate(pipeline);
  const results = facet?.results ?? [];
  const total = facet?.counted?.[0]?.total ?? 0;

  const restaurantIds = [...new Set(results.map((d) => d.restaurant_id))];
  const restaurants = await Restaurant.find({ _id: { $in: restaurantIds } }).select(
    'name cuisine_type price_range address location rating'
  );
  const restaurantMap = new Map(restaurants.map((r) => [String(r._id), r]));

  res.json({
    data: results.map((d) => ({ ...d, restaurant: restaurantMap.get(String(d.restaurant_id)) || null })),
    meta: { total, page, limit, pages: Math.ceil(total / limit), sort },
  });
});

/** GET /api/dishes/:id - dish detail including vote state for the current user. */
export const getDish = asyncHandler(async (req, res) => {
  const dish = await Dish.findById(req.params.id).select('+votersMeta');
  if (!dish) {
    return res.status(404).json({ error: 'Dish not found' });
  }

  const restaurant = await Restaurant.findById(dish.restaurant_id);
  const myVote =
    req.user && dish.votersMeta.length
      ? dish.votersMeta.find((m) => String(m.user) === req.user._id.toString())?.direction || null
      : null;

  res.json({
    data: {
      ...dish.toJSON(),
      restaurant: restaurant || null,
      my_vote: myVote,
    },
  });
});

/** POST /api/dishes - any logged-in user can contribute a dish. */
export const createDish = asyncHandler(async (req, res) => {
  const { name, restaurant_id, description = '', health_tags = [], allergens = [], tip = '' } =
    req.body || {};

  if (!name?.trim()) {
    return res.status(400).json({ error: 'Dish name is required' });
  }
  const tags = validateTags(health_tags, HEALTH_TAGS, 'health_tags');
  const allergyList = validateTags(allergens, ALLERGENS, 'allergens');

  if (!Array.isArray(health_tags) || health_tags.length === 0) {
    return res.status(400).json({ error: 'Select at least one health tag' });
  }

  const restaurant = await Restaurant.findById(restaurant_id);
  if (!restaurant) {
    return res.status(400).json({ error: 'Restaurant not found' });
  }

  const duplicate = await Dish.findOne({
    restaurant_id,
    name: { $regex: `^${escapeRegex(name.trim())}$`, $options: 'i' },
  });
  if (duplicate) {
    return res
      .status(409)
      .json({ error: 'That dish already exists at this restaurant', dish_id: duplicate._id });
  }

  const dish = await Dish.create({
    name: name.trim(),
    restaurant_id,
    description: String(description).slice(0, 400),
    health_tags: tags,
    allergens: allergyList,
    tip: String(tip).slice(0, 220),
    created_by: req.user._id,
    // New contributions start unverified so they do not outrank well-voted data.
    community_votes: { up: 0, down: 0 },
  });

  res.status(201).json({ data: dish });
});

/** PATCH /api/dishes/:id - edit tags, allergens or the tip. */
export const updateDish = asyncHandler(async (req, res) => {
  const dish = await Dish.findById(req.params.id);
  if (!dish) {
    return res.status(404).json({ error: 'Dish not found' });
  }

  const { name, description, health_tags, allergens, tip } = req.body || {};

  if (name !== undefined) {
    if (!String(name).trim()) return res.status(400).json({ error: 'Dish name cannot be empty' });
    dish.name = String(name).trim();
  }
  if (description !== undefined) dish.description = String(description).slice(0, 400);
  if (health_tags !== undefined) {
    const tags = validateTags(health_tags, HEALTH_TAGS, 'health_tags');
    if (!tags.length) return res.status(400).json({ error: 'Select at least one health tag' });
    dish.health_tags = tags;
  }
  if (allergens !== undefined) {
    dish.allergens = validateTags(allergens, ALLERGENS, 'allergens');
  }
  if (tip !== undefined) dish.tip = String(tip).slice(0, 220);

  await dish.save();
  res.json({ data: dish });
});

/**
 * POST /api/dishes/:id/vote
 * Community vote on tag accuracy. One vote per user, toggled by re-voting the
 * opposite way or passing the same direction to clear it.
 */
export const voteDish = asyncHandler(async (req, res) => {
  const { direction } = req.body || {};
  if (!['up', 'down'].includes(direction)) {
    return res.status(400).json({ error: "direction must be 'up' or 'down'" });
  }

  const dish = await Dish.findById(req.params.id).select('+votersMeta');
  if (!dish) {
    return res.status(404).json({ error: 'Dish not found' });
  }

  const userId = req.user._id.toString();
  const meta = dish.votersMeta || [];
  const metaIndex = meta.findIndex((m) => String(m.user) === userId);
  const previousDirection = metaIndex === -1 ? null : meta[metaIndex].direction;

  if (previousDirection === direction) {
    dish.community_votes[direction] = Math.max(0, dish.community_votes[direction] - 1);
    if (metaIndex !== -1) meta.splice(metaIndex, 1);
  } else {
    if (previousDirection) {
      dish.community_votes[previousDirection] = Math.max(
        0,
        dish.community_votes[previousDirection] - 1
      );
    }
    dish.community_votes[direction] += 1;
    if (metaIndex === -1) meta.push({ user: req.user._id, direction });
    else meta[metaIndex].direction = direction;
  }

  dish.votersMeta = meta;
  dish.markModified('votersMeta');
  await dish.save();

  res.json({
    data: {
      community_votes: dish.community_votes,
      total_votes: dish.total_votes,
      confidence: dish.confidence,
      my_vote: previousDirection === direction ? null : direction,
    },
  });
});

function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
