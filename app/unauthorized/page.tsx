import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-canvas px-4">
      <div className="text-center max-w-sm">
        <div className="w-12 h-12 rounded-2xl bg-dangerbg flex items-center justify-center mx-auto mb-4">
          <span className="text-danger font-display font-bold text-lg">!</span>
        </div>
        <h1 className="font-display text-lg font-bold text-ink mb-2">You don't have access to this page</h1>
        <p className="text-sm text-muted mb-6">
          Your session may have expired, or this area requires a different login.
        </p>
        <Link
          href="/"
          className="inline-block px-4 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition"
        >
          Go to homepage
        </Link>
      </div>
    </main>
  );
}
