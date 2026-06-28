'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewSchoolPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', gov_id: '', email: '', student_prefix: '' });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const res = await fetch('/api/sysadmin/schools', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const body = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(body.error || 'Something went wrong. Try again.');
      return;
    }

    setSuccess(`${form.name} was added. A setup link was sent to ${form.email}.`);
    setForm({ name: '', gov_id: '', email: '', student_prefix: '' });
  }

  return (
    <div className="px-8 py-8 max-w-xl">
      <Link href="/sysadmin/dashboard" className="text-sm text-muted hover:text-ink">
        ← Back to schools
      </Link>

      <h1 className="font-display text-2xl font-bold text-ink mt-4 mb-1">Add a school</h1>
      <p className="text-sm text-muted mb-6">
        We'll send an activation link to the school's email so they can set up their administrator account.
      </p>

      <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-2xl shadow-card px-6 py-6">
        {error && (
          <div className="mb-4 px-3 py-2 rounded-xl bg-dangerbg text-danger text-sm">{error}</div>
        )}
        {success && (
          <div className="mb-4 px-3 py-2 rounded-xl bg-okbg text-ok text-sm">{success}</div>
        )}

        <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="name">
          School name
        </label>
        <input
          id="name"
          required
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          className="w-full mb-4 px-3 py-2.5 rounded-xl border border-border bg-surfacealt text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          placeholder="Lakeside High School"
        />

        <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="gov_id">
          Government registration ID
        </label>
        <input
          id="gov_id"
          required
          value={form.gov_id}
          onChange={(e) => update('gov_id', e.target.value)}
          className="w-full mb-4 px-3 py-2.5 rounded-xl border border-border bg-surfacealt text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          placeholder="e.g. GOV-2024-00451"
        />

        <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="email">
          Administration email
        </label>
        <input
          id="email"
          type="email"
          required
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          className="w-full mb-4 px-3 py-2.5 rounded-xl border border-border bg-surfacealt text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          placeholder="admin@lakesidehigh.edu"
        />

        <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="student_prefix">
          Student ID prefix (4 characters, unique)
        </label>
        <input
          id="student_prefix"
          required
          maxLength={4}
          value={form.student_prefix}
          onChange={(e) => update('student_prefix', e.target.value.toUpperCase())}
          className="w-full mb-1.5 px-3 py-2.5 rounded-xl border border-border bg-surfacealt text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          placeholder="LKSD"
        />
        <p className="text-xs text-muted mb-6">
          Used to match students to this school, e.g. student ID LKSD2031045.
        </p>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition disabled:opacity-60"
        >
          {loading ? 'Adding school…' : 'Add school & send activation link'}
        </button>
      </form>
    </div>
  );
}
