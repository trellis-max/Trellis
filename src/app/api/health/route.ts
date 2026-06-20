// Health check — verifies environment variables and API connectivity
// No auth required — only reports pass/fail, never exposes keys

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function checkAnthropic(): Promise<{ status: string; detail: string }> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return { status: "FAIL", detail: "ANTHROPIC_API_KEY not set" };

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 10,
        messages: [{ role: "user", content: "Say OK" }],
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const text =
        data?.content?.[0]?.text?.slice(0, 20) ?? "no text";
      return { status: "PASS", detail: `Claude responded: "${text}"` };
    }
    const err = await res.json().catch(() => ({}));
    const errObj = err as Record<string, Record<string, string>>;
    const msg = errObj?.error?.message ?? res.statusText;
    return {
      status: "FAIL",
      detail: `HTTP ${res.status}: ${msg}`,
    };
  } catch (e) {
    return { status: "FAIL", detail: `Network error: ${String(e)}` };
  }
}

async function checkDeepgram(): Promise<{ status: string; detail: string }> {
  const key = process.env.DEEPGRAM_API_KEY;
  if (!key) return { status: "FAIL", detail: "DEEPGRAM_API_KEY not set" };

  try {
    // Minimal request: send a tiny silent WAV to Deepgram
    // 44 bytes WAV header + 0 samples = valid but empty
    const wavHeader = new Uint8Array([
      0x52,0x49,0x46,0x46, 0x24,0x00,0x00,0x00, 0x57,0x41,0x56,0x45,
      0x66,0x6d,0x74,0x20, 0x10,0x00,0x00,0x00, 0x01,0x00,0x01,0x00,
      0x80,0x3e,0x00,0x00, 0x00,0x7d,0x00,0x00, 0x02,0x00,0x10,0x00,
      0x64,0x61,0x74,0x61, 0x00,0x00,0x00,0x00,
    ]);

    const res = await fetch(
      "https://api.deepgram.com/v1/listen?model=nova-2&language=en",
      {
        method: "POST",
        headers: {
          Authorization: `Token ${key}`,
          "Content-Type": "audio/wav",
        },
        body: wavHeader,
      },
    );

    if (res.ok) {
      return { status: "PASS", detail: "Deepgram API authenticated and responded" };
    }
    const err = await res.json().catch(() => ({}));
    return {
      status: res.status === 401 ? "FAIL" : "PASS",
      detail: `HTTP ${res.status}: ${JSON.stringify(err).slice(0, 100)}`,
    };
  } catch (e) {
    return { status: "FAIL", detail: `Network error: ${String(e)}` };
  }
}

function checkSupabase(): { status: string; detail: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url) return { status: "FAIL", detail: "NEXT_PUBLIC_SUPABASE_URL not set" };
  if (!key) return { status: "FAIL", detail: "NEXT_PUBLIC_SUPABASE_ANON_KEY not set" };
  return { status: "PASS", detail: `URL: ${url.replace(/https?:\/\//, "").slice(0, 20)}...` };
}

export async function GET() {
  const [anthropic, deepgram] = await Promise.all([
    checkAnthropic(),
    checkDeepgram(),
  ]);
  const supabase = checkSupabase();

  const allPass =
    anthropic.status === "PASS" &&
    deepgram.status === "PASS" &&
    supabase.status === "PASS";

  return NextResponse.json(
    {
      status: allPass ? "healthy" : "degraded",
      checks: { anthropic, deepgram, supabase },
      timestamp: new Date().toISOString(),
    },
    { status: allPass ? 200 : 503 },
  );
}
