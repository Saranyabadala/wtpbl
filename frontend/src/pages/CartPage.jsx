import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { HealthBadgeList, AllergenBadgeList } from '../components/Badges.jsx';
import { EmptyState, ErrorBanner, Spinner } from '../components/ui.jsx';
import { formatInr } from '../lib/format.js';
import { useState } from 'react';

export default function CartPage() {
  const { cart, loading, updateQuantity, removeItem } = useCart();
  const { toast } = useToast();
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  async function changeQty(item, next) {
    setError(null);
    setBusyId(item.id);
    try {
      if (next < 1) await removeItem(item.id);
      else await updateQuantity(item.id, next);
    } catch (err) {
      setError(err.message);
      toast(err.message, 'error');
    } finally {
      setBusyId(null);
    }
  }

  async function handleRemove(item) {
    setError(null);
    setBusyId(item.id);
    try {
      await removeItem(item.id);
      toast('Removed from cart');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  if (loading && !cart.items?.length) {
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-slate-400">
        <Spinner className="h-5 w-5" /> Loading cart
      </div>
    );
  }

  const items = cart.items || [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Your cart</h1>
        <p className="mt-1 text-sm text-slate-500">
          Demo checkout only — no payment is taken. Health tags stay visible so you can
          double-check each dish.
        </p>
      </div>

      <ErrorBanner message={error} />

      {items.length === 0 ? (
        <EmptyState
          title="Cart is empty"
          message="Add a dish from a restaurant or the catalogue."
          action={
            <Link to="/" className="btn-primary text-sm">
              Browse restaurants
            </Link>
          }
        />
      ) : (
        <>
          <div className="space-y-3">
            {items.map((item) => (
              <article key={item.id} className="card p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1 space-y-2">
                    <h2 className="text-base font-semibold text-slate-900">
                      {item.dish?.name || 'Dish'}
                    </h2>
                    {item.restaurant && (
                      <p className="text-xs text-slate-500">
                        <Link
                          to={`/restaurants/${item.restaurant.id}`}
                          className="text-brand-700 underline"
                        >
                          {item.restaurant.name}
                        </Link>
                        {item.restaurant.cuisine_type ? ` · ${item.restaurant.cuisine_type}` : ''}
                      </p>
                    )}
                    <HealthBadgeList tags={item.dish?.health_tags || []} />
                    <AllergenBadgeList allergens={item.dish?.allergens || []} />
                  </div>
                  <div className="flex flex-col items-start gap-2 sm:items-end">
                    <p className="text-sm font-semibold text-slate-900">
                      {formatInr(item.line_total)}
                    </p>
                    <p className="text-xs text-slate-400">{formatInr(item.price_at_add)} each</p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="btn-secondary px-2 py-1 text-xs"
                        disabled={busyId === item.id}
                        onClick={() => changeQty(item, item.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="min-w-[1.5rem] text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        className="btn-secondary px-2 py-1 text-xs"
                        disabled={busyId === item.id}
                        onClick={() => changeQty(item, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      className="text-xs font-medium text-red-600 underline"
                      disabled={busyId === item.id}
                      onClick={() => handleRemove(item)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-base font-semibold text-slate-900">
              Total <span className="ml-2">{formatInr(cart.total_amount)}</span>
            </p>
            <Link to="/checkout" className="btn-primary">
              Proceed to Checkout
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
