// Notification emails via Resend
// Supports: couple_invite, booking_confirm, payment_reminder, reorder_alert, task_assignment

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@willowacres.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://trellis-trellis2.vercel.app";

// Gold-on-charcoal branded email wrapper
function emailWrapper(title: string, body: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#1E1E1E;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#1E1E1E;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#2A2A2A;border-radius:12px;overflow:hidden;">
<tr><td style="background:#1A1A1A;padding:24px 32px;border-bottom:2px solid #D4AF37;">
  <h1 style="margin:0;color:#D4AF37;font-size:20px;font-weight:700;">Willow Acres</h1>
</td></tr>
<tr><td style="padding:32px;">
  <h2 style="margin:0 0 16px;color:#FFFFFF;font-size:18px;">${title}</h2>
  ${body}
</td></tr>
<tr><td style="padding:16px 32px;background:#1A1A1A;border-top:1px solid #3A3A3A;">
  <p style="margin:0;color:#666;font-size:12px;text-align:center;">Willow Acres &middot; Event Management</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

const TEMPLATES: Record<string, (data: Record<string, string>) => { subject: string; html: string }> = {
  couple_invite: (data) => ({
    subject: `You're invited to view your ${data.event_name || "event"} details`,
    html: emailWrapper("Your Event Portal", `
      <p style="color:#CCC;font-size:14px;line-height:1.6;">
        Hi ${data.couple_name || "there"},<br><br>
        Your event details are ready to view on the Willow Acres portal. 
        Click below to see your timeline, balance, and planning details.
      </p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${APP_URL}/auth/couple?token=${data.token || ""}" 
           style="display:inline-block;padding:12px 32px;background:#D4AF37;color:#000;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">
          View Your Event
        </a>
      </div>
      <p style="color:#666;font-size:12px;">This link expires in 7 days. If you didn't expect this, you can safely ignore it.</p>
    `),
  }),

  booking_confirm: (data) => ({
    subject: `Booking Confirmed — ${data.event_name || "Your Event"}`,
    html: emailWrapper("Booking Confirmed! 🎉", `
      <p style="color:#CCC;font-size:14px;line-height:1.6;">
        Great news! Your booking for <strong style="color:#D4AF37;">${data.event_name || "your event"}</strong> 
        on <strong>${data.event_date || "TBD"}</strong> is confirmed.
      </p>
      <div style="background:#1E1E1E;border-radius:8px;padding:16px;margin:16px 0;">
        <p style="margin:0 0 8px;color:#999;font-size:12px;">BOOKING DETAILS</p>
        <p style="margin:4px 0;color:#FFF;font-size:14px;">📅 Date: ${data.event_date || "TBD"}</p>
        <p style="margin:4px 0;color:#FFF;font-size:14px;">👥 Guests: ${data.guest_count || "TBD"}</p>
        <p style="margin:4px 0;color:#FFF;font-size:14px;">💰 Package: ${data.package_name || "TBD"}</p>
      </div>
      <p style="color:#CCC;font-size:14px;">We'll be in touch soon with next steps. Welcome to Willow Acres!</p>
    `),
  }),

  payment_reminder: (data) => ({
    subject: `Payment Reminder — ${data.event_name || "Your Event"}`,
    html: emailWrapper("Payment Reminder", `
      <p style="color:#CCC;font-size:14px;line-height:1.6;">
        Hi ${data.couple_name || "there"},<br><br>
        This is a friendly reminder that a payment of 
        <strong style="color:#D4AF37;">$${data.amount || "0.00"}</strong> 
        is due by <strong>${data.due_date || "soon"}</strong> for 
        <strong>${data.event_name || "your event"}</strong>.
      </p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${APP_URL}/portal" 
           style="display:inline-block;padding:12px 32px;background:#D4AF37;color:#000;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">
          View Balance & Pay
        </a>
      </div>
    `),
  }),

  reorder_alert: (data) => ({
    subject: `⚠️ Low Stock Alert — ${data.item_name || "Inventory Item"}`,
    html: emailWrapper("Low Stock Alert ⚠️", `
      <p style="color:#CCC;font-size:14px;line-height:1.6;">
        The following item has dropped below par level and needs reordering:
      </p>
      <div style="background:#1E1E1E;border-radius:8px;padding:16px;margin:16px 0;border-left:3px solid #D4AF37;">
        <p style="margin:0 0 4px;color:#FFF;font-size:16px;font-weight:600;">${data.item_name || "Unknown Item"}</p>
        <p style="margin:4px 0;color:#CCC;font-size:14px;">Current: <strong style="color:#FF6B6B;">${data.current_qty || "0"}</strong> | Par Level: <strong>${data.par_level || "0"}</strong></p>
        <p style="margin:4px 0;color:#999;font-size:12px;">Category: ${data.category || "general"}</p>
      </div>
      <div style="text-align:center;margin:24px 0;">
        <a href="${APP_URL}/dashboard/inventory" 
           style="display:inline-block;padding:12px 32px;background:#D4AF37;color:#000;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">
          View Inventory
        </a>
      </div>
    `),
  }),

  task_assignment: (data) => ({
    subject: `New Task: ${data.task_title || "Assigned to you"}`,
    html: emailWrapper("New Task Assigned", `
      <p style="color:#CCC;font-size:14px;line-height:1.6;">
        A new task has been assigned to you:
      </p>
      <div style="background:#1E1E1E;border-radius:8px;padding:16px;margin:16px 0;border-left:3px solid #D4AF37;">
        <p style="margin:0 0 4px;color:#FFF;font-size:16px;font-weight:600;">${data.task_title || "New Task"}</p>
        <p style="margin:4px 0;color:#CCC;font-size:14px;">Priority: <strong>${data.priority || "medium"}</strong></p>
        ${data.due_date ? `<p style="margin:4px 0;color:#CCC;font-size:14px;">Due: <strong>${data.due_date}</strong></p>` : ""}
        ${data.notes ? `<p style="margin:8px 0 0;color:#999;font-size:13px;">${data.notes}</p>` : ""}
      </div>
      <div style="text-align:center;margin:24px 0;">
        <a href="${APP_URL}/dashboard/tasks" 
           style="display:inline-block;padding:12px 32px;background:#D4AF37;color:#000;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">
          View Tasks
        </a>
      </div>
    `),
  }),
};

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!RESEND_API_KEY) {
      return NextResponse.json({ error: "Email not configured" }, { status: 503 });
    }

    const { type, to, data = {} } = await req.json() as {
      type: string;
      to: string;
      data: Record<string, string>;
    };

    if (!type || !to) {
      return NextResponse.json({ error: "type and to are required" }, { status: 400 });
    }

    const template = TEMPLATES[type];
    if (!template) {
      return NextResponse.json(
        { error: `Unknown template: ${type}. Available: ${Object.keys(TEMPLATES).join(", ")}` },
        { status: 400 },
      );
    }

    const { subject, html } = template(data);

    // Send via Resend
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject,
        html,
      }),
    });

    const resendData = await resendRes.json();

    if (!resendRes.ok) {
      console.error("Resend error:", resendData);
      return NextResponse.json(
        { error: "Failed to send email", details: resendData },
        { status: 502 },
      );
    }

    // Audit log
    await supabase.from("audit_log").insert({
      action: "notification_email",
      user_id: user.id,
      details: { type, to, email_id: resendData.id },
    });

    return NextResponse.json({ success: true, email_id: resendData.id });
  } catch (err) {
    console.error("Notification error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
