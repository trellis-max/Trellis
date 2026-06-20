/**
 * square-payments — Square payment processing + POS sync
 * ========================================================
 * Single payment rail: deposits, final payments, online bookings,
 * contracts, portal payments, cash-bar POS.
 *
 * STATUS: SCAFFOLD — requires Square OAuth Connection Session with Austin.
 * DEFERRED per Greg's directive: scaffold + hold.
 *
 * Endpoints (via action param):
 *   - create_payment_link: Generate Square payment link for couple portal
 *   - process_deposit: Process booking deposit via Square
 *   - webhook: Square webhook receiver (payment.completed, etc.)
 *   - sync_pos: Pull cash-bar POS sales for inventory reconciliation
 */
import { corsHeaders, corsResponse } from "../_shared/cors.ts";
import { createSupabaseClient } from "../_shared/supabase.ts";

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

    const squareToken = Deno.env.get("SQUARE_ACCESS_TOKEN");
    if (!squareToken) {
      return new Response(
        JSON.stringify({
          error: "Square not connected",
          message: "Square OAuth Connection Session with Austin required. Scaffold in place — hold for Connection Session.",
          stub: true,
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { action, data } = await req.json();

    switch (action) {
      case "create_payment_link": {
        // TODO: Create payment link via Square Checkout API
        // POST /v2/online-checkout/payment-links
        return new Response(
          JSON.stringify({ error: "create_payment_link not implemented" }),
          { status: 501, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      case "process_deposit": {
        // TODO: Process deposit via Square Payments API
        // POST /v2/payments
        return new Response(
          JSON.stringify({ error: "process_deposit not implemented" }),
          { status: 501, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      case "create_invoice": {
        // TODO: Create Square invoice for couple
        // POST /v2/invoices
        return new Response(
          JSON.stringify({ error: "create_invoice not implemented" }),
          { status: 501, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      case "sync_pos": {
        // TODO: Pull POS transactions for inventory/sales reconciliation
        // GET /v2/payments?source_type=SQUARE_POS
        return new Response(
          JSON.stringify({ error: "sync_pos not implemented" }),
          { status: 501, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
