"use client";

import { useState } from "react";

export function ReceiptUploader() {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{
    vendor: string;
    amount: number;
    category: string;
    confidence: number;
    stub: boolean;
  } | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setResult(null);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];

        // Call the receipt-vision Edge Function
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/receipt-vision`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
              image_base64: base64,
              description: file.name,
            }),
          },
        );

        const data = await response.json();
        if (data.data) {
          setResult({ ...data.data, stub: !!data.stub });
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setUploading(false);
    }
  }

  return (
    <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
      <h2 className="text-lg font-semibold text-white mb-2">
        Upload Receipt
      </h2>
      <p className="text-sm text-gray-400 mb-4">
        Snap a photo or upload a receipt image. The Trellis AI Engine will
        extract vendor, amount, and category for QB sync.
      </p>

      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#3A3A3A] rounded-lg cursor-pointer hover:border-[#D4AF37] transition-colors">
        <div className="text-center">
          <p className="text-[#D4AF37] text-2xl mb-1">📸</p>
          <p className="text-sm text-gray-400">
            {uploading ? "Processing..." : "Click to upload receipt"}
          </p>
        </div>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
          disabled={uploading}
        />
      </label>

      {result && (
        <div className="mt-4 p-4 bg-[#1E1E1E] rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[#D4AF37]">
              {result.stub ? "⚠️" : "✅"}
            </span>
            <span className="text-sm text-gray-400">
              {result.stub
                ? "AI Engine not connected — stub result"
                : `Confidence: ${(result.confidence * 100).toFixed(0)}%`}
            </span>
          </div>
          <p className="text-white font-medium">{result.vendor}</p>
          <p className="text-gray-400">
            ${result.amount.toFixed(2)} • {result.category}
          </p>
          <div className="mt-3 flex gap-2">
            <button
              className="px-3 py-1 bg-[#D4AF37] text-black text-sm rounded font-medium hover:bg-[#C4A030] disabled:opacity-50"
              disabled={result.stub}
            >
              Approve & Push to QB
            </button>
            <button className="px-3 py-1 bg-[#3A3A3A] text-white text-sm rounded hover:bg-[#4A4A4A]">
              Edit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
