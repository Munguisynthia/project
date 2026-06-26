import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-canvas">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold text-ink mb-2">Voting System</h1>
        <p className="text-muted mb-6">Choose where you'd like to sign in.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/login" className="px-4 py-2 rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition">
            Student login
          </Link>
          <Link href="/admin/login" className="px-4 py-2 rounded-xl bg-surface border border-border text-ink text-sm font-medium hover:bg-surfacealt transition">
            School admin
          </Link>
          <Link href="/sysadmin/login" className="px-4 py-2 rounded-xl bg-surface border border-border text-ink text-sm font-medium hover:bg-surfacealt transition">
            System admin
          </Link>
        </div>
      </div>
    </main>
  );
}
