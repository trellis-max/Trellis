"use client";

import { useState } from "react";

export default function HoneybookMigrationPage() {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#D4AF37]">
          Honeybook Migration
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          One-time data import from Honeybook. Export your data as CSV, then
          import here to populate Trellis.
        </p>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-2 text-sm">
        {["Export from HB", "Upload CSV", "Map Fields", "Review", "Import"].map(
          (label, i) => (
            <div key={label} className="flex items-center gap-2">
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  i + 1 === step
                    ? "bg-[#D4AF37] text-black"
                    : i + 1 < step
                      ? "bg-green-600 text-white"
                      : "bg-[#3A3A3A] text-gray-400"
                }`}
              >
                {i + 1 < step ? "✓" : i + 1}
              </span>
              <span
                className={
                  i + 1 === step ? "text-white" : "text-gray-500"
                }
              >
                {label}
              </span>
              {i < 4 && (
                <span className="text-gray-600 mx-1">→</span>
              )}
            </div>
          ),
        )}
      </div>

      {/* Step content */}
      <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-white font-semibold">
              Step 1: Export from Honeybook
            </h3>
            <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
              <li>
                Log into Honeybook and navigate to{" "}
                <strong>Settings → Data Export</strong>
              </li>
              <li>
                Export your <strong>Contacts</strong> as CSV (this includes
                couples, leads, and client info)
              </li>
              <li>
                Export your <strong>Projects/Bookings</strong> as CSV (event
                details, dates, packages)
              </li>
              <li>
                Export any <strong>Financial</strong> data (invoices,
                payments) if available
              </li>
              <li>
                Save all CSV files — you&apos;ll upload them in the next step
              </li>
            </ol>
            <div className="bg-[#1E1E1E] rounded p-3 text-xs text-gray-400">
              <strong>Note:</strong> Honeybook does not have an open API. This
              is a one-time manual migration via CSV export. After import,
              Honeybook will be retired.
            </div>
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 bg-[#D4AF37] text-black rounded-lg font-medium hover:bg-[#C4A030] text-sm"
            >
              I&apos;ve Exported → Next
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Step 2: Upload CSV</h3>
            <div className="border-2 border-dashed border-[#3A3A3A] rounded-lg p-8 text-center">
              <p className="text-3xl mb-2">📄</p>
              <p className="text-gray-400 text-sm mb-3">
                Drop your Honeybook CSV here or click to browse
              </p>
              <label className="px-4 py-2 bg-[#3A3A3A] text-white rounded-lg text-sm cursor-pointer hover:bg-[#4A4A4A]">
                Choose File
                <input
                  type="file"
                  className="hidden"
                  accept=".csv"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </label>
              {file && (
                <p className="text-sm text-[#D4AF37] mt-3">
                  ✓ {file.name} ({(file.size / 1024).toFixed(0)} KB)
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 bg-[#3A3A3A] text-white rounded-lg text-sm"
              >
                Back
              </button>
              <button
                onClick={() => file && setStep(3)}
                disabled={!file}
                className="px-4 py-2 bg-[#D4AF37] text-black rounded-lg font-medium hover:bg-[#C4A030] text-sm disabled:opacity-50"
              >
                Upload → Next
              </button>
            </div>
          </div>
        )}

        {step >= 3 && (
          <div className="space-y-4">
            <h3 className="text-white font-semibold">
              Step {step}: {step === 3 ? "Map Fields" : step === 4 ? "Review" : "Import"}
            </h3>
            <p className="text-gray-400 text-sm">
              This step will be activated when real Willow data is available
              for calibration. The migration tool will map Honeybook fields to
              Trellis schema columns (couples, events, invoices).
            </p>
            <button
              onClick={() => setStep(step > 1 ? step - 1 : 1)}
              className="px-4 py-2 bg-[#3A3A3A] text-white rounded-lg text-sm"
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
