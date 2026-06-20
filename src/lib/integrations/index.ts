/**
 * Integration Status Registry
 * ============================
 * Tracks which integrations are wired vs stubbed.
 * Used by the owner dashboard to show integration health.
 */

export type IntegrationStatus = 'connected' | 'stub' | 'error' | 'pending_auth';

export interface IntegrationInfo {
  name: string;
  status: IntegrationStatus;
  description: string;
  blockedBy?: string;
}

export function getIntegrationStatus(): IntegrationInfo[] {
  return [
    {
      name: 'Supabase',
      status: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'connected' : 'stub',
      description: 'Database, auth, storage, edge functions',
    },
    {
      name: 'Anthropic (Trellis AI)',
      status: process.env.ANTHROPIC_API_KEY ? 'connected' : 'stub',
      description: 'Receipt vision, voice routing, Ask Trellis, email drafts',
      blockedBy: 'API key not provided',
    },
    {
      name: 'Deepgram',
      status: process.env.DEEPGRAM_API_KEY ? 'connected' : 'stub',
      description: 'Speech-to-text for voice memos',
      blockedBy: 'API key not provided',
    },
    {
      name: 'Resend',
      status: 'stub',
      description: 'Email delivery (magic-link, notifications)',
      blockedBy: 'Verified domain not configured',
    },
    {
      name: 'Twilio',
      status: 'stub',
      description: 'SMS notifications (A2P gated for couples)',
      blockedBy: 'A2P 10DLC registration pending',
    },
    {
      name: 'QuickBooks',
      status: 'stub',
      description: 'Financial system of record',
      blockedBy: 'Connection Session pending (Austin)',
    },
    {
      name: 'Square',
      status: 'stub',
      description: 'Payment processing',
      blockedBy: 'Connection Session pending (Austin)',
    },
  ];
}
