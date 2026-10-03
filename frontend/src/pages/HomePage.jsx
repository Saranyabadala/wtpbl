import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useOrigin } from '../hooks/useOrigin.js';
import { useAuth } from '../context/AuthContext.jsx';
import FilterBar from '../components/FilterBar.jsx';
import RestaurantCard, { RestaurantCardSkeleton } from '../components/RestaurantCard.jsx';
import { EmptyState, ErrorBanner, Spinner } from '../components/ui.jsx';

const DEFAULT_FILTERS = {
  healthTags: [],
  cuisines: [],
  prices: [],
  excludeAllergens: [],
  search: '',
  safeForMe: false,
  sort: 'distance',
};

/** Filter state is mirrored into the URL so results are shareable. */
function filtersToParams(filters) {
  return {
    health_tags: filters.healthTags,
    cuisine: filters.cuisines,
    price: filters.prices,
    avoid_allergens: filters.excludeAllergens,
    search: filters.search,
    safe_for_me: filters.safeForMe ? 'true' : '',
    sort: filters.sort,
  };
}

function paramsToFilters(params) {
  const list = (key) => (params.get(key) ? params.get(key).split(',').filter(Boolean) : []);
  return {
    healthTags: list('health_tags'),
    cuisines: list('cuisine'),
    prices: list('price'),
    excludeAllergens: list('avoid_allergens'),
    search: params.get('search') || '',
    safeForMe: params.get('safe_for_me') === 'true',
    sort: params.get('sort') || 'distance',
  };
}

export default function HomePage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { origin, requestBrowserLocation, useDefaultLocation } = useOrigin();
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => paramsToFilters(searchParams), [searchParams]);
  const [restaurants, setRestaurants] = useState([]);
  const [meta, setMeta] = useState(null);
  const [options, setOptions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const updateFilters = useCallback(
    (next) => {
      const params = {};
      Object.entries(filtersToParams(next)).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          if (value.length) params[key] = value.join(',');
        } else if (value) {
          params[key] = String(value);
        }
      });
      setSearchParams(params, { replace: true });
    },
    [setSearchParams]
  );

  // Load cuisines / prices / tag counts once for the filter bar.
  useEffect(() => {
    api
      .filterOptions()
      .then((res) =>
        setOptions({
          cuisines: res.cuisines,
          prices: res.prices,
          tagCounts: Object.fromEntries(res.health_tags.map((t) => [t.tag, t.count])),
        })
      )
      .catch(() => setOptions({ cuisines: [], prices: [], tagCounts: {} }));
  }, []);

  // Fetch restaurants whenever the filters or origin change.
  useEffect(() => {
    if (origin.loading) return undefined;

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    api
      .listRestaurants(
        {
          ...filtersToParams(filters),
          lat: origin.lat,
          lng: origin.lng,
          limit: 50,
        },
        controller.signal
      )
      .then((res) => {
        setRestaurants(res.data);
        setMeta(res.meta);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [filters, origin.lat, origin.lng, origin.loading, reloadKey, isAuthenticated, authLoading]);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-slate-900 px-6 py-10 text-white sm:px-12 sm:py-16">
        <div className="relative z-10 mx-auto max-w-3xl text-center sm:text-left">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
            What's on your plate today?
          </h1>
          <p className="mt-4 text-lg text-slate-300">
            Discover delicious food that fits your health needs.
          </p>

          <div className="mt-8 relative max-w-2xl">
            <label htmlFor="hero-search" className="sr-only">Search for restaurants, dishes or cuisines</label>
            <input
              id="hero-search"
              type="search"
              value={filters.search}
              onChange={(e) => updateFilters({ ...filters, search: e.target.value })}
              placeholder="Search for restaurants, dishes or cuisines..."
              className="w-full rounded-xl border-0 py-4 pl-12 pr-4 text-slate-900 shadow-xl outline-none focus:ring-2 focus:ring-brand-500 text-lg"
            />
            <svg
              className="pointer-events-none absolute left-4 top-4 h-6 w-6 text-slate-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9 3.5a5.5 5.5 0 103.4 9.83l3.63 3.64a1 1 0 001.42-1.42l-3.64-3.63A5.5 5.5 0 009 3.5zM5 9a4 4 0 118 0 4 4 0 01-8 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          <div className="mt-8 flex items-center gap-4 overflow-x-auto no-scrollbar pb-2 sm:justify-start">
            {['Indian', 'Healthy', 'Fast Food', 'South Indian', 'Chinese', 'North Indian', 'Diet Friendly'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  const current = filters.cuisines || [];
                  const next = current.includes(cat) ? current.filter(c => c !== cat) : [...current, cat];
                  updateFilters({ ...filters, cuisines: next });
                }}
                className={`flex-shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition ${
                  filters.cuisines.includes(cat)
                    ? 'bg-white text-slate-900'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Safe For Me Section */}
      <section className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-brand-200 bg-brand-50 p-6 shadow-sm">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <span className="text-2xl">🛡️</span> Safe for Me
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Show only restaurants and dishes that match my saved health preferences.
          </p>
        </div>
        <button
          type="button"
          onClick={() => updateFilters({ ...filters, safeForMe: !filters.safeForMe })}
          disabled={!isAuthenticated}
          className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
            filters.safeForMe ? 'bg-brand-600' : 'bg-slate-300'
          } ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={!isAuthenticated ? 'Log in to use Safe for me' : ''}
        >
          <span className="sr-only">Use Safe for Me</span>
          <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              filters.safeForMe ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
      </section>

      {/* Health Filters */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-slate-900">Eat for your health</h2>
        <FilterBar
          filters={filters}
          onChange={updateFilters}
          options={options}
          resultCount={restaurants.length}
          loading={loading}
        />
      </section>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <p>
          Distances from{' '}
          <span className="font-medium text-slate-700">{origin.label}</span>
          {origin.source === 'default' && (
            <>
              <span className="ml-1 text-slate-400">(fallback)</span>
              <button
                type="button"
                onClick={requestBrowserLocation}
                className="ml-2 font-medium text-brand-700 underline"
              >
                use my location
              </button>
            </>
          )}
        </p>
        {meta?.data_source === 'seed' && (
          <p className="text-slate-400">Showing seeded demo restaurants</p>
        )}
      </div>

      <ErrorBanner message={error} onRetry={() => setReloadKey((k) => k + 1)} />

      {/* Restaurant Grid */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-slate-900">Top restaurants near you</h2>
        
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <RestaurantCardSkeleton key={i} />
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <EmptyState
            title="No restaurants match these filters"
            message={
              filters.safeForMe && isAuthenticated
                ? 'Nothing nearby satisfies every saved condition. Try turning off "Safe for me" or removing a tag.'
                : 'Try removing a health tag or widening your search.'
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        )}

        <div className="pt-8 text-center">
          <button
            type="button"
            onClick={useDefaultLocation}
            className="text-xs text-slate-400 hover:text-slate-600 underline"
          >
            Reset to default location
          </button>
        </div>
      </section>
    </div>
  );
}
