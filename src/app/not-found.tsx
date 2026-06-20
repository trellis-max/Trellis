import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <p className="text-6xl mb-4">🌿</p>
        <h1 className="text-3xl font-bold text-[#D4AF37] mb-2">Page Not Found</h1>
        <p className="text-gray-400 mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/dashboard"
          className="inline-block px-6 py-3 bg-[#D4AF37] text-black rounded-lg font-medium hover:bg-[#C4A030]"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
