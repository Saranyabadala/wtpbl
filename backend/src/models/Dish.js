import mongoose from 'mongoose';
import { HEALTH_TAGS, ALLERGENS } from '../constants.js';

const { Schema, model } = mongoose;

const DishSchema = new Schema(
  {
    name: { type: String, required: [true, 'Dish name is required'], trim: true },
    restaurant_id: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true,
    },
    description: { type: String, trim: true, default: '' },
    health_tags: {
      type: [{ type: String, enum: HEALTH_TAGS }],
      default: [],
    },
    allergens: {
      type: [{ type: String, enum: ALLERGENS }],
      default: [],
    },
    community_votes: {
      up: { type: Number, default: 0, min: 0 },
      down: { type: Number, default: 0, min: 0 },
    },
    /**
     * Per-user vote record. Keeps direction so a user can flip or retract a
     * vote without a separate votes collection. Never selected by default.
     */
    votersMeta: {
      type: [
        new Schema(
          {
            user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
            direction: { type: String, enum: ['up', 'down'], required: true },
          },
          { _id: false }
        ),
      ],
      default: [],
      select: false,
    },
    /** Static preparation tip, e.g. "ask for no added sugar". */
    tip: { type: String, trim: true, default: '', maxlength: 220 },
    created_by: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

DishSchema.index({ name: 'text' });
DishSchema.index({ restaurant_id: 1, name: 1 }, { unique: true });

/**
 * Vote confidence in [-1, 1]. Uses the net score normalised by total votes with
 * a Bayesian prior so that a single upvote on a 1-vote dish does not read as
 * "100% verified" next to a 40-vote dish at the same ratio.
 */
DishSchema.virtual('confidence').get(function () {
  const up = this.community_votes?.up ?? 0;
  const down = this.community_votes?.down ?? 0;
  const total = up + down;
  const PRIOR_VOTES = 5;
  const net = up - down;
  return Number(((net + 0) / (total + PRIOR_VOTES)).toFixed(3));
});

DishSchema.virtual('total_votes').get(function () {
  return (this.community_votes?.up ?? 0) + (this.community_votes?.down ?? 0);
});

DishSchema.set('toJSON', { virtuals: true });
DishSchema.set('toObject', { virtuals: true });

export const Dish = model('Dish', DishSchema);
