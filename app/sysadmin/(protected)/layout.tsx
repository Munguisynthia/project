import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSysAdminSession } from '@/lib/session';
import LogoutButton from '@/components/LogoutButton';

export default async function SysAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSysAdminSession();

  // Login page renders its own standalone layout (no shell), handled by its own route group check.
  if (!session) {
    redirect('/sysadmin/login');
  }

  return (
    <div className="min-h-screen flex bg-canvas">
      <aside className="w-60 shrink-0 border-r border-border bg-surface flex flex-col">
        <div className="px-6 py-6 border-b border-border">
          <p className="font-display text-lg font-bold text-ink leading-tight">Voting System</p>
          <p className="text-xs text-muted mt-0.5">System administration</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <Link
            href="/sysadmin/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-ink hover:bg-brand-50 transition"
          >
            Schools
          </Link>
          <Link
            href="/sysadmin/schools/new"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-muted hover:bg-brand-50 hover:text-ink transition"
          >
            Add a school
          </Link>
        </nav>
        <div className="px-3 py-4 border-t border-border">
          <div className="px-3 py-2 mb-2">
            <p className="text-xs text-muted">Signed in as</p>
            <p className="text-sm font-medium text-ink truncate">{session.email}</p>
          </div>
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
