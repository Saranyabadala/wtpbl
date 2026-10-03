import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext(null);

const EMPTY = { items: [], item_count: 0, total_amount: 0 };

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(EMPTY);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(EMPTY);
      return EMPTY;
    }
    setLoading(true);
    try {
      const res = await api.getCart();
      setCart(res.data);
      return res.data;
    } catch {
      setCart(EMPTY);
      return EMPTY;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = useCallback(
    async (dishId, quantity = 1) => {
      const res = await api.addToCart({ dish_id: dishId, quantity });
      setCart(res.data);
      return res.data;
    },
    []
  );

  const updateQuantity = useCallback(async (itemId, quantity) => {
    const res = await api.updateCart({ item_id: itemId, quantity });
    setCart(res.data);
    return res.data;
  }, []);

  const removeItem = useCallback(async (itemId) => {
    const res = await api.removeCartItem(itemId);
    setCart(res.data);
    return res.data;
  }, []);

  const checkout = useCallback(async () => {
    const res = await api.checkout();
    setCart(EMPTY);
    return res.data;
  }, []);

  const value = useMemo(
    () => ({
      cart,
      loading,
      itemCount: cart.item_count || 0,
      refresh,
      addItem,
      updateQuantity,
      removeItem,
      checkout,
    }),
    [cart, loading, refresh, addItem, updateQuantity, removeItem, checkout]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside a CartProvider');
  return ctx;
}
