import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createSysAdminSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json().catch(() => ({}));

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log('[login] attempt for:', normalizedEmail);

    const supabase = supabaseAdmin();
    const { data: admin, error } = await supabase
      .from('system_admins')
      .select('id, email, password_hash')
      .ilike('email', normalizedEmail)
      .maybeSingle();

    if (error) {
      console.error('[login] supabase query error:', error.message, error);
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    if (!admin) {
      console.log('[login] no row found for email:', normalizedEmail);
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    console.log('[login] row found, id:', admin.id, 'hash length:', admin.password_hash?.length);

    const valid = await bcrypt.compare(password, admin.password_hash);
    console.log('[login] bcrypt compare result:', valid);

    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    await createSysAdminSession({ sub: admin.id, email: admin.email });
    console.log('[login] session created for:', admin.email);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[login] unexpected error:', err);
    return NextResponse.json({ error: 'Server error. Check terminal logs.' }, { status: 500 });
  }
}
