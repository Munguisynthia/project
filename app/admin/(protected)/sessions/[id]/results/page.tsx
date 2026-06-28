import { notFound } from 'next/navigation';
import Link from 'next/link';
import { schoolAdminSession } from '@/lib/schoolAdminSession';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import VoteResultsChart from '@/components/VoteResultsChart';

export const dynamic = 'force-dynamic';

export default async function AdminSessionResultsPage({ params }: { params: { id: string } }) {
  const session = await schoolAdminSession.get();
  const supabase = supabaseAdmin();

  const { data: votingSession } = await supabase
    .from('voting_sessions')
    .select('id, title')
    .eq('id', params.id)
    .eq('school_id', session!.school_id)
    .maybeSingle();

  if (!votingSession) notFound();

  const { data: candidates } = await supabase
    .from('candidates')
    .select('id, name, position')
    .eq('session_id', params.id);

  const { data: votes } = await supabase.from('votes').select('candidate_id').eq('session_id', params.id);

  const counts: Record<string, number> = {};
  for (const v of votes ?? []) counts[v.candidate_id] = (counts[v.candidate_id] ?? 0) + 1;

  const results = (candidates ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    position: c.position,
    votes: counts[c.id] ?? 0,
  }));

  return (
    <div className="px-8 py-8 max-w-2xl">
      <Link href="/admin/sessions" className="text-sm text-muted hover:text-ink">
        ← Back to sessions
      </Link>
      <h1 className="font-display text-2xl font-bold text-ink mt-4 mb-1">{votingSession.title}</h1>
      <p className="text-sm text-muted mb-6">Live results, updates automatically as votes come in.</p>

      <div className="bg-surface border border-border rounded-2xl shadow-card px-6 py-6">
        {results.length === 0 ? (
          <p className="text-sm text-muted text-center py-8">No candidates in this session yet.</p>
        ) : (
          <VoteResultsChart sessionId={votingSession.id} initialResults={results} />
        )}
      </div>
    </div>
  );
}
