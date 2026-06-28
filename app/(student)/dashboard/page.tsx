'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type SessionRow = {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  hasVoted: boolean;
};

function classify(s: SessionRow) {
  const now = new Date();
  if (new Date(s.start_date) > now) return 'upcoming';
  if (new Date(s.end_date) < now) return 'completed';
  return 'ongoing';
}

export default function StudentDashboardPage() {
  const [sessions, setSessions] = useState<SessionRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/student/sessions')
      .then((res) => res.json().then((body) => ({ ok: res.ok, body })))
      .then(({ ok, body }) => {
        if (!ok) setError(body.error || 'Could not load sessions.');
        else setSessions(body.sessions);
      });
  }, []);

  const groups = {
    ongoing: sessions?.filter((s) => classify(s) === 'ongoing') ?? [],
    upcoming: sessions?.filter((s) => classify(s) === 'upcoming') ?? [],
    completed: sessions?.filter((s) => classify(s) === 'completed') ?? [],
  };

  return (
    <div className="px-8 py-8 max-w-4xl mx-auto">
      <h1 className="font-display text-2xl font-bold text-ink mb-1">Voting sessions</h1>
      <p className="text-sm text-muted mb-8">Cast your vote in ongoing elections at your school.</p>

      {error && <div className="mb-6 px-4 py-3 rounded-xl bg-dangerbg text-danger text-sm">{error}</div>}

      {!sessions && !error && <p className="text-sm text-muted">Loading sessions…</p>}

      {sessions && sessions.length === 0 && (
        <div className="bg-surface border border-border rounded-2xl px-6 py-14 text-center">
          <p className="font-display text-base font-bold text-ink mb-1">No sessions yet</p>
          <p className="text-sm text-muted">Check back once your school schedules a voting session.</p>
        </div>
      )}

      <SessionGroup title="Ongoing" accent="ok" sessions={groups.ongoing} mode="vote" />
      <SessionGroup title="Upcoming" accent="warn" sessions={groups.upcoming} mode="none" />
      <SessionGroup title="Completed" accent="brand" sessions={groups.completed} mode="results" />
    </div>
  );
}

function SessionGroup({
  title,
  accent,
  sessions,
  mode,
}: {
  title: string;
  accent: 'ok' | 'warn' | 'brand';
  sessions: SessionRow[];
  mode: 'vote' | 'results' | 'none';
}) {
  if (sessions.length === 0) return null;

  const dot = accent === 'ok' ? 'bg-ok' : accent === 'warn' ? 'bg-warn' : 'bg-brand-500';

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-2 h-2 rounded-full ${dot}`} />
        <h2 className="font-display text-sm font-bold text-ink uppercase tracking-wide">{title}</h2>
      </div>
      <div className="grid gap-3">
        {sessions.map((s) => (
          <div
            key={s.id}
            className="bg-surface border border-border rounded-2xl shadow-card px-5 py-4 flex items-center justify-between"
          >
            <div className="min-w-0">
              <p className="font-medium text-ink">{s.title}</p>
              {s.description && <p className="text-sm text-muted truncate">{s.description}</p>}
              <p className="text-xs text-muted mt-1">
                {new Date(s.start_date).toLocaleDateString()} – {new Date(s.end_date).toLocaleDateString()}
              </p>
            </div>

            {mode === 'vote' && (
              s.hasVoted ? (
                <Link
                  href={`/sessions/${s.id}/results`}
                  className="px-4 py-2 rounded-xl bg-surfacealt border border-border text-sm font-medium text-ink hover:bg-brand-50 transition shrink-0"
                >
                  View results
                </Link>
              ) : (
                <Link
                  href={`/sessions/${s.id}/vote`}
                  className="px-4 py-2 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition shrink-0"
                >
                  Vote now
                </Link>
              )
            )}

            {mode === 'results' && (
              <Link
                href={`/sessions/${s.id}/results`}
                className="px-4 py-2 rounded-xl bg-surfacealt border border-border text-sm font-medium text-ink hover:bg-brand-50 transition shrink-0"
              >
                View results
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
