// Receipt Vision — Claude Vision extracts structured data from receipt photos
// Runs on Vercel where ANTHROPIC_API_KEY is set

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const EXTRACTION_PROMPT = `You are a receipt data extraction engine for Willow Acres, an event venue. Extract structured data from this receipt image.

Return ONLY valid JSON with these fields:
{
  "vendor_name": "string — business name on receipt",
  "date": "string — YYYY-MM-DD format",
  "total": number,
  "subtotal": number or null,
  "tax": number or null,
  "tip": number or null,
  "category": "one of: bar_supplies, food, rentals, decor, office, maintenance, other",
  "line_items": [
    { "description": "string", "quantity": number or null, "amount": number }
  ],
  "payment_method": "cash | card | check | other | unknown",
  "confidence": "high | medium | low"
}

If a field is unreadable, use null. For category, infer from the vendor and items (e.g. liquor store = bar_supplies, restaurant supply = food). Always return valid JSON, nothing else.`;

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI engine not configured" },
        { status: 503 },
      );
    }

    const formData = await req.formData();
    const file = formData.get("receipt") as File | null;
    const imageUrl = formData.get("image_url") as string | null;

    if (!file && !imageUrl) {
      return NextResponse.json(
        { error: "Receipt image or URL is required" },
        { status: 400 },
      );
    }

    // Build the image content for Claude
    let imageContent: Record<string, unknown>;

    if (file) {
      const bytes = await file.arrayBuffer();
      const base64 = Buffer.from(bytes).toString("base64");
      const mediaType = file.type || "image/jpeg";
      imageContent = {
        type: "image",
        source: {
          type: "base64",
          media_type: mediaType,
          data: base64,
        },
      };
    } else {
      imageContent = {
        type: "image",
        source: {
          type: "url",
          url: imageUrl,
        },
      };
    }

    // Call Anthropic Vision
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: [
              imageContent,
              { type: "text", text: EXTRACTION_PROMPT },
            ],
          },
        ],
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      console.error("Anthropic vision error:", errText);
      return NextResponse.json(
        { error: "Receipt processing temporarily unavailable" },
        { status: 502 },
      );
    }

    const anthropicData = await anthropicRes.json();
    const rawText =
      anthropicData.content?.[0]?.text || "{}";

    // Parse the JSON response
    let extracted;
    try {
      // Strip markdown code fences if present
      const cleaned = rawText.replace(/```json?\n?/g, "").replace(/```\n?/g, "").trim();
      extracted = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse extraction:", rawText);
      return NextResponse.json(
        {
          error: "Could not parse receipt data",
          raw: rawText,
        },
        { status: 422 },
      );
    }

    // Log to audit
    await supabase.from("audit_log").insert({
      action: "receipt_vision",
      user_id: user.id,
      details: {
        vendor: extracted.vendor_name,
        total: extracted.total,
        confidence: extracted.confidence,
        model: "claude-sonnet-4-20250514",
      },
    });

    return NextResponse.json({
      extracted,
      usage: anthropicData.usage,
    });
  } catch (err) {
    console.error("Receipt vision error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
