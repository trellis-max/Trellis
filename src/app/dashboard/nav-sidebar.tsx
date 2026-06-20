'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Overview', href: '/dashboard', icon: '📊' },
  { label: 'Couples', href: '/dashboard/couples', icon: '💍' },
  { label: 'Events', href: '/dashboard/events', icon: '📅' },
  { label: 'Inventory', href: '/dashboard/inventory', icon: '📦' },
  { label: 'Finances', href: '/dashboard/finances', icon: '💰' },
  { label: 'Tasks', href: '/dashboard/tasks', icon: '✅' },
  { label: 'Staff', href: '/dashboard/staff', icon: '👥' },
];

export function NavSidebar({ userName }: { userName: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed left-4 top-4 z-50 rounded-lg bg-trellis-charcoal p-2 text-trellis-gold lg:hidden"
        aria-label="Toggle menu"
      >
        {open ? '✕' : '☰'}
      </button>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 z-40 flex h-full w-64 flex-col bg-trellis-charcoal transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center px-6">
          <span className="text-2xl font-bold text-trellis-gold">Trellis</span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-trellis-charcoal-light text-trellis-gold'
                    : 'text-trellis-warm-gray hover:bg-trellis-charcoal-light hover:text-trellis-gold'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="border-t border-trellis-charcoal-light px-4 py-3">
          <p className="text-xs text-trellis-warm-gray/50">Signed in as</p>
          <p className="truncate text-sm font-medium text-trellis-warm-gray">{userName}</p>
        </div>
      </aside>
    </>
  );
}
