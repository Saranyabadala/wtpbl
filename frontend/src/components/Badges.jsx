import {
  HEALTH_TAGS,
  ALLERGENS,
  HEALTH_TAG_LABELS,
  ALLERGEN_LABELS,
  HEALTH_TAG_COLORS,
  ALLERGEN_COLORS,
} from '../lib/constants.js';

/** Green-tinted badge for a health condition. */
export function HealthBadge({ tag, className = '' }) {
  if (!HEALTH_TAG_LABELS[tag]) return null;
  return (
    <span className={`badge ${HEALTH_TAG_COLORS[tag]} ${className}`}>
      {HEALTH_TAG_LABELS[tag]}
    </span>
  );
}

/** Warning-tinted badge for a declared allergen. */
export function AllergenBadge({ allergen, className = '' }) {
  if (!ALLERGEN_LABELS[allergen]) return null;
  return (
    <span className={`badge ${ALLERGEN_COLORS[allergen]} ${className}`}>
      <span aria-hidden="true">!</span>
      {ALLERGEN_LABELS[allergen]}
    </span>
  );
}

export function HealthBadgeList({ tags = [], limit, className = '' }) {
  const shown = limit ? tags.slice(0, limit) : tags;
  const overflow = limit ? tags.length - shown.length : 0;
  if (!shown.length && !overflow) return null;

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {shown.map((tag) => (
        <HealthBadge key={tag} tag={tag} />
      ))}
      {overflow > 0 && (
        <span className="badge bg-slate-100 text-slate-600 ring-slate-500/20">+{overflow} more</span>
      )}
    </div>
  );
}

export function AllergenBadgeList({ allergens = [], className = '' }) {
  if (!allergens.length) return null;
  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {allergens.map((a) => (
        <AllergenBadge key={a} allergen={a} />
      ))}
    </div>
  );
}

/** Toggle pill used in the filter bar and profile forms. */
export function ToggleChip({ active, onClick, children, colorClass, disabled, count }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`badge cursor-pointer py-1 transition ${
        active
          ? `${colorClass} ring-2 ring-offset-1`
          : 'bg-white text-slate-600 ring-slate-300 hover:bg-slate-100'
      } ${disabled ? 'cursor-not-allowed opacity-40' : ''}`}
    >
      {children}
      {count !== undefined && (
        <span className="ml-1 text-[11px] opacity-70">{count}</span>
      )}
    </button>
  );
}

export { HEALTH_TAGS, ALLERGENS, HEALTH_TAG_LABELS, ALLERGEN_LABELS, HEALTH_TAG_COLORS, ALLERGEN_COLORS };
