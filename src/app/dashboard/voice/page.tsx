"use client";

import { useState, useRef } from "react";

interface ExtractedTask {
  title: string;
  priority: "low" | "medium" | "high" | "urgent";
  due_hint: string | null;
  category: string;
}

interface VoiceResult {
  transcript: string;
  summary: string;
  tasks: ExtractedTask[];
  created_task_ids: string[];
}

export default function VoiceMemosPage() {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<VoiceResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function startRecording() {
    try {
      setError(null);
      setResult(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        if (timerRef.current) clearInterval(timerRef.current);

        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (blob.size < 1000) {
          setError("Recording too short. Try again with a longer memo.");
          return;
        }
        await processAudio(blob);
      };

      mediaRecorder.start(250); // collect chunks every 250ms
      setRecording(true);
      setDuration(0);
      timerRef.current = setInterval(
        () => setDuration((d) => d + 1),
        1000,
      );
    } catch {
      setError(
        "Microphone access denied. Please allow microphone access to record voice memos.",
      );
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  }

  async function processAudio(blob: Blob) {
    setProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("audio", blob, "voice-memo.webm");

      const res = await fetch("/api/voice-to-task", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        setError(data.error || "Failed to process voice memo");
      }
    } catch {
      setError("Network error. Check your connection.");
    } finally {
      setProcessing(false);
    }
  }

  function formatDuration(secs: number) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  const priorityColors: Record<string, string> = {
    urgent: "bg-red-900/30 text-red-400",
    high: "bg-orange-900/30 text-orange-400",
    medium: "bg-yellow-900/30 text-yellow-400",
    low: "bg-green-900/30 text-green-400",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#D4AF37]">Voice Memos</h1>
        <p className="text-sm text-gray-400 mt-1">
          Record a voice memo and Trellis AI will transcribe it, extract tasks,
          and add them to your task list automatically.
        </p>
      </div>

      {/* Recorder */}
      <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-8 text-center">
        {!recording && !processing && (
          <div>
            <button
              onClick={startRecording}
              className="w-20 h-20 rounded-full bg-[#D4AF37] hover:bg-[#C4A030] flex items-center justify-center mx-auto transition-transform hover:scale-105"
            >
              <span className="text-3xl">🎤</span>
            </button>
            <p className="text-gray-400 text-sm mt-4">
              Tap to start recording
            </p>
          </div>
        )}

        {recording && (
          <div>
            <button
              onClick={stopRecording}
              className="w-20 h-20 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center mx-auto animate-pulse"
            >
              <span className="text-3xl">⏹</span>
            </button>
            <p className="text-white font-mono text-lg mt-4">
              {formatDuration(duration)}
            </p>
            <p className="text-red-400 text-sm mt-1 flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Recording — tap to stop
            </p>
          </div>
        )}

        {processing && (
          <div>
            <div className="w-20 h-20 rounded-full bg-[#3A3A3A] flex items-center justify-center mx-auto">
              <div className="flex gap-1">
                <span
                  className="w-2 h-2 bg-[#D4AF37] rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="w-2 h-2 bg-[#D4AF37] rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="w-2 h-2 bg-[#D4AF37] rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
            <p className="text-gray-400 text-sm mt-4">
              Transcribing and extracting tasks...
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-5">
            <h3 className="text-white font-semibold mb-2">📝 Summary</h3>
            <p className="text-gray-300 text-sm">{result.summary}</p>
          </div>

          {/* Extracted tasks */}
          {result.tasks.length > 0 && (
            <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold">
                  ✅ Tasks Created ({result.created_task_ids.length})
                </h3>
                <span className="text-xs text-green-400 bg-green-900/30 px-2 py-0.5 rounded-full">
                  Auto-added to task list
                </span>
              </div>
              <div className="space-y-2">
                {result.tasks.map((task, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 bg-[#1E1E1E] rounded-lg p-3"
                  >
                    <span className="text-green-400">✓</span>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">
                        {task.title}
                      </p>
                      <div className="flex gap-2 mt-1">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[task.priority] || priorityColors.medium}`}
                        >
                          {task.priority}
                        </span>
                        <span className="text-xs text-gray-500 capitalize">
                          {task.category}
                        </span>
                        {task.due_hint && (
                          <span className="text-xs text-gray-400">
                            📅 {task.due_hint}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full transcript */}
          <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-5">
            <h3 className="text-white font-semibold mb-2">
              🎙️ Full Transcript
            </h3>
            <p className="text-gray-400 text-sm whitespace-pre-wrap">
              {result.transcript}
            </p>
          </div>

          {/* Record another */}
          <button
            onClick={() => {
              setResult(null);
              setDuration(0);
            }}
            className="px-4 py-2 bg-[#D4AF37] text-black rounded-lg font-medium hover:bg-[#C4A030] text-sm"
          >
            Record Another Memo
          </button>
        </div>
      )}
    </div>
  );
}
