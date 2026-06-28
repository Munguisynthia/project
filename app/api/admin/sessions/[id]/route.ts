import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { schoolAdminSession } from '@/lib/schoolAdminSession';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await schoolAdminSession.get();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from('voting_sessions')
    .select('id, title, description, start_date, end_date, created_at')
    .eq('id', params.id)
    .eq('school_id', session.school_id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Session not found.' }, { status: 404 });
  return NextResponse.json({ session: data });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await schoolAdminSession.get();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const supabase = supabaseAdmin();

  const { data, error } = await supabase
    .from('voting_sessions')
    .update(body)
    .eq('id', params.id)
    .eq('school_id', session.school_id)
    .select('id, title, description, start_date, end_date')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, session: data });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await schoolAdminSession.get();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = supabaseAdmin();
  const { error } = await supabase
    .from('voting_sessions')
    .delete()
    .eq('id', params.id)
    .eq('school_id', session.school_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
