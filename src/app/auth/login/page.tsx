'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'magic' | 'password'>('password');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsError(false);

    try {
      const supabase = createClient();

      if (mode === 'magic') {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) throw error;
        setMessage('Check your email for a login link.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.href = '/dashboard';
      }
    } catch (err: unknown) {
      setIsError(true);
      setMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-trellis-charcoal px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-trellis-gold">Trellis</h1>
          <p className="mt-1 text-trellis-warm-gray">Owner & Staff Login</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-trellis-warm-gray">
              Email address
            </label>
            <input id="email" type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@willowacres.com"
              className="mt-1 w-full rounded-lg border border-trellis-charcoal-light bg-trellis-charcoal-light px-4 py-3 text-white placeholder-gray-500 focus:border-trellis-gold focus:outline-none focus:ring-1 focus:ring-trellis-gold" />
          </div>

          {mode === 'password' && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-trellis-warm-gray">
                Password
              </label>
              <input id="password" type="password" required value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-trellis-charcoal-light bg-trellis-charcoal-light px-4 py-3 text-white placeholder-gray-500 focus:border-trellis-gold focus:outline-none focus:ring-1 focus:ring-trellis-gold" />
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full rounded-lg bg-trellis-gold px-4 py-3 text-base font-semibold text-trellis-charcoal-dark transition hover:bg-trellis-gold-light disabled:opacity-50">
            {loading ? 'Signing in...' : mode === 'magic' ? 'Send Login Link' : 'Sign In'}
          </button>
        </form>

        <button onClick={() => setMode(mode === 'magic' ? 'password' : 'magic')}
          className="mt-3 w-full text-center text-sm text-trellis-warm-gray/60 hover:text-trellis-warm-gray">
          {mode === 'magic' ? 'Use password instead' : 'Use magic link instead'}
        </button>

        {message && (
          <p className={`mt-4 text-center text-sm ${isError ? 'text-trellis-error' : 'text-trellis-gold'}`}>
            {message}
          </p>
        )}
      </div>
    </main>
  );
}
