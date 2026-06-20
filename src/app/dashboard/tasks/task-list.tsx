'use client';

import { useState } from 'react';
import { createTask, updateTaskStatus } from './actions';

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

const statusIcons: Record<string, string> = {
  pending: '⏳',
  in_progress: '🔄',
  completed: '✅',
  cancelled: '❌',
};

interface TaskItem {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string | null;
  source: string | null;
  [key: string]: unknown;
}

export function TaskList({ initialTasks }: { initialTasks: TaskItem[] }) {
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<string>('active');

  const filtered = tasks.filter((t) => {
    if (filter === 'active') return t.status === 'pending' || t.status === 'in_progress';
    if (filter === 'completed') return t.status === 'completed';
    return true;
  });

  async function handleComplete(taskId: string) {
    const result = await updateTaskStatus(taskId, 'completed');
    if (!result.error) {
      setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status: 'completed' } : t));
    }
  }

  return (
    <div className="space-y-4">
      {/* Filter + Add */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {['active', 'completed', 'all'].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${filter === f ? 'bg-trellis-charcoal text-white' : 'bg-white text-trellis-charcoal hover:bg-gray-100'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-trellis-gold px-4 py-2 text-sm font-semibold text-trellis-charcoal-dark transition hover:bg-trellis-gold-light">
          + Add Task
        </button>
      </div>

      {/* Quick Add Form */}
      {showForm && (
        <form action={async (fd) => {
          const result = await createTask(fd);
          if (!result.error) {
            setShowForm(false);
            window.location.reload();
          }
        }} className="rounded-xl bg-white p-4 shadow-sm space-y-3">
          <input name="title" required placeholder="Task title..."
            className="w-full rounded-lg border border-trellis-warm-gray px-3 py-2 focus:border-trellis-gold focus:outline-none" />
          <div className="flex gap-3">
            <select name="priority" className="rounded-lg border border-trellis-warm-gray px-3 py-2 text-sm">
              <option value="medium">Medium</option>
              <option value="low">Low</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            <input name="due_date" type="date"
              className="rounded-lg border border-trellis-warm-gray px-3 py-2 text-sm" />
            <button type="submit"
              className="rounded-lg bg-trellis-gold px-4 py-2 text-sm font-semibold text-trellis-charcoal-dark">
              Save
            </button>
          </div>
        </form>
      )}

      {/* Task List */}
      {filtered.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-trellis-charcoal/50">No tasks to show</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((task) => (
            <div key={task.id as string} className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
              <span className="text-lg">{statusIcons[task.status as string] ?? '⏳'}</span>
              <div className="flex-1">
                <p className={`font-medium ${task.status === 'completed' ? 'line-through text-trellis-charcoal/40' : 'text-trellis-charcoal'}`}>
                  {task.title as string}
                </p>
                <div className="mt-1 flex items-center gap-2 text-xs text-trellis-charcoal/50">
                  {task.due_date && <span>Due {new Date(task.due_date).toLocaleDateString()}</span>}
                  {task.source && <span>· {task.source}</span>}
                </div>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityColors[task.priority as string] ?? ''}`}>
                {task.priority as string}
              </span>
              {task.status !== 'completed' && (
                <button onClick={() => handleComplete(task.id as string)}
                  className="rounded-lg border border-green-200 px-2 py-1 text-xs text-green-700 hover:bg-green-50">
                  Done
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
