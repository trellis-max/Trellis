/**
 * voice-to-task — Voice memo → STT → AI task routing
 * =====================================================
 * Accepts audio (base64 or Storage URL), transcribes via Deepgram,
 * then AI-routes into one or more tasks assigned to staff.
 *
 * STATUS: SCAFFOLD — returns mock data until Deepgram + Anthropic keys are wired.
 *
 * Flow: Record voice memo → upload → this function → Deepgram STT → Anthropic parse
 *       → create tasks in DB → notify assigned staff
 */
import { corsHeaders, corsResponse } from "../_shared/cors.ts";
import { createSupabaseClient } from "../_shared/supabase.ts";

interface ParsedTask {
  title: string;
  description: string;
  assignee_suggestion: string;
  priority: "low" | "medium" | "high" | "urgent";
  due_date: string | null;
  event_id: string | null;
}

interface VoiceToTaskResult {
  transcript: string;
  tasks: ParsedTask[];
  confidence: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return corsResponse();

  try {
    const supabase = createSupabaseClient(req);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { audio_base64, storage_path, event_id } = await req.json();

    if (!audio_base64 && !storage_path) {
      return new Response(
        JSON.stringify({ error: "Provide audio_base64 or storage_path" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // --- STUB: Deepgram STT ---
    const deepgramKey = Deno.env.get("DEEPGRAM_API_KEY");
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");

    if (!deepgramKey || !anthropicKey) {
      console.warn("[STUB] voice-to-task — keys not set");
      const stubResult: VoiceToTaskResult = {
        transcript: "[Voice transcription not available — Deepgram key not set]",
        tasks: [
          {
            title: "Voice task (pending AI routing)",
            description: "AI engine not connected — task created from voice memo stub",
            assignee_suggestion: "unassigned",
            priority: "medium",
            due_date: null,
            event_id: event_id || null,
          },
        ],
        confidence: 0,
      };
      return new Response(JSON.stringify({ data: stubResult, stub: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // TODO: Step 1 — Deepgram transcription
    // const dgResponse = await fetch("https://api.deepgram.com/v1/listen", { ... });
    // const transcript = dgResponse.results.channels[0].alternatives[0].transcript;

    // TODO: Step 2 — Anthropic task parsing
    // Parse transcript into structured tasks with assignments

    // TODO: Step 3 — Create tasks in DB
    // await supabase.from("tasks").insert(parsedTasks);

    return new Response(
      JSON.stringify({ error: "Not yet implemented" }),
      { status: 501, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
