'use client';

import { useEffect, useState } from 'react';
import StatusBadge from '@/components/StatusBadge';

type Student = {
  id: string;
  name: string;
  email: string;
  student_id: string;
  verified: boolean;
  created_at: string;
};

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[] | null>(null);
  const [form, setForm] = useState({ name: '', email: '', student_id: '' });
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function loadStudents() {
    const res = await fetch('/api/admin/students');
    const body = await res.json().catch(() => ({}));
    if (res.ok) setStudents(body.students);
  }

  useEffect(() => {
    loadStudents();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);

    const res = await fetch('/api/admin/students', {
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

    setMessage(`${form.name} was added. A login link was sent to ${form.email}.`);
    setForm({ name: '', email: '', student_id: '' });
    loadStudents();
  }

  return (
    <div className="px-8 py-8 max-w-4xl">
      <h1 className="font-display text-2xl font-bold text-ink mb-1">Students</h1>
      <p className="text-sm text-muted mb-6">Add students and track who has activated their account.</p>

      <form
        onSubmit={handleSubmit}
        className="bg-surface border border-border rounded-2xl shadow-card px-6 py-5 mb-8 grid grid-cols-4 gap-3 items-end"
      >
        {error && (
          <div className="col-span-4 px-3 py-2 rounded-xl bg-dangerbg text-danger text-sm">{error}</div>
        )}
        {message && (
          <div className="col-span-4 px-3 py-2 rounded-xl bg-okbg text-ok text-sm">{message}</div>
        )}

        <div>
          <label className="block text-xs font-medium text-ink mb-1.5">Full name</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-surfacealt text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Amara Eze"
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
            placeholder="amara@student.edu"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink mb-1.5">Student ID</label>
          <input
            required
            value={form.student_id}
            onChange={(e) => setForm((f) => ({ ...f, student_id: e.target.value.toUpperCase() }))}
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-surfacealt text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="LKSD20310"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition disabled:opacity-60"
        >
          {submitting ? 'Adding…' : '+ Add student'}
        </button>
      </form>

      <div className="bg-surface border border-border rounded-2xl shadow-card overflow-hidden">
        {students === null ? (
          <p className="px-6 py-8 text-sm text-muted">Loading…</p>
        ) : students.length === 0 ? (
          <p className="px-6 py-8 text-sm text-muted text-center">No students added yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surfacealt text-left text-xs font-medium text-muted uppercase tracking-wide">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Student ID</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-t border-border">
                  <td className="px-5 py-3.5 font-medium text-ink">{s.name}</td>
                  <td className="px-5 py-3.5 font-mono text-xs">{s.student_id}</td>
                  <td className="px-5 py-3.5">{s.email}</td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={s.verified ? 'verified' : 'pending'} />
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
