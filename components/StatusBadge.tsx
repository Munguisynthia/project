type Status = 'verified' | 'pending';

export default function StatusBadge({ status }: { status: Status }) {
  const isVerified = status === 'verified';
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
        isVerified ? 'bg-okbg text-ok' : 'bg-warnbg text-warn'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isVerified ? 'bg-ok' : 'bg-warn'}`} />
      {isVerified ? 'Verified' : 'Pending activation'}
    </span>
  );
}
