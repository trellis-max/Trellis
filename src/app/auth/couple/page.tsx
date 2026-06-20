'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function CouplePortalInner() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      verifyToken(token);
    }
  }, [searchParams]);

  async function verifyToken(token: string) {
    setLoading(true);
    setMessage('Verifying your access link...');

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'magiclink',
      });
      if (error) throw error;
      window.location.href = '/portal';
    } catch {
      setIsError(true);
      setMessage('This link may have expired. Please request a new one.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsError(false);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/couple`,
        },
      });
      if (error) throw error;
      setMessage('Check your email for an access link!');
    } catch (err: unknown) {
      setIsError(true);
      setMessage(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <p className="mb-4 text-sm text-trellis-charcoal/70">
        Enter your email to receive an access link for your event details,
        payments, and planning info.
      </p>

      <form onSubmit={handleRequest} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-left text-sm font-medium text-trellis-charcoal/80">
            Email address
          </label>
          <input id="email" type="email" required value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="mt-1 w-full rounded-lg border border-trellis-warm-gray bg-white px-4 py-3 text-trellis-charcoal placeholder-gray-400 focus:border-trellis-gold focus:outline-none focus:ring-1 focus:ring-trellis-gold" />
        </div>

        <button type="submit" disabled={loading}
          className="w-full rounded-lg bg-trellis-charcoal px-4 py-3 text-base font-semibold text-trellis-gold transition hover:bg-trellis-charcoal-light disabled:opacity-50">
          {loading ? 'Sending...' : 'Send Access Link'}
        </button>
      </form>

      {message && (
        <p className={`mt-4 text-sm ${isError ? 'text-trellis-error' : 'text-trellis-gold'}`}>
          {message}
        </p>
      )}
    </div>
  );
}

export default function CouplePortalPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-trellis-cream px-4">
      <div className="w-full max-w-sm text-center">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-trellis-charcoal">Willow Acres</h1>
          <p className="mt-1 text-trellis-charcoal/70">Couple Portal</p>
        </div>

        <Suspense fallback={
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-trellis-charcoal/40">Loading...</p>
          </div>
        }>
          <CouplePortalInner />
        </Suspense>

        <p className="mt-6 text-xs text-trellis-charcoal/40">
          Need help? Contact Willow Acres directly.
        </p>
      </div>
    </main>
  );
}
