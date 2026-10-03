import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const CartItemSchema = new Schema(
  {
    dish_id: { type: Schema.Types.ObjectId, ref: 'Dish', required: true },
    restaurant_id: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    price_at_add: { type: Number, required: true, min: 0 },
  },
  { _id: true }
);

const CartSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    items: { type: [CartItemSchema], default: [] },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

export const Cart = model('Cart', CartSchema);
