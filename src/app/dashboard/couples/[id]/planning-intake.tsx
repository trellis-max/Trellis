'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const intakeQuestions = [
  { key: 'ceremony_style', label: 'Ceremony Style', type: 'select', options: ['Traditional', 'Modern', 'Rustic', 'Bohemian', 'Other'] },
  { key: 'color_palette', label: 'Color Palette / Theme', type: 'text' },
  { key: 'dietary_restrictions', label: 'Dietary Restrictions or Allergies', type: 'textarea' },
  { key: 'bar_preference', label: 'Bar Package Preference', type: 'select', options: ['Beer & Wine', 'Full Bar', 'Premium Bar', 'Non-Alcoholic Only'] },
  { key: 'special_requests', label: 'Special Requests', type: 'textarea' },
  { key: 'vendor_list', label: 'Known Vendors (photographer, DJ, florist, etc.)', type: 'textarea' },
  { key: 'timeline_notes', label: 'Timeline / Schedule Preferences', type: 'textarea' },
];

export function PlanningIntakeForm({ coupleId, eventId }: { coupleId: string; eventId: string }) {
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const supabase = createClient();
    const { error } = await supabase.from('planning_intakes').insert({
      couple_id: coupleId,
      event_id: eventId,
      responses,
      submitted_at: new Date().toISOString(),
      processed: false,
    });

    if (!error) {
      setSuccess(true);
      router.refresh();
    }
    setSubmitting(false);
  }

  if (success) {
    return (
      <div className="rounded-xl bg-green-50 p-6 text-center">
        <p className="text-lg font-semibold text-green-800">✅ Planning intake submitted!</p>
        <p className="mt-1 text-sm text-green-600">We'll review your responses and get back to you soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-trellis-charcoal">Planning Questionnaire</h3>
      <p className="text-sm text-trellis-charcoal/60">Help us understand your vision for the perfect day.</p>

      {intakeQuestions.map((q) => (
        <div key={q.key}>
          <label className="block text-sm font-medium text-trellis-charcoal/80">{q.label}</label>
          {q.type === 'select' ? (
            <select value={responses[q.key] ?? ''} onChange={(e) => setResponses((r) => ({ ...r, [q.key]: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-trellis-warm-gray px-3 py-2 focus:border-trellis-gold focus:outline-none">
              <option value="">Select...</option>
              {q.options?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          ) : q.type === 'textarea' ? (
            <textarea value={responses[q.key] ?? ''} onChange={(e) => setResponses((r) => ({ ...r, [q.key]: e.target.value }))}
              rows={3} className="mt-1 w-full rounded-lg border border-trellis-warm-gray px-3 py-2 focus:border-trellis-gold focus:outline-none" />
          ) : (
            <input type="text" value={responses[q.key] ?? ''} onChange={(e) => setResponses((r) => ({ ...r, [q.key]: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-trellis-warm-gray px-3 py-2 focus:border-trellis-gold focus:outline-none" />
          )}
        </div>
      ))}

      <button type="submit" disabled={submitting}
        className="w-full rounded-lg bg-trellis-gold px-4 py-3 font-semibold text-trellis-charcoal-dark transition hover:bg-trellis-gold-light disabled:opacity-50">
        {submitting ? 'Submitting...' : 'Submit Planning Intake'}
      </button>
    </form>
  );
}
