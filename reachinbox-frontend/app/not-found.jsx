import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-md w-full text-center">
        {/* Error Code */}
        <h1 className="text-7xl font-bold text-primary mb-4">404</h1>

        {/* Message */}
        <h2 className="text-2xl font-semibold mb-2">Page not found</h2>

        <p className="text-muted-foreground mb-8">
          The page you’re looking for doesn’t exist or has been moved.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/"
            className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition"
          >
            Go Home
          </Link>

          <Link
            href="/dashboard"
            className="px-6 py-2.5 rounded-xl border border-border hover:bg-muted transition"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
