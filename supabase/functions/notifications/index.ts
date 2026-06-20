/**
 * notifications — Email (Resend) + SMS (Twilio) dispatcher
 * ==========================================================
 * Centralized notification engine. Every notification type supports
 * both channels with per-channel toggles.
 *
 * STATUS: SCAFFOLD — returns stub until Resend + Twilio are wired.
 * NOTE: Couple SMS gate-blocked until A2P registration is live.
 *
 * Notification types:
 *   - booking_confirmation, payment_received, invoice_sent
 *   - event_reminder, task_assigned, planning_intake_complete
 *   - reorder_alert, staff_schedule_update
 */
import { corsHeaders, corsResponse } from "../_shared/cors.ts";
import { createServiceClient } from "../_shared/supabase.ts";

interface NotificationPayload {
  type: string;
  recipient_id: string;
  recipient_type: "couple" | "staff" | "owner";
  channels: ("email" | "sms")[];
  data: Record<string, unknown>;
  template_overrides?: {
    subject?: string;
    body?: string;
  };
}

interface NotificationResult {
  email_sent: boolean;
  sms_sent: boolean;
  email_id: string | null;
  sms_sid: string | null;
  errors: string[];
}

const NOTIFICATION_TEMPLATES: Record<string, { subject: string; body: string }> = {
  booking_confirmation: {
    subject: "Booking Confirmed — {{event_name}}",
    body: "Your event on {{event_date}} has been confirmed! We\'re excited to work with you.",
  },
  payment_received: {
    subject: "Payment Received — ${{amount}}",
    body: "We\'ve received your payment of ${{amount}} for {{event_name}}. Thank you!",
  },
  invoice_sent: {
    subject: "Invoice #{{invoice_number}} from Willow Acres",
    body: "A new invoice for ${{amount}} is ready for your review.",
  },
  event_reminder: {
    subject: "Reminder: {{event_name}} on {{event_date}}",
    body: "This is a reminder that {{event_name}} is coming up on {{event_date}}.",
  },
  task_assigned: {
    subject: "New Task: {{task_title}}",
    body: "You\'ve been assigned a new task: {{task_title}} ({{priority}} priority).",
  },
  reorder_alert: {
    subject: "⚠️ Reorder Alert: {{item_name}}",
    body: "{{item_name}} is below reorder point. Current: {{current_qty}}, Reorder at: {{reorder_point}}.",
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return corsResponse();

  try {
    // Use service client for notifications (system-initiated)
    const supabase = createServiceClient();

    const payload: NotificationPayload = await req.json();

    if (!payload.type || !payload.recipient_id || !payload.channels?.length) {
      return new Response(
        JSON.stringify({ error: "type, recipient_id, and channels required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const result: NotificationResult = {
      email_sent: false,
      sms_sent: false,
      email_id: null,
      sms_sid: null,
      errors: [],
    };

    // --- EMAIL via Resend ---
    if (payload.channels.includes("email")) {
      const resendKey = Deno.env.get("RESEND_API_KEY");
      if (!resendKey) {
        result.errors.push("[STUB] Resend key not set — email not sent");
      } else {
        // TODO: Look up recipient email from profiles/couples table
        // TODO: Render template with payload.data
        // TODO: Send via Resend API
        // const emailRes = await fetch("https://api.resend.com/emails", { ... });
        result.errors.push("Email sending not yet implemented");
      }
    }

    // --- SMS via Twilio ---
    if (payload.channels.includes("sms")) {
      const twilioSid = Deno.env.get("TWILIO_ACCOUNT_SID");
      const twilioAuth = Deno.env.get("TWILIO_AUTH_TOKEN");
      if (!twilioSid || !twilioAuth) {
        result.errors.push("[STUB] Twilio not set — SMS not sent");
      } else {
        // NOTE: Couple SMS gate-blocked until A2P registration
        if (payload.recipient_type === "couple") {
          result.errors.push("Couple SMS blocked — A2P registration pending");
        } else {
          // TODO: Send via Twilio API
          result.errors.push("SMS sending not yet implemented");
        }
      }
    }

    // Log notification attempt
    await supabase.from("audit_log").insert({
      table_name: "notifications",
      record_id: payload.recipient_id,
      action: "notification_attempt",
      changes: {
        type: payload.type,
        channels: payload.channels,
        result,
      },
    });

    return new Response(
      JSON.stringify({ data: result, stub: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
