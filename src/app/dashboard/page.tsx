/**
 * Owner Dashboard — Overview (Server Component)
 * ==============================================
 * Wired to live Supabase queries. Kindergarten-simple, mobile-first.
 */

import { getDashboardStats, getFunnelCounts } from '@/lib/supabase/queries';
import { FUNNEL_STAGES, STAGE_LABELS, STAGE_COLORS } from '@/lib/crm/lifecycle';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning ☀️';
  if (hour < 17) return 'Good afternoon 🌤️';
  return 'Good evening 🌙';
}

export default async function DashboardPage() {
  let stats = { activeLeads: 0, upcomingEvents: 0, openTasks: 0, monthRevenue: 0, upcomingEventsList: [] as { id: string; event_date: string }[] };
  let funnelCounts: Record<string, number> = {};
  let dbConnected = false;

  try {
    [stats, funnelCounts] = await Promise.all([getDashboardStats(), getFunnelCounts()]);
    dbConnected = true;
  } catch {
    // DB not connected yet — show placeholder UI
  }

  const statCards = [
    { label: 'Active Leads', value: dbConnected ? String(stats.activeLeads) : '—', icon: '🌱', color: 'bg-blue-50 text-blue-700' },
    { label: 'Upcoming Events', value: dbConnected ? String(stats.upcomingEvents) : '—', icon: '📅', color: 'bg-green-50 text-green-700' },
    { label: 'This Month Revenue', value: dbConnected ? formatCurrency(stats.monthRevenue) : '—', icon: '💰', color: 'bg-yellow-50 text-yellow-700' },
    { label: 'Open Tasks', value: dbConnected ? String(stats.openTasks) : '—', icon: '✅', color: 'bg-purple-50 text-purple-700' },
  ];

  const maxFunnel = Math.max(...FUNNEL_STAGES.map(s => funnelCounts[s] ?? 0), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-trellis-charcoal">{getGreeting()}</h1>
        <p className="mt-1 text-trellis-charcoal/60">
          Here&apos;s what&apos;s happening at Willow Acres
        </p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="rounded-xl bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-2xl">{stat.icon}</span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${stat.color}`}>
                {stat.value}
              </span>
            </div>
            <p className="mt-3 text-sm font-medium text-trellis-charcoal/70">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Booking Funnel */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-trellis-charcoal">Booking Funnel</h2>
        <div className="space-y-3">
          {FUNNEL_STAGES.map((stage) => {
            const count = funnelCounts[stage] ?? 0;
            const pct = maxFunnel > 0 ? Math.max((count / maxFunnel) * 100, 4) : 4;
            return (
              <div key={stage} className="flex items-center gap-3">
                <span className="w-28 text-sm font-medium text-trellis-charcoal/70">{STAGE_LABELS[stage]}</span>
                <div className="flex-1">
                  <div className="h-8 w-full rounded-lg bg-gray-100">
                    <div
                      className={`h-8 rounded-lg ${STAGE_COLORS[stage].split(' ')[0]} flex items-center px-3 text-xs font-bold text-white transition-all`}
                      style={{ width: `${pct}%` }}
                    >
                      {count > 0 ? count : ''}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {!dbConnected && (
          <p className="mt-4 text-center text-xs text-trellis-charcoal/40">
            Set SUPABASE env vars to see live data
          </p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-trellis-charcoal">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'New Lead', icon: '➕', href: '/dashboard/couples/new' },
            { label: 'Snap Receipt', icon: '📸', href: '/dashboard/finances' },
            { label: 'Add Task', icon: '📋', href: '/dashboard/tasks' },
            { label: 'Ask Trellis', icon: '💬', href: '#ask-trellis' },
          ].map((action) => (
            <a key={action.label} href={action.href}
              className="flex flex-col items-center gap-2 rounded-xl border-2 border-trellis-warm-gray p-4 text-center transition hover:border-trellis-gold hover:bg-trellis-gold/5">
              <span className="text-2xl">{action.icon}</span>
              <span className="text-sm font-medium text-trellis-charcoal">{action.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
