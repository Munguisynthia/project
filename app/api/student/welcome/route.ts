import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { peekToken, markTokenUsed } from '@/lib/tokens';

export async function POST(req: NextRequest) {
  const { token } = await req.json().catch(() => ({}));
  if (!token) return NextResponse.json({ error: 'Missing token.' }, { status: 400 });

  const supabase = supabaseAdmin();
  const tokenRow = await peekToken(supabase, token, 'student_login_link');

  if (!tokenRow) {
    return NextResponse.json({ error: 'This link is invalid, expired, or already used.' }, { status: 400 });
  }

  const { error } = await supabase.from('students').update({ verified: true }).eq('id', tokenRow.target_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await markTokenUsed(supabase, tokenRow.id);

  return NextResponse.json({ ok: true });
}
