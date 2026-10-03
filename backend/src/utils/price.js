/**
 * Demo prices derived from restaurant price_range + dish name.
 * Seed data has no per-dish prices; this keeps checkout demoable without
 * changing the seed file.
 */
const BASE_BY_RANGE = {
  $: 89,
  $$: 179,
  $$$: 329,
  $$$$: 549,
};

export function mockDishPrice(dishName, priceRange) {
  const base = BASE_BY_RANGE[priceRange] || 179;
  const name = String(dishName || '');
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash + name.charCodeAt(i) * (i + 1)) % 97;
  }
  return base + hash;
}
