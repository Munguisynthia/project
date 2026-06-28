import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';

export const dynamic = 'force-dynamic';

export default async function SchoolsDashboardPage() {
  const supabase = supabaseAdmin();
  const { data: schools, error } = await supabase
    .from('schools')
    .select('id, name, gov_id, email, student_prefix, verified, created_at')
    .order('created_at', { ascending: false });

  const total = schools?.length ?? 0;
  const verified = schools?.filter((s) => s.verified).length ?? 0;
  const pending = total - verified;

  return (
    <div className="px-8 py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Schools</h1>
          <p className="text-sm text-muted mt-1">All schools registered on the platform.</p>
        </div>
        <Link
          href="/sysadmin/schools/new"
          className="px-4 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition"
        >
          + Add a school
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Total schools" value={total} accent="brand" />
        <StatCard label="Activated" value={verified} accent="ok" />
        <StatCard label="Pending activation" value={pending} accent="warn" />
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-dangerbg text-danger text-sm mb-6">
          Couldn't load schools: {error.message}
        </div>
      )}

      <div className="bg-surface border border-border rounded-2xl shadow-card overflow-hidden">
        {total === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="font-display text-base font-bold text-ink mb-1">No schools yet</p>
            <p className="text-sm text-muted mb-5">Add your first school to get started.</p>
            <Link
              href="/sysadmin/schools/new"
              className="inline-block px-4 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition"
            >
              + Add a school
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surfacealt text-left text-xs font-medium text-muted uppercase tracking-wide">
                <th className="px-5 py-3">School</th>
                <th className="px-5 py-3">Prefix</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {schools!.map((s) => (
                <tr key={s.id} className="border-t border-border hover:bg-surfacealt transition">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-ink">{s.name}</p>
                    <p className="text-xs text-muted">{s.gov_id}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 font-mono text-xs font-semibold">
                      {s.student_prefix}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-ink">{s.email}</td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={s.verified ? 'verified' : 'pending'} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      href={`/sysadmin/schools/${s.id}`}
                      className="text-brand-500 font-medium hover:text-brand-600"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
