import { getUpcomingEvents } from '@/lib/supabase/queries';

export default async function EventsPage() {
  let events: Array<Record<string, unknown>> = [];
  let dbConnected = false;

  try {
    const result = await getUpcomingEvents();
    events = result.data;
    dbConnected = true;
  } catch { /* DB not connected */ }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-trellis-charcoal">Events</h1>

      {!dbConnected ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-trellis-charcoal/40">Connect Supabase to see events</p>
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-lg">📅</p>
          <p className="mt-2 text-trellis-charcoal/50">No upcoming events</p>
          <p className="text-sm text-trellis-charcoal/40">Events appear here when couples are booked</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const couple = event.couples as Record<string, string> | null;
            return (
              <div key={event.id as string} className="rounded-xl bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-trellis-charcoal">
                      {couple ? `${couple.partner_1_name}${couple.partner_2_name ? ` & ${couple.partner_2_name}` : ''}` : 'Unknown'}
                    </p>
                    <p className="text-sm text-trellis-charcoal/60">
                      {event.event_type as string} · {event.guest_count ? `${event.guest_count} guests` : 'Guest count TBD'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm text-trellis-gold-dark">
                      {event.event_date ? new Date(event.event_date as string).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'Date TBD'}
                    </p>
                    {couple?.customer_id && (
                      <p className="text-xs text-trellis-charcoal/40">{couple.customer_id}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
