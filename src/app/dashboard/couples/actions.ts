"use server";

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { canTransition } from '@/lib/crm/lifecycle';
import { redirect } from 'next/navigation';
import type { LifecycleStage } from '@/types/database';

export async function createCouple(formData: FormData) {
  const supabase = await createServerSupabaseClient();

  const partner1 = formData.get('partner_1_name') as string;
  const partner2 = formData.get('partner_2_name') as string | null;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string | null;
  const source = formData.get('source') as string | null;
  const notes = formData.get('notes') as string | null;

  const { data, error } = await supabase
    .from('couples')
    .insert({
      partner_1_name: partner1,
      partner_2_name: partner2 || null,
      email,
      phone: phone || null,
      source: source || null,
      notes: notes || null,
      lifecycle_stage: 'lead',
    })
    .select('id')
    .single();

  if (error) {
    return { error: error.message };
  }

  redirect(`/dashboard/couples/${data.id}`);
}

export async function updateLifecycleStage(coupleId: string, newStage: LifecycleStage, currentStage: LifecycleStage) {
  if (!canTransition(currentStage, newStage)) {
    return { error: `Cannot transition from ${currentStage} to ${newStage}` };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from('couples')
    .update({ lifecycle_stage: newStage })
    .eq('id', coupleId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function updateCoupleNotes(coupleId: string, notes: string) {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from('couples')
    .update({ notes })
    .eq('id', coupleId);

  if (error) return { error: error.message };
  return { success: true };
}
