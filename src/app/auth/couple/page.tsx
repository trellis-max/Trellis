'use client';

import { useState } from 'react';

export default function CouplePortalPage() {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleAccess(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // TODO: Verify magic-link token via Edge Function
      // Tokens are single-use, time-boxed, ≥128-bit entropy
      setMessage('Verifying your access link...');
    } catch {
      setMessage('This link may have expired. Please request a new one.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-trellis-cream px-4">
      <div className="w-full max-w-sm text-center">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-trellis-charcoal">Willow Acres</h1>
          <p className="mt-1 text-trellis-charcoal/70">Couple Portal</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="mb-4 text-sm text-trellis-charcoal/70">
            Use the access link sent to your email to view your event details,
            payments, and planning info.
          </p>

          <form onSubmit={handleAccess} className="space-y-4">
            <div>
              <label htmlFor="token" className="block text-left text-sm font-medium text-trellis-charcoal/80">
                Access code
              </label>
              <input
                id="token"
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste from your email"
                className="mt-1 w-full rounded-lg border border-trellis-warm-gray bg-white px-4 py-3 text-trellis-charcoal placeholder-gray-400 focus:border-trellis-gold focus:outline-none focus:ring-1 focus:ring-trellis-gold"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-trellis-charcoal px-4 py-3 text-base font-semibold text-trellis-gold transition hover:bg-trellis-charcoal-light disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Access My Event'}
            </button>
          </form>

          {message && (
            <p className="mt-4 text-sm text-trellis-gold">{message}</p>
          )}
        </div>

        <p className="mt-6 text-xs text-trellis-charcoal/40">
          Need help? Contact Willow Acres directly.
        </p>
      </div>
    </main>
  );
}
