import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { studentSession } from '@/lib/studentSession';
import { sendVoteConfirmationEmail } from '@/lib/email';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await studentSession.get();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = supabaseAdmin();

  const { data: votingSession } = await supabase
    .from('voting_sessions')
    .select('id, title, description, start_date, end_date')
    .eq('id', params.id)
    .eq('school_id', session.school_id)
    .maybeSingle();

  if (!votingSession) return NextResponse.json({ error: 'Session not found.' }, { status: 404 });

  const now = new Date();
  if (new Date(votingSession.start_date) > now) {
    return NextResponse.json({ error: 'This session has not started yet.' }, { status: 403 });
  }
  if (new Date(votingSession.end_date) < now) {
    return NextResponse.json({ error: 'This session has ended.' }, { status: 403 });
  }

  const { data: existingVote } = await supabase
    .from('votes')
    .select('id')
    .eq('session_id', params.id)
    .eq('student_id', session.sub)
    .maybeSingle();

  if (existingVote) {
    return NextResponse.json({ error: 'You have already voted in this session.' }, { status: 409 });
  }

  const { data: candidates, error } = await supabase
    .from('candidates')
    .select('id, name, position, pitch, photo')
    .eq('session_id', params.id)
    .eq('verified', true);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ session: votingSession, candidates });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await studentSession.get();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { candidate_id } = await req.json().catch(() => ({}));
  if (!candidate_id) return NextResponse.json({ error: 'Choose a candidate.' }, { status: 400 });

  const supabase = supabaseAdmin();

  const { data: votingSession } = await supabase
    .from('voting_sessions')
    .select('id, title, start_date, end_date')
    .eq('id', params.id)
    .eq('school_id', session.school_id)
    .maybeSingle();

  if (!votingSession) return NextResponse.json({ error: 'Session not found.' }, { status: 404 });

  const now = new Date();
  if (new Date(votingSession.start_date) > now || new Date(votingSession.end_date) < now) {
    return NextResponse.json({ error: 'This session is not currently open for voting.' }, { status: 403 });
  }

  const { data: candidate } = await supabase
    .from('candidates')
    .select('id, name, position')
    .eq('id', candidate_id)
    .eq('session_id', params.id)
    .eq('verified', true)
    .maybeSingle();

  if (!candidate) return NextResponse.json({ error: 'Candidate not found.' }, { status: 404 });

  const { error: insertError } = await supabase.from('votes').insert({
    session_id: params.id,
    student_id: session.sub,
    candidate_id,
  });

  if (insertError) {
    const message =
      insertError.code === '23505' ? 'You have already voted in this session.' : insertError.message;
    return NextResponse.json({ error: message }, { status: 409 });
  }

  try {
    await sendVoteConfirmationEmail({
      to: session.email,
      studentName: session.name,
      candidateName: candidate.name,
      position: candidate.position,
      sessionTitle: votingSession.title,
    });
  } catch (e) {
    // Vote is already recorded — don't fail the request just because the email failed.
    console.error('[vote] confirmation email failed:', e);
  }

  return NextResponse.json({ ok: true });
}
