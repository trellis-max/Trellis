/**
 * ask-trellis — "Ask Trellis" NL ops Q&A
 * ========================================
 * Plain-language operations queries grounded in Willow's actual data.
 * Approval-gated on any write action.
 *
 * STATUS: SCAFFOLD — returns stub until Anthropic key is wired.
 *
 * Examples:
 *   "How many weddings do we have in August?"
 *   "What's our bar cost for the Henderson event?"
 *   "Create a task to order more bourbon before Saturday"
 */
import { corsHeaders, corsResponse } from "../_shared/cors.ts";
import { createSupabaseClient } from "../_shared/supabase.ts";

interface AskTrellisResponse {
  answer: string;
  data_sources: string[];
  requires_action: boolean;
  suggested_action: {
    type: string;
    description: string;
    params: Record<string, unknown>;
  } | null;
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

    const { question, context } = await req.json();

    if (!question) {
      return new Response(
        JSON.stringify({ error: "Provide a question" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicKey) {
      console.warn("[STUB] ask-trellis — Anthropic key not set");
      const stubResult: AskTrellisResponse = {
        answer:
          "The Trellis AI Engine is not yet connected. Once wired, you can ask questions like \"How many events this month?\" or \"What\'s our inventory status?\"",
        data_sources: [],
        requires_action: false,
        suggested_action: null,
        confidence: 0,
      };
      return new Response(JSON.stringify({ data: stubResult, stub: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // TODO: Step 1 — Gather relevant context from DB
    // Query couples, events, inventory, finances based on question keywords

    // TODO: Step 2 — Send to Anthropic with system prompt + data context
    // System prompt: You are the Trellis AI Engine for Willow Acres...

    // TODO: Step 3 — Parse response, detect if action is needed
    // If action detected, set requires_action=true and return suggested_action

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
