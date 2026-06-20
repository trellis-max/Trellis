import { getTasks } from '@/lib/supabase/queries';
import { TaskList } from './task-list';

export default async function TasksPage() {
  let tasks: Array<{ id: string; title: string; status: string; priority: string; due_date: string | null; source: string | null; [key: string]: unknown }> = [];
  let dbConnected = false;

  try {
    const result = await getTasks();
    tasks = result.data;
    dbConnected = true;
  } catch { /* DB not connected */ }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-trellis-charcoal">Tasks</h1>
      </div>

      {!dbConnected ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-trellis-charcoal/40">Connect Supabase to manage tasks</p>
        </div>
      ) : (
        <TaskList initialTasks={tasks} />
      )}
    </div>
  );
}
