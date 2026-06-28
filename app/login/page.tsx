'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function StudentLoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const welcomeToken = params.get('welcome_token');

  const [step, setStep] = useState<'identify' | 'otp'>('identify');
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activating, setActivating] = useState(!!welcomeToken);

  useEffect(() => {
    if (!welcomeToken) return;
    fetch('/api/student/welcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: welcomeToken }),
    })
      .then((res) => res.json().then((body) => ({ ok: res.ok, body })))
      .then(({ ok, body }) => {
        if (ok) setMessage('Your account is now active. Log in below to continue.');
        else setError(body.error || 'This activation link is invalid.');
      })
      .finally(() => setActivating(false));
  }, [welcomeToken]);

  async function handleIdentify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const res = await fetch('/api/student/login/request-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, student_id: studentId }),
    });
    const body = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(body.error || 'Something went wrong.');
      return;
    }

    setStep('otp');
    setMessage(`We sent a 6-digit code to ${email}.`);
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch('/api/student/login/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, student_id: studentId, code }),
    });
    const body = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(body.error || 'Something went wrong.');
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  if (activating) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-canvas">
        <p className="text-sm text-muted">Activating your account…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="font-display text-xl font-bold text-ink">Voting System</p>
          <p className="text-sm text-muted mt-1">Student login</p>
        </div>

        {step === 'identify' ? (
          <form onSubmit={handleIdentify} className="bg-surface border border-border rounded-2xl shadow-card px-6 py-7">
            {error && <div className="mb-4 px-3 py-2 rounded-xl bg-dangerbg text-danger text-sm">{error}</div>}
            {message && <div className="mb-4 px-3 py-2 rounded-xl bg-okbg text-ok text-sm">{message}</div>}

            <label className="block text-sm font-medium text-ink mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mb-4 px-3 py-2.5 rounded-xl border border-border bg-surfacealt text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="you@student.edu"
            />

            <label className="block text-sm font-medium text-ink mb-1.5">Student ID</label>
            <input
              required
              value={studentId}
              onChange={(e) => setStudentId(e.target.value.toUpperCase())}
              className="w-full mb-6 px-3 py-2.5 rounded-xl border border-border bg-surfacealt text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="LKSD20310"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition disabled:opacity-60"
            >
              {loading ? 'Sending code…' : 'Send login code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="bg-surface border border-border rounded-2xl shadow-card px-6 py-7">
            {error && <div className="mb-4 px-3 py-2 rounded-xl bg-dangerbg text-danger text-sm">{error}</div>}
            {message && <div className="mb-4 px-3 py-2 rounded-xl bg-okbg text-ok text-sm">{message}</div>}

            <label className="block text-sm font-medium text-ink mb-1.5">6-digit code</label>
            <input
              required
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className="w-full mb-6 px-3 py-2.5 rounded-xl border border-border bg-surfacealt text-center text-2xl font-mono tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="······"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition disabled:opacity-60"
            >
              {loading ? 'Verifying…' : 'Verify & sign in'}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('identify');
                setCode('');
                setError(null);
                setMessage(null);
              }}
              className="w-full mt-3 py-2 text-xs text-muted hover:text-ink"
            >
              ← Use a different email or student ID
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
