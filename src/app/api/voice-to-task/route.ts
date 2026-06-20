// Voice-to-Task — Deepgram speech-to-text + Claude task extraction
// Records voice memo → transcribes → extracts actionable tasks/notes

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

interface ExtractedTask {
  title: string;
  priority: "low" | "medium" | "high" | "urgent";
  due_hint: string | null; // e.g. "tomorrow", "next friday", "before the wedding"
  category: string; // e.g. "bar", "setup", "vendor", "admin"
}

interface ExtractionResult {
  tasks: ExtractedTask[];
  summary: string;
  raw_transcript: string;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const deepgramKey = process.env.DEEPGRAM_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    if (!deepgramKey) {
      return NextResponse.json(
        { error: "Voice processing not configured" },
        { status: 503 },
      );
    }

    const formData = await req.formData();
    const audio = formData.get("audio") as File | null;

    if (!audio) {
      return NextResponse.json(
        { error: "Audio file is required" },
        { status: 400 },
      );
    }

    // 1. Upload audio to Supabase storage
    const fileName = `${Date.now()}-memo.webm`;
    const audioBytes = await audio.arrayBuffer();

    await supabase.storage
      .from("voice-memos")
      .upload(fileName, new Uint8Array(audioBytes), {
        contentType: audio.type || "audio/webm",
      });

    // 2. Transcribe with Deepgram
    const dgRes = await fetch(
      "https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&punctuate=true&diarize=true",
      {
        method: "POST",
        headers: {
          Authorization: `Token ${deepgramKey}`,
          "Content-Type": audio.type || "audio/webm",
        },
        body: new Uint8Array(audioBytes),
      },
    );

    if (!dgRes.ok) {
      const errText = await dgRes.text();
      console.error("Deepgram error:", errText);
      return NextResponse.json(
        { error: "Voice transcription temporarily unavailable" },
        { status: 502 },
      );
    }

    const dgData = await dgRes.json();
    const transcript =
      dgData.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";

    if (!transcript.trim()) {
      return NextResponse.json(
        {
          error: "Could not detect speech in the recording",
          transcript: "",
        },
        { status: 422 },
      );
    }

    // 3. Extract tasks with Claude (if available)
    let extraction: ExtractionResult = {
      tasks: [],
      summary: transcript,
      raw_transcript: transcript,
    };

    if (anthropicKey) {
      const extractionPrompt = `You are the Trellis AI Engine for Willow Acres, a wedding/event venue. 
A staff member just recorded a voice memo. Extract actionable tasks and a brief summary.

Voice memo transcript:
"${transcript}"

Return ONLY valid JSON:
{
  "tasks": [
    {
      "title": "concise task title",
      "priority": "low | medium | high | urgent",
      "due_hint": "natural language due date hint or null",
      "category": "bar | setup | vendor | admin | maintenance | catering | other"
    }
  ],
  "summary": "1-2 sentence summary of the memo"
}

If no actionable tasks are found, return an empty tasks array with just the summary. Always return valid JSON.`;

      try {
        const claudeRes = await fetch(
          "https://api.anthropic.com/v1/messages",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": anthropicKey,
              "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
              model: "claude-3-5-sonnet-20241022",
              max_tokens: 512,
              messages: [
                { role: "user", content: extractionPrompt },
              ],
            }),
          },
        );

        if (claudeRes.ok) {
          const claudeData = await claudeRes.json();
          const rawText = claudeData.content?.[0]?.text || "{}";
          const cleaned = rawText
            .replace(/```json?\n?/g, "")
            .replace(/```\n?/g, "")
            .trim();
          const parsed = JSON.parse(cleaned);
          extraction = {
            tasks: parsed.tasks || [],
            summary: parsed.summary || transcript,
            raw_transcript: transcript,
          };
        }
      } catch (e) {
        console.error("Claude extraction failed, using raw transcript:", e);
        // Fall back to just the transcript
      }
    }

    // 4. Auto-create tasks in the database
    const createdTasks: string[] = [];
    for (const task of extraction.tasks) {
      const { data, error: insertErr } = await supabase
        .from("tasks")
        .insert({
          title: task.title,
          priority: task.priority,
          status: "pending",
          created_by: user.id,
          notes: `[Voice memo] ${extraction.summary}\n\nDue hint: ${task.due_hint || "none"}\nCategory: ${task.category}`,
        })
        .select("id")
        .single();

      if (!insertErr && data) {
        createdTasks.push(data.id);
      }
    }

    // 5. Audit log
    await supabase.from("audit_log").insert({
      action: "voice_to_task",
      user_id: user.id,
      details: {
        transcript_length: transcript.length,
        tasks_extracted: extraction.tasks.length,
        tasks_created: createdTasks.length,
        storage_path: fileName,
      },
    });

    return NextResponse.json({
      transcript,
      summary: extraction.summary,
      tasks: extraction.tasks,
      created_task_ids: createdTasks,
      storage_path: fileName,
    });
  } catch (err) {
    console.error("Voice-to-task error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
