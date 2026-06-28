'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);
    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(body.error || 'Something went wrong.');
      return;
    }

    router.push('/admin/dashboard');
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="font-display text-xl font-bold text-ink">Voting System</p>
          <p className="text-sm text-muted mt-1">School administration</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-2xl shadow-card px-6 py-7">
          <h1 className="font-display text-base font-bold text-ink mb-5">Sign in</h1>

          {error && <div className="mb-4 px-3 py-2 rounded-xl bg-dangerbg text-danger text-sm">{error}</div>}

          <label className="block text-sm font-medium text-ink mb-1.5">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-4 px-3 py-2.5 rounded-xl border border-border bg-surfacealt text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            placeholder="admin@school.edu"
          />

          <label className="block text-sm font-medium text-ink mb-1.5">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-6 px-3 py-2.5 rounded-xl border border-border bg-surfacealt text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            placeholder="••••••••"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </main>
  );
}
