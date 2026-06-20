"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <p className="text-5xl mb-4">⚠️</p>
        <h1 className="text-2xl font-bold text-[#D4AF37] mb-2">Something Went Wrong</h1>
        <p className="text-gray-400 mb-6">
          An unexpected error occurred. Please try again or contact support if
          the problem persists.
        </p>
        {error.digest && (
          <p className="text-xs text-gray-600 mb-4 font-mono">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-[#D4AF37] text-black rounded-lg font-medium hover:bg-[#C4A030]"
          >
            Try Again
          </button>
          <a
            href="/dashboard"
            className="px-6 py-3 bg-[#3A3A3A] text-white rounded-lg hover:bg-[#4A4A4A]"
          >
            Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
