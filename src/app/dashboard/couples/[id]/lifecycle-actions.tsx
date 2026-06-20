'use client';

import { updateLifecycleStage } from '../actions';
import { STAGE_LABELS, STAGE_COLORS } from '@/lib/crm/lifecycle';
import type { LifecycleStage } from '@/types/database';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function LifecycleActions({
  coupleId,
  currentStage,
  nextStages,
}: {
  coupleId: string;
  currentStage: LifecycleStage;
  nextStages: LifecycleStage[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function handleTransition(newStage: LifecycleStage) {
    setLoading(newStage);
    setError('');
    const result = await updateLifecycleStage(coupleId, newStage, currentStage);
    if (result.error) {
      setError(result.error);
      setLoading(null);
    } else {
      router.refresh();
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {nextStages.map((stage) => (
          <button
            key={stage}
            onClick={() => handleTransition(stage)}
            disabled={loading !== null}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              stage === 'lost'
                ? 'border border-trellis-error/30 text-trellis-error hover:bg-red-50'
                : `${STAGE_COLORS[stage]} hover:opacity-80`
            } disabled:opacity-50`}
          >
            {loading === stage ? 'Moving...' : `→ ${STAGE_LABELS[stage]}`}
          </button>
        ))}
      </div>
      {error && <p className="mt-2 text-sm text-trellis-error">{error}</p>}
    </div>
  );
}
