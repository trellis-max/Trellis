"use server";

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { InventoryUnit } from '@/types/database';

export async function addInventoryItem(formData: FormData) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.from('inventory_items').insert({
    name: formData.get('name') as string,
    category: formData.get('category') as string,
    unit: formData.get('unit') as InventoryUnit,
    current_quantity: Number(formData.get('current_quantity') || 0),
    par_level: Number(formData.get('par_level') || 0),
    reorder_point: Number(formData.get('reorder_point') || 0),
    cost_per_unit: formData.get('cost_per_unit') ? Number(formData.get('cost_per_unit')) : null,
    supplier: (formData.get('supplier') as string) || null,
  });

  if (error) return { error: error.message };
  revalidatePath('/dashboard/inventory');
  return { success: true };
}

export async function recordTransaction(formData: FormData) {
  const supabase = await createServerSupabaseClient();

  const itemId = formData.get('item_id') as string;
  const quantityChange = Number(formData.get('quantity_change'));
  const reason = formData.get('reason') as string;

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  // Insert transaction
  const { error: txError } = await supabase.from('inventory_transactions').insert({
    item_id: itemId,
    quantity_change: quantityChange,
    reason,
    performed_by: user?.id ?? '00000000-0000-0000-0000-000000000000',
  });
  if (txError) return { error: txError.message };

  // Update current quantity
  const { data: item } = await supabase
    .from('inventory_items')
    .select('current_quantity')
    .eq('id', itemId)
    .single();

  if (item) {
    await supabase
      .from('inventory_items')
      .update({ current_quantity: item.current_quantity + quantityChange })
      .eq('id', itemId);
  }

  revalidatePath('/dashboard/inventory');
  return { success: true };
}
