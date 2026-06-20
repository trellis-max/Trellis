import { getCouples } from '@/lib/supabase/queries';
import { STAGE_LABELS, STAGE_COLORS } from '@/lib/crm/lifecycle';
import type { LifecycleStage } from '@/types/database';

export default async function CouplesPage() {
  let couples: Array<{
    id: string; customer_id: string; partner_1_name: string;
    partner_2_name: string | null; email: string; lifecycle_stage: string;
    created_at: string;
  }> = [];
  let dbConnected = false;

  try {
    const result = await getCouples();
    couples = result.data;
    dbConnected = true;
  } catch { /* DB not connected */ }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-trellis-charcoal">Couples</h1>
        <a href="/dashboard/couples/new"
          className="rounded-lg bg-trellis-gold px-4 py-2 text-sm font-semibold text-trellis-charcoal-dark transition hover:bg-trellis-gold-light">
          + New Lead
        </a>
      </div>

      {!dbConnected ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-trellis-charcoal/40">Connect Supabase to see couples</p>
        </div>
      ) : couples.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-trellis-charcoal/50">No couples yet — add your first lead</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-trellis-warm-gray bg-gray-50">
                <th className="px-4 py-3 text-left font-medium text-trellis-charcoal/70">Customer ID</th>
                <th className="px-4 py-3 text-left font-medium text-trellis-charcoal/70">Names</th>
                <th className="px-4 py-3 text-left font-medium text-trellis-charcoal/70">Email</th>
                <th className="px-4 py-3 text-left font-medium text-trellis-charcoal/70">Stage</th>
              </tr>
            </thead>
            <tbody>
              {couples.map((c) => (
                <tr key={c.id} className="border-b border-gray-100 transition hover:bg-trellis-cream/50">
                  <td className="px-4 py-3">
                    <a href={`/dashboard/couples/${c.id}`} className="font-mono text-trellis-gold-dark hover:underline">
                      {c.customer_id}
                    </a>
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {c.partner_1_name}{c.partner_2_name ? ` & ${c.partner_2_name}` : ''}
                  </td>
                  <td className="px-4 py-3 text-trellis-charcoal/60">{c.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STAGE_COLORS[c.lifecycle_stage as LifecycleStage] ?? 'bg-gray-100 text-gray-600'}`}>
                      {STAGE_LABELS[c.lifecycle_stage as LifecycleStage] ?? c.lifecycle_stage}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
