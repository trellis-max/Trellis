/**
 * Square (Payment Rail) — STUB
 * =============================
 * OAuth token exchange in Supabase Edge Functions only (never browser).
 * Square is the single payment rail for Willow Acres.
 *
 * On hold until Connection Session with Austin (Austin=Square admin).
 * Web Payments SDK + Invoices/Payments API confirmation needed.
 */

export interface SquarePaymentResult {
  success: boolean;
  paymentId: string | null;
  receiptUrl: string | null;
}

export async function processPayment(
  _amount: number,
  _sourceId: string,
  _coupleId: string,
): Promise<SquarePaymentResult> {
  console.warn('[STUB] processPayment — Square OAuth not connected');
  return { success: false, paymentId: null, receiptUrl: null };
}

export async function createSquareInvoice(
  _invoiceData: Record<string, unknown>,
): Promise<{ success: boolean; invoiceId: string | null }> {
  console.warn('[STUB] createSquareInvoice — Square OAuth not connected');
  return { success: false, invoiceId: null };
}

/**
 * Verify Square webhook signature.
 * MUST be implemented before accepting any payment webhooks.
 */
export function verifyWebhookSignature(
  _body: string,
  _signature: string,
): boolean {
  console.warn('[STUB] verifyWebhookSignature — Square not configured');
  return false;
}
