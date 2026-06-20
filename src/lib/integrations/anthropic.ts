/**
 * Anthropic (Trellis AI Engine) — STUB
 * =====================================
 * All AI calls route through Supabase Edge Functions (never browser).
 * This client-side module calls internal API routes that proxy to Edge Functions.
 *
 * Wire ANTHROPIC_API_KEY when key is provided.
 * Scoped key + Console spend cap required before production.
 */

export interface AICategorizationResult {
  category: string;
  confidence: number;
  reasoning: string;
}

export interface AITaskRoutingResult {
  assignee_suggestion: string;
  task_title: string;
  priority: string;
  confidence: number;
}

export interface AskTrellisResult {
  answer: string;
  sources: string[];
  requires_action: boolean;
  suggested_action: string | null;
}

// --- Stub implementations (replace with real Edge Function calls) ---

export async function categorizeReceipt(
  _imageUrl: string,
  _description: string,
): Promise<AICategorizationResult> {
  console.warn('[STUB] categorizeReceipt — Anthropic key not wired');
  return {
    category: 'other',
    confidence: 0,
    reasoning: 'AI engine not connected — stub response',
  };
}

export async function routeVoiceTask(
  _transcript: string,
  _staffRoster: string[],
): Promise<AITaskRoutingResult> {
  console.warn('[STUB] routeVoiceTask — Anthropic key not wired');
  return {
    assignee_suggestion: 'unassigned',
    task_title: 'Voice task (pending AI routing)',
    priority: 'medium',
    confidence: 0,
  };
}

export async function askTrellis(
  _question: string,
  _context: Record<string, unknown>,
): Promise<AskTrellisResult> {
  console.warn('[STUB] askTrellis — Anthropic key not wired');
  return {
    answer: 'The Trellis AI Engine is not yet connected. This feature will be available once the API key is wired.',
    sources: [],
    requires_action: false,
    suggested_action: null,
  };
}

export async function draftEmail(
  _purpose: string,
  _context: Record<string, unknown>,
): Promise<{ subject: string; body: string }> {
  console.warn('[STUB] draftEmail — Anthropic key not wired');
  return {
    subject: '[Draft] Pending AI connection',
    body: 'Email drafting requires the Trellis AI Engine to be connected.',
  };
}
