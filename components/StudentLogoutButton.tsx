'use client';

import { useRouter } from 'next/navigation';

export default function StudentLogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/student/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <button onClick={handleLogout} className="text-sm font-medium text-muted hover:text-danger transition">
      Sign out
    </button>
  );
}
