export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-trellis-charcoal">
      <div className="text-center">
        <h1 className="mb-2 text-5xl font-bold text-trellis-gold tracking-tight">
          Trellis
        </h1>
        <p className="text-lg text-trellis-warm-gray">
          Willow Acres Operations Platform
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
          <a
            href="/auth/login"
            className="rounded-lg bg-trellis-gold px-8 py-3 text-base font-semibold text-trellis-charcoal-dark transition hover:bg-trellis-gold-light active:bg-trellis-gold-dark"
          >
            Owner Login
          </a>
          <a
            href="/auth/couple"
            className="rounded-lg border-2 border-trellis-gold px-8 py-3 text-base font-semibold text-trellis-gold transition hover:bg-trellis-gold hover:text-trellis-charcoal-dark"
          >
            Couple Portal
          </a>
        </div>
      </div>
      <p className="mt-16 text-sm text-trellis-warm-gray/50">
        Preview Build
      </p>
    </main>
  );
}
