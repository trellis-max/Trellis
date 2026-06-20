"use client";

import { useState, useRef } from "react";

export default function VoiceToTaskPage() {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{
    transcript: string;
    tasks: Array<{
      title: string;
      priority: string;
      assignee_suggestion: string;
    }>;
    stub: boolean;
  } | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((track) => track.stop());
        await processAudio(blob);
      };

      mediaRecorder.start();
      setRecording(true);
    } catch {
      alert("Microphone access required for voice memos.");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  async function processAudio(blob: Blob) {
    setProcessing(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/voice-to-task`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ audio_base64: base64 }),
          },
        );
        const data = await response.json();
        if (data.data) {
          setResult({ ...data.data, stub: !!data.stub });
        }
        setProcessing(false);
      };
      reader.readAsDataURL(blob);
    } catch {
      setProcessing(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#D4AF37]">
        Voice to Task
      </h1>
      <p className="text-sm text-gray-400">
        Record a voice memo and the Trellis AI Engine will split it into
        assigned tasks for your team.
      </p>

      {/* Recording control */}
      <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-8 text-center">
        <button
          onClick={recording ? stopRecording : startRecording}
          disabled={processing}
          className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl transition-all ${
            recording
              ? "bg-red-600 hover:bg-red-700 animate-pulse"
              : "bg-[#D4AF37] hover:bg-[#C4A030]"
          } disabled:opacity-50`}
        >
          {recording ? "⏹" : "🎤"}
        </button>
        <p className="mt-4 text-gray-400 text-sm">
          {processing
            ? "Processing voice memo..."
            : recording
              ? "Recording... tap to stop"
              : "Tap to record"}
        </p>
      </div>

      {/* Result */}
      {result && (
        <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
          {result.stub && (
            <div className="bg-yellow-900/30 text-yellow-200 text-sm p-3 rounded mb-4">
              ⚠️ AI Engine not connected — showing stub result
            </div>
          )}

          <h3 className="text-white font-semibold mb-2">Transcript</h3>
          <p className="text-gray-300 text-sm mb-4 bg-[#1E1E1E] p-3 rounded">
            {result.transcript}
          </p>

          <h3 className="text-white font-semibold mb-2">
            Tasks Created ({result.tasks.length})
          </h3>
          <div className="space-y-2">
            {result.tasks.map((task, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-[#1E1E1E] rounded"
              >
                <div>
                  <p className="text-white text-sm font-medium">
                    {task.title}
                  </p>
                  <p className="text-xs text-gray-400">
                    → {task.assignee_suggestion}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    task.priority === "urgent"
                      ? "bg-red-900 text-red-200"
                      : task.priority === "high"
                        ? "bg-orange-900 text-orange-200"
                        : "bg-gray-700 text-gray-300"
                  }`}
                >
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
