/**
 * Supabase Query Helpers
 * ======================
 * Reusable server-side queries for dashboard and pages.
 */

import { createServerSupabaseClient } from './server';
import type { LifecycleStage } from '@/types/database';

/** Dashboard stats: counts of key metrics */
export async function getDashboardStats() {
  const supabase = await createServerSupabaseClient();

  const [couplesRes, eventsRes, tasksRes, paymentsRes] = await Promise.all([
    supabase
      .from('couples')
      .select('id, lifecycle_stage')
      .in('lifecycle_stage', ['lead', 'inquiry', 'tour_scheduled', 'tour_complete', 'proposal_sent', 'contract_sent']),
    supabase
      .from('events')
      .select('id, event_date')
      .gte('event_date', new Date().toISOString().split('T')[0])
      .order('event_date', { ascending: true })
      .limit(10),
    supabase
      .from('tasks')
      .select('id')
      .in('status', ['pending', 'in_progress']),
    supabase
      .from('payments')
      .select('amount, received_at')
      .gte('received_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
  ]);

  const activeLeads = couplesRes.data?.length ?? 0;
  const upcomingEvents = eventsRes.data?.length ?? 0;
  const openTasks = tasksRes.data?.length ?? 0;
  const monthRevenue = paymentsRes.data?.reduce((sum, p) => sum + Number(p.amount), 0) ?? 0;

  return { activeLeads, upcomingEvents, openTasks, monthRevenue, upcomingEventsList: eventsRes.data ?? [] };
}

/** Funnel stage counts for the booking funnel chart */
export async function getFunnelCounts(): Promise<Record<LifecycleStage, number>> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from('couples').select('lifecycle_stage');

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    counts[row.lifecycle_stage] = (counts[row.lifecycle_stage] ?? 0) + 1;
  }
  return counts as Record<LifecycleStage, number>;
}

/** Get all couples, optionally filtered by stage */
export async function getCouples(stage?: LifecycleStage) {
  const supabase = await createServerSupabaseClient();
  let query = supabase.from('couples').select('*').order('created_at', { ascending: false });
  if (stage) query = query.eq('lifecycle_stage', stage);
  const { data, error } = await query;
  return { data: data ?? [], error };
}

/** Get a single couple by ID with their events */
export async function getCoupleWithEvents(coupleId: string) {
  const supabase = await createServerSupabaseClient();
  const [coupleRes, eventsRes] = await Promise.all([
    supabase.from('couples').select('*').eq('id', coupleId).single(),
    supabase.from('events').select('*').eq('couple_id', coupleId).order('event_date', { ascending: true }),
  ]);
  return { couple: coupleRes.data, events: eventsRes.data ?? [], error: coupleRes.error };
}

/** Get inventory items with optional low-stock filter */
export async function getInventoryItems(lowStockOnly = false) {
  const supabase = await createServerSupabaseClient();
  let query = supabase.from('inventory_items').select('*').eq('is_active', true).order('name');
  if (lowStockOnly) {
    // Can\'t do column comparison in PostgREST, so we fetch all and filter client-side
  }
  const { data, error } = await query;
  return { data: data ?? [], error };
}

/** Get all tasks, optionally filtered by status */
export async function getTasks(status?: string) {
  const supabase = await createServerSupabaseClient();
  let query = supabase.from('tasks').select('*').order('created_at', { ascending: false });
  if (status) query = query.eq('status', status);
  const { data, error } = await query;
  return { data: data ?? [], error };
}

/** Get upcoming events with couple info */
export async function getUpcomingEvents() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('events')
    .select('*, couples(partner_1_name, partner_2_name, customer_id)')
    .gte('event_date', new Date().toISOString().split('T')[0])
    .order('event_date', { ascending: true });
  return { data: data ?? [], error };
}

/** Get expenses with optional date range */
export async function getExpenses(startDate?: string) {
  const supabase = await createServerSupabaseClient();
  let query = supabase.from('expenses').select('*').order('date', { ascending: false });
  if (startDate) query = query.gte('date', startDate);
  const { data, error } = await query;
  return { data: data ?? [], error };
}

/** Get staff members */
export async function getStaffMembers() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('staff_members')
    .select('*, profiles(full_name, email, phone)')
    .eq('is_active', true);
  return { data: data ?? [], error };
}
