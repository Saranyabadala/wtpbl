import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Spinner } from '../components/ui.jsx';

export default function LoginPage() {
  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [localError, setLocalError] = useState(null);
  const redirectTo = location.state?.from || '/';

  useEffect(() => clearError, [clearError]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLocalError(null);
    if (!email.trim() || !password) {
      setLocalError('Email and password are required');
      return;
    }
    setPending(true);
    try {
      await login({ email: email.trim(), password });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-[85vh] items-center justify-center p-4">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200">
        <div className="relative h-40 bg-slate-100">
          <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800&h=400" alt="Food background" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-slate-900/40" />
          <div className="absolute bottom-6 left-6 text-white">
            <h1 className="text-3xl font-extrabold">Welcome back</h1>
            <p className="mt-1 text-sm font-medium text-slate-300">Log in to use Safe for me</p>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-bold text-slate-700">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="input rounded-xl bg-slate-50 py-3"
                placeholder="••••••••"
              />
            </div>

            {(localError || error) && (
              <p className="rounded-xl border-l-4 border-red-500 bg-red-50 p-4 text-sm font-semibold text-red-900 shadow-sm">
                {localError || error}
              </p>
            )}

            <div className="pt-2">
              <button type="submit" disabled={pending} className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3.5 text-base font-bold text-white shadow-md transition hover:bg-brand-700 disabled:opacity-70">
                {pending && <Spinner className="h-5 w-5" />}
                {pending ? 'Logging in...' : 'Log in'}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm font-medium text-slate-600">
            New here?{' '}
            <Link to="/signup" className="font-bold text-brand-600 hover:text-brand-700">
              Create an account
            </Link>
          </p>

          <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-xs text-slate-600">
            <p className="font-bold text-slate-700 mb-1">Demo account</p>
            <p className="font-mono bg-slate-200 px-2 py-1 rounded inline-block text-slate-800">demo@healthplate.app</p>
            <p className="font-mono bg-slate-200 px-2 py-1 rounded inline-block text-slate-800 mt-1 ml-1">demo1234</p>
          </div>
        </div>
      </div>
    </div>
  );
}
