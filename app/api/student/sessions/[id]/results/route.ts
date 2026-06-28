import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { studentSession } from '@/lib/studentSession';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await studentSession.get();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = supabaseAdmin();

  const { data: votingSession } = await supabase
    .from('voting_sessions')
    .select('id, title')
    .eq('id', params.id)
    .eq('school_id', session.school_id)
    .maybeSingle();

  if (!votingSession) return NextResponse.json({ error: 'Session not found.' }, { status: 404 });

  const { data: candidates } = await supabase
    .from('candidates')
    .select('id, name, position, photo')
    .eq('session_id', params.id)
    .eq('verified', true);

  const { data: votes } = await supabase.from('votes').select('candidate_id').eq('session_id', params.id);

  const counts: Record<string, number> = {};
  for (const v of votes ?? []) counts[v.candidate_id] = (counts[v.candidate_id] ?? 0) + 1;

  const results = (candidates ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    position: c.position,
    photo: c.photo,
    votes: counts[c.id] ?? 0,
  }));

  return NextResponse.json({ session: votingSession, results });
}
