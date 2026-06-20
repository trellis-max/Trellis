/**
 * Resend (Email) — STUB
 * ======================
 * Email notifications, magic-link delivery, receipts.
 * Calls route through Supabase Edge Functions (never browser).
 *
 * Using Resend test domain for now; real verified domain wired before production.
 * SPF/DKIM/DMARC required on sending domain before notifications go live.
 */

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

export async function sendEmail(
  _payload: EmailPayload,
): Promise<{ success: boolean; messageId: string | null }> {
  console.warn('[STUB] sendEmail — Resend domain not verified for production');
  return { success: false, messageId: null };
}

export async function sendMagicLinkEmail(
  _email: string,
  _magicLink: string,
  _coupleName: string,
): Promise<{ success: boolean }> {
  console.warn('[STUB] sendMagicLinkEmail — Resend domain not verified for production');
  return { success: false };
}
