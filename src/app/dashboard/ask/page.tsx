"use client";

import { useState, useRef, useEffect } from "react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function AskTrellisPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ask-trellis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: messages }),
      });

      const data = await res.json();
      if (res.ok && data.reply) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.error || "Something went wrong. Please try again.",
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Network error. Check your connection and try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-[#D4AF37]">Ask Trellis</h1>
        <p className="text-sm text-gray-400 mt-1">
          Your AI operations assistant. Ask about events, inventory, finances,
          tasks — anything venue-related.
        </p>
      </div>

      {/* Chat area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 pb-4"
      >
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <p className="text-4xl mb-3">🤖</p>
              <p className="text-gray-400 mb-4">
                Ask me anything about your venue operations.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  "What events are coming up?",
                  "Any inventory running low?",
                  "How should I price a 150-guest bar package?",
                  "When is the next tax filing deadline?",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setInput(suggestion);
                    }}
                    className="px-3 py-1.5 bg-[#2A2A2A] text-gray-300 rounded-lg text-xs hover:bg-[#3A3A3A] border border-[#3A3A3A]"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-3 text-sm ${
                msg.role === "user"
                  ? "bg-[#D4AF37] text-black"
                  : "bg-[#2A2A2A] text-gray-200 border border-[#3A3A3A]"
              }`}
            >
              {msg.role === "assistant" && (
                <p className="text-xs text-[#D4AF37] font-medium mb-1">
                  Trellis AI
                </p>
              )}
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#2A2A2A] rounded-lg px-4 py-3 border border-[#3A3A3A]">
              <p className="text-xs text-[#D4AF37] font-medium mb-1">
                Trellis AI
              </p>
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-[#3A3A3A] pt-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Trellis anything..."
            className="flex-1 px-4 py-3 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-5 py-3 bg-[#D4AF37] text-black rounded-lg font-medium hover:bg-[#C4A030] disabled:opacity-50 text-sm"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
