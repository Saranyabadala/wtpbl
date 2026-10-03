export function formatInr(amount) {
  const n = Number(amount) || 0;
  return `₹${n.toFixed(0)}`;
}

export function dishId(dish) {
  if (!dish) return null;
  return dish.id || dish._id || null;
}
