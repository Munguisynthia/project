import { NextResponse } from 'next/server';
import { studentSession } from '@/lib/studentSession';

export async function POST() {
  studentSession.clear();
  return NextResponse.json({ ok: true });
}
