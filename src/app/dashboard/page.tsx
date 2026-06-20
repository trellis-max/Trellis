/**
 * Owner Dashboard — Overview
 * ===========================
 * The "visible owner-dashboard slice" (Greg add #1):
 * Funnel + key tiles, rendering on real data once connected.
 * Kindergarten-simple, mobile-first, daily-use.
 */

// Placeholder data — replaced by real Supabase queries in Phase 1
const stats = [
  { label: 'Active Leads', value: '—', icon: '🌱', color: 'bg-blue-50 text-blue-700' },
  { label: 'Upcoming Events', value: '—', icon: '📅', color: 'bg-green-50 text-green-700' },
  { label: 'This Month Revenue', value: '—', icon: '💰', color: 'bg-yellow-50 text-yellow-700' },
  { label: 'Open Tasks', value: '—', icon: '✅', color: 'bg-purple-50 text-purple-700' },
];

const funnelStages = [
  { stage: 'Leads', count: 0, color: 'bg-blue-400' },
  { stage: 'Tours', count: 0, color: 'bg-cyan-400' },
  { stage: 'Proposals', count: 0, color: 'bg-trellis-gold' },
  { stage: 'Booked', count: 0, color: 'bg-green-500' },
  { stage: 'Planning', count: 0, color: 'bg-trellis-gold-dark' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-trellis-charcoal">Good morning ☀️</h1>
        <p className="mt-1 text-trellis-charcoal/60">
          Here&apos;s what&apos;s happening at Willow Acres
        </p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">{stat.icon}</span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${stat.color}`}
              >
                {stat.value}
              </span>
            </div>
            <p className="mt-3 text-sm font-medium text-trellis-charcoal/70">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Sales Funnel */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-trellis-charcoal">
          Booking Funnel
        </h2>
        <div className="space-y-3">
          {funnelStages.map((stage) => (
            <div key={stage.stage} className="flex items-center gap-3">
              <span className="w-24 text-sm font-medium text-trellis-charcoal/70">
                {stage.stage}
              </span>
              <div className="flex-1">
                <div className="h-8 w-full rounded-lg bg-gray-100">
                  <div
                    className={`h-8 rounded-lg ${stage.color} flex items-center px-3 text-xs font-bold text-white transition-all`}
                    style={{ width: stage.count > 0 ? `${Math.max(stage.count * 10, 10)}%` : '4%' }}
                  >
                    {stage.count > 0 ? stage.count : ''}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-trellis-charcoal/40">
          Connect to see real data
        </p>
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-trellis-charcoal">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'New Lead', icon: '➕', href: '/dashboard/couples/new' },
            { label: 'Snap Receipt', icon: '📸', href: '/dashboard/finances/receipt' },
            { label: 'Voice Task', icon: '🎙️', href: '/dashboard/tasks/voice' },
            { label: 'Ask Trellis', icon: '💬', href: '#ask-trellis' },
          ].map((action) => (
            <a
              key={action.label}
              href={action.href}
              className="flex flex-col items-center gap-2 rounded-xl border-2 border-trellis-warm-gray p-4 text-center transition hover:border-trellis-gold hover:bg-trellis-gold/5"
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="text-sm font-medium text-trellis-charcoal">
                {action.label}
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-trellis-charcoal">
          Upcoming Events
        </h2>
        <div className="flex items-center justify-center py-8 text-trellis-charcoal/40">
          <p>No events yet — add your first couple to get started</p>
        </div>
      </div>

      {/* Inventory Alerts */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-trellis-charcoal">
          Inventory Alerts
        </h2>
        <div className="flex items-center justify-center py-8 text-trellis-charcoal/40">
          <p>No alerts — inventory tracking starts when items are added</p>
        </div>
      </div>
    </div>
  );
}
