/**
 * qb-sync — QuickBooks Online bi-directional sync
 * ==================================================
 * Handles: receipt push, invoice sync, expense categorization,
 * bank-feed matching, sales-tax data pull.
 *
 * STATUS: SCAFFOLD — requires QB OAuth Connection Session with Austin.
 * DEFERRED per Greg's directive: scaffold + hold.
 *
 * Endpoints (via action param):
 *   - push_receipt: Trellis receipt → QB expense
 *   - sync_invoice: Trellis invoice ↔ QB invoice
 *   - pull_bank_feed: QB bank/card transactions → Trellis
 *   - pull_sales_tax: QB sales-tax rates → Trellis for report
 *   - webhook: QB webhook receiver for real-time updates
 */
import { corsHeaders, corsResponse } from "../_shared/cors.ts";
import { createSupabaseClient } from "../_shared/supabase.ts";

interface QBTokens {
  access_token: string;
  refresh_token: string;
  realm_id: string;
  expires_at: number;
}

async function getQBTokens(_supabase: ReturnType<typeof createSupabaseClient>): Promise<QBTokens | null> {
  // TODO: Read from secure storage (Supabase Vault or encrypted column)
  // Tokens stored after OAuth Connection Session with Austin
  return null;
}

async function refreshQBToken(_tokens: QBTokens): Promise<QBTokens> {
  // TODO: Refresh via QB OAuth endpoint
  // POST https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer
  throw new Error("QB token refresh not implemented");
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

    const { action, data } = await req.json();

    // Check for QB tokens
    const tokens = await getQBTokens(supabase);
    if (!tokens) {
      return new Response(
        JSON.stringify({
          error: "QuickBooks not connected",
          message: "QB OAuth Connection Session with Austin required. This is deferred until the Connection Session is scheduled.",
          stub: true,
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    switch (action) {
      case "push_receipt": {
        // TODO: Create QB Expense/Purchase from Trellis receipt data
        // POST /v3/company/{realmId}/purchase
        return new Response(
          JSON.stringify({ error: "push_receipt not implemented" }),
          { status: 501, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      case "sync_invoice": {
        // TODO: Sync Trellis invoice ↔ QB Invoice
        // POST /v3/company/{realmId}/invoice
        return new Response(
          JSON.stringify({ error: "sync_invoice not implemented" }),
          { status: 501, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      case "pull_bank_feed": {
        // TODO: Read QB bank/card feed transactions
        // GET /v3/company/{realmId}/query?query=SELECT * FROM Purchase
        return new Response(
          JSON.stringify({ error: "pull_bank_feed not implemented" }),
          { status: 501, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      case "pull_sales_tax": {
        // TODO: Pull sales-tax rates for report generation
        // GET /v3/company/{realmId}/query?query=SELECT * FROM TaxCode
        return new Response(
          JSON.stringify({ error: "pull_sales_tax not implemented" }),
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
