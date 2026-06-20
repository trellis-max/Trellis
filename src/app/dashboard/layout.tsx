import type { ReactNode } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
}

const navItems = [
  { label: 'Overview', href: '/dashboard', icon: '📊' },
  { label: 'Couples', href: '/dashboard/couples', icon: '💍' },
  { label: 'Events', href: '/dashboard/events', icon: '📅' },
  { label: 'Inventory', href: '/dashboard/inventory', icon: '📦' },
  { label: 'Finances', href: '/dashboard/finances', icon: '💰' },
  { label: 'Tasks', href: '/dashboard/tasks', icon: '✅' },
  { label: 'Staff', href: '/dashboard/staff', icon: '👥' },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-30 flex h-full w-64 flex-col bg-trellis-charcoal">
        {/* Logo */}
        <div className="flex h-16 items-center px-6">
          <span className="text-2xl font-bold text-trellis-gold">Trellis</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-trellis-warm-gray transition hover:bg-trellis-charcoal-light hover:text-trellis-gold"
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>

        {/* User area */}
        <div className="border-t border-trellis-charcoal-light px-4 py-3">
          <p className="text-xs text-trellis-warm-gray/50">Signed in as</p>
          <p className="truncate text-sm font-medium text-trellis-warm-gray">
            Owner
          </p>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 flex-1 bg-trellis-cream">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-trellis-warm-gray bg-white px-6 shadow-sm">
          <h2 className="text-lg font-semibold text-trellis-charcoal">
            Willow Acres
          </h2>
          <div className="flex items-center gap-4">
            <button
              className="rounded-lg bg-trellis-gold/10 px-3 py-1.5 text-sm font-medium text-trellis-gold-dark transition hover:bg-trellis-gold/20"
              aria-label="Ask Trellis AI"
            >
              💬 Ask Trellis
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
