import { NextResponse } from 'next/server';
import { schoolAdminSession } from '@/lib/schoolAdminSession';

export async function POST() {
  schoolAdminSession.clear();
  return NextResponse.json({ ok: true });
}
