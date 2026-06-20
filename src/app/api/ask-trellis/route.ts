// Ask Trellis — AI assistant API route
// Uses Anthropic Claude as the "Trellis AI Engine" (white-labeled)
// Runs on Vercel where ANTHROPIC_API_KEY is set

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const SYSTEM_PROMPT = `You are the Trellis AI Engine, the built-in assistant for Willow Acres — a wedding and event venue. You help the venue owner (Austin) and staff with:

- Event planning and day-of logistics
- Bar inventory and reorder recommendations
- Financial questions (invoicing, tax, payments)
- Staff scheduling and task management
- Vendor coordination
- General venue operations advice

Rules:
- Never mention "Claude", "Anthropic", "AI model", or "language model". You are the Trellis AI Engine.
- Be concise and actionable. The owner is busy running events.
- When referencing data, note it comes from their Trellis system.
- Use a warm, professional tone. Think experienced venue operations consultant.
- For tax questions, remind them of the 7% rental tax and 8% bar tax rates, and the 20th/30th filing deadlines.
- For bar inventory, factor in par levels and seasonal demand.
- Never fabricate specific numbers — if you don't have the data, say so and suggest where to find it in Trellis.`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, history = [] } = (await req.json()) as {
      message: string;
      history?: ChatMessage[];
    };

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI engine not configured" },
        { status: 503 },
      );
    }

    // Fetch context: upcoming events, pending tasks, low-stock inventory
    const [eventsRes, tasksRes, inventoryRes] = await Promise.all([
      supabase
        .from("events")
        .select("name, date, status, guest_count")
        .order("date", { ascending: true })
        .limit(5),
      supabase
        .from("tasks")
        .select("title, status, priority, due_date")
        .eq("status", "pending")
        .order("due_date", { ascending: true })
        .limit(10),
      supabase
        .from("inventory_items")
        .select("name, quantity, par_level, category")
        .limit(50),
    ]);

    // Build context block
    const contextParts: string[] = [];

    if (eventsRes.data?.length) {
      contextParts.push(
        "UPCOMING EVENTS:\n" +
          eventsRes.data
            .map(
              (e) =>
                `- ${e.name} on ${e.date} (${e.status}, ${e.guest_count} guests)`,
            )
            .join("\n"),
      );
    }

    if (tasksRes.data?.length) {
      contextParts.push(
        "PENDING TASKS:\n" +
          tasksRes.data
            .map(
              (t) =>
                `- [${t.priority}] ${t.title} (due: ${t.due_date || "no date"})`,
            )
            .join("\n"),
      );
    }

    if (inventoryRes.data?.length) {
      const lowStock = inventoryRes.data.filter(
        (i) =>
          typeof i.quantity === "number" &&
          typeof i.par_level === "number" &&
          i.quantity <= i.par_level,
      );
      if (lowStock.length) {
        contextParts.push(
          "LOW STOCK ALERTS:\n" +
            lowStock
              .map(
                (i) =>
                  `- ${i.name}: ${i.quantity} remaining (par: ${i.par_level})`,
              )
              .join("\n"),
        );
      }
    }

    const contextBlock = contextParts.length
      ? `\n\nCURRENT TRELLIS DATA:\n${contextParts.join("\n\n")}`
      : "";

    // Build messages for Claude
    const messages = [
      ...history.slice(-10),
      { role: "user" as const, content: message },
    ];

    // Call Anthropic
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        system: SYSTEM_PROMPT + contextBlock,
        messages,
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      console.error("Anthropic error:", errText);
      return NextResponse.json(
        { error: "AI engine temporarily unavailable" },
        { status: 502 },
      );
    }

    const anthropicData = await anthropicRes.json();
    const reply =
      anthropicData.content?.[0]?.text ||
      "I couldn't generate a response. Please try again.";

    // Log to audit
    await supabase.from("audit_log").insert({
      action: "ask_trellis",
      user_id: user.id,
      details: {
        message_length: message.length,
        model: "claude-3-5-sonnet-20241022",
      },
    });

    return NextResponse.json({ reply, usage: anthropicData.usage });
  } catch (err) {
    console.error("Ask Trellis error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
