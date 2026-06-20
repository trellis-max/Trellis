import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Fetch all metrics in parallel
  const [
    couplesRes,
    eventsRes,
    tasksRes,
    inventoryRes,
    paymentsRes,
    expensesRes,
    staffRes,
  ] = await Promise.all([
    supabase.from("couples").select("id, name, stage, created_at", { count: "exact" }),
    supabase.from("events").select("id, name, date, status, guest_count").order("date", { ascending: true }),
    supabase.from("tasks").select("id, title, status, priority, due_date").order("due_date", { ascending: true }),
    supabase.from("inventory_items").select("id, name, quantity, par_level, category"),
    supabase.from("payments").select("id, amount, created_at"),
    supabase.from("expenses").select("id, amount, date"),
    supabase.from("staff_members").select("id, name, role, is_active"),
  ]);

  const couples = couplesRes.data || [];
  const events = eventsRes.data || [];
  const tasks = tasksRes.data || [];
  const inventory = inventoryRes.data || [];
  const payments = paymentsRes.data || [];
  const expenses = expensesRes.data || [];
  const staff = staffRes.data || [];

  // Compute metrics
  const now = new Date();
  const upcomingEvents = events.filter((e) => new Date(e.date) >= now);
  const pendingTasks = tasks.filter((t) => t.status === "pending");
  const overdueTasks = pendingTasks.filter((t) => t.due_date && new Date(t.due_date) < now);
  const urgentTasks = pendingTasks.filter((t) => t.priority === "urgent" || t.priority === "high");
  const lowStockItems = inventory.filter((i) => 
    typeof i.quantity === "number" && typeof i.par_level === "number" && i.quantity <= i.par_level
  );
  const totalRevenue = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const activeStaff = staff.filter((s) => s.is_active);

  const nextEvent = upcomingEvents[0];
  const daysToNextEvent = nextEvent
    ? Math.ceil((new Date(nextEvent.date).getTime() - now.getTime()) / 86400000)
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#D4AF37]">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">
          {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </p>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/dashboard/events" className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-4 hover:border-[#D4AF37] transition-colors">
          <p className="text-sm text-gray-400">Upcoming Events</p>
          <p className="text-2xl font-bold text-white">{upcomingEvents.length}</p>
          {nextEvent && (
            <p className="text-xs text-[#D4AF37] mt-1">
              Next: {daysToNextEvent === 0 ? "TODAY" : daysToNextEvent === 1 ? "Tomorrow" : `${daysToNextEvent} days`}
            </p>
          )}
        </Link>

        <Link href="/dashboard/tasks" className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-4 hover:border-[#D4AF37] transition-colors">
          <p className="text-sm text-gray-400">Pending Tasks</p>
          <p className="text-2xl font-bold text-white">{pendingTasks.length}</p>
          {overdueTasks.length > 0 && (
            <p className="text-xs text-red-400 mt-1">⚠ {overdueTasks.length} overdue</p>
          )}
          {overdueTasks.length === 0 && urgentTasks.length > 0 && (
            <p className="text-xs text-orange-400 mt-1">{urgentTasks.length} high priority</p>
          )}
        </Link>

        <Link href="/dashboard/couples" className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-4 hover:border-[#D4AF37] transition-colors">
          <p className="text-sm text-gray-400">Active Couples</p>
          <p className="text-2xl font-bold text-white">{couples.length}</p>
          <p className="text-xs text-gray-500 mt-1">
            {couples.filter((c) => c.stage === "booked").length} booked
          </p>
        </Link>

        <Link href="/dashboard/inventory" className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-4 hover:border-[#D4AF37] transition-colors">
          <p className="text-sm text-gray-400">Inventory</p>
          <p className="text-2xl font-bold text-white">{inventory.length} items</p>
          {lowStockItems.length > 0 && (
            <p className="text-xs text-red-400 mt-1">⚠ {lowStockItems.length} below par</p>
          )}
        </Link>
      </div>

      {/* Financial summary */}
      <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-5">
        <h3 className="text-white font-semibold mb-3">💰 Financial Summary</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-400">Revenue</p>
            <p className="text-xl font-bold text-green-400">${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Expenses</p>
            <p className="text-xl font-bold text-red-400">${totalExpenses.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Net</p>
            <p className={`text-xl font-bold ${totalRevenue - totalExpenses >= 0 ? "text-[#D4AF37]" : "text-red-400"}`}>
              ${(totalRevenue - totalExpenses).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Next event */}
        <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-5">
          <h3 className="text-white font-semibold mb-3">📅 Next Event</h3>
          {nextEvent ? (
            <Link href={`/dashboard/events/${nextEvent.id}`} className="block hover:bg-[#333] rounded-lg p-3 -m-1 transition-colors">
              <p className="text-[#D4AF37] font-semibold">{String(nextEvent.name)}</p>
              <p className="text-sm text-gray-400 mt-1">
                {new Date(nextEvent.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
              <p className="text-sm text-gray-500 mt-1">{nextEvent.guest_count} guests • {String(nextEvent.status)}</p>
            </Link>
          ) : (
            <p className="text-gray-500 text-sm">No upcoming events</p>
          )}
        </div>

        {/* Low stock alerts */}
        <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-5">
          <h3 className="text-white font-semibold mb-3">📦 Inventory Alerts</h3>
          {lowStockItems.length === 0 ? (
            <p className="text-green-400 text-sm">✓ All items above par level</p>
          ) : (
            <div className="space-y-2">
              {lowStockItems.slice(0, 5).map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-300">{String(item.name)}</span>
                  <span className="text-red-400">{item.quantity}/{item.par_level}</span>
                </div>
              ))}
              {lowStockItems.length > 5 && (
                <Link href="/dashboard/inventory" className="text-xs text-[#D4AF37] hover:underline">
                  +{lowStockItems.length - 5} more →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-5">
        <h3 className="text-white font-semibold mb-3">⚡ Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/couples/new" className="px-4 py-2 bg-[#D4AF37] text-black rounded-lg text-sm font-medium hover:bg-[#C4A030]">
            + New Couple
          </Link>
          <Link href="/dashboard/voice" className="px-4 py-2 bg-[#3A3A3A] text-white rounded-lg text-sm hover:bg-[#4A4A4A]">
            🎤 Voice Memo
          </Link>
          <Link href="/dashboard/receipts" className="px-4 py-2 bg-[#3A3A3A] text-white rounded-lg text-sm hover:bg-[#4A4A4A]">
            📸 Scan Receipt
          </Link>
          <Link href="/dashboard/ask" className="px-4 py-2 bg-[#3A3A3A] text-white rounded-lg text-sm hover:bg-[#4A4A4A]">
            🤖 Ask Trellis
          </Link>
          <Link href="/dashboard/finances/invoicing" className="px-4 py-2 bg-[#3A3A3A] text-white rounded-lg text-sm hover:bg-[#4A4A4A]">
            🧾 Create Invoice
          </Link>
        </div>
      </div>

      {/* Staff on duty */}
      <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-5">
        <h3 className="text-white font-semibold mb-3">👥 Team ({activeStaff.length} active)</h3>
        {activeStaff.length === 0 ? (
          <p className="text-gray-500 text-sm">No staff members added yet</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {activeStaff.map((s) => (
              <div key={s.id} className="px-3 py-2 bg-[#1E1E1E] rounded-lg text-sm">
                <span className="text-white">{String(s.name)}</span>
                <span className="text-gray-500 ml-2 text-xs capitalize">{String(s.role)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
