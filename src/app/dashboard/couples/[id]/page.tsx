import { getCoupleWithEvents } from '@/lib/supabase/queries';
import { STAGE_LABELS, STAGE_COLORS, getNextStages } from '@/lib/crm/lifecycle';
import type { LifecycleStage } from '@/types/database';
import { LifecycleActions } from './lifecycle-actions';
import { notFound } from 'next/navigation';

export default async function CoupleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let couple: Record<string, unknown> | null = null;
  let events: Array<Record<string, unknown>> = [];

  try {
    const result = await getCoupleWithEvents(id);
    if (result.error || !result.couple) notFound();
    couple = result.couple;
    events = result.events;
  } catch {
    notFound();
  }

  if (!couple) notFound();

  const stage = couple.lifecycle_stage as LifecycleStage;
  const nextStages = getNextStages(stage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-mono text-trellis-charcoal/50">{couple.customer_id as string}</p>
          <h1 className="text-2xl font-bold text-trellis-charcoal">
            {couple.partner_1_name as string}
            {couple.partner_2_name ? ` & ${couple.partner_2_name}` : ''}
          </h1>
          <p className="mt-1 text-sm text-trellis-charcoal/60">{couple.email as string}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-medium ${STAGE_COLORS[stage]}`}>
          {STAGE_LABELS[stage]}
        </span>
      </div>

      {/* Lifecycle Transitions */}
      {nextStages.length > 0 && (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-trellis-charcoal">Move to Next Stage</h2>
          <LifecycleActions
            coupleId={id}
            currentStage={stage}
            nextStages={nextStages}
          />
        </div>
      )}

      {/* Contact Info */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-trellis-charcoal">Contact</h2>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium text-trellis-charcoal/50 uppercase">Email</dt>
            <dd className="mt-1">{couple.email as string}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-trellis-charcoal/50 uppercase">Phone</dt>
            <dd className="mt-1">{(couple.phone as string) || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-trellis-charcoal/50 uppercase">Source</dt>
            <dd className="mt-1">{(couple.source as string) || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-trellis-charcoal/50 uppercase">Created</dt>
            <dd className="mt-1">{new Date(couple.created_at as string).toLocaleDateString()}</dd>
          </div>
        </dl>
      </div>

      {/* Events */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-trellis-charcoal">Events</h2>
        {events.length === 0 ? (
          <p className="text-trellis-charcoal/40">No events yet</p>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div key={event.id as string} className="flex items-center justify-between rounded-lg border border-trellis-warm-gray p-4">
                <div>
                  <p className="font-medium">{event.event_type as string}</p>
                  <p className="text-sm text-trellis-charcoal/60">
                    {event.event_date ? new Date(event.event_date as string).toLocaleDateString() : 'Date TBD'}
                    {event.guest_count ? ` · ${event.guest_count} guests` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-trellis-charcoal">Notes</h2>
        <p className="whitespace-pre-wrap text-trellis-charcoal/70">
          {(couple.notes as string) || 'No notes yet.'}
        </p>
      </div>
    </div>
  );
}
