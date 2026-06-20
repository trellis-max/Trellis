"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface ExtractedReceipt {
  vendor_name: string;
  date: string;
  total: number;
  subtotal: number | null;
  tax: number | null;
  tip: number | null;
  category: string;
  line_items: Array<{
    description: string;
    quantity: number | null;
    amount: number;
  }>;
  payment_method: string;
  confidence: string;
}

export default function ReceiptsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [extracted, setExtracted] = useState<ExtractedReceipt | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setExtracted(null);
    setSaved(false);
    setError(null);

    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(selected);
  }

  async function handleExtract() {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("receipt", file);

      const res = await fetch("/api/receipt-vision", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.extracted) {
        setExtracted(data.extracted);
      } else {
        setError(data.error || "Failed to process receipt");
      }
    } catch {
      setError("Network error. Check your connection.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveExpense() {
    if (!extracted || !file) return;
    setSaving(true);

    try {
      const supabase = createClient();

      // Upload receipt image to storage
      const fileName = `${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("receipts")
        .upload(fileName, file);

      if (uploadError) {
        setError("Failed to upload receipt image");
        setSaving(false);
        return;
      }

      // Create expense record
      const { error: insertError } = await supabase.from("expenses").insert({
        description: `${extracted.vendor_name} — ${extracted.category.replace(/_/g, " ")}`,
        amount: extracted.total,
        date: extracted.date || new Date().toISOString().split("T")[0],
        category: extracted.category,
        vendor: extracted.vendor_name,
        receipt_url: fileName,
        payment_method: extracted.payment_method,
        notes: extracted.line_items
          ?.map(
            (li) =>
              `${li.description}: $${li.amount.toFixed(2)}${li.quantity ? ` (x${li.quantity})` : ""}`,
          )
          .join("\n"),
      });

      if (insertError) {
        setError("Failed to save expense: " + insertError.message);
      } else {
        setSaved(true);
      }
    } catch {
      setError("Failed to save expense");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#D4AF37]">Receipt Scanner</h1>
        <p className="text-sm text-gray-400 mt-1">
          Snap a photo or upload a receipt. The Trellis AI Engine extracts vendor,
          amount, items, and category automatically.
        </p>
      </div>

      {/* Upload area */}
      <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
        {!preview ? (
          <div className="border-2 border-dashed border-[#3A3A3A] rounded-lg p-8 text-center">
            <p className="text-4xl mb-3">📸</p>
            <p className="text-gray-400 text-sm mb-3">
              Drop a receipt photo here or click to browse
            </p>
            <label className="px-4 py-2 bg-[#D4AF37] text-black rounded-lg font-medium cursor-pointer hover:bg-[#C4A030] text-sm">
              Choose Receipt
              <input
                type="file"
                className="hidden"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
              />
            </label>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-6">
            {/* Preview */}
            <div className="md:w-1/3">
              <img
                src={preview}
                alt="Receipt preview"
                className="rounded-lg border border-[#3A3A3A] max-h-80 w-full object-contain bg-[#1E1E1E]"
              />
              <div className="flex gap-2 mt-3">
                <label className="flex-1 text-center px-3 py-1.5 bg-[#3A3A3A] text-white rounded text-sm cursor-pointer hover:bg-[#4A4A4A]">
                  Replace
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                  />
                </label>
                {!extracted && (
                  <button
                    onClick={handleExtract}
                    disabled={loading}
                    className="flex-1 px-3 py-1.5 bg-[#D4AF37] text-black rounded font-medium text-sm hover:bg-[#C4A030] disabled:opacity-50"
                  >
                    {loading ? "Processing..." : "Extract Data"}
                  </button>
                )}
              </div>
            </div>

            {/* Extracted data */}
            <div className="md:w-2/3">
              {loading && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="flex gap-1 justify-center mb-3">
                      <span className="w-2 h-2 bg-[#D4AF37] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-[#D4AF37] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-[#D4AF37] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    <p className="text-gray-400 text-sm">
                      Trellis AI is reading the receipt...
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 text-red-300 text-sm">
                  {error}
                </div>
              )}

              {extracted && (
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-white font-semibold text-lg">
                        {extracted.vendor_name}
                      </h3>
                      <p className="text-sm text-gray-400">{extracted.date}</p>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        extracted.confidence === "high"
                          ? "bg-green-900/30 text-green-400"
                          : extracted.confidence === "medium"
                            ? "bg-yellow-900/30 text-yellow-400"
                            : "bg-red-900/30 text-red-400"
                      }`}
                    >
                      {extracted.confidence} confidence
                    </span>
                  </div>

                  {/* Line items */}
                  {extracted.line_items?.length > 0 && (
                    <div className="bg-[#1E1E1E] rounded-lg p-3">
                      <p className="text-xs text-gray-500 font-medium mb-2">
                        LINE ITEMS
                      </p>
                      {extracted.line_items.map((item, i) => (
                        <div
                          key={i}
                          className="flex justify-between text-sm py-1 border-b border-[#2A2A2A] last:border-0"
                        >
                          <span className="text-gray-300">
                            {item.description}
                            {item.quantity ? ` (×${item.quantity})` : ""}
                          </span>
                          <span className="text-white">
                            ${item.amount.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Totals */}
                  <div className="space-y-1 text-sm">
                    {extracted.subtotal != null && (
                      <div className="flex justify-between text-gray-400">
                        <span>Subtotal</span>
                        <span>${extracted.subtotal.toFixed(2)}</span>
                      </div>
                    )}
                    {extracted.tax != null && (
                      <div className="flex justify-between text-gray-400">
                        <span>Tax</span>
                        <span>${extracted.tax.toFixed(2)}</span>
                      </div>
                    )}
                    {extracted.tip != null && (
                      <div className="flex justify-between text-gray-400">
                        <span>Tip</span>
                        <span>${extracted.tip.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-white font-semibold border-t border-[#3A3A3A] pt-1">
                      <span>Total</span>
                      <span className="text-[#D4AF37]">
                        ${extracted.total?.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span>
                      Category:{" "}
                      <span className="text-gray-300 capitalize">
                        {extracted.category?.replace(/_/g, " ")}
                      </span>
                    </span>
                    <span>
                      Payment:{" "}
                      <span className="text-gray-300 capitalize">
                        {extracted.payment_method}
                      </span>
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    {!saved ? (
                      <button
                        onClick={handleSaveExpense}
                        disabled={saving}
                        className="px-4 py-2 bg-[#D4AF37] text-black rounded-lg font-medium hover:bg-[#C4A030] text-sm disabled:opacity-50"
                      >
                        {saving ? "Saving..." : "Save as Expense"}
                      </button>
                    ) : (
                      <span className="px-4 py-2 bg-green-900/30 text-green-400 rounded-lg text-sm font-medium">
                        ✓ Saved to Expenses
                      </span>
                    )}
                    <button
                      onClick={() => {
                        setExtracted(null);
                        setSaved(false);
                        setFile(null);
                        setPreview(null);
                      }}
                      className="px-4 py-2 bg-[#3A3A3A] text-white rounded-lg text-sm hover:bg-[#4A4A4A]"
                    >
                      Scan Another
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
