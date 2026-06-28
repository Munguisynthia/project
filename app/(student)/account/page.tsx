'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Me = { email: string; name: string; student_id: string; school_name: string };
type HistoryItem = {
  id: string;
  voted_at: string;
  sessionId: string;
  sessionTitle: string;
  candidateName: string;
  position: string;
};

export default function AccountPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [history, setHistory] = useState<HistoryItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/student/me')
      .then((res) => res.json())
      .then((body) => setMe(body.student))
      .catch(() => setError('Could not load your profile.'));

    fetch('/api/student/votes')
      .then((res) => res.json().then((body) => ({ ok: res.ok, body })))
      .then(({ ok, body }) => {
        if (!ok) setError(body.error || 'Could not load voting history.');
        else setHistory(body.history);
      });
  }, []);

  return (
    <div className="px-8 py-8 max-w-2xl mx-auto">
      <h1 className="font-display text-2xl font-bold text-ink mb-1">Your account</h1>
      <p className="text-sm text-muted mb-8">Profile details and your voting history.</p>

      {error && <div className="mb-6 px-4 py-3 rounded-xl bg-dangerbg text-danger text-sm">{error}</div>}

      <div className="bg-surface border border-border rounded-2xl shadow-card px-6 py-6 mb-8">
        <h2 className="font-display text-base font-bold text-ink mb-4">Profile</h2>
        {!me ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : (
          <dl className="grid grid-cols-2 gap-y-3 text-sm">
            <dt className="text-muted">Name</dt>
            <dd className="text-ink font-medium">{me.name}</dd>
            <dt className="text-muted">Email</dt>
            <dd className="text-ink font-medium">{me.email}</dd>
            <dt className="text-muted">Student ID</dt>
            <dd className="text-ink font-medium font-mono">{me.student_id}</dd>
            <dt className="text-muted">School</dt>
            <dd className="text-ink font-medium">{me.school_name}</dd>
          </dl>
        )}
      </div>

      <div className="bg-surface border border-border rounded-2xl shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-display text-base font-bold text-ink">Voting history</h2>
        </div>

        {history === null && <p className="text-sm text-muted px-6 py-6">Loading…</p>}

        {history?.length === 0 && (
          <p className="text-sm text-muted px-6 py-10 text-center">You haven't voted in any sessions yet.</p>
        )}

        {history && history.length > 0 && (
          <ul>
            {history.map((h) => (
              <li key={h.id} className="px-6 py-4 border-t border-border first:border-t-0 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-ink">{h.sessionTitle}</p>
                  <p className="text-xs text-muted">
                    Voted for {h.candidateName} ({h.position}) on {new Date(h.voted_at).toLocaleDateString()}
                  </p>
                </div>
                <Link
                  href={`/sessions/${h.sessionId}/results`}
                  className="text-brand-500 text-sm font-medium hover:text-brand-600 shrink-0"
                >
                  Results →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
