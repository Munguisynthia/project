'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Initial = {
  title?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
};

function toLocalInput(value?: string) {
  if (!value) return '';
  const d = new Date(value);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function SessionForm({
  mode,
  sessionId,
  initial,
}: {
  mode: 'create' | 'edit';
  sessionId?: string;
  initial?: Initial;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    start_date: toLocalInput(initial?.start_date),
    end_date: toLocalInput(initial?.end_date),
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const url = mode === 'create' ? '/api/admin/sessions' : `/api/admin/sessions/${sessionId}`;
    const method = mode === 'create' ? 'POST' : 'PATCH';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        start_date: new Date(form.start_date).toISOString(),
        end_date: new Date(form.end_date).toISOString(),
      }),
    });

    const body = await res.json().catch(() => ({}));
    setSubmitting(false);

    if (!res.ok) {
      setError(body.error || 'Something went wrong.');
      return;
    }

    router.push('/admin/sessions');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-2xl shadow-card px-6 py-6">
      {error && <div className="mb-4 px-3 py-2 rounded-xl bg-dangerbg text-danger text-sm">{error}</div>}

      <label className="block text-sm font-medium text-ink mb-1.5">Title</label>
      <input
        required
        value={form.title}
        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        className="w-full mb-4 px-3 py-2.5 rounded-xl border border-border bg-surfacealt text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        placeholder="Student Council Election 2026"
      />

      <label className="block text-sm font-medium text-ink mb-1.5">Description (optional)</label>
      <textarea
        value={form.description}
        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        rows={3}
        className="w-full mb-4 px-3 py-2.5 rounded-xl border border-border bg-surfacealt text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        placeholder="Annual election for student council positions."
      />

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">Starts</label>
          <input
            type="datetime-local"
            required
            value={form.start_date}
            onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-surfacealt text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">Ends</label>
          <input
            type="datetime-local"
            required
            value={form.end_date}
            onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-surfacealt text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="px-5 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition disabled:opacity-60"
      >
        {submitting ? 'Saving…' : mode === 'create' ? 'Create session' : 'Save changes'}
      </button>
    </form>
  );
}
