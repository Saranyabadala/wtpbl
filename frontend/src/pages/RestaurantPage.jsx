import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useOrigin } from '../hooks/useOrigin.js';
import { useAuth } from '../context/AuthContext.jsx';
import { HealthBadgeList, AllergenBadgeList } from '../components/Badges.jsx';
import { StarRating, EmptyState, ErrorBanner, Spinner } from '../components/ui.jsx';
import VoteControl from '../components/VoteControl.jsx';
import AddDishForm from '../components/AddDishForm.jsx';
import AddToCartButton from '../components/AddToCartButton.jsx';

export default function RestaurantPage() {
  const { id } = useParams();
  const { origin, requestBrowserLocation } = useOrigin();
  const { isAuthenticated } = useAuth();

  const [restaurant, setRestaurant] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [onlyGlutenFree, setOnlyGlutenFree] = useState(false);
  const [safeForMe, setSafeForMe] = useState(false);

  const load = useCallback(async () => {
    if (!id || origin.loading) return;
    setLoading(true);
    setError(null);
    try {
      const params = { lat: origin.lat, lng: origin.lng };
      if (onlyGlutenFree) params.health_tags = ['gluten_free'];
      if (safeForMe) params.safe_for_me = true;
      const res = await api.getRestaurant(id, params);
      setRestaurant(res.data);
      setDishes(res.dishes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, origin.lat, origin.lng, origin.loading, onlyGlutenFree, safeForMe]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleVote(dishId, direction) {
    const res = await api.voteDish(dishId, direction);
    setDishes((prev) =>
      prev.map((d) => (d.id === dishId ? { ...d, ...res.data, my_vote: res.data.my_vote } : d))
    );
    return res.data;
  }

  function onDishCreated(dish) {
    setDishes((prev) => [dish, ...prev]);
    setShowAddForm(false);
  }

  return (
    <div className="space-y-6">
      <Link to="/" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-brand-600">
        ← Back to discover
      </Link>

      <ErrorBanner message={error} onRetry={load} />

      {loading && !restaurant && (
        <div className="space-y-6">
          <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        </div>
      )}

      {restaurant && (
        <header className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="relative h-48 w-full bg-slate-200 sm:h-64">
            <img
              src={restaurant.image_url || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=1200&h=400`}
              alt={restaurant.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 text-white">
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{restaurant.name}</h1>
              <p className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-200">
                <span>{restaurant.cuisine_type}</span>
                <span>•</span>
                <span>{restaurant.price_range}</span>
                <span>•</span>
                <span>{restaurant.address}</span>
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 p-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-bold text-white shadow-sm">
                <span>⭐</span>
                <span>{restaurant.rating || '4.3'}</span>
              </div>
              <div className="text-sm font-medium text-slate-600">
                {restaurant.distance_label || '2.4 km'}
              </div>
              <div className="flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-700">
                <span>🛡️</span>
                {restaurant.dish_count || 12} health-friendly dishes
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setOnlyGlutenFree((v) => !v)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${onlyGlutenFree ? 'bg-brand-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                aria-pressed={onlyGlutenFree}
              >
                🌾 Gluten-free only
              </button>
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={() => setSafeForMe((v) => !v)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${safeForMe ? 'bg-brand-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                  aria-pressed={safeForMe}
                >
                  🛡️ Safe for me
                </button>
              )}
            </div>
          </div>
        </header>
      )}

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Menu</h2>
          <button
            type="button"
            onClick={() => setShowAddForm((v) => !v)}
            className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition"
          >
            {showAddForm ? 'Cancel' : '+ Add Dish'}
          </button>
        </div>

        {showAddForm && restaurant && (
          <div className="rounded-2xl bg-white p-6 shadow-card">
            <AddDishForm restaurantId={restaurant.id} onCreated={onDishCreated} onCancel={() => setShowAddForm(false)} />
          </div>
        )}

        {loading && restaurant && (
          <div className="flex justify-center py-12">
            <Spinner className="h-8 w-8 text-brand-500" />
          </div>
        )}

        {!loading && dishes.length === 0 && (
          <EmptyState
            title="No dishes match these filters"
            message="Try clearing your filters or add a new dish to the menu."
          />
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {dishes.map((dish) => (
            <article key={dish.id} className="group relative flex overflow-hidden rounded-2xl bg-white shadow-card transition-all hover:shadow-soft">
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 leading-tight">{dish.name}</h3>
                    <p className="mt-1 text-sm font-bold text-slate-700">
                      ₹{Math.floor(Math.random() * 200 + 100)}
                    </p>
                  </div>
                  <div className="shrink-0 scale-90 origin-top-right">
                    <VoteControl dish={dish} onChange={(dir) => handleVote(dish.id, dir)} />
                  </div>
                </div>
                
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <HealthBadgeList tags={dish.health_tags} />
                  <AllergenBadgeList allergens={dish.allergens} />
                </div>

                {dish.description && (
                  <p className="mt-3 text-sm text-slate-500 line-clamp-2">{dish.description}</p>
                )}
                
                {dish.tip && (
                  <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-green-50 px-2.5 py-1.5 text-xs font-medium text-green-700">
                    <span>💡</span> {dish.tip}
                  </div>
                )}
                
                <div className="mt-auto pt-4 flex justify-between items-center">
                  <div className="text-xs font-medium text-slate-500">
                    {dish.total_votes > 0 ? (
                      <span className="flex items-center gap-1"><span className="text-brand-600 font-bold">{dish.total_votes}</span> votes on health accuracy</span>
                    ) : (
                      'Be the first to vote'
                    )}
                  </div>
                  <AddToCartButton dish={dish} />
                </div>
              </div>
              <div className="relative w-1/3 shrink-0 bg-slate-100">
                <img src={`https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400&h=400`} alt={dish.name} className="h-full w-full object-cover" />
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[90%] flex justify-center">
                   {/* Add to cart could also go here for the traditional swiggy style, but we placed it above */}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
