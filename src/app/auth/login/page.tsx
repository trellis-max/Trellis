'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // TODO: Wire Supabase Auth when project keys are in env
      // const { error } = await supabase.auth.signInWithOtp({ email });
      setMessage('Check your email for a login link.');
    } catch {
      setMessage('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-trellis-charcoal px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-trellis-gold">Trellis</h1>
          <p className="mt-1 text-trellis-warm-gray">Owner &amp; Staff Login</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-trellis-warm-gray">
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@willowacres.com"
              className="mt-1 w-full rounded-lg border border-trellis-charcoal-light bg-trellis-charcoal-light px-4 py-3 text-white placeholder-gray-500 focus:border-trellis-gold focus:outline-none focus:ring-1 focus:ring-trellis-gold"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-trellis-gold px-4 py-3 text-base font-semibold text-trellis-charcoal-dark transition hover:bg-trellis-gold-light disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Login Link'}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm text-trellis-gold">{message}</p>
        )}
      </div>
    </main>
  );
}
