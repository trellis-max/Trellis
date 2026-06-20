import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: event } = await supabase
    .from("events")
    .select("*, couples(partner1_first_name, partner2_first_name, customer_id)")
    .eq("id", id)
    .single();

  if (!event) notFound();

  // Fetch tasks for this event
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("event_id", id)
    .order("due_date", { ascending: true });

  // Fetch expenses for this event
  const { data: expenses } = await supabase
    .from("expenses")
    .select("*")
    .eq("event_id", id)
    .order("date", { ascending: false });

  const couple = event.couples as Record<string, unknown> | null;
  const totalExpenses = (expenses || []).reduce(
    (sum, e) => sum + Number(e.amount || 0),
    0,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#D4AF37]">
            {String(event.title)}
          </h1>
          <p className="text-gray-400 mt-1">
            {couple
              ? `${String(couple.partner1_first_name)} & ${String(couple.partner2_first_name)} (${String(couple.customer_id)})`
              : "No couple assigned"}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            event.status === "confirmed"
              ? "bg-green-900 text-green-200"
              : event.status === "completed"
                ? "bg-blue-900 text-blue-200"
                : "bg-yellow-900 text-yellow-200"
          }`}
        >
          {String(event.status)}
        </span>
      </div>

      {/* Event details grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-4">
          <p className="text-sm text-gray-400">Date</p>
          <p className="text-white font-semibold">
            {event.event_date
              ? new Date(String(event.event_date)).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "TBD"}
          </p>
        </div>
        <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-4">
          <p className="text-sm text-gray-400">Type</p>
          <p className="text-white font-semibold capitalize">
            {String(event.event_type || "—").replace(/_/g, " ")}
          </p>
        </div>
        <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-4">
          <p className="text-sm text-gray-400">Guest Count</p>
          <p className="text-white font-semibold">
            {Number(event.guest_count || 0)} guests
          </p>
        </div>
      </div>

      {/* Venue / location */}
      {event.venue && (
        <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-5">
          <h3 className="text-white font-semibold mb-2">📍 Venue</h3>
          <p className="text-gray-300">{String(event.venue)}</p>
        </div>
      )}

      {/* Run of Show placeholder */}
      <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-5">
        <h3 className="text-white font-semibold mb-3">
          📋 Run of Show / Day-of Timeline
        </h3>
        <p className="text-gray-400 text-sm mb-4">
          The run-of-show will be populated from the planning intake and can
          be edited in real-time on event day.
        </p>
        <div className="space-y-2">
          {(event.run_of_show as Array<{ time: string; item: string }> || []).length > 0 ? (
            (event.run_of_show as Array<{ time: string; item: string }>).map(
              (item: { time: string; item: string }, i: number) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-2 bg-[#1E1E1E] rounded"
                >
                  <span className="text-[#D4AF37] font-mono text-sm w-16">
                    {item.time}
                  </span>
                  <span className="text-white text-sm">{item.item}</span>
                </div>
              ),
            )
          ) : (
            <div className="text-center py-4">
              <button className="px-4 py-2 bg-[#3A3A3A] text-white rounded-lg text-sm hover:bg-[#4A4A4A]">
                + Build Run of Show
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tasks for this event */}
      <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold">✅ Tasks</h3>
          <span className="text-sm text-gray-400">
            {(tasks || []).filter((t) => t.status === "completed").length}/
            {(tasks || []).length} done
          </span>
        </div>
        {!tasks?.length ? (
          <p className="text-gray-400 text-sm">No tasks for this event.</p>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-2 bg-[#1E1E1E] rounded"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      task.status === "completed"
                        ? "bg-green-400"
                        : "bg-yellow-400"
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      task.status === "completed"
                        ? "text-gray-500 line-through"
                        : "text-white"
                    }`}
                  >
                    {String(task.title)}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {task.assignee_name ? String(task.assignee_name) : "Unassigned"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expenses */}
      <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold">💰 Expenses</h3>
          <span className="text-[#D4AF37] font-semibold">
            ${totalExpenses.toFixed(2)}
          </span>
        </div>
        {!expenses?.length ? (
          <p className="text-gray-400 text-sm">No expenses logged.</p>
        ) : (
          <div className="space-y-2">
            {expenses.map((exp) => (
              <div
                key={exp.id}
                className="flex items-center justify-between p-2 bg-[#1E1E1E] rounded"
              >
                <div>
                  <span className="text-white text-sm">
                    {String(exp.vendor || exp.description || "Expense")}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    {String(exp.category)}
                  </span>
                </div>
                <span className="text-white text-sm">
                  ${Number(exp.amount || 0).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-5">
        <h3 className="text-white font-semibold mb-2">📝 Notes</h3>
        <p className="text-gray-300 text-sm whitespace-pre-wrap">
          {String(event.notes || "No notes yet.")}
        </p>
      </div>
    </div>
  );
}
