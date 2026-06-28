import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { generateOtp } from '@/lib/tokens';
import { sendOtpEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { email, student_id } = await req.json().catch(() => ({}));
    

    if (!email || !student_id) {
      return NextResponse.json({ error: 'Email and student ID are required.' }, { status: 400 });
    }

   
     const normalizedEmail = email.toLowerCase().trim();
    const supabase = supabaseAdmin();
    //const fields = ['id', 'full_name', 'email', 'is_verified'];
    const { data: student, error } = await supabase
      .from('students')
      .select('*')
      .eq('email', normalizedEmail)
      .eq('student_id', student_id.toUpperCase().trim())
      .maybeSingle();

    
    if (error || !student) {
      return NextResponse.json(
        { error: 'No student found matching that email and student ID.' },
        { status: 401 }
      );
    }

    if (!student.is_verified) {
      return NextResponse.json(
        { error: 'Please activate your account first using the link sent to your email.' },
        { status: 403 }
      );
    }

    const code = generateOtp();
    const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { error: otpError } = await supabase.from('otp_codes').insert({
      student_id: student.id,
      code,
      expires_at,
    });

    if (otpError) return NextResponse.json({ error: otpError.message }, { status: 500 });
console.log('email not sent' , student.email, 'code:', code);
    await sendOtpEmail({ to: student.email, studentName: student.full_name, code });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[request-otp] error:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
