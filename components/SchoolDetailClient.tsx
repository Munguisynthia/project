'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import StatusBadge from '@/components/StatusBadge';
import StatCard from '@/components/StatCard';

type School = {
  id: string;
  name: string;
  gov_id: string;
  email: string;
  student_prefix: string;
  verified: boolean;
  created_at: string;
};

export default function SchoolDetailClient({
  school: initialSchool,
  stats,
}: {
  school: School;
  stats: { students: number; admins: number; sessions: number };
}) {
  const router = useRouter();
  const [school, setSchool] = useState(initialSchool);
  const [form, setForm] = useState({
    name: initialSchool.name,
    gov_id: initialSchool.gov_id,
    email: initialSchool.email,
    student_prefix: initialSchool.student_prefix,
  });
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [resending, setResending] = useState(false);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSaving(true);

    const res = await fetch(`/api/sysadmin/schools/${school.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const body = await res.json().catch(() => ({}));
    setSaving(false);

    if (!res.ok) {
      setError(body.error || 'Could not save changes.');
      return;
    }

    setSchool(body.school);
    setMessage('Changes saved.');
    router.refresh();
  }

  async function handleResend() {
    setError(null);
    setMessage(null);
    setResending(true);

    const res = await fetch(`/api/sysadmin/schools/${school.id}/resend`, { method: 'POST' });
    const body = await res.json().catch(() => ({}));
    setResending(false);

    if (!res.ok) {
      setError(body.error || 'Could not resend the activation link.');
      return;
    }

    setMessage(`Activation link resent to ${school.email}.`);
  }

  return (
    <div className="px-8 py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-display text-2xl font-bold text-ink">{school.name}</h1>
        <StatusBadge status={school.verified ? 'verified' : 'pending'} />
      </div>
      <p className="text-sm text-muted mb-6">Registered {new Date(school.created_at).toLocaleDateString()}</p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Students" value={stats.students} accent="brand" />
        <StatCard label="Admins" value={stats.admins} accent="brand" />
        <StatCard label="Voting sessions" value={stats.sessions} accent="brand" />
      </div>

      {error && (
        <div className="mb-4 px-3 py-2 rounded-xl bg-dangerbg text-danger text-sm">{error}</div>
      )}
      {message && (
        <div className="mb-4 px-3 py-2 rounded-xl bg-okbg text-ok text-sm">{message}</div>
      )}

      {!school.verified && (
        <div className="mb-6 flex items-center justify-between bg-warnbg border border-warn/20 rounded-2xl px-5 py-4">
          <div>
            <p className="text-sm font-medium text-ink">Account not activated yet</p>
            <p className="text-xs text-muted">Resend the setup link if the school hasn't received it.</p>
          </div>
          <button
            onClick={handleResend}
            disabled={resending}
            className="px-3.5 py-2 rounded-xl bg-surface border border-border text-sm font-medium text-ink hover:bg-surfacealt transition disabled:opacity-60"
          >
            {resending ? 'Sending…' : 'Resend link'}
          </button>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-surface border border-border rounded-2xl shadow-card px-6 py-6">
        <h2 className="font-display text-base font-bold text-ink mb-4">School details</h2>

        <label className="block text-sm font-medium text-ink mb-1.5">School name</label>
        <input
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          className="w-full mb-4 px-3 py-2.5 rounded-xl border border-border bg-surfacealt text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
        />

        <label className="block text-sm font-medium text-ink mb-1.5">Government registration ID</label>
        <input
          value={form.gov_id}
          onChange={(e) => update('gov_id', e.target.value)}
          className="w-full mb-4 px-3 py-2.5 rounded-xl border border-border bg-surfacealt text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
        />

        <label className="block text-sm font-medium text-ink mb-1.5">Administration email</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          className="w-full mb-4 px-3 py-2.5 rounded-xl border border-border bg-surfacealt text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
        />

        <label className="block text-sm font-medium text-ink mb-1.5">Student ID prefix</label>
        <input
          maxLength={4}
          value={form.student_prefix}
          onChange={(e) => update('student_prefix', e.target.value.toUpperCase())}
          className="w-full mb-6 px-3 py-2.5 rounded-xl border border-border bg-surfacealt text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
        />

        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
