import { NextResponse } from 'next/server';
import { studentSession } from '@/lib/studentSession';

export async function GET() {
  const session = await studentSession.get();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ student: session });
}
