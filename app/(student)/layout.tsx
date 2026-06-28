import { redirect } from 'next/navigation';
import Link from 'next/link';
import { studentSession } from '@/lib/studentSession';
import StudentLogoutButton from '@/components/LogoutButton';

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await studentSession.get();
  if (!session) redirect('/login');

  return (
    <div className="min-h-screen bg-canvas">
      <header className="bg-surface border-b border-border px-8 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="font-display text-base font-bold text-ink">
          {session.school_name}
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/account" className="text-sm text-muted hover:text-ink">
            {session.name}
          </Link>
          <StudentLogoutButton />
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
