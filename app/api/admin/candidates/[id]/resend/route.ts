import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { schoolAdminSession } from '@/lib/schoolAdminSession';
import { issueToken } from '@/lib/tokens';
import { sendCandidateInviteEmail } from '@/lib/email';

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await schoolAdminSession.get();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = supabaseAdmin();
  const { data: candidate, error } = await supabase
    .from('candidates')
    .select('id, name, email, position, verified')
    .eq('id', params.id)
    .eq('school_id', session.school_id)
    .maybeSingle();

  if (error || !candidate) return NextResponse.json({ error: 'Candidate not found.' }, { status: 404 });
  if (candidate.verified) {
    return NextResponse.json({ error: 'This candidate has already submitted their pitch.' }, { status: 400 });
  }

  await supabase
    .from('verification_tokens')
    .update({ used_at: new Date().toISOString() })
    .eq('target_id', candidate.id)
    .eq('purpose', 'candidate_pitch')
    .is('used_at', null);

  const token = await issueToken(supabase, {
    purpose: 'candidate_pitch',
    targetTable: 'candidates',
    targetId: candidate.id,
    expiresInHours: 72,
  });

  const pitchUrl = `${process.env.NEXT_PUBLIC_APP_URL}/candidate/verify/${token}`;

  try {
    await sendCandidateInviteEmail({
      to: candidate.email,
      candidateName: candidate.name,
      schoolName: session.school_name,
      position: candidate.position,
      pitchUrl,
    });
  } catch (e: any) {
    return NextResponse.json({ error: `Failed to send email: ${e.message}` }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
