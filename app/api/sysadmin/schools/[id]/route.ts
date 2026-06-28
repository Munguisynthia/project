import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getSysAdminSession } from '@/lib/session';

const updateSchoolSchema = z.object({
  name: z.string().min(2).optional(),
  gov_id: z.string().min(2).optional(),
  email: z.string().email().optional(),
  student_prefix: z.string().length(4).regex(/^[A-Za-z0-9]{4}$/).optional(),
});

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSysAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = supabaseAdmin();

  const { data: school, error } = await supabase
    .from('schools')
    .select('id, name, gov_id, email, student_prefix, verified, created_at')
    .eq('id', params.id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!school) return NextResponse.json({ error: 'School not found.' }, { status: 404 });

  // Lightweight related counts for the detail page
  const [{ count: studentCount }, { count: adminCount }, { count: sessionCount }] = await Promise.all([
    supabase.from('students').select('id', { count: 'exact', head: true }).eq('school_id', params.id),
    supabase.from('school_admins').select('id', { count: 'exact', head: true }).eq('school_id', params.id),
    supabase.from('voting_sessions').select('id', { count: 'exact', head: true }).eq('school_id', params.id),
  ]);

  return NextResponse.json({
    school,
    stats: {
      students: studentCount ?? 0,
      admins: adminCount ?? 0,
      sessions: sessionCount ?? 0,
    },
  });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSysAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = updateSchoolSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Invalid input.' },
      { status: 400 }
    );
  }

  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: 'No fields to update.' }, { status: 400 });
  }

  const supabase = supabaseAdmin();
  const updates: Record<string, any> = { ...parsed.data };
  if (updates.email) updates.email = updates.email.toLowerCase().trim();
  if (updates.student_prefix) updates.student_prefix = updates.student_prefix.toUpperCase();

  const { data, error } = await supabase
    .from('schools')
    .update(updates)
    .eq('id', params.id)
    .select('id, name, gov_id, email, student_prefix, verified, created_at')
    .single();

  if (error) {
    const message = error.code === '23505'
      ? 'Another school already uses that registration ID, prefix, or email.'
      : error.message;
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, school: data });
}
