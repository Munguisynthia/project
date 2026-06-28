import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { studentSession } from '@/lib/studentSession';

export async function GET() {
  const session = await studentSession.get();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = supabaseAdmin();

  const { data: sessions, error } = await supabase
    .from('voting_sessions')
    .select('id, title, description, start_date, end_date')
    .eq('school_id', session.school_id)
    .order('start_date', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: myVotes } = await supabase
    .from('votes')
    .select('session_id')
    .eq('student_id', session.sub);

  const votedSessionIds = new Set((myVotes ?? []).map((v) => v.session_id));

  const enriched = (sessions ?? []).map((s) => ({
    ...s,
    hasVoted: votedSessionIds.has(s.id),
  }));

  return NextResponse.json({ sessions: enriched });
}
