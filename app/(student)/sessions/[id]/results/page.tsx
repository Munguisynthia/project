'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import VoteResultsChart from '@/components/VoteResultsChart';

type Result = { id: string; name: string; position: string; photo: string | null; votes: number };

export default function ResultsPage() {
  const params = useParams<{ id: string }>();
  const sessionId = params.id;

  const [sessionTitle, setSessionTitle] = useState('');
  const [results, setResults] = useState<Result[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/student/sessions/${sessionId}/results`)
      .then((res) => res.json().then((body) => ({ ok: res.ok, body })))
      .then(({ ok, body }) => {
        if (!ok) {
          setError(body.error || 'Could not load results.');
          return;
        }
        setSessionTitle(body.session.title);
        setResults(body.results);
      });
  }, [sessionId]);

  if (error) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <p className="font-display text-lg font-bold text-ink mb-2">Can't load results</p>
          <p className="text-sm text-muted mb-4">{error}</p>
          <Link href="/dashboard" className="text-brand-500 font-medium text-sm">← Back to dashboard</Link>
        </div>
      </main>
    );
  }

  // Group candidates by position so multi-position elections get separate charts
  const byPosition = (results ?? []).reduce<Record<string, Result[]>>((acc, r) => {
    const key = r.position || 'General';
    acc[key] = acc[key] ?? [];
    acc[key].push(r);
    return acc;
  }, {});

  return (
    <div className="px-8 py-8 max-w-2xl mx-auto">
      <Link href="/dashboard" className="text-sm text-muted hover:text-ink">← Back to dashboard</Link>
      <h1 className="font-display text-2xl font-bold text-ink mt-3 mb-6">{sessionTitle || 'Results'}</h1>

      {!results && <p className="text-sm text-muted">Loading results…</p>}

      {results && results.length === 0 && (
        <div className="bg-surface border border-border rounded-2xl px-6 py-12 text-center">
          <p className="text-sm text-muted">No candidates to show results for yet.</p>
        </div>
      )}

      <div className="space-y-8">
        {Object.entries(byPosition).map(([position, candidates]) => (
          <div key={position} className="bg-surface border border-border rounded-2xl shadow-card px-6 py-6">
            <h2 className="font-display text-base font-bold text-ink mb-4">{position}</h2>
            <VoteResultsChart sessionId={sessionId} initialResults={candidates} />
          </div>
        ))}
      </div>
    </div>
  );
}
