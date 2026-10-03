import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Spinner } from '../components/ui.jsx';
import {
  HEALTH_TAGS,
  ALLERGENS,
  HEALTH_TAG_LABELS,
  ALLERGEN_LABELS,
  HEALTH_TAG_DESCRIPTIONS,
  HEALTH_TAG_COLORS,
  ALLERGEN_COLORS,
} from '../lib/constants.js';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [tags, setTags] = useState(user?.dietary_preferences || []);
  const [allergies, setAllergies] = useState(user?.allergies || []);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  function toggle(list, setList, value) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setPending(true);
    setMessage(null);
    setError(null);
    try {
      await updateProfile({ name: name.trim(), dietary_preferences: tags, allergies });
      setMessage('Profile saved. Safe for me now uses these settings.');
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Profile Header */}
      <div className="flex items-center gap-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-slate-900 text-3xl font-bold text-white shadow-md">
          {name ? name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-extrabold text-slate-900">{name || 'User'}</h1>
          <p className="truncate text-slate-500">{user?.email}</p>
          <Link to="/orders" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
            View order history →
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Edit */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-4 text-lg font-bold text-slate-900">Edit Profile</h2>
          <div className="max-w-sm">
            <label htmlFor="profile-name" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Full Name
            </label>
            <input
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input rounded-xl bg-slate-50"
            />
          </div>
        </div>

        {/* Health Preferences */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-1 text-lg font-bold text-slate-900">❤️ Health Preferences</h2>
          <p className="mb-4 text-sm text-slate-500">
            Safe for me shows only dishes carrying every tag selected here.
          </p>
          <div className="space-y-3">
            {HEALTH_TAGS.map((tag) => (
              <div key={tag} className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggle(tags, setTags, tag)}
                  aria-pressed={tags.includes(tag)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    tags.includes(tag)
                      ? 'bg-brand-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {HEALTH_TAG_LABELS[tag]}
                </button>
                {tags.includes(tag) && (
                  <span className="text-xs font-medium text-slate-500">{HEALTH_TAG_DESCRIPTIONS[tag]}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Allergies */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-1 text-lg font-bold text-slate-900">⚠️ Allergies</h2>
          <p className="mb-4 text-sm text-slate-500">
            Dishes declaring these allergens are excluded when Safe for me is on.
          </p>
          <div className="flex flex-wrap gap-2">
            {ALLERGENS.map((allergen) => (
              <button
                key={allergen}
                type="button"
                onClick={() => toggle(allergies, setAllergies, allergen)}
                aria-pressed={allergies.includes(allergen)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  allergies.includes(allergen)
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {ALLERGEN_LABELS[allergen]}
              </button>
            ))}
          </div>
        </div>

        {message && (
          <div className="rounded-2xl border-l-4 border-brand-500 bg-brand-50 p-4 shadow-sm">
            <p className="text-sm font-semibold text-brand-900">{message}</p>
          </div>
        )}
        
        {error && (
          <div className="rounded-2xl border-l-4 border-red-500 bg-red-50 p-4 shadow-sm">
            <p className="text-sm font-semibold text-red-900">{error}</p>
          </div>
        )}

        <div className="pb-10">
          <button type="submit" disabled={pending} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 text-base font-bold text-white shadow-md transition hover:bg-slate-800 disabled:opacity-70">
            {pending && <Spinner className="h-5 w-5" />}
            Save Profile settings
          </button>
        </div>
      </form>
    </div>
  );
}
