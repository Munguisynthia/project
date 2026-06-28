import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { schoolAdminSession } from '@/lib/schoolAdminSession';
import { _email } from 'zod/v4/core';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json().catch(() => ({}));
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const supabase = supabaseAdmin();
    const { data: admin, error } = await supabase
      .from('school_admins')
      .select('*')
      .ilike('email', email)
      .maybeSingle();

    if (error || !admin) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const schoolName = (admin as any).schools?.name || '';

    await schoolAdminSession.create({
      sub: admin.id,
      email: admin.email,
      school_id: admin.school_id,
      school_name: schoolName,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[admin login] error:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
