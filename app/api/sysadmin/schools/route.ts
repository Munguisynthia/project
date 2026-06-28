import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getSysAdminSession } from '@/lib/session';
import { sendSchoolSetupEmail } from '@/lib/email';

const createSchoolSchema = z.object({
  name: z.string().min(2, 'School name is required.'),
  gov_id: z.string().min(2, 'Government registration ID is required.'),
  email: z.string().email('Enter a valid email address.'),
  student_prefix: z
    .string()
    .length(4, 'Prefix must be exactly 4 characters.')
    .regex(/^[A-Za-z0-9]{4}$/, 'Prefix must be 4 letters/numbers.'),
});

export async function GET() {
  const session = await getSysAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from('schools')
    .select('id, name, gov_id, email, student_prefix, verified, created_at')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ schools: data });
}

export async function POST(req: NextRequest) {
  const session = await getSysAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = createSchoolSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Invalid input.' },
      { status: 400 }
    );
  }

  const { name, gov_id, email, student_prefix } = parsed.data;
  const supabase = supabaseAdmin();

  const { data: school, error: insertError } = await supabase
    .from('schools')
    .insert({
      name,
      gov_id,
      email: email.toLowerCase().trim(),
      student_prefix: student_prefix.toUpperCase(),
      verified: false,
    })
    .select('id, name, email')
    .single();

  if (insertError) {
    const message = insertError.code === '23505'
      ? 'A school with that registration ID, prefix, or email already exists.'
      : insertError.message;
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // Create a one-time setup token valid for 48 hours
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
    return NextResponse.json(
      { error: `School created but failed to generate setup link: ${tokenError.message}` },
      { status: 500 }
    );
  }

  const setupUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/setup?token=${token}`;

  try {
    await sendSchoolSetupEmail({ to: school.email, schoolName: school.name, setupUrl });
  } catch (e: any) {
    return NextResponse.json(
      { error: `School created but the setup email failed to send: ${e.message}` },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, school }, { status: 201 });
}
