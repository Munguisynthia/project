import Link from 'next/link';
import SessionForm from '@/components/SessionForm';

export default function NewSessionPage() {
  return (
    <div className="px-8 py-8 max-w-xl">
      <Link href="/admin/sessions" className="text-sm text-muted hover:text-ink">
        ← Back to sessions
      </Link>
      <h1 className="font-display text-2xl font-bold text-ink mt-4 mb-1">New voting session</h1>
      <p className="text-sm text-muted mb-6">Set the title, dates, and description for this election.</p>
      <SessionForm mode="create" />
    </div>
  );
}
