/**
 * QuickBooks Online (System of Record) — STUB
 * =============================================
 * OAuth token exchange happens in Supabase Edge Functions only (never browser).
 * QB is the financial system of record for Willow Acres.
 *
 * On hold until Connection Session with Austin (Pam=QB admin).
 * Scaffold placeholders for: expense sync, invoice sync, sales-tax reports.
 */

export interface QBExpense {
  id: string;
  vendor: string;
  amount: number;
  category: string;
  date: string;
}

export interface QBInvoice {
  id: string;
  customer: string;
  amount: number;
  status: string;
}

export async function syncExpenseToQB(
  _expenseId: string,
): Promise<{ success: boolean; qbId: string | null }> {
  console.warn('[STUB] syncExpenseToQB — QB OAuth not connected');
  return { success: false, qbId: null };
}

export async function syncInvoiceToQB(
  _invoiceId: string,
): Promise<{ success: boolean; qbId: string | null }> {
  console.warn('[STUB] syncInvoiceToQB — QB OAuth not connected');
  return { success: false, qbId: null };
}

export async function generateSalesTaxReport(
  _month: number,
  _year: number,
): Promise<{ success: boolean; report: null }> {
  console.warn('[STUB] generateSalesTaxReport — QB OAuth not connected');
  return { success: false, report: null };
}
