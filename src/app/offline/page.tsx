"use client";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <p className="text-5xl mb-4">📡</p>
        <h1 className="text-2xl font-bold text-[#D4AF37] mb-2">You&apos;re Offline</h1>
        <p className="text-gray-400">
          Check your connection and try again. Your work is saved locally and
          will sync when you&apos;re back online.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-3 bg-[#D4AF37] text-black rounded-lg font-medium hover:bg-[#C4A030]"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
