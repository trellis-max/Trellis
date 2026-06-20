/**
 * Twilio (SMS) — STUB
 * =====================
 * SMS notifications to staff + couples (couples A2P-gated).
 * Calls route through Supabase Edge Functions (never browser).
 *
 * Couple SMS blocked until A2P 10DLC registration complete.
 * FDC Viktor handles ISV registration — scaffold only.
 */

export interface SMSPayload {
  to: string;
  body: string;
}

export async function sendSMS(
  _payload: SMSPayload,
): Promise<{ success: boolean; sid: string | null }> {
  console.warn('[STUB] sendSMS — Twilio not wired; A2P registration pending');
  return { success: false, sid: null };
}

/**
 * Check if A2P is registered and SMS to couples is allowed.
 * Always returns false until registration is confirmed.
 */
export function isCoupleSMSEnabled(): boolean {
  return false;
}
