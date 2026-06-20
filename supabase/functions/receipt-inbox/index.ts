/**
 * receipt-inbox — Emailed/recurring receipt capture
 * ===================================================
 * Monitored inbox receives forwarded receipts → AI parse → QB.
 * Handles: forwarded receipts, recurring vendor receipts, bank-fed receipts.
 *
 * STATUS: SCAFFOLD — requires receipt-forwarding inbox provisioning.
 *
 * Trigger: Webhook from email provider when new email arrives at
 *          the dedicated receipt-forwarding address.
 */
import { corsHeaders, corsResponse } from "../_shared/cors.ts";
import { createServiceClient } from "../_shared/supabase.ts";

interface ParsedReceipt {
  vendor: string;
  amount: number;
  date: string;
  category: string;
  is_recurring: boolean;
  original_sender: string;
  attachments: string[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return corsResponse();

  try {
    // Webhook — use service client (no user auth)
    const supabase = createServiceClient();

    // Verify webhook signature (provider-specific)
    // TODO: Validate webhook authenticity

    const emailData = await req.json();

    console.log("[STUB] receipt-inbox webhook received:", {
      from: emailData.from,
      subject: emailData.subject,
      has_attachments: !!emailData.attachments?.length,
    });

    // TODO: Step 1 — Extract receipt images/PDFs from email attachments
    // TODO: Step 2 — Store in Supabase Storage (receipts bucket)
    // TODO: Step 3 — Call receipt-vision Edge Function for AI extraction
    // TODO: Step 4 — Queue for human approval
    // TODO: Step 5 — On approval, push to QuickBooks via qb-sync

    const stubResult: ParsedReceipt = {
      vendor: "Unknown (inbox not wired)",
      amount: 0,
      date: new Date().toISOString().split("T")[0],
      category: "pending",
      is_recurring: false,
      original_sender: emailData.from || "unknown",
      attachments: [],
    };

    // Log receipt attempt
    await supabase.from("audit_log").insert({
      table_name: "receipt_inbox",
      record_id: "inbox",
      action: "receipt_received",
      changes: { stub: true, from: emailData.from },
    });

    return new Response(
      JSON.stringify({ data: stubResult, stub: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
