import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { Spinner } from './ui.jsx';
import { dishId as resolveDishId } from '../lib/format.js';

export default function AddToCartButton({ dish, dishId, className = '' }) {
  const id = dishId || resolveDishId(dish);
  const { isAuthenticated } = useAuth();
  const { cart, addItem, updateQuantity, removeItem } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [pending, setPending] = useState(false);

  const cartItem = cart?.items?.find((item) => (item.dish?.id || item.dish_id) === id);
  const quantity = cartItem?.quantity || 0;

  async function handleAction(actionFn) {
    if (!id) return;
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    setPending(true);
    try {
      await actionFn();
    } catch (err) {
      toast(err.message || 'Action failed', 'error');
    } finally {
      setPending(false);
    }
  }

  if (quantity > 0) {
    return (
      <div className={`flex items-center rounded-lg border border-brand-200 bg-brand-50 shadow-sm ${className}`}>
        <button
          type="button"
          disabled={pending}
          onClick={(e) => { e.preventDefault(); handleAction(() => quantity === 1 ? removeItem(cartItem.id) : updateQuantity(cartItem.id, quantity - 1)); }}
          className="flex h-8 w-8 items-center justify-center text-brand-700 hover:bg-brand-100 disabled:opacity-50 rounded-l-lg"
        >
          <span className="text-lg font-medium leading-none">-</span>
        </button>
        <div className="flex h-8 w-8 items-center justify-center text-sm font-semibold text-brand-900">
          {pending ? <Spinner className="h-3 w-3" /> : quantity}
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={(e) => { e.preventDefault(); handleAction(() => updateQuantity(cartItem.id, quantity + 1)); }}
          className="flex h-8 w-8 items-center justify-center text-brand-700 hover:bg-brand-100 disabled:opacity-50 rounded-r-lg"
        >
          <span className="text-lg font-medium leading-none">+</span>
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); handleAction(() => addItem(id)); toast('Added to cart'); }}
      disabled={pending}
      className={`relative inline-flex h-8 items-center justify-center rounded-lg border border-brand-200 bg-white px-4 text-xs font-bold text-brand-700 shadow-sm hover:bg-brand-50 disabled:opacity-50 ${className}`}
    >
      {pending && <Spinner className="absolute h-3 w-3" />}
      <span className={pending ? 'opacity-0' : ''}>ADD <span className="ml-0.5 text-sm font-normal">+</span></span>
    </button>
  );
}
