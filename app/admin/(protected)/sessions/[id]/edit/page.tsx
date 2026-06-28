import { notFound } from 'next/navigation';
import Link from 'next/link';
import { schoolAdminSession } from '@/lib/schoolAdminSession';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import SessionForm from '@/components/SessionForm';

export const dynamic = 'force-dynamic';

export default async function EditSessionPage({ params }: { params: { id: string } }) {
  const session = await schoolAdminSession.get();
  const supabase = supabaseAdmin();

  const { data: votingSession } = await supabase
    .from('voting_sessions')
    .select('id, title, description, start_date, end_date')
    .eq('id', params.id)
    .eq('school_id', session!.school_id)
    .maybeSingle();

  if (!votingSession) notFound();

  return (
    <div className="px-8 py-8 max-w-xl">
      <Link href="/admin/sessions" className="text-sm text-muted hover:text-ink">
        ← Back to sessions
      </Link>
      <h1 className="font-display text-2xl font-bold text-ink mt-4 mb-1">Edit session</h1>
      <p className="text-sm text-muted mb-6">Update the details for this election.</p>
      <SessionForm mode="edit" sessionId={votingSession.id} initial={votingSession} />
    </div>
  );
}
