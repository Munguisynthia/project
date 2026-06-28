'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/sysadmin/logout', { method: 'POST' });
    router.push('/sysadmin/login');
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-muted hover:bg-dangerbg hover:text-danger transition"
    >
      Sign out
    </button>
  );
}
