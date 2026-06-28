import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { schoolAdminSession } from '@/lib/schoolAdminSession';
import { issueToken } from '@/lib/tokens';
import { sendCandidateInviteEmail } from '@/lib/email';

const createCandidateSchema = z.object({
  name: z.string().min(2, 'Name is required.'),
  email: z.string().email('Enter a valid email address.'),
  position: z.string().min(2, 'Position is required.'),
  session_id: z.string().uuid('Choose a voting session.'),
});

export async function GET() {
  const session = await schoolAdminSession.get();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from('candidates')
    .select('id, name, email, position, pitch, photo, verified, created_at, session_id, voting_sessions(title)')
    .eq('school_id', session.school_id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ candidates: data });
}

export async function POST(req: NextRequest) {
  const session = await schoolAdminSession.get();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = createCandidateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid input.' }, { status: 400 });
  }

  const { name, email, position, session_id } = parsed.data;
  const supabase = supabaseAdmin();

  // Confirm the session belongs to this school
  const { data: votingSession } = await supabase
    .from('voting_sessions')
    .select('id, title')
    .eq('id', session_id)
    .eq('school_id', session.school_id)
    .maybeSingle();

  if (!votingSession) {
    return NextResponse.json({ error: 'Voting session not found.' }, { status: 400 });
  }

  const { data: candidate, error: insertError } = await supabase
    .from('candidates')
    .insert({
      school_id: session.school_id,
      session_id,
      full_name: name,
      email: email.toLowerCase().trim(),
      position,
      verified: false,
    })
    .select('id, full_name, email')
    .single();

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 400 });

  try {
    const token = await issueToken(supabase, {
      purpose: 'candidate_pitch',
      targetTable: 'candidates',
      targetId: candidate.id,
      expiresInHours: 72,
    });
    const pitchUrl = `${process.env.NEXT_PUBLIC_APP_URL}/candidate/verify/${token}`;
    await sendCandidateInviteEmail({
      to: candidate.email,
      candidateName: candidate.full_name,
      schoolName: session.school_name,
      position,
      pitchUrl,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: `Candidate added but the invite email failed: ${e.message}` },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, candidate }, { status: 201 });
}
