import type { ReactNode } from 'react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { NavSidebar } from './nav-sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  let userName = 'Owner';
  
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      redirect('/auth/login');
    }

    // Get profile name
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', user.id)
      .single();

    userName = profile?.full_name ?? user.email ?? 'Owner';
  } catch {
    // Not connected — allow through for preview
  }

  return (
    <div className="flex min-h-screen">
      <NavSidebar userName={userName} />

      {/* Main content */}
      <main className="ml-0 flex-1 bg-trellis-cream lg:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-trellis-warm-gray bg-white px-6 shadow-sm">
          <h2 className="text-lg font-semibold text-trellis-charcoal">Willow Acres</h2>
          <div className="flex items-center gap-4">
            <button
              className="rounded-lg bg-trellis-gold/10 px-3 py-1.5 text-sm font-medium text-trellis-gold-dark transition hover:bg-trellis-gold/20"
              aria-label="Ask Trellis AI"
            >
              💬 Ask Trellis
            </button>
          </div>
        </header>

        <div className="p-4 sm:p-6">{children}</div>
      </main>
    </div>
  );
}
