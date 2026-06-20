/**
 * receipt-vision — Snap-a-receipt → AI categorize → QB-ready
 * =============================================================
 * Accepts a receipt image (base64 or Storage URL), sends to Anthropic
 * vision for extraction, returns structured data ready for QB push.
 *
 * STATUS: SCAFFOLD — returns mock data until Anthropic key is wired.
 *
 * Flow: Upload image → this function → AI extracts vendor/amount/date/category
 *       → human approval gate in UI → push to QuickBooks
 */
import { corsHeaders, corsResponse } from "../_shared/cors.ts";
import { createSupabaseClient } from "../_shared/supabase.ts";

interface ReceiptExtractionResult {
  vendor: string;
  amount: number;
  date: string;
  category: string;
  description: string;
  confidence: number;
  tax_amount: number | null;
  payment_method: string | null;
  line_items: Array<{ description: string; amount: number }>;
  raw_text: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return corsResponse();

  try {
    const supabase = createSupabaseClient(req);

    // Verify authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { image_base64, storage_path, description } = await req.json();

    if (!image_base64 && !storage_path) {
      return new Response(
        JSON.stringify({ error: "Provide image_base64 or storage_path" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // --- STUB: Anthropic vision call ---
    // When wired: send image to claude-3.5-sonnet with receipt-extraction prompt
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicKey) {
      console.warn("[STUB] receipt-vision — Anthropic key not set");
      const stubResult: ReceiptExtractionResult = {
        vendor: "Sample Vendor (AI not connected)",
        amount: 0,
        date: new Date().toISOString().split("T")[0],
        category: "other",
        description: description || "Receipt pending AI processing",
        confidence: 0,
        tax_amount: null,
        payment_method: null,
        line_items: [],
        raw_text: "[AI engine not connected — stub response]",
      };
      return new Response(JSON.stringify({ data: stubResult, stub: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // TODO: Real Anthropic vision call
    // const response = await fetch("https://api.anthropic.com/v1/messages", { ... });
    // Parse structured receipt data from response

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
