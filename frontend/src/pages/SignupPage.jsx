import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Spinner } from '../components/ui.jsx';
import {
  HEALTH_TAGS,
  ALLERGENS,
  HEALTH_TAG_LABELS,
  ALLERGEN_LABELS,
  HEALTH_TAG_COLORS,
  ALLERGEN_COLORS,
} from '../lib/constants.js';

export default function SignupPage() {
  const { signup, error } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    dietary_preferences: [],
    allergies: [],
  });
  const [pending, setPending] = useState(false);
  const [localError, setLocalError] = useState(null);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggle(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLocalError(null);
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setLocalError('Name, email and password are required');
      return;
    }
    if (form.password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }
    setPending(true);
    try {
      await signup({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        dietary_preferences: form.dietary_preferences,
        allergies: form.allergies,
      });
      navigate('/', { replace: true });
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-[85vh] items-center justify-center p-4">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200 my-8">
        <div className="relative h-40 bg-slate-100">
          <img src="https://images.unsplash.com/photo-1490818387583-1b0570770b43?auto=format&fit=crop&q=80&w=800&h=400" alt="Healthy food" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-slate-900/40" />
          <div className="absolute bottom-6 left-6 text-white">
            <h1 className="text-3xl font-extrabold">Create account</h1>
            <p className="mt-1 text-sm font-medium text-slate-300">Set preferences to filter safely.</p>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-bold text-slate-700">Name</label>
              <input
                id="name"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                className="input rounded-xl bg-slate-50 py-3"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-bold text-slate-700">Email</label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                autoComplete="email"
                className="input rounded-xl bg-slate-50 py-3"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-bold text-slate-700">Password</label>
              <input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                autoComplete="new-password"
                className="input rounded-xl bg-slate-50 py-3"
                placeholder="At least 6 characters"
              />
            </div>

            <div className="pt-2">
              <span className="mb-2 block text-sm font-bold text-slate-700">Health conditions</span>
              <div className="flex flex-wrap gap-2">
                {HEALTH_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggle('dietary_preferences', tag)}
                    aria-pressed={form.dietary_preferences.includes(tag)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      form.dietary_preferences.includes(tag)
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {HEALTH_TAG_LABELS[tag]}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <span className="mb-2 block text-sm font-bold text-slate-700">Allergies</span>
              <div className="flex flex-wrap gap-2">
                {ALLERGENS.map((allergen) => (
                  <button
                    key={allergen}
                    type="button"
                    onClick={() => toggle('allergies', allergen)}
                    aria-pressed={form.allergies.includes(allergen)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      form.allergies.includes(allergen)
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {ALLERGEN_LABELS[allergen]}
                  </button>
                ))}
              </div>
            </div>

            {(localError || error) && (
              <p className="rounded-xl border-l-4 border-red-500 bg-red-50 p-4 text-sm font-semibold text-red-900 shadow-sm mt-4">
                {localError || error}
              </p>
            )}

            <div className="pt-6">
              <button type="submit" disabled={pending} className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3.5 text-base font-bold text-white shadow-md transition hover:bg-brand-700 disabled:opacity-70">
                {pending && <Spinner className="h-5 w-5" />}
                {pending ? 'Creating account...' : 'Create account'}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm font-medium text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-brand-600 hover:text-brand-700">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
