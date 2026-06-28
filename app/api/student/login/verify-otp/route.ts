import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { studentSession } from '@/lib/studentSession';

export async function POST(req: NextRequest) {
  try {
    const { email, student_id, code } = await req.json().catch(() => ({}));

    if (!email || !student_id || !code) {
      return NextResponse.json({ error: 'Email, student ID, and code are required.' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const supabase = supabaseAdmin();
    const { data: student, error } = await supabase
      .from('students')
      .select('*')
      .ilike('email', email)
      .eq('student_id', student_id.toUpperCase().trim())
      .maybeSingle();

    if (error || !student) {
      return NextResponse.json({ error: 'Invalid login details.' }, { status: 401 });
    }

    const { data: otpRow, error: otpError } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('student_id', student.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (otpError || !otpRow) {
      return NextResponse.json({ error: 'No code found. Request a new one.' }, { status: 401 });
    }

    if (otpRow.used_at) {
      return NextResponse.json({ error: 'This code has already been used.' }, { status: 401 });
    }

    if (new Date(otpRow.expires_at) < new Date()) {
      return NextResponse.json({ error: 'This code has expired. Request a new one.' }, { status: 401 });
    }

    if (otpRow.code != code.trim()) {
      return NextResponse.json({ error: 'Incorrect code.' }, { status: 401 });
    }

    await supabase.from('otp_codes').update({ used_at: new Date().toISOString() }).eq('id', otpRow.id);

    await studentSession.create({
      sub: student.id,
      email: student.email,
      name: student.name,
      student_id: student.student_id,
      school_id: student.school_id,
      school_name: (student as any).schools?.name ?? '',
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[verify-otp] error:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
