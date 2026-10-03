import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { HealthBadgeList, AllergenBadgeList } from '../components/Badges.jsx';
import { EmptyState, ErrorBanner, Spinner } from '../components/ui.jsx';
import AddToCartButton from '../components/AddToCartButton.jsx';
import {
  HEALTH_TAGS,
  HEALTH_TAG_LABELS,
  HEALTH_TAG_COLORS,
} from '../lib/constants.js';

const SORTS = [
  { value: 'confidence', label: 'Highest confidence' },
  { value: 'most_voted', label: 'Most voted' },
  { value: 'newest', label: 'Newest' },
  { value: 'name', label: 'A-Z' },
];

function DishRow({ dish }) {
  const up = dish.community_votes?.up || 0;
  const down = dish.community_votes?.down || 0;
  const net = up - down;

  return (
    <article className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Link to={`/dishes/${dish.id}`} className="text-base font-semibold text-slate-900 hover:text-brand-700">
            {dish.name}
          </Link>
          {dish.restaurant && (
            <p className="mt-0.5 text-xs text-slate-500">
              <Link to={`/restaurants/${dish.restaurant.id}`} className="text-brand-700 underline">
                {dish.restaurant.name}
              </Link>
              {' · '}
              {dish.restaurant.cuisine_type}
            </p>
          )}
          <HealthBadgeList tags={dish.health_tags || []} className="mt-2" />
          <AllergenBadgeList allergens={dish.allergens || []} className="mt-1.5" />
          {dish.tip && <p className="mt-2 text-xs text-slate-500">Tip: {dish.tip}</p>}
          <div className="mt-3">
            <AddToCartButton dish={dish} />
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className={`text-lg font-bold ${net >= 0 ? 'text-brand-700' : 'text-red-600'}`}>
            {net >= 0 ? '+' : ''}
            {net}
          </p>
          <p className="text-[11px] text-slate-400">{up + down} votes</p>
        </div>
      </div>
    </article>
  );
}

export default function DishesPage() {
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [tags, setTags] = useState(
    searchParams.get('health_tags') ? searchParams.get('health_tags').split(',').filter(Boolean) : []
  );
  const sort = searchParams.get('sort') || 'confidence';

  const query = useMemo(
    () => ({
      health_tags: tags,
      search: searchParams.get('search') || '',
      sort,
      limit: 50,
    }),
    [tags, searchParams, sort]
  );

  const load = useCallback(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    api
      .listDishes(query, controller.signal)
      .then((res) => setDishes(res.data))
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [query]);

  useEffect(() => load(), [load, isAuthenticated]);

  function syncParams(nextTags, nextSearch) {
    const params = {};
    if (nextTags.length) params.health_tags = nextTags.join(',');
    if (nextSearch) params.search = nextSearch;
    if (sort !== 'confidence') params.sort = sort;
    setSearchParams(params, { replace: true });
  }

  function toggleTag(tag) {
    const next = tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag];
    setTags(next);
    syncParams(next, searchParams.get('search') || '');
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    syncParams(tags, search.trim());
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">All dishes</h1>
        <p className="mt-1 text-sm text-slate-500">
          Browse the full community-tagged catalogue, sorted by vote confidence.
        </p>
      </div>

      <div className="card space-y-3 p-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col gap-2 sm:flex-row">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dishes"
            className="input flex-1"
            aria-label="Search dishes"
          />
          <button type="submit" className="btn-secondary text-sm">
            Search
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          {HEALTH_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              aria-pressed={tags.includes(tag)}
              className={`badge cursor-pointer py-1.5 text-xs transition ${
                tags.includes(tag)
                  ? `${HEALTH_TAG_COLORS[tag]} ring-2 ring-offset-1`
                  : 'bg-white text-slate-600 ring-slate-300 hover:bg-slate-100'
              }`}
            >
              {HEALTH_TAG_LABELS[tag]}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
          <span className="text-xs font-medium text-slate-500">Sort</span>
          {SORTS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                const params = {};
                if (tags.length) params.health_tags = tags.join(',');
                if (searchParams.get('search')) params.search = searchParams.get('search');
                if (option.value !== 'confidence') params.sort = option.value;
                setSearchParams(params, { replace: true });
              }}
              aria-pressed={sort === option.value}
              className={`badge cursor-pointer py-1 text-xs transition ${
                sort === option.value
                  ? 'bg-slate-800 text-white ring-slate-800'
                  : 'bg-white text-slate-600 ring-slate-300 hover:bg-slate-100'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <ErrorBanner message={error} onRetry={load} />

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-slate-400">
          <Spinner className="h-5 w-5" />
          Loading dishes
        </div>
      ) : dishes.length === 0 ? (
        <EmptyState title="No dishes found" message="Try a different search or clear the filters." />
      ) : (
        <div className="space-y-3">
          {dishes.map((dish) => (
            <DishRow key={dish.id} dish={dish} />
          ))}
        </div>
      )}
    </div>
  );
}
