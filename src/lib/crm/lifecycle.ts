/**
 * CRM Lifecycle Engine
 * ====================
 * Defines valid stage transitions for Willow Acres couples.
 * 13 stages from lead → closed/lost.
 */

import type { LifecycleStage } from '@/types/database';

/** Valid forward transitions — couples move through this funnel */
export const STAGE_TRANSITIONS: Record<LifecycleStage, LifecycleStage[]> = {
  lead:            ['inquiry', 'lost'],
  inquiry:         ['tour_scheduled', 'lost'],
  tour_scheduled:  ['tour_complete', 'lost'],
  tour_complete:   ['proposal_sent', 'lost'],
  proposal_sent:   ['contract_sent', 'lost'],
  contract_sent:   ['booked', 'lost'],
  booked:          ['planning'],
  planning:        ['week_of'],
  week_of:         ['event_day'],
  event_day:       ['post_event'],
  post_event:      ['closed'],
  closed:          [],
  lost:            ['lead'], // allow re-engagement
};

/** Human-readable stage labels */
export const STAGE_LABELS: Record<LifecycleStage, string> = {
  lead:            'Lead',
  inquiry:         'Inquiry',
  tour_scheduled:  'Tour Scheduled',
  tour_complete:   'Tour Complete',
  proposal_sent:   'Proposal Sent',
  contract_sent:   'Contract Sent',
  booked:          'Booked',
  planning:        'Planning',
  week_of:         'Week Of',
  event_day:       'Event Day',
  post_event:      'Post-Event',
  closed:          'Closed',
  lost:            'Lost',
};

/** Stage colors for UI */
export const STAGE_COLORS: Record<LifecycleStage, string> = {
  lead:            'bg-blue-100 text-blue-800',
  inquiry:         'bg-sky-100 text-sky-800',
  tour_scheduled:  'bg-cyan-100 text-cyan-800',
  tour_complete:   'bg-teal-100 text-teal-800',
  proposal_sent:   'bg-amber-100 text-amber-800',
  contract_sent:   'bg-orange-100 text-orange-800',
  booked:          'bg-green-100 text-green-800',
  planning:        'bg-emerald-100 text-emerald-800',
  week_of:         'bg-yellow-100 text-yellow-800',
  event_day:       'bg-rose-100 text-rose-800',
  post_event:      'bg-purple-100 text-purple-800',
  closed:          'bg-gray-100 text-gray-800',
  lost:            'bg-red-100 text-red-800',
};

/** Funnel stages (for the overview chart — excludes terminal states) */
export const FUNNEL_STAGES: LifecycleStage[] = [
  'lead', 'inquiry', 'tour_scheduled', 'tour_complete',
  'proposal_sent', 'contract_sent', 'booked', 'planning',
];

/** Check if a transition is valid */
export function canTransition(from: LifecycleStage, to: LifecycleStage): boolean {
  return STAGE_TRANSITIONS[from]?.includes(to) ?? false;
}

/** Get the next valid stages for a given current stage */
export function getNextStages(current: LifecycleStage): LifecycleStage[] {
  return STAGE_TRANSITIONS[current] ?? [];
}
