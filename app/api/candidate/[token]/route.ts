import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { consumeToken } from '@/lib/tokens';

export async function GET(_req: NextRequest, { params }: { params: { token: string } }) {
  const supabase = supabaseAdmin();

  const { data: row } = await supabase
    .from('verification_tokens')
    .select('target_id, expires_at, used_at')
    .eq('token', params.token)
    .eq('purpose', 'candidate_pitch')
    .maybeSingle();

  if (!row) return NextResponse.json({ error: 'Invalid or unknown link.' }, { status: 400 });
  if (row.used_at) return NextResponse.json({ error: 'This link has already been used.' }, { status: 400 });
  if (new Date(row.expires_at) < new Date()) {
    return NextResponse.json({ error: 'This link has expired. Ask the school admin to resend it.' }, { status: 400 });
  }

  const { data: candidate } = await supabase
    .from('candidates')
    .select('id, name, position, verified, schools(name)')
    .eq('id', row.target_id)
    .maybeSingle();

  if (!candidate) return NextResponse.json({ error: 'Candidate not found.' }, { status: 404 });
  if (candidate.verified) return NextResponse.json({ error: 'You have already submitted your pitch.' }, { status: 400 });

  return NextResponse.json({
    candidateName: candidate.name,
    position: candidate.position,
    schoolName: (candidate as any).schools?.name ?? '',
  });
}

const submitSchema = z.object({
  token: z.string().min(10),
  pitch: z.string().min(20, 'Your pitch should be at least 20 characters.'),
  photo: z.string().url('Enter a valid image URL.').optional().or(z.literal('')),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = submitSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid input.' }, { status: 400 });
  }

  const { token, pitch, photo } = parsed.data;
  const supabase = supabaseAdmin();
  const tokenRow = await consumeToken(supabase, token, 'candidate_pitch');

  if (!tokenRow) {
    return NextResponse.json({ error: 'This link is invalid, expired, or already used.' }, { status: 400 });
  }

  const { error } = await supabase
    .from('candidates')
    .update({ pitch, photo: photo || null, verified: true })
    .eq('id', tokenRow.target_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
