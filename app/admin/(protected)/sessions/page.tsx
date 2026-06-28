'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Session = {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
};

function getStatus(s: Session): 'ongoing' | 'upcoming' | 'completed' {
  const now = new Date();
  if (new Date(s.start_date) > now) return 'upcoming';
  if (new Date(s.end_date) < now) return 'completed';
  return 'ongoing';
}

const statusStyles: Record<string, string> = {
  ongoing: 'bg-okbg text-ok',
  upcoming: 'bg-brand-50 text-brand-700',
  completed: 'bg-surfacealt text-muted',
};

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<Session[] | null>(null);

  useEffect(() => {
    fetch('/api/admin/sessions')
      .then((res) => res.json())
      .then((body) => setSessions(body.sessions ?? []));
  }, []);

  return (
    <div className="px-8 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Voting sessions</h1>
          <p className="text-sm text-muted mt-1">Create and manage your school's elections.</p>
        </div>
        <Link
          href="/admin/sessions/new"
          className="px-4 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition"
        >
          + New session
        </Link>
      </div>

      <div className="bg-surface border border-border rounded-2xl shadow-card overflow-hidden">
        {sessions === null ? (
          <p className="px-6 py-8 text-sm text-muted">Loading…</p>
        ) : sessions.length === 0 ? (
          <p className="px-6 py-8 text-sm text-muted text-center">No voting sessions yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surfacealt text-left text-xs font-medium text-muted uppercase tracking-wide">
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Starts</th>
                <th className="px-5 py-3">Ends</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => {
                const status = getStatus(s);
                return (
                  <tr key={s.id} className="border-t border-border">
                    <td className="px-5 py-3.5 font-medium text-ink">{s.title}</td>
                    <td className="px-5 py-3.5 text-muted">{new Date(s.start_date).toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-muted">{new Date(s.end_date).toLocaleString()}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[status]}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-3">
                      <Link href={`/admin/sessions/${s.id}/results`} className="text-brand-500 font-medium hover:text-brand-600">
                        Results
                      </Link>
                      <Link href={`/admin/sessions/${s.id}/edit`} className="text-muted font-medium hover:text-ink">
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
