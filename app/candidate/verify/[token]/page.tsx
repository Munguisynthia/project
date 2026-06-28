'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function CandidateVerifyPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;

  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState<{ candidateName: string; position: string; schoolName: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pitch, setPitch] = useState('');
  const [photo, setPhoto] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch(`/api/candidate/${token}`)
      .then((res) => res.json().then((body) => ({ ok: res.ok, body })))
      .then(({ ok, body }) => {
        if (!ok) setError(body.error || 'This link is invalid.');
        else setInfo(body);
      })
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const res = await fetch(`/api/candidate/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, pitch, photo }),
    });

    const body = await res.json().catch(() => ({}));
    setSubmitting(false);

    if (!res.ok) {
      setError(body.error || 'Something went wrong.');
      return;
    }

    setDone(true);
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-canvas">
        <p className="text-sm text-muted">Checking your link…</p>
      </main>
    );
  }

  if (error && !info) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-canvas px-4">
        <div className="max-w-sm text-center">
          <p className="font-display text-lg font-bold text-ink mb-2">Link not valid</p>
          <p className="text-sm text-muted">{error}</p>
        </div>
      </main>
    );
  }

  if (done) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-canvas px-4">
        <div className="max-w-sm text-center">
          <p className="font-display text-lg font-bold text-ink mb-2">Pitch submitted 🎉</p>
          <p className="text-sm text-muted">
            Thanks, {info?.candidateName}. Your pitch is now visible to students when voting opens.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <p className="font-display text-xl font-bold text-ink">Submit your pitch</p>
          <p className="text-sm text-muted mt-1">
            {info?.candidateName} — {info?.position} at {info?.schoolName}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-2xl shadow-card px-6 py-6">
          {error && <div className="mb-4 px-3 py-2 rounded-xl bg-dangerbg text-danger text-sm">{error}</div>}

          <label className="block text-sm font-medium text-ink mb-1.5">Your pitch</label>
          <textarea
            required
            minLength={20}
            rows={6}
            value={pitch}
            onChange={(e) => setPitch(e.target.value)}
            className="w-full mb-4 px-3 py-2.5 rounded-xl border border-border bg-surfacealt text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Tell students why they should vote for you…"
          />

          <label className="block text-sm font-medium text-ink mb-1.5">Photo URL (optional)</label>
          <input
            type="url"
            value={photo}
            onChange={(e) => setPhoto(e.target.value)}
            className="w-full mb-1.5 px-3 py-2.5 rounded-xl border border-border bg-surfacealt text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="https://…"
          />
          <p className="text-xs text-muted mb-6">Link to a photo of yourself, students will see it on the ballot.</p>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition disabled:opacity-60"
          >
            {submitting ? 'Submitting…' : 'Submit pitch'}
          </button>
        </form>
      </div>
    </main>
  );
}
