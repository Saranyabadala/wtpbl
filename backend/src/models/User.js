import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { HEALTH_TAGS, ALLERGENS } from '../constants.js';

const { Schema, model } = mongoose;

const UserSchema = new Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password_hash: { type: String, required: true, select: false },
    /** Health conditions the user wants to guarantee, used by "Safe for me". */
    dietary_preferences: {
      type: [{ type: String, enum: HEALTH_TAGS }],
      default: [],
    },
    allergies: {
      type: [{ type: String, enum: ALLERGENS }],
      default: [],
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

UserSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password_hash')) return next();
  this.password_hash = await bcrypt.hash(this.password_hash, 10);
  next();
});

UserSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password_hash);
};

/** Shape sent to the client. Never leaks password_hash. */
UserSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    dietary_preferences: this.dietary_preferences,
    allergies: this.allergies,
    created_at: this.created_at,
  };
};

export const User = model('User', UserSchema);
