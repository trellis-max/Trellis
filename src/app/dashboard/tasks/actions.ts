"use server";

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { TaskPriority } from '@/types/database';

export async function createTask(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase.from('tasks').insert({
    title: formData.get('title') as string,
    description: (formData.get('description') as string) || null,
    priority: (formData.get('priority') as TaskPriority) || 'medium',
    due_date: (formData.get('due_date') as string) || null,
    status: 'pending',
    source: 'manual',
    ai_routed: false,
    created_by: user?.id ?? null,
  });

  if (error) return { error: error.message };
  revalidatePath('/dashboard/tasks');
  return { success: true };
}

export async function updateTaskStatus(taskId: string, status: string) {
  const supabase = await createServerSupabaseClient();
  const updates: Record<string, unknown> = { status };
  if (status === 'completed') updates.completed_at = new Date().toISOString();
  
  const { error } = await supabase.from('tasks').update(updates).eq('id', taskId);
  if (error) return { error: error.message };
  revalidatePath('/dashboard/tasks');
  return { success: true };
}
