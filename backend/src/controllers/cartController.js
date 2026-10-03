import mongoose from 'mongoose';
import { Cart } from '../models/Cart.js';
import { Dish } from '../models/Dish.js';
import { Restaurant } from '../models/Restaurant.js';
import { Order } from '../models/Order.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { mockDishPrice } from '../utils/price.js';

const DISH_POPULATE = {
  path: 'items.dish_id',
  select: 'name health_tags allergens tip restaurant_id',
};
const RESTAURANT_POPULATE = {
  path: 'items.restaurant_id',
  select: 'name cuisine_type price_range',
};

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user_id: userId });
  if (!cart) cart = await Cart.create({ user_id: userId, items: [] });
  return cart;
}

function serializeCart(cart) {
  const items = (cart.items || [])
    .filter((item) => item.dish_id)
    .map((item) => {
      const dish = item.dish_id;
      const restaurant = item.restaurant_id;
      const quantity = item.quantity;
      const unit = item.price_at_add;
      return {
        id: item._id.toString(),
        quantity,
        price_at_add: unit,
        line_total: Number((unit * quantity).toFixed(2)),
        dish: dish
          ? {
              id: dish._id.toString(),
              name: dish.name,
              health_tags: dish.health_tags || [],
              allergens: dish.allergens || [],
              tip: dish.tip || '',
            }
          : null,
        restaurant: restaurant
          ? {
              id: restaurant._id.toString(),
              name: restaurant.name,
              cuisine_type: restaurant.cuisine_type,
              price_range: restaurant.price_range,
            }
          : null,
      };
    });

  const item_count = items.reduce((sum, item) => sum + item.quantity, 0);
  const total_amount = Number(items.reduce((sum, item) => sum + item.line_total, 0).toFixed(2));

  return {
    id: cart._id.toString(),
    items,
    item_count,
    total_amount,
    updated_at: cart.updated_at,
  };
}

async function loadPopulatedCart(userId) {
  const cart = await Cart.findOne({ user_id: userId })
    .populate(DISH_POPULATE)
    .populate(RESTAURANT_POPULATE);
  if (!cart) {
    return {
      id: null,
      items: [],
      item_count: 0,
      total_amount: 0,
      updated_at: null,
    };
  }
  return serializeCart(cart);
}

/** POST /api/cart/add */
export const addToCart = asyncHandler(async (req, res) => {
  const dishId = req.body?.dish_id;
  const quantity = Math.max(1, Number(req.body?.quantity) || 1);

  if (!dishId || !mongoose.isValidObjectId(dishId)) {
    return res.status(400).json({ error: 'dish_id is required' });
  }

  const dish = await Dish.findById(dishId);
  if (!dish) return res.status(404).json({ error: 'Dish not found' });

  const restaurant = await Restaurant.findById(dish.restaurant_id);
  if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });

  const cart = await getOrCreateCart(req.user._id);
  const existing = cart.items.find((item) => String(item.dish_id) === String(dish._id));

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.items.push({
      dish_id: dish._id,
      restaurant_id: restaurant._id,
      quantity,
      price_at_add: mockDishPrice(dish.name, restaurant.price_range),
    });
  }

  await cart.save();
  const data = await loadPopulatedCart(req.user._id);
  res.status(existing ? 200 : 201).json({ data });
});

/** GET /api/cart */
export const getCart = asyncHandler(async (req, res) => {
  const data = await loadPopulatedCart(req.user._id);
  res.json({ data });
});

/** PUT /api/cart/update */
export const updateCartItem = asyncHandler(async (req, res) => {
  const itemId = req.body?.item_id || req.body?.itemId;
  const quantity = Number(req.body?.quantity);

  if (!itemId || !mongoose.isValidObjectId(itemId)) {
    return res.status(400).json({ error: 'item_id is required' });
  }
  if (!Number.isFinite(quantity) || quantity < 0) {
    return res.status(400).json({ error: 'quantity must be a non-negative number' });
  }

  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.id(itemId);
  if (!item) return res.status(404).json({ error: 'Cart item not found' });

  if (quantity === 0) {
    item.deleteOne();
  } else {
    item.quantity = Math.floor(quantity);
  }

  await cart.save();
  const data = await loadPopulatedCart(req.user._id);
  res.json({ data });
});

/** DELETE /api/cart/remove/:itemId */
export const removeCartItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  if (!mongoose.isValidObjectId(itemId)) {
    return res.status(400).json({ error: 'Invalid item id' });
  }

  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.id(itemId);
  if (!item) return res.status(404).json({ error: 'Cart item not found' });

  item.deleteOne();
  await cart.save();
  const data = await loadPopulatedCart(req.user._id);
  res.json({ data });
});

async function nextOrderNumber() {
  const count = await Order.countDocuments();
  return `HP-${10234 + count}`;
}

/** POST /api/checkout — mock order placement, no payment. */
export const checkout = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user_id: req.user._id })
    .populate(DISH_POPULATE)
    .populate(RESTAURANT_POPULATE);

  const liveItems = (cart?.items || []).filter((item) => item.dish_id && item.restaurant_id);
  if (!liveItems.length) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  const orderItems = liveItems.map((item) => {
    const dish = item.dish_id;
    const restaurant = item.restaurant_id;
    return {
      dish_name: dish.name,
      restaurant_name: restaurant.name,
      quantity: item.quantity,
      price: item.price_at_add,
      health_tags: dish.health_tags || [],
      allergens: dish.allergens || [],
    };
  });

  const total_amount = Number(
    orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
  );

  const order = await Order.create({
    user_id: req.user._id,
    items: orderItems,
    total_amount,
    status: 'placed',
    order_number: await nextOrderNumber(),
  });

  cart.items = [];
  await cart.save();

  res.status(201).json({
    data: {
      id: order._id.toString(),
      order_number: order.order_number,
      status: order.status,
      items: order.items,
      total_amount: order.total_amount,
      created_at: order.created_at,
      mock: true,
      message: 'Order placed. This is a demo checkout — no payment was taken.',
    },
  });
});

/** GET /api/orders */
export const listOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user_id: req.user._id }).sort({ created_at: -1 });
  res.json({
    data: orders.map((order) => ({
      id: order._id.toString(),
      order_number: order.order_number,
      status: order.status,
      items: order.items,
      total_amount: order.total_amount,
      created_at: order.created_at,
    })),
  });
});
