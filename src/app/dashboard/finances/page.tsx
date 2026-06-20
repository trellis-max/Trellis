import { getExpenses } from '@/lib/supabase/queries';

export default async function FinancesPage() {
  let expenses: Array<Record<string, unknown>> = [];
  let dbConnected = false;

  try {
    // Current month expenses
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    const result = await getExpenses(startOfMonth);
    expenses = result.data;
    dbConnected = true;
  } catch { /* DB not connected */ }

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount ?? 0), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-trellis-charcoal">Finances</h1>

      {/* Month Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-trellis-charcoal/60">Monthly Expenses</p>
          <p className="mt-1 text-2xl font-bold text-trellis-charcoal">
            {dbConnected ? `$${totalExpenses.toLocaleString()}` : '—'}
          </p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-trellis-charcoal/60">QB Sync</p>
          <p className="mt-1 text-sm text-trellis-charcoal/40">Pending setup (Connection Session)</p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-trellis-charcoal/60">Snap Receipt</p>
          <p className="mt-1 text-sm text-trellis-charcoal/40">AI vision stub ready — needs Anthropic key</p>
        </div>
      </div>

      {/* Expenses List */}
      {!dbConnected ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-trellis-charcoal/40">Connect Supabase to track expenses</p>
        </div>
      ) : expenses.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-lg">💰</p>
          <p className="mt-2 text-trellis-charcoal/50">No expenses this month</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-trellis-warm-gray bg-gray-50">
                <th className="px-4 py-3 text-left font-medium text-trellis-charcoal/70">Date</th>
                <th className="px-4 py-3 text-left font-medium text-trellis-charcoal/70">Description</th>
                <th className="px-4 py-3 text-left font-medium text-trellis-charcoal/70">Category</th>
                <th className="px-4 py-3 text-right font-medium text-trellis-charcoal/70">Amount</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp) => (
                <tr key={exp.id as string} className="border-b border-gray-100">
                  <td className="px-4 py-3">{new Date(exp.date as string).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{exp.description as string}</td>
                  <td className="px-4 py-3 text-trellis-charcoal/60">{(exp.category as string).replace('_', ' ')}</td>
                  <td className="px-4 py-3 text-right font-mono">${Number(exp.amount).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
