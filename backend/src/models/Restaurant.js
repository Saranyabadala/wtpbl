import mongoose from 'mongoose';
import { DEFAULT_LOCATION } from '../constants.js';

const { Schema, model } = mongoose;

const PointSchema = new Schema(
  {
    lat: { type: Number, required: true, min: -90, max: 90 },
    lng: { type: Number, required: true, min: -180, max: 180 },
  },
  { _id: false }
);

const RestaurantSchema = new Schema(
  {
    name: { type: String, required: [true, 'Restaurant name is required'], trim: true },
    location: { type: PointSchema, required: true },
    address: { type: String, required: true, trim: true },
    cuisine_type: { type: String, required: true, trim: true },
    price_range: {
      type: String,
      required: true,
      enum: ['$', '$$', '$$$', '$$$$'],
      default: '$$',
    },
    google_place_id: {
      type: String,
      trim: true,
      default: null,
      index: { sparse: true },
    },
    image_query: { type: String, trim: true, default: '' },
    image_url: { type: String, trim: true, default: null },
    image_author: { type: String, trim: true, default: null },
    image_author_url: { type: String, trim: true, default: null },
    rating: { type: Number, min: 0, max: 5, default: null },
    source: {
      type: String,
      enum: ['seed', 'google_places'],
      default: 'seed',
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

RestaurantSchema.index({ name: 'text', cuisine_type: 'text', address: 'text' });
RestaurantSchema.index({ location: '2dsphere' });

RestaurantSchema.virtual('dish_count', {
  ref: 'Dish',
  localField: '_id',
  foreignField: 'restaurant_id',
  count: true,
});

RestaurantSchema.set('toJSON', { virtuals: true });

export const Restaurant = model('Restaurant', RestaurantSchema);
export { DEFAULT_LOCATION };
