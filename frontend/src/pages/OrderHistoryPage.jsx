import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { HealthBadgeList, AllergenBadgeList } from '../components/Badges.jsx';
import { EmptyState, ErrorBanner, Spinner } from '../components/ui.jsx';
import { formatInr } from '../lib/format.js';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .listOrders()
      .then((res) => {
        if (!cancelled) setOrders(res.data || []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Order history</h1>
        <p className="mt-1 text-sm text-slate-500">Past mock orders from this demo account.</p>
      </div>

      <ErrorBanner message={error} />

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-12 text-slate-400">
          <Spinner className="h-5 w-5" /> Loading orders
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          message="Place a mock order from the cart to see it here."
          action={
            <Link to="/" className="btn-primary text-sm">
              Browse restaurants
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <article key={order.id} className="card space-y-3 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="font-semibold text-slate-900">Order #{order.order_number}</h2>
                  <p className="text-xs text-slate-500">
                    {order.created_at
                      ? new Date(order.created_at).toLocaleString()
                      : ''}
                    {' · '}
                    <span className="capitalize">{order.status}</span>
                  </p>
                </div>
                <p className="text-sm font-semibold">{formatInr(order.total_amount)}</p>
              </div>
              <ul className="space-y-2">
                {order.items.map((item, index) => (
                  <li key={`${order.id}-${index}`} className="border-t border-slate-100 pt-2">
                    <div className="flex justify-between gap-2 text-sm">
                      <span className="font-medium text-slate-800">
                        {item.dish_name}{' '}
                        <span className="font-normal text-slate-500">× {item.quantity}</span>
                      </span>
                      <span className="text-slate-600">
                        {formatInr(item.price * item.quantity)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{item.restaurant_name}</p>
                    <HealthBadgeList tags={item.health_tags || []} className="mt-1.5" />
                    <AllergenBadgeList allergens={item.allergens || []} className="mt-1" />
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
