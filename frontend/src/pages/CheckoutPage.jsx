import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { HealthBadgeList, AllergenBadgeList } from '../components/Badges.jsx';
import { Spinner } from '../components/ui.jsx';
import { formatInr } from '../lib/format.js';

export default function CheckoutPage() {
  const { cart, checkout } = useCart();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  const items = cart.items || [];
  if (!items.length && !pending) {
    return <Navigate to="/cart" replace />;
  }

  async function placeOrder() {
    setPending(true);
    setError(null);
    try {
      const order = await checkout();
      navigate('/order-placed', { replace: true, state: { order } });
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-4">
      <Link to="/cart" className="inline-flex text-sm text-brand-700 underline">
        ← Back to cart
      </Link>
      <div>
        <h1 className="text-xl font-bold text-slate-900">Order summary</h1>
        <p className="mt-1 text-sm text-slate-500">
          This is a mock checkout for the demo. Place Order does not charge a card or open a
          payment gateway.
        </p>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <article key={item.id} className="card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1.5">
                <h2 className="font-semibold text-slate-900">{item.dish?.name}</h2>
                <p className="text-xs text-slate-500">
                  {item.restaurant?.name} · qty {item.quantity}
                </p>
                <HealthBadgeList tags={item.dish?.health_tags || []} />
                <AllergenBadgeList allergens={item.dish?.allergens || []} />
              </div>
              <p className="shrink-0 text-sm font-semibold">{formatInr(item.line_total)}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="card space-y-3 p-4">
        <div className="flex items-center justify-between text-base font-semibold">
          <span>Total</span>
          <span>{formatInr(cart.total_amount)}</span>
        </div>
        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        <button type="button" className="btn-primary w-full" disabled={pending} onClick={placeOrder}>
          {pending && <Spinner className="h-4 w-4" />}
          Place Order
        </button>
      </div>
    </div>
  );
}
