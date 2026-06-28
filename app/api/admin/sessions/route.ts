import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { schoolAdminSession } from '@/lib/schoolAdminSession';

const createSessionSchema = z.object({
  title: z.string().min(2, 'Title is required.'),
  description: z.string().optional(),
  start_date: z.string().min(1, 'Start date is required.'),
  end_date: z.string().min(1, 'End date is required.'),
});

export async function GET() {
  const session = await schoolAdminSession.get();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from('voting_sessions')
    .select('id, title, description, start_date, end_date, created_at')
    .eq('school_id', session.school_id)
    .order('start_date', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ sessions: data });
}

export async function POST(req: NextRequest) {
  const session = await schoolAdminSession.get();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = createSessionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid input.' }, { status: 400 });
  }

  const { title, description, start_date, end_date } = parsed.data;

  if (new Date(end_date) <= new Date(start_date)) {
    return NextResponse.json({ error: 'End date must be after the start date.' }, { status: 400 });
  }

  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from('voting_sessions')
    .insert({
      school_id: session.school_id,
      title,
      description: description || null,
      start_date,
      end_date,
    })
    .select('id, title, description, start_date, end_date, created_at')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, session: data }, { status: 201 });
}
