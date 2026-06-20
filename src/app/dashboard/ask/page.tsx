"use client";

import { useState } from "react";

interface AskResult {
  answer: string;
  data_sources: string[];
  requires_action: boolean;
  suggested_action: {
    type: string;
    description: string;
  } | null;
  stub: boolean;
}

export default function AskTrellisPage() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState<
    Array<{ role: "user" | "assistant"; content: string; action?: AskResult["suggested_action"] }>
  >([]);

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || loading) return;

    const q = question.trim();
    setQuestion("");
    setConversation((prev) => [...prev, { role: "user", content: q }]);
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ask-trellis`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ question: q }),
        },
      );

      const data = await response.json();
      if (data.data) {
        setConversation((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.data.answer,
            action: data.data.suggested_action,
          },
        ]);
      }
    } catch {
      setConversation((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Please try again." },
      ]);
    }

    setLoading(false);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <h1 className="text-2xl font-bold text-[#D4AF37] mb-4">
        Ask Trellis
      </h1>
      <p className="text-sm text-gray-400 mb-6">
        Ask anything about your business — events, inventory, finances,
        staff. Trellis AI Engine answers from your real data.
      </p>

      {/* Conversation */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {conversation.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-4">🧠</p>
            <p className="text-gray-400 mb-6">
              Try asking something like:
            </p>
            <div className="space-y-2">
              {[
                "How many weddings do we have in August?",
                "What\'s our bar cost for the next event?",
                "Which inventory items need reordering?",
                "Show me overdue tasks",
              ].map((example) => (
                <button
                  key={example}
                  onClick={() => setQuestion(example)}
                  className="block mx-auto px-4 py-2 bg-[#2A2A2A] text-gray-300 rounded-lg hover:bg-[#3A3A3A] hover:text-[#D4AF37] transition-colors text-sm"
                >
                  &ldquo;{example}&rdquo;
                </button>
              ))}
            </div>
          </div>
        )}

        {conversation.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.role === "user"
                  ? "bg-[#D4AF37] text-black"
                  : "bg-[#2A2A2A] text-white border border-[#3A3A3A]"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              {msg.action && (
                <div className="mt-2 pt-2 border-t border-[#4A4A4A]">
                  <p className="text-xs text-gray-400 mb-1">
                    Suggested action:
                  </p>
                  <button className="px-3 py-1 bg-[#D4AF37] text-black text-xs rounded font-medium hover:bg-[#C4A030]">
                    {msg.action.description}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#2A2A2A] rounded-lg p-3 border border-[#3A3A3A]">
              <p className="text-sm text-gray-400 animate-pulse">
                Thinking...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleAsk} className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask Trellis anything..."
          className="flex-1 px-4 py-3 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="px-6 py-3 bg-[#D4AF37] text-black rounded-lg font-medium hover:bg-[#C4A030] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Ask
        </button>
      </form>
    </div>
  );
}
