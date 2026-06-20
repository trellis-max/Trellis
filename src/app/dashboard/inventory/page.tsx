import { getInventoryItems } from '@/lib/supabase/queries';
import { getReorderAlerts, suggestReorderQuantity } from '@/lib/inventory/reorder';
import type { InventoryItem } from '@/types/database';

export default async function InventoryPage() {
  let items: InventoryItem[] = [];
  let dbConnected = false;

  try {
    const result = await getInventoryItems();
    items = result.data as InventoryItem[];
    dbConnected = true;
  } catch { /* DB not connected */ }

  const alerts = getReorderAlerts(items);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-trellis-charcoal">Inventory</h1>
      </div>

      {/* Reorder Alerts */}
      {alerts.length > 0 && (
        <div className="rounded-xl border-2 border-trellis-warning/30 bg-orange-50 p-5">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-orange-800">
            ⚠️ Reorder Alerts ({alerts.length})
          </h2>
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div key={alert.item.id} className={`flex items-center justify-between rounded-lg p-3 ${alert.severity === 'critical' ? 'bg-red-100' : 'bg-orange-100'}`}>
                <div>
                  <p className="font-medium text-trellis-charcoal">{alert.item.name}</p>
                  <p className="text-sm text-trellis-charcoal/60">
                    {alert.item.current_quantity} {alert.item.unit} remaining (reorder at {alert.item.reorder_point})
                  </p>
                </div>
                <span className="rounded-lg bg-white px-3 py-1 text-sm font-medium">
                  Order {suggestReorderQuantity(alert.item)} {alert.item.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inventory Table */}
      {!dbConnected ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-trellis-charcoal/40">Connect Supabase to manage inventory</p>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-lg">📦</p>
          <p className="mt-2 text-trellis-charcoal/50">No inventory items yet</p>
          <p className="text-sm text-trellis-charcoal/40">Add bar stock, rentals, and supplies to start tracking</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-trellis-warm-gray bg-gray-50">
                <th className="px-4 py-3 text-left font-medium text-trellis-charcoal/70">Item</th>
                <th className="px-4 py-3 text-left font-medium text-trellis-charcoal/70">Category</th>
                <th className="px-4 py-3 text-right font-medium text-trellis-charcoal/70">Qty</th>
                <th className="px-4 py-3 text-right font-medium text-trellis-charcoal/70">Par</th>
                <th className="px-4 py-3 text-right font-medium text-trellis-charcoal/70">Reorder At</th>
                <th className="px-4 py-3 text-left font-medium text-trellis-charcoal/70">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const isLow = item.current_quantity <= item.reorder_point;
                const isCritical = item.current_quantity <= item.par_level * 0.25;
                return (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="px-4 py-3 font-medium">{item.name}</td>
                    <td className="px-4 py-3 text-trellis-charcoal/60">{item.category}</td>
                    <td className="px-4 py-3 text-right font-mono">{item.current_quantity} {item.unit}</td>
                    <td className="px-4 py-3 text-right font-mono text-trellis-charcoal/50">{item.par_level}</td>
                    <td className="px-4 py-3 text-right font-mono text-trellis-charcoal/50">{item.reorder_point}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        isCritical ? 'bg-red-100 text-red-800' :
                        isLow ? 'bg-orange-100 text-orange-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {isCritical ? 'Critical' : isLow ? 'Low' : 'OK'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
