import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import SchoolDetailClient from '@/components/SchoolDetailClient';

export const dynamic = 'force-dynamic';

export default async function SchoolDetailPage({ params }: { params: { id: string } }) {
  const supabase = supabaseAdmin();

  const { data: school } = await supabase
    .from('schools')
    .select('id, name, gov_id, email, student_prefix, verified, created_at')
    .eq('id', params.id)
    .maybeSingle();

  if (!school) notFound();

  const [{ count: students }, { count: admins }, { count: sessions }] = await Promise.all([
    supabase.from('students').select('id', { count: 'exact', head: true }).eq('school_id', params.id),
    supabase.from('school_admins').select('id', { count: 'exact', head: true }).eq('school_id', params.id),
    supabase.from('voting_sessions').select('id', { count: 'exact', head: true }).eq('school_id', params.id),
  ]);

  return (
    <div>
      <div className="px-8 pt-6">
        <Link href="/sysadmin/dashboard" className="text-sm text-muted hover:text-ink">
          ← Back to schools
        </Link>
      </div>
      <SchoolDetailClient
        school={school}
        stats={{ students: students ?? 0, admins: admins ?? 0, sessions: sessions ?? 0 }}
      />
    </div>
  );
}
