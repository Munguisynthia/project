'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AdminSetupPage() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token') || '';

  const [loading, setLoading] = useState(true);
  const [schoolName, setSchoolName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Missing setup link token.');
      setLoading(false);
      return;
    }
    fetch(`/api/admin/setup?token=${encodeURIComponent(token)}`)
      .then((res) => res.json().then((body) => ({ ok: res.ok, body })))
      .then(({ ok, body }) => {
        if (!ok) {
          setError(body.error || 'This link is invalid.');
        } else {
          setSchoolName(body.schoolName);
        }
      })
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    const res = await fetch('/api/admin/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, name, password }),
    });

    const body = await res.json().catch(() => ({}));
    setSubmitting(false);

    if (!res.ok) {
      setError(body.error || 'Something went wrong.');
      return;
    }

    router.push('/admin/dashboard');
    router.refresh();
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-canvas">
        <p className="text-sm text-muted">Checking your link…</p>
      </main>
    );
  }

  if (error && !schoolName) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-canvas px-4">
        <div className="max-w-sm text-center">
          <p className="font-display text-lg font-bold text-ink mb-2">Link not valid</p>
          <p className="text-sm text-muted">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="font-display text-xl font-bold text-ink">Activate your account</p>
          <p className="text-sm text-muted mt-1">{schoolName}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-2xl shadow-card px-6 py-7">
          {error && (
            <div className="mb-4 px-3 py-2 rounded-xl bg-dangerbg text-danger text-sm">{error}</div>
          )}

          <label className="block text-sm font-medium text-ink mb-1.5">Your name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mb-4 px-3 py-2.5 rounded-xl border border-border bg-surfacealt text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            placeholder="Jane Okafor"
          />

          <label className="block text-sm font-medium text-ink mb-1.5">Create a password</label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-4 px-3 py-2.5 rounded-xl border border-border bg-surfacealt text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            placeholder="At least 8 characters"
          />

          <label className="block text-sm font-medium text-ink mb-1.5">Confirm password</label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full mb-6 px-3 py-2.5 rounded-xl border border-border bg-surfacealt text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition disabled:opacity-60"
          >
            {submitting ? 'Activating…' : 'Activate account'}
          </button>
        </form>
      </div>
    </main>
  );
}
