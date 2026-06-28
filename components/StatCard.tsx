export default function StatCard({
  label,
  value,
  accent = 'brand',
}: {
  label: string;
  value: string | number;
  accent?: 'brand' | 'ok' | 'warn';
}) {
  const borderColor =
    accent === 'ok' ? 'border-l-ok' : accent === 'warn' ? 'border-l-warn' : 'border-l-brand-500';

  return (
    <div className={`bg-surface rounded-2xl shadow-card border border-border border-l-4 ${borderColor} px-5 py-4`}>
      <p className="text-xs font-medium text-muted uppercase tracking-wide">{label}</p>
      <p className="font-display text-2xl font-bold text-ink mt-1">{value}</p>
    </div>
  );
}
