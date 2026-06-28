import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { peekToken, markTokenUsed } from '@/lib/tokens';
import { schoolAdminSession } from '@/lib/schoolAdminSession';

// Validate token + return school name, WITHOUT consuming it (so refreshing the page doesn't break it)
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'Missing token.' }, { status: 400 });

  const supabase = supabaseAdmin();
  const { data: row, error } = await supabase
    .from('verification_tokens')
    .select('target_id, expires_at, used_at')
    .eq('token', token)
    .eq('purpose', 'school_setup')
    .maybeSingle();

  if (error || !row) return NextResponse.json({ error: 'Invalid or unknown link.' }, { status: 400 });
  if (row.used_at) return NextResponse.json({ error: 'This link has already been used.' }, { status: 400 });
  if (new Date(row.expires_at) < new Date()) {
    return NextResponse.json({ error: 'This link has expired. Ask the system admin to resend it.' }, { status: 400 });
  }

  const { data: school } = await supabase.from('schools').select('id, name, verified').eq('id', row.target_id).maybeSingle();
  if (!school) return NextResponse.json({ error: 'School not found.' }, { status: 404 });
  if (school.verified) return NextResponse.json({ error: 'This school has already been activated.' }, { status: 400 });

  return NextResponse.json({ schoolName: school.name });
}

// Consume the token, create the school_admins row, mark school verified, start a session
export async function POST(req: NextRequest) {
  const { token, name, password } = await req.json().catch(() => ({}));

  if (!token || !name || !password || password.length < 8) {
    return NextResponse.json(
      { error: 'Name and a password of at least 8 characters are required.' },
      { status: 400 }
    );
  }

  const supabase = supabaseAdmin();
  const tokenRow = await peekToken(supabase, token, 'school_setup');

  if (!tokenRow) {
    return NextResponse.json({ error: 'This link is invalid, expired, or already used.' }, { status: 400 });
  }

  const { data: school, error: schoolError } = await supabase
    .from('schools')
    .select('id, name, email, verified')
    .eq('id', tokenRow.target_id)
    .maybeSingle();

  if (schoolError || !school) {
    return NextResponse.json({ error: 'School not found.' }, { status: 404 });
  }

  if (school.verified) {
    return NextResponse.json({ error: 'This school has already been activated.' }, { status: 400 });
  }

  const password_hash = await bcrypt.hash(password, 10);

  const { data: admin, error: insertError } = await supabase
    .from('school_admins')
    .insert({ school_id: school.id, name, email: school.email, password_hash })
    .select('id, name, email')
    .single();

  if (insertError) {
    // Token is NOT burned here — the same link can be retried after this is resolved.
    const message =
      insertError.code === '23505'
        ? 'An admin account for this email already exists. Try logging in instead, or ask the system admin to check this school.'
        : insertError.message;
    return NextResponse.json({ error: message }, { status: 400 });
  }

  await supabase.from('schools').update({ verified: true }).eq('id', school.id);

  // Only mark the token used once everything above has actually succeeded.
  await markTokenUsed(supabase, tokenRow.id);

  await schoolAdminSession.create({
    sub: admin.id,
    email: admin.email,
    school_id: school.id,
    school_name: school.name,
  });

  return NextResponse.json({ ok: true });
}
