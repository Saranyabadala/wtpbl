import { useState, useCallback, useEffect } from 'react';
import {
  HEALTH_TAGS,
  ALLERGENS,
  HEALTH_TAG_LABELS,
  ALLERGEN_LABELS,
  HEALTH_TAG_COLORS,
  ALLERGEN_COLORS,
} from './Badges.jsx';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * The primary filter surface. Sits above the restaurant list and stays
 * deliberately visible on mobile.
 *
 * Two independent mechanisms per the spec:
 *  - manual multi-select health conditions (feature 5)
 *  - one-tap "Safe for me" using the saved profile (feature 4)
 */
export default function FilterBar({ filters, onChange, options, resultCount, loading }) {
  const { user, isAuthenticated } = useAuth();
  const [expanded, setExpanded] = useState(false);

  const toggleArray = useCallback(
    (key, value) => {
      const current = filters[key] || [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      onChange({ ...filters, [key]: next });
    },
    [filters, onChange]
  );

  const profileTags = user?.dietary_preferences || [];
  const profileAllergies = user?.allergies || [];
  const hasProfile = profileTags.length > 0 || profileAllergies.length > 0;

  // Turning on "Safe for me" with no saved preferences would silently do nothing,
  // so warn rather than pretend to filter.
  const safeForMeUnavailable = filters.safeForMe && (!isAuthenticated || !hasProfile);

  const activeCount =
    filters.healthTags.length +
    filters.cuisines.length +
    filters.prices.length +
    filters.excludeAllergens.length +
    (filters.safeForMe ? 1 : 0) +
    (filters.search ? 1 : 0);

  const clearAll = () => {
    onChange({
      healthTags: [],
      cuisines: [],
      prices: [],
      excludeAllergens: [],
      search: '',
      safeForMe: false,
      sort: 'distance',
    });
  };

  return (
    <div className="w-full" aria-label="Filters">
      {/* Saved-profile summary, if needed */}
      {isAuthenticated && hasProfile && (
        <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
          <span className="font-medium text-slate-600">Your profile:</span>
          {profileTags.map((tag) => (
            <span key={tag} className={`badge ${HEALTH_TAG_COLORS[tag]}`}>
              {HEALTH_TAG_LABELS[tag]}
            </span>
          ))}
          {profileAllergies.length > 0 && <span className="ml-1 font-medium text-slate-600">Allergies:</span>}
          {profileAllergies.map((a) => (
            <span key={a} className={`badge ${ALLERGEN_COLORS[a]}`}>
              {ALLERGEN_LABELS[a]}
            </span>
          ))}
        </div>
      )}

      {/* Health condition horizontal scrollable chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
        {HEALTH_TAGS.map((tag) => {
          const count = options?.tagCounts?.[tag];
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggleArray('healthTags', tag)}
              aria-pressed={filters.healthTags.includes(tag)}
              className={`flex-shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition whitespace-nowrap shadow-sm border ${
                filters.healthTags.includes(tag)
                  ? 'bg-brand-50 border-brand-200 text-brand-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {HEALTH_TAG_LABELS[tag]}
              {count !== undefined && <span className="ml-1 text-xs opacity-70">({count})</span>}
            </button>
          );
        })}
      </div>

      {/* Secondary filters, collapsed on mobile to keep the list above the fold */}
      <div className="p-4">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="flex w-full items-center justify-between text-sm font-semibold text-slate-800"
        >
          <span>More filters{activeCount ? ` (${activeCount} active)` : ''}</span>
          <svg
            className={`h-4 w-4 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.22 7.22a1 1 0 011.06 0L10 10.94l3.72-3.72a1 1 0 111.06 1.42l-4.25 4.25a1 1 0 01-1.42 0L5.22 8.28a1 1 0 010-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {expanded && (
          <div className="mt-4 space-y-4">
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Exclude allergens
              </h3>
              <div className="flex flex-wrap gap-2">
                {ALLERGENS.map((allergen) => (
                  <button
                    key={allergen}
                    type="button"
                    onClick={() => toggleArray('excludeAllergens', allergen)}
                    aria-pressed={filters.excludeAllergens.includes(allergen)}
                    className={`badge cursor-pointer py-1.5 text-xs transition ${
                      filters.excludeAllergens.includes(allergen)
                        ? `${ALLERGEN_COLORS[allergen]} ring-2 ring-offset-1`
                        : 'bg-white text-slate-600 ring-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {ALLERGEN_LABELS[allergen]}
                  </button>
                ))}
              </div>
            </div>

            {options?.cuisines?.length > 0 && (
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Cuisine
                </h3>
                <div className="flex flex-wrap gap-2">
                  {options.cuisines.map((cuisine) => (
                    <button
                      key={cuisine}
                      type="button"
                      onClick={() => toggleArray('cuisines', cuisine)}
                      aria-pressed={filters.cuisines.includes(cuisine)}
                      className={`badge cursor-pointer py-1.5 text-xs transition ${
                        filters.cuisines.includes(cuisine)
                          ? 'bg-slate-800 text-white ring-slate-800'
                          : 'bg-white text-slate-600 ring-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {cuisine}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {options?.prices?.length > 0 && (
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Price
                </h3>
                <div className="flex flex-wrap gap-2">
                  {options.prices.map((price) => (
                    <button
                      key={price}
                      type="button"
                      onClick={() => toggleArray('prices', price)}
                      aria-pressed={filters.prices.includes(price)}
                      className={`badge cursor-pointer py-1.5 text-xs transition ${
                        filters.prices.includes(price)
                          ? 'bg-slate-800 text-white ring-slate-800'
                          : 'bg-white text-slate-600 ring-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {price}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Sort by
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'distance', label: 'Nearest' },
                  { value: 'rating', label: 'Top rated' },
                  { value: 'price_asc', label: 'Price: low' },
                  { value: 'price_desc', label: 'Price: high' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onChange({ ...filters, sort: option.value })}
                    aria-pressed={filters.sort === option.value}
                    className={`badge cursor-pointer py-1.5 text-xs transition ${
                      filters.sort === option.value
                        ? 'bg-brand-600 text-white ring-brand-600'
                        : 'bg-white text-slate-600 ring-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Result summary bar */}
      <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-4 py-2.5 text-xs">
        <span className="text-slate-600">
          {loading ? 'Searching...' : `${resultCount} restaurant${resultCount === 1 ? '' : 's'}`}
          {filters.safeForMe && isAuthenticated && ' safe for you'}
        </span>
        {activeCount > 0 && (
          <button type="button" onClick={clearAll} className="font-medium text-brand-700 underline">
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
