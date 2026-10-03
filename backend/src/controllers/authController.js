import { User } from '../models/User.js';
import { signToken } from '../utils/token.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { HEALTH_TAGS, ALLERGENS } from '../constants.js';

function validateEnumList(values, allowed, field) {
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

export const signup = asyncHandler(async (req, res) => {
  const { name, email, password, dietary_preferences = [], allergies = [] } = req.body || {};

  if (!name?.trim() || !email?.trim() || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const prefs = validateEnumList(dietary_preferences, HEALTH_TAGS, 'dietary_preferences');
  const allergyList = validateEnumList(allergies, ALLERGENS, 'allergies');

  const existing = await User.findOne({ email: String(email).toLowerCase().trim() });
  if (existing) {
    return res.status(409).json({ error: 'An account with that email already exists' });
  }

  const user = await User.create({
    name: name.trim(),
    email: String(email).toLowerCase().trim(),
    password_hash: password,
    dietary_preferences: prefs,
    allergies: allergyList,
  });

  return res.status(201).json({ token: signToken(user), user: user.toPublicJSON() });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select(
    '+password_hash'
  );
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  return res.json({ token: signToken(user), user: user.toPublicJSON() });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toPublicJSON() });
});

/** Updates the "Safe for me" profile fields. */
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, dietary_preferences, allergies } = req.body || {};

  if (name !== undefined) {
    if (!String(name).trim()) {
      return res.status(400).json({ error: 'Name cannot be empty' });
    }
    req.user.name = String(name).trim();
  }
  if (dietary_preferences !== undefined) {
    req.user.dietary_preferences = validateEnumList(
      dietary_preferences,
      HEALTH_TAGS,
      'dietary_preferences'
    );
  }
  if (allergies !== undefined) {
    req.user.allergies = validateEnumList(allergies, ALLERGENS, 'allergies');
  }

  await req.user.save();
  res.json({ user: req.user.toPublicJSON() });
});
