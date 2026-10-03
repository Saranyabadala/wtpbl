import { useState } from 'react';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Spinner } from './ui.jsx';
import {
  HEALTH_TAGS,
  ALLERGENS,
  HEALTH_TAG_LABELS,
  ALLERGEN_LABELS,
  HEALTH_TAG_COLORS,
  ALLERGEN_COLORS,
} from './Badges.jsx';

/** Community contribution form. Any logged-in user can add a dish. */
export default function AddDishForm({ restaurantId, onCreated, onCancel }) {
  const { isAuthenticated } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [allergens, setAllergens] = useState([]);
  const [tip, setTip] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  function toggle(list, setList, value) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isAuthenticated) return;

    if (!name.trim()) {
      setError('Dish name is required');
      return;
    }
    if (!tags.length) {
      setError('Select at least one health tag');
      return;
    }

    setPending(true);
    setError(null);
    try {
      const res = await api.createDish({
        name: name.trim(),
        restaurant_id: restaurantId,
        description: description.trim(),
        health_tags: tags,
        allergens,
        tip: tip.trim(),
      });
      onCreated?.(res.data);
      setName('');
      setDescription('');
      setTags([]);
      setAllergens([]);
      setTip('');
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-600">
        <a href="/login" className="font-medium text-brand-700 underline">
          Log in
        </a>{' '}
        to add a dish and share health tags with the community.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="dish-name" className="mb-1 block text-sm font-medium text-slate-700">
          Dish name <span className="text-red-500">*</span>
        </label>
        <input
          id="dish-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Moong Dal Khichdi"
          className="input"
          maxLength={80}
        />
      </div>

      <div>
        <span className="mb-1.5 block text-sm font-medium text-slate-700">
          Health tags <span className="text-red-500">*</span>
        </span>
        <div className="flex flex-wrap gap-2">
          {HEALTH_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggle(tags, setTags, tag)}
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
      </div>

      <div>
        <span className="mb-1.5 block text-sm font-medium text-slate-700">Allergens</span>
        <div className="flex flex-wrap gap-2">
          {ALLERGENS.map((allergen) => (
            <button
              key={allergen}
              type="button"
              onClick={() => toggle(allergens, setAllergens, allergen)}
              aria-pressed={allergens.includes(allergen)}
              className={`badge cursor-pointer py-1.5 text-xs transition ${
                allergens.includes(allergen)
                  ? `${ALLERGEN_COLORS[allergen]} ring-2 ring-offset-1`
                  : 'bg-white text-slate-600 ring-slate-300 hover:bg-slate-100'
              }`}
            >
              {ALLERGEN_LABELS[allergen]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="dish-tip" className="mb-1 block text-sm font-medium text-slate-700">
          Tip for ordering it safely
        </label>
        <input
          id="dish-tip"
          value={tip}
          onChange={(e) => setTip(e.target.value)}
          placeholder="e.g. Ask for no added sugar"
          className="input"
          maxLength={220}
        />
        <p className="mt-1 text-xs text-slate-400">{tip.length}/220</p>
      </div>

      <div>
        <label htmlFor="dish-desc" className="mb-1 block text-sm font-medium text-slate-700">
          Description (optional)
        </label>
        <textarea
          id="dish-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="Short description of preparation"
          className="input resize-none"
          maxLength={400}
        />
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="btn-primary">
          {pending && <Spinner className="h-4 w-4" />}
          {pending ? 'Adding...' : 'Add dish'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
