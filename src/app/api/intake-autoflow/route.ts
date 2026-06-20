// Intake Auto-Flow — planning intake → auto-create tasks, timeline items, inventory forecast
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// Default tasks generated from a planning intake
const INTAKE_TASK_TEMPLATES = [
  { title: "Review planning intake submission", priority: "high", offset_days: 1 },
  { title: "Confirm venue availability for event date", priority: "urgent", offset_days: 0 },
  { title: "Send booking confirmation email", priority: "high", offset_days: 1 },
  { title: "Schedule initial planning call with couple", priority: "medium", offset_days: 3 },
  { title: "Create bar package based on intake preferences", priority: "medium", offset_days: 7 },
  { title: "Confirm vendor availability", priority: "medium", offset_days: 7 },
  { title: "Generate inventory forecast for event", priority: "medium", offset_days: 14 },
  { title: "Create day-of timeline draft", priority: "low", offset_days: 21 },
  { title: "Send couple portal invite", priority: "medium", offset_days: 3 },
];

// Default run-of-show template for a wedding
const DEFAULT_TIMELINE = [
  { time_slot: "14:00", duration_minutes: 60, title: "Vendor arrival & setup" },
  { time_slot: "15:00", duration_minutes: 30, title: "Wedding party arrives" },
  { time_slot: "15:30", duration_minutes: 30, title: "Guest seating" },
  { time_slot: "16:00", duration_minutes: 30, title: "Ceremony" },
  { time_slot: "16:30", duration_minutes: 30, title: "Cocktail hour begins" },
  { time_slot: "16:30", duration_minutes: 15, title: "Couple photos" },
  { time_slot: "17:00", duration_minutes: 15, title: "Wedding party announced" },
  { time_slot: "17:15", duration_minutes: 45, title: "Dinner service" },
  { time_slot: "18:00", duration_minutes: 15, title: "Toasts & speeches" },
  { time_slot: "18:15", duration_minutes: 15, title: "First dance" },
  { time_slot: "18:30", duration_minutes: 15, title: "Cake cutting" },
  { time_slot: "18:45", duration_minutes: 120, title: "Open dance floor" },
  { time_slot: "20:45", duration_minutes: 15, title: "Last call" },
  { time_slot: "21:00", duration_minutes: 30, title: "Send-off" },
  { time_slot: "21:30", duration_minutes: 60, title: "Breakdown & cleanup" },
];

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { intake_id } = await req.json() as { intake_id: string };
    if (!intake_id) {
      return NextResponse.json({ error: "intake_id is required" }, { status: 400 });
    }

    // Fetch the intake
    const { data: intake, error: intakeErr } = await supabase
      .from("planning_intakes")
      .select("*, couples(name, email), events(id, name, date, guest_count)")
      .eq("id", intake_id)
      .single();

    if (intakeErr || !intake) {
      return NextResponse.json({ error: "Intake not found" }, { status: 404 });
    }

    const eventId = (intake.events as Record<string, unknown>)?.id as string;
    const eventDate = (intake.events as Record<string, unknown>)?.date as string;
    const results = { tasks_created: 0, timeline_items: 0, forecast_notes: [] as string[] };

    // 1. Auto-create tasks
    const eventDateObj = eventDate ? new Date(eventDate) : null;
    const taskInserts = INTAKE_TASK_TEMPLATES.map((tpl, i) => {
      let dueDate: string | null = null;
      if (eventDateObj) {
        const due = new Date();
        due.setDate(due.getDate() + tpl.offset_days);
        dueDate = due.toISOString().split("T")[0];
      }
      return {
        title: tpl.title,
        priority: tpl.priority,
        status: "pending",
        due_date: dueDate,
        created_by: user.id,
        event_id: eventId || null,
        notes: `[Auto-generated from planning intake #${intake_id.slice(0, 8)}]`,
      };
    });

    const { data: tasks } = await supabase.from("tasks").insert(taskInserts).select("id");
    results.tasks_created = tasks?.length || 0;

    // 2. Auto-create run-of-show timeline (if event exists)
    if (eventId) {
      const timelineInserts = DEFAULT_TIMELINE.map((item, i) => ({
        event_id: eventId,
        time_slot: item.time_slot,
        duration_minutes: item.duration_minutes,
        title: item.title,
        sort_order: i,
        is_completed: false,
      }));

      const { data: timeline } = await supabase.from("run_of_show").insert(timelineInserts).select("id");
      results.timeline_items = timeline?.length || 0;
    }

    // 3. Inventory forecast notes
    const guestCount = (intake.events as Record<string, unknown>)?.guest_count;
    if (typeof guestCount === "number" && guestCount > 0) {
      // Simple per-guest estimates for bar inventory
      const estimates = [
        { item: "Wine bottles", per_guest: 0.5, unit: "bottles" },
        { item: "Beer (cases)", per_guest: 0.08, unit: "cases" },
        { item: "Liquor bottles", per_guest: 0.1, unit: "bottles" },
        { item: "Mixers", per_guest: 0.25, unit: "bottles" },
        { item: "Ice", per_guest: 1.5, unit: "lbs" },
        { item: "Cups/Glassware", per_guest: 3, unit: "pcs" },
        { item: "Napkins", per_guest: 5, unit: "pcs" },
      ];

      for (const est of estimates) {
        const qty = Math.ceil(guestCount * est.per_guest);
        results.forecast_notes.push(`${est.item}: ~${qty} ${est.unit} (${guestCount} guests × ${est.per_guest}/${est.unit})`);
      }
    }

    // Audit log
    await supabase.from("audit_log").insert({
      action: "intake_autoflow",
      user_id: user.id,
      details: {
        intake_id,
        tasks_created: results.tasks_created,
        timeline_items: results.timeline_items,
        forecast_items: results.forecast_notes.length,
      },
    });

    return NextResponse.json(results);
  } catch (err) {
    console.error("Intake autoflow error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
