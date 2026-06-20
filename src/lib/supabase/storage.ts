/**
 * Supabase Storage helpers — bucket references and upload utilities.
 *
 * Buckets (to be created via migration or dashboard):
 *   - receipts: Receipt images (snap-a-receipt + emailed)
 *   - voice-memos: Voice memo audio files
 *   - documents: Contracts, branding assets, Honeybook exports
 *   - branding: Logo, colors, custom assets for Willow Acres
 */

import { createClient } from "./client";

export const BUCKETS = {
  RECEIPTS: "receipts",
  VOICE_MEMOS: "voice-memos",
  DOCUMENTS: "documents",
  BRANDING: "branding",
} as const;

export async function uploadReceipt(file: File): Promise<string | null> {
  const supabase = createClient();
  const filename = `${Date.now()}-${file.name}`;

  const { data, error } = await supabase.storage
    .from(BUCKETS.RECEIPTS)
    .upload(filename, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error("Receipt upload error:", error);
    return null;
  }

  return data.path;
}

export async function uploadVoiceMemo(blob: Blob): Promise<string | null> {
  const supabase = createClient();
  const filename = `${Date.now()}-memo.webm`;

  const { data, error } = await supabase.storage
    .from(BUCKETS.VOICE_MEMOS)
    .upload(filename, blob, {
      contentType: "audio/webm",
      upsert: false,
    });

  if (error) {
    console.error("Voice memo upload error:", error);
    return null;
  }

  return data.path;
}

export function getPublicUrl(bucket: string, path: string): string {
  const supabase = createClient();
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
