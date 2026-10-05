import { Link } from 'react-router-dom';
import { HealthBadgeList, AllergenBadgeList } from './Badges.jsx';
import { StarRating, Spinner } from './ui.jsx';
import AddToCartButton from './AddToCartButton.jsx';

function PriceRange({ value }) {
  if (!value) return null;
  return (
    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600">
      {value}
    </span>
  );
}

function DishPreviewRow({ dish }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg px-2 py-2 transition hover:bg-slate-50">
      <Link to={`/dishes/${dish.id}`} className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-800">{dish.name}</p>
        {dish.tip && <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{dish.tip}</p>}
        <div className="mt-1.5 flex flex-wrap gap-1">
          <HealthBadgeList tags={dish.health_tags} limit={3} />
          <AllergenBadgeList allergens={dish.allergens} />
        </div>
      </Link>
      <div className="flex shrink-0 flex-col items-end gap-2">
        {dish.total_votes > 0 && (
          <span
            className="text-xs text-slate-400"
            title={`${dish.total_votes} community votes on tag accuracy`}
          >
            {dish.total_votes} votes
          </span>
        )}
        <AddToCartButton dish={dish} />
      </div>
    </div>
  );
}

export default function RestaurantCard({ restaurant, className = '' }) {
  // Use a placeholder image if none exists
  const fallbackUrl = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800&h=600';
  const imageUrl = restaurant.image_url || fallbackUrl;

  return (
    <Link
      to={`/restaurants/${restaurant.id}`}
      className={`group block overflow-hidden rounded-2xl bg-white shadow-card transition-all hover:-translate-y-1 hover:shadow-soft ${className}`}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <img
          src={imageUrl}
          alt={restaurant.name}
          onError={(e) => { e.target.onerror = null; e.target.src = fallbackUrl; }}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Gradient Overlay for text readability if we were to add text on image, Swiggy uses a dark gradient at the bottom for offers */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate text-lg font-bold text-slate-900 group-hover:text-brand-600">{restaurant.name}</h3>
          <div className="flex shrink-0 items-center gap-1 rounded bg-brand-600 px-1.5 py-0.5 text-xs font-bold text-white shadow-sm">
            <span>⭐</span>
            <span>{restaurant.rating || '4.3'}</span>
          </div>
        </div>
        
        <p className="mt-1 truncate text-sm text-slate-600">
          {restaurant.cuisine_type || 'Healthy, Indian'}
        </p>

        <div className="mt-1.5 flex items-center gap-2 text-xs font-medium text-slate-500">
          <PriceRange value={restaurant.price_range} />
          <span>•</span>
          <span>{restaurant.distance_label || '2.4 km'}</span>
        </div>

        <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <p className="text-xs font-medium text-slate-600">
            <span className="font-bold text-brand-700">{restaurant.dish_count || 12}</span> healthy options
          </p>
        </div>
      </div>
    </Link>
  );
}

export function RestaurantCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-card">
      <div className="aspect-[4/3] w-full animate-pulse bg-slate-200"></div>
      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200"></div>
          <div className="h-5 w-10 animate-pulse rounded bg-slate-200"></div>
        </div>
        <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200"></div>
        <div className="mt-3 border-t border-slate-100 pt-3">
          <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200"></div>
        </div>
      </div>
    </div>
  );
}
