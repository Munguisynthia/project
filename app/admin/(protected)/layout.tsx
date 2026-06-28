import Link from 'next/link';
import { redirect } from 'next/navigation';
import { schoolAdminSession } from '@/lib/schoolAdminSession';
import AdminLogoutButton from '@/components/LogoutButton';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await schoolAdminSession.get();
  if (!session) redirect('/admin/login');

  return (
    <div className="min-h-screen flex bg-canvas">
      <aside className="w-60 shrink-0 border-r border-border bg-surface flex flex-col">
        <div className="px-6 py-6 border-b border-border">
          <p className="font-display text-lg font-bold text-ink leading-tight">{session.school_name}</p>
          <p className="text-xs text-muted mt-0.5">School administration</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {[
            { href: '/admin/dashboard', label: 'Dashboard' },
            { href: '/admin/students', label: 'Students' },
            { href: '/admin/candidates', label: 'Candidates' },
            { href: '/admin/sessions', label: 'Voting sessions' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-muted hover:bg-brand-50 hover:text-ink transition"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-border">
          <div className="px-3 py-2 mb-2">
            <p className="text-xs text-muted">Signed in as</p>
            <p className="text-sm font-medium text-ink truncate">{session.email}</p>
          </div>
          <AdminLogoutButton />
        </div>
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
