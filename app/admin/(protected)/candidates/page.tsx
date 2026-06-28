'use client';

import { useEffect, useState } from 'react';
import StatusBadge from '@/components/StatusBadge';

type Candidate = {
  id: string;
  name: string;
  email: string;
  position: string;
  verified: boolean;
  voting_sessions?: { title: string } | null;
};

type SessionOption = { id: string; title: string };

export default function AdminCandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[] | null>(null);
  const [sessions, setSessions] = useState<SessionOption[]>([]);
  const [form, setForm] = useState({ name: '', email: '', position: '', session_id: '' });
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);

  async function loadData() {
    const [candidatesRes, sessionsRes] = await Promise.all([
      fetch('/api/admin/candidates'),
      fetch('/api/admin/sessions'),
    ]);
    const candidatesBody = await candidatesRes.json().catch(() => ({}));
    const sessionsBody = await sessionsRes.json().catch(() => ({}));
    if (candidatesRes.ok) setCandidates(candidatesBody.candidates);
    if (sessionsRes.ok) setSessions(sessionsBody.sessions);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);

    const res = await fetch('/api/admin/candidates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const body = await res.json().catch(() => ({}));
    setSubmitting(false);

    if (!res.ok) {
      setError(body.error || 'Something went wrong.');
      return;
    }

    setMessage(`${form.name} was added. A pitch invite was sent to ${form.email}.`);
    setForm({ name: '', email: '', position: '', session_id: '' });
    loadData();
  }

  async function handleResend(id: string) {
    setResendingId(id);
    setError(null);
    setMessage(null);
    const res = await fetch(`/api/admin/candidates/${id}/resend`, { method: 'POST' });
    const body = await res.json().catch(() => ({}));
    setResendingId(null);

    if (!res.ok) {
      setError(body.error || 'Could not resend the invite.');
      return;
    }
    setMessage('Invite resent.');
  }

  return (
    <div className="px-8 py-8 max-w-4xl">
      <h1 className="font-display text-2xl font-bold text-ink mb-1">Candidates</h1>
      <p className="text-sm text-muted mb-6">Add candidates and track pitch submissions.</p>

      <form
        onSubmit={handleSubmit}
        className="bg-surface border border-border rounded-2xl shadow-card px-6 py-5 mb-8 grid grid-cols-2 gap-3"
      >
        {error && (
          <div className="col-span-2 px-3 py-2 rounded-xl bg-dangerbg text-danger text-sm">{error}</div>
        )}
        {message && (
          <div className="col-span-2 px-3 py-2 rounded-xl bg-okbg text-ok text-sm">{message}</div>
        )}

        <div>
          <label className="block text-xs font-medium text-ink mb-1.5">Full name</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-surfacealt text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Kwame Boateng"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink mb-1.5">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-surfacealt text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="kwame@student.edu"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink mb-1.5">Position</label>
          <input
            required
            value={form.position}
            onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-surfacealt text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Head Prefect"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink mb-1.5">Voting session</label>
          <select
            required
            value={form.session_id}
            onChange={(e) => setForm((f) => ({ ...f, session_id: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-surfacealt text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">Select a session…</option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={submitting || sessions.length === 0}
          className="col-span-2 px-4 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition disabled:opacity-60"
        >
          {sessions.length === 0
            ? 'Create a voting session first'
            : submitting
            ? 'Adding…'
            : '+ Add candidate'}
        </button>
      </form>

      <div className="bg-surface border border-border rounded-2xl shadow-card overflow-hidden">
        {candidates === null ? (
          <p className="px-6 py-8 text-sm text-muted">Loading…</p>
        ) : candidates.length === 0 ? (
          <p className="px-6 py-8 text-sm text-muted text-center">No candidates added yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surfacealt text-left text-xs font-medium text-muted uppercase tracking-wide">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Position</th>
                <th className="px-5 py-3">Session</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((c) => (
                <tr key={c.id} className="border-t border-border">
                  <td className="px-5 py-3.5 font-medium text-ink">{c.name}</td>
                  <td className="px-5 py-3.5">{c.position}</td>
                  <td className="px-5 py-3.5 text-muted">{c.voting_sessions?.title ?? '—'}</td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={c.verified ? 'verified' : 'pending'} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {!c.verified && (
                      <button
                        onClick={() => handleResend(c.id)}
                        disabled={resendingId === c.id}
                        className="text-brand-500 font-medium hover:text-brand-600 text-xs disabled:opacity-60"
                      >
                        {resendingId === c.id ? 'Sending…' : 'Resend invite'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
