import { NextResponse } from 'next/server';
import { clearSysAdminSession } from '@/lib/session';

export async function POST() {
  clearSysAdminSession();
  return NextResponse.json({ ok: true });
}
