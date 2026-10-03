import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const OrderItemSchema = new Schema(
  {
    dish_name: { type: String, required: true, trim: true },
    restaurant_name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    health_tags: { type: [String], default: [] },
    allergens: { type: [String], default: [] },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: { type: [OrderItemSchema], default: [] },
    total_amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['placed', 'confirmed'],
      default: 'placed',
    },
    order_number: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

export const Order = model('Order', OrderSchema);
