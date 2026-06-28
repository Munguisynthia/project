import { randomBytes } from 'crypto';
import { SupabaseClient } from '@supabase/supabase-js';

export type TokenPurpose = 'school_setup' | 'student_login_link' | 'candidate_pitch';

export async function issueToken(
  supabase: SupabaseClient,
  opts: { purpose: TokenPurpose; targetTable: string; targetId: string; expiresInHours?: number }
) {
  const token = randomBytes(32).toString('hex');
  const expires_at = new Date(Date.now() + (opts.expiresInHours ?? 48) * 60 * 60 * 1000).toISOString();

  const { error } = await supabase.from('verification_tokens').insert({
    token,
    purpose: opts.purpose,
    target_table: opts.targetTable,
    target_id: opts.targetId,
    expires_at,
  });

  if (error) throw new Error(error.message);
  return token;
}

/** Returns the token row if valid (not used, not expired), otherwise null. Does NOT mark it used. */
export async function peekToken(supabase: SupabaseClient, token: string, purpose: TokenPurpose) {
  const { data: row, error } = await supabase
    .from('verification_tokens')
    .select('id, target_id, expires_at, used_at')
    .eq('token', token)
    .eq('purpose', purpose)
    .maybeSingle();

  if (error || !row) return null;
  if (row.used_at) return null;
  if (new Date(row.expires_at) < new Date()) return null;

  return row;
}

/** Marks a token row as used. Call this only after the action it gates has fully succeeded. */
export async function markTokenUsed(supabase: SupabaseClient, tokenRowId: string) {
  await supabase.from('verification_tokens').update({ used_at: new Date().toISOString() }).eq('id', tokenRowId);
}

/**
 * Convenience wrapper that peeks and immediately marks used in one step.
 * Only use this for flows where there is no further failure-prone work after
 * reading the token (e.g. simple read-only confirmations). For multi-step flows
 * like account creation, use peekToken() + markTokenUsed() so a downstream failure
 * doesn't burn the token.
 */
export async function consumeToken(supabase: SupabaseClient, token: string, purpose: TokenPurpose) {
  const row = await peekToken(supabase, token, purpose);
  if (!row) return null;
  await markTokenUsed(supabase, row.id);
  return row;
}

export function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
}
