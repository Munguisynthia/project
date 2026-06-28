'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

type Candidate = {
  id: string;
  name: string;
  position: string | null;
  pitch: string | null;
  photo: string | null;
};

export default function VotePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const sessionId = params.id;

  const [sessionTitle, setSessionTitle] = useState('');
  const [candidates, setCandidates] = useState<Candidate[] | null>(null);
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch(`/api/student/sessions/${sessionId}/vote`)
      .then((res) => res.json().then((body) => ({ ok: res.ok, body })))
      .then(({ ok, body }) => {
        if (!ok) {
          setError(body.error || 'Could not load this session.');
          return;
        }
        setSessionTitle(body.session.title);
        setCandidates(body.candidates);
      });
  }, [sessionId]);

  async function confirmVote() {
    if (!selected) return;
    setConfirming(true);
    setError(null);

    const res = await fetch(`/api/student/sessions/${sessionId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidate_id: selected.id }),
    });

    const body = await res.json().catch(() => ({}));
    setConfirming(false);

    if (!res.ok) {
      setError(body.error || 'Could not record your vote.');
      return;
    }

    setSubmitted(true);
    setTimeout(() => {
      router.push('/dashboard');
      router.refresh();
    }, 2200);
  }

  if (submitted) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <p className="font-display text-xl font-bold text-ink mb-2">Vote recorded 🎉</p>
          <p className="text-sm text-muted">
            You voted for <span className="font-medium text-ink">{selected?.name}</span>. A confirmation
            email is on its way. Taking you back to your dashboard…
          </p>
        </div>
      </main>
    );
  }

  if (error && !candidates) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <p className="font-display text-lg font-bold text-ink mb-2">Can't open this session</p>
          <p className="text-sm text-muted mb-4">{error}</p>
          <Link href="/dashboard" className="text-brand-500 font-medium text-sm">← Back to dashboard</Link>
        </div>
      </main>
    );
  }

  // Review / confirm screen
  if (selected) {
    return (
      <div className="px-8 py-8 max-w-lg mx-auto">
        <button
          onClick={() => setSelected(null)}
          className="text-sm text-muted hover:text-ink mb-4"
        >
          ← Back to candidates
        </button>

        <h1 className="font-display text-xl font-bold text-ink mb-1">Confirm your vote</h1>
        <p className="text-sm text-muted mb-6">{sessionTitle}</p>

        {error && <div className="mb-4 px-3 py-2 rounded-xl bg-dangerbg text-danger text-sm">{error}</div>}

        <div className="bg-surface border border-border rounded-2xl shadow-card px-6 py-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            {selected.photo ? (
              <img src={selected.photo} alt={selected.name} className="w-16 h-16 rounded-xl object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-brand-100 flex items-center justify-center font-display font-bold text-brand-700 text-lg">
                {selected.name.charAt(0)}
              </div>
            )}
            <div>
              <p className="font-display font-bold text-ink">{selected.name}</p>
              <p className="text-sm text-muted">{selected.position}</p>
            </div>
          </div>
          {selected.pitch && <p className="text-sm text-ink leading-relaxed">{selected.pitch}</p>}
        </div>

        <p className="text-xs text-muted mb-4 text-center">
          You can only vote once in this session. This action cannot be undone.
        </p>

        <button
          onClick={confirmVote}
          disabled={confirming}
          className="w-full py-3 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition disabled:opacity-60"
        >
          {confirming ? 'Submitting…' : `Confirm vote for ${selected.name}`}
        </button>
      </div>
    );
  }

  // Candidate selection screen
  return (
    <div className="px-8 py-8 max-w-2xl mx-auto">
      <Link href="/dashboard" className="text-sm text-muted hover:text-ink">← Back to dashboard</Link>
      <h1 className="font-display text-2xl font-bold text-ink mt-3 mb-1">{sessionTitle}</h1>
      <p className="text-sm text-muted mb-6">Choose a candidate, then review before confirming.</p>

      {!candidates && <p className="text-sm text-muted">Loading candidates…</p>}

      <div className="grid gap-3">
        {candidates?.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelected(c)}
            className="text-left bg-surface border border-border rounded-2xl shadow-card px-5 py-4 flex items-center gap-4 hover:border-brand-300 hover:bg-brand-50/40 transition"
          >
            {c.photo ? (
              <img src={c.photo} alt={c.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center font-display font-bold text-brand-700 shrink-0">
                {c.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-medium text-ink">{c.name}</p>
              <p className="text-sm text-muted">{c.position}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
