import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getSysAdminSession } from '@/lib/session';
import { sendSchoolSetupEmail } from '@/lib/email';

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSysAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = supabaseAdmin();

  const { data: school, error } = await supabase
    .from('schools')
    .select('id, name, email, verified')
    .eq('id', params.id)
    .maybeSingle();

  if (error || !school) {
    return NextResponse.json({ error: 'School not found.' }, { status: 404 });
  }

  if (school.verified) {
    return NextResponse.json(
      { error: 'This school has already activated its account.' },
      { status: 400 }
    );
  }

  // Invalidate previous unused setup tokens, then issue a fresh one
  await supabase
    .from('verification_tokens')
    .update({ used_at: new Date().toISOString() })
    .eq('target_id', school.id)
    .eq('purpose', 'school_setup')
    .is('used_at', null);

  const token = randomBytes(32).toString('hex');
  const expires_at = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

  const { error: tokenError } = await supabase.from('verification_tokens').insert({
    token,
    purpose: 'school_setup',
    target_table: 'schools',
    target_id: school.id,
    expires_at,
  });

  if (tokenError) {
    return NextResponse.json({ error: tokenError.message }, { status: 500 });
  }

  const setupUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/setup?token=${token}`;

  try {
    await sendSchoolSetupEmail({ to: school.email, schoolName: school.name, setupUrl });
  } catch (e: any) {
    return NextResponse.json({ error: `Failed to send email: ${e.message}` }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
