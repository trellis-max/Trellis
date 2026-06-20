'use client';

import { createCouple } from '../actions';
import { useActionState } from 'react';

const initialState = { error: '' };

function submitAction(_state: typeof initialState, formData: FormData) {
  return createCouple(formData).then(() => initialState).catch((e) => ({ error: String(e) }));
}

export default function NewCouplePage() {
  const [state, formAction, isPending] = useActionState(submitAction, initialState);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold text-trellis-charcoal">Add New Lead</h1>

      <form action={formAction} className="space-y-4 rounded-xl bg-white p-6 shadow-sm">
        <div>
          <label htmlFor="partner_1_name" className="block text-sm font-medium text-trellis-charcoal/80">
            Partner 1 Name *
          </label>
          <input id="partner_1_name" name="partner_1_name" required
            className="mt-1 w-full rounded-lg border border-trellis-warm-gray px-4 py-2.5 focus:border-trellis-gold focus:outline-none focus:ring-1 focus:ring-trellis-gold" />
        </div>

        <div>
          <label htmlFor="partner_2_name" className="block text-sm font-medium text-trellis-charcoal/80">
            Partner 2 Name
          </label>
          <input id="partner_2_name" name="partner_2_name"
            className="mt-1 w-full rounded-lg border border-trellis-warm-gray px-4 py-2.5 focus:border-trellis-gold focus:outline-none focus:ring-1 focus:ring-trellis-gold" />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-trellis-charcoal/80">
            Email *
          </label>
          <input id="email" name="email" type="email" required
            className="mt-1 w-full rounded-lg border border-trellis-warm-gray px-4 py-2.5 focus:border-trellis-gold focus:outline-none focus:ring-1 focus:ring-trellis-gold" />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-trellis-charcoal/80">
            Phone
          </label>
          <input id="phone" name="phone" type="tel"
            className="mt-1 w-full rounded-lg border border-trellis-warm-gray px-4 py-2.5 focus:border-trellis-gold focus:outline-none focus:ring-1 focus:ring-trellis-gold" />
        </div>

        <div>
          <label htmlFor="source" className="block text-sm font-medium text-trellis-charcoal/80">
            How did they find Willow Acres?
          </label>
          <select id="source" name="source"
            className="mt-1 w-full rounded-lg border border-trellis-warm-gray px-4 py-2.5 focus:border-trellis-gold focus:outline-none">
            <option value="">Select...</option>
            <option value="referral">Referral</option>
            <option value="website">Website</option>
            <option value="instagram">Instagram</option>
            <option value="the_knot">The Knot</option>
            <option value="weddingwire">WeddingWire</option>
            <option value="facebook">Facebook</option>
            <option value="drive_by">Drive-By</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-trellis-charcoal/80">
            Notes
          </label>
          <textarea id="notes" name="notes" rows={3}
            className="mt-1 w-full rounded-lg border border-trellis-warm-gray px-4 py-2.5 focus:border-trellis-gold focus:outline-none focus:ring-1 focus:ring-trellis-gold" />
        </div>

        {state.error && <p className="text-sm text-trellis-error">{state.error}</p>}

        <button type="submit" disabled={isPending}
          className="w-full rounded-lg bg-trellis-gold px-4 py-3 text-base font-semibold text-trellis-charcoal-dark transition hover:bg-trellis-gold-light disabled:opacity-50">
          {isPending ? 'Creating...' : 'Add Lead'}
        </button>
      </form>
    </div>
  );
}
