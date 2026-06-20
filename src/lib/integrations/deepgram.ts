/**
 * Deepgram (Speech-to-Text) — STUB
 * ==================================
 * Voice memo capture → STT → AI task routing.
 * Calls route through Supabase Edge Functions (never browser).
 *
 * Wire DEEPGRAM_API_KEY when key is provided.
 */

export interface TranscriptionResult {
  transcript: string;
  confidence: number;
  duration_seconds: number;
}

export async function transcribeAudio(
  _audioUrl: string,
): Promise<TranscriptionResult> {
  console.warn('[STUB] transcribeAudio — Deepgram key not wired');
  return {
    transcript: '',
    confidence: 0,
    duration_seconds: 0,
  };
}
