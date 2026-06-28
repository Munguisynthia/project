import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { studentSession } from '@/lib/studentSession';

export async function GET() {
  const session = await studentSession.get();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = supabaseAdmin();

  const { data: votes, error } = await supabase
    .from('votes')
    .select('id, voted_at, voting_sessions(id, title), candidates(name, position)')
    .eq('student_id', session.sub)
    .order('voted_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const history = (votes ?? []).map((v: any) => ({
    id: v.id,
    voted_at: v.voted_at,
    sessionId: v.voting_sessions?.id,
    sessionTitle: v.voting_sessions?.title,
    candidateName: v.candidates?.name,
    position: v.candidates?.position,
  }));

  return NextResponse.json({ history });
}
