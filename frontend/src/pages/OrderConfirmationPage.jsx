import { Link, Navigate, useLocation } from 'react-router-dom';
import { formatInr } from '../lib/format.js';

export default function OrderConfirmationPage() {
  const location = useLocation();
  const order = location.state?.order;

  if (!order) {
    return <Navigate to="/orders" replace />;
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="card space-y-3 p-6 text-center">
        <p className="text-sm font-medium text-brand-700">Demo order placed</p>
        <h1 className="text-2xl font-bold text-slate-900">Order placed!</h1>
        <p className="text-lg font-semibold text-slate-800">Order #{order.order_number}</p>
        <p className="text-sm text-slate-500">
          Total {formatInr(order.total_amount)}. No payment was collected — this is a UI
          simulation for the college demo.
        </p>
        <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-center">
          <Link to="/" className="btn-primary">
            Back to Restaurants
          </Link>
          <Link to="/orders" className="btn-secondary">
            View order history
          </Link>
        </div>
      </div>
    </div>
  );
}
