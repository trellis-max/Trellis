/**
 * Inventory & Reorder Logic
 * =========================
 * Reorder-point alerts and inventory helpers for bar + supplies.
 */

import type { InventoryItem } from '@/types/database';

export interface ReorderAlert {
  item: InventoryItem;
  deficit: number; // how many units below reorder point
  severity: 'low' | 'critical';
}

/** Check inventory for items at or below reorder point */
export function getReorderAlerts(items: InventoryItem[]): ReorderAlert[] {
  return items
    .filter((item) => item.is_active && item.current_quantity <= item.reorder_point)
    .map((item) => ({
      item,
      deficit: item.reorder_point - item.current_quantity,
      severity: (item.current_quantity <= item.par_level * 0.25 ? 'critical' : 'low') as 'critical' | 'low',
    }))
    .sort((a, b) => {
      if (a.severity === 'critical' && b.severity !== 'critical') return -1;
      if (b.severity === 'critical' && a.severity !== 'critical') return 1;
      return b.deficit - a.deficit;
    });
}

/** Calculate suggested reorder quantity (up to par level) */
export function suggestReorderQuantity(item: InventoryItem): number {
  return Math.max(0, item.par_level - item.current_quantity);
}
