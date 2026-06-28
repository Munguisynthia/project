import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { schoolAdminSession } from '@/lib/schoolAdminSession';
import { issueToken } from '@/lib/tokens';
import { sendStudentLoginLinkEmail } from '@/lib/email';
 
// const createStudentSchema = z.object({
//   full_name: z.string().min(2, 'Name is required.'),
//   email: z.string().email('Enter a valid email address.'),
//   student_id: z.string().min(4, 'Student ID is required.'),
// });

const createStudentSchema = z.object({
  full_name: z.string().min(2, 'Name is required.'),   // was: full_name
  email: z.string().email('Enter a valid email address.'),
  student_id: z.string().min(4, 'Student ID is required.'),
});

 

export async function GET() {
  const session = await schoolAdminSession.get();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('school_id', session.school_id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ students: data });
}

export async function POST(req: NextRequest) {
  const session = await schoolAdminSession.get();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = createStudentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid input.' }, { status: 400 });
  }

  const { full_name, email, student_id } = parsed.data;

  // Get the school's prefix to validate the student ID belongs to this school
  const supabase = supabaseAdmin();
  const { data: school } = await supabase
    .from('schools')
    .select('student_prefix')
    .eq('id', session.school_id)
    .maybeSingle();

  if (school && !student_id.toUpperCase().startsWith(school.student_prefix.toUpperCase())) {
    return NextResponse.json(
      { error: `Student ID must start with this school's prefix (${school.student_prefix}).` },
      { status: 400 }
    );
  }

  const { data: student, error: insertError } = await supabase
    .from('students')
    // .insert({
    //   school_id: session.school_id,
    //   full_name: name.trim(),
    //   email: email.toLowerCase().trim(),
    //   student_id: student_id.toUpperCase().trim(),
    //   verified: false,
    // })
    .insert({
  school_id: session.school_id,
  full_name: full_name.trim(),
  email: email.toLowerCase().trim(),
  student_id: student_id.toUpperCase().trim(),
  verified: false,
})
    .select('id, full_name, email')
    .single();

  if (insertError) {
    const message =
      insertError.code === '23505' ? 'A student with that student ID already exists.' : insertError.message;
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    const token = await issueToken(supabase, {
      purpose: 'student_login_link',
      targetTable: 'students',
      targetId: student.id,
      expiresInHours: 72,
    });
    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/login?welcome_token=${token}`;
    await sendStudentLoginLinkEmail({
      to: student.email,
      studentName: student.full_name,
      schoolName: session.school_name,
      verifyUrl,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: `Student added but the login link email failed: ${e.message}` },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, student }, { status: 201 });
}
