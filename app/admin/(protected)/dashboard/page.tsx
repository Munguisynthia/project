import { schoolAdminSession } from '@/lib/schoolAdminSession';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import StatCard from '@/components/StatCard';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const session = await schoolAdminSession.get();
  const supabase = supabaseAdmin();
  const schoolId = session!.school_id;

  const now = new Date().toISOString();

  const [{ count: students }, { count: candidates }, { count: pendingCandidates }, { count: ongoing }] =
    await Promise.all([
      supabase.from('students').select('id', { count: 'exact', head: true }).eq('school_id', schoolId),
      supabase.from('candidates').select('id', { count: 'exact', head: true }).eq('school_id', schoolId),
      supabase
        .from('candidates')
        .select('id', { count: 'exact', head: true })
        .eq('school_id', schoolId)
        .eq('verified', false),
      supabase
        .from('voting_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('school_id', schoolId)
        .lte('start_date', now)
        .gte('end_date', now),
    ]);

  return (
    <div className="px-8 py-8 max-w-4xl">
      <h1 className="font-display text-2xl font-bold text-ink mb-1">Dashboard</h1>
      <p className="text-sm text-muted mb-6">Overview of your school's voting activity.</p>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Students" value={students ?? 0} accent="brand" />
        <StatCard label="Candidates" value={candidates ?? 0} accent="brand" />
        <StatCard label="Pending pitches" value={pendingCandidates ?? 0} accent="warn" />
        <StatCard label="Ongoing sessions" value={ongoing ?? 0} accent="ok" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Link href="/admin/students" className="bg-surface border border-border rounded-2xl shadow-card px-5 py-4 hover:border-brand-300 transition">
          <p className="font-display text-sm font-bold text-ink mb-1">Manage students</p>
          <p className="text-xs text-muted">Add students and send their login links.</p>
        </Link>
        <Link href="/admin/candidates" className="bg-surface border border-border rounded-2xl shadow-card px-5 py-4 hover:border-brand-300 transition">
          <p className="font-display text-sm font-bold text-ink mb-1">Manage candidates</p>
          <p className="text-xs text-muted">Add candidates and track pitch submissions.</p>
        </Link>
        <Link href="/admin/sessions" className="bg-surface border border-border rounded-2xl shadow-card px-5 py-4 hover:border-brand-300 transition">
          <p className="font-display text-sm font-bold text-ink mb-1">Voting sessions</p>
          <p className="text-xs text-muted">Create and schedule elections.</p>
        </Link>
      </div>
    </div>
  );
}
