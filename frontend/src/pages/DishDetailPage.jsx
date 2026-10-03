import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import {
  HEALTH_TAGS,
  ALLERGENS,
  HEALTH_TAG_LABELS,
  ALLERGEN_LABELS,
  HEALTH_TAG_DESCRIPTIONS,
  HEALTH_TAG_COLORS,
  ALLERGEN_COLORS,
} from '../lib/constants.js';
import VoteControl from '../components/VoteControl.jsx';
import { Spinner, ErrorBanner } from '../components/ui.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import AddToCartButton from '../components/AddToCartButton.jsx';

export default function DishDetailPage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [dish, setDish] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTip, setEditingTip] = useState(false);
  const [tipDraft, setTipDraft] = useState('');
  const [savingTip, setSavingTip] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.getDish(id);
      setDish(res.data);
      setTipDraft(res.data.tip || '');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleVote(direction) {
    const res = await api.voteDish(dish.id, direction);
    setDish((prev) => ({ ...prev, ...res.data, my_vote: res.data.my_vote }));
    return res.data;
  }

  async function saveTip() {
    setSavingTip(true);
    try {
      const res = await api.updateDish(dish.id, { tip: tipDraft.trim() });
      setDish((prev) => ({ ...prev, tip: res.data.tip }));
      setEditingTip(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingTip(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-slate-400">
        <Spinner className="h-5 w-5" />
      </div>
    );
  }

  if (error || !dish) {
    return (
      <div className="space-y-3">
        <ErrorBanner message={error || 'Dish not found'} onRetry={load} />
        <Link to="/" className="text-sm text-brand-700 underline">
          ← Back to discover
        </Link>
      </div>
    );
  }

  const netScore = (dish.community_votes?.up || 0) - (dish.community_votes?.down || 0);
  const totalVotes = (dish.community_votes?.up || 0) + (dish.community_votes?.down || 0);

  return (
    <div className="space-y-4">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-brand-700 underline">
        ← Back to discover
      </Link>

      <article className="card p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-slate-900">{dish.name}</h1>
            {dish.restaurant && (
              <p className="mt-1 text-sm text-slate-500">
                <Link
                  to={`/restaurants/${dish.restaurant.id}`}
                  className="font-medium text-brand-700 underline"
                >
                  {dish.restaurant.name}
                </Link>
                {' · '}
                {dish.restaurant.cuisine_type} · {dish.restaurant.price_range}
              </p>
            )}
            {dish.description && <p className="mt-2 text-sm text-slate-600">{dish.description}</p>}
            <div className="mt-3">
              <AddToCartButton dish={dish} />
            </div>
          </div>
          <div className="shrink-0 rounded-lg bg-slate-50 px-4 py-2 text-center">
            <p
              className={`text-lg font-bold ${netScore >= 0 ? 'text-brand-700' : 'text-red-600'}`}
            >
              {netScore >= 0 ? '+' : ''}
              {netScore}
            </p>
            <p className="text-xs text-slate-500">{totalVotes} votes</p>
          </div>
        </div>

        <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
          <div>
            <h2 className="mb-2 text-sm font-semibold text-slate-800">Health tags</h2>
            {dish.health_tags?.length ? (
              <div className="space-y-2">
                {dish.health_tags.map((tag) => (
                  <div key={tag} className="flex flex-wrap items-center gap-2">
                    <span className={`badge ${HEALTH_TAG_COLORS[tag]}`}>{HEALTH_TAG_LABELS[tag]}</span>
                    <span className="text-xs text-slate-500">{HEALTH_TAG_DESCRIPTIONS[tag]}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No health tags recorded yet.</p>
            )}
          </div>

          <div>
            <h2 className="mb-2 text-sm font-semibold text-slate-800">Allergens</h2>
            {dish.allergens?.length ? (
              <div className="flex flex-wrap gap-1.5">
                {dish.allergens.map((a) => (
                  <span key={a} className={`badge ${ALLERGEN_COLORS[a]}`}>
                    {ALLERGEN_LABELS[a]}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">
                None declared. Always confirm with the restaurant.
              </p>
            )}
          </div>

          <div>
            <h2 className="mb-2 text-sm font-semibold text-slate-800">Ordering tip</h2>
            {editingTip ? (
              <div className="space-y-2">
                <input
                  value={tipDraft}
                  onChange={(e) => setTipDraft(e.target.value)}
                  className="input"
                  maxLength={220}
                  placeholder="e.g. Ask for no added sugar"
                />
                <div className="flex gap-2">
                  <button onClick={saveTip} disabled={savingTip} className="btn-primary text-xs">
                    {savingTip && <Spinner className="h-3 w-3" />}
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingTip(false);
                      setTipDraft(dish.tip || '');
                    }}
                    className="btn-secondary text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                <p className="text-sm text-amber-900">
                  {dish.tip || 'No tip yet. Add one to help others order it safely.'}
                </p>
                {isAuthenticated && (
                  <button
                    onClick={() => setEditingTip(true)}
                    className="shrink-0 text-xs font-medium text-amber-800 underline"
                  >
                    Edit
                  </button>
                )}
              </div>
            )}
          </div>

          <VoteControl dish={dish} onChange={handleVote} />
        </div>
      </article>
    </div>
  );
}
