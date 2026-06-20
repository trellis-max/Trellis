"use client";

import { useState } from "react";

interface TimeEntry {
  staff_name: string;
  event_name: string;
  date: string;
  hours: number;
  rate: number;
}

export default function PayrollExportPage() {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 14 * 86400000).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });
  const [entries] = useState<TimeEntry[]>([]);

  function exportCSV() {
    if (!entries.length) {
      alert("No time entries to export.");
      return;
    }

    const headers = [
      "Staff Name",
      "Event",
      "Date",
      "Hours",
      "Rate",
      "Total",
    ];
    const rows = entries.map((e) => [
      e.staff_name,
      e.event_name,
      e.date,
      e.hours.toString(),
      e.rate.toString(),
      (e.hours * e.rate).toFixed(2),
    ]);

    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payroll_${dateRange.start}_to_${dateRange.end}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#D4AF37]">Payroll Export</h1>
          <p className="text-sm text-gray-400 mt-1">
            Hours captured + totaled → payroll-ready CSV. Staff paid via
            Venmo/Zelle.
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="px-4 py-2 bg-[#D4AF37] text-black rounded-lg font-medium hover:bg-[#C4A030] text-sm"
        >
          📥 Export CSV
        </button>
      </div>

      {/* Date range */}
      <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-4 flex gap-4 items-end">
        <div>
          <label className="text-sm text-gray-400 block mb-1">From</label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, start: e.target.value }))
            }
            className="px-3 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded text-white text-sm"
          />
        </div>
        <div>
          <label className="text-sm text-gray-400 block mb-1">To</label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, end: e.target.value }))
            }
            className="px-3 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded text-white text-sm"
          />
        </div>
        <button className="px-4 py-2 bg-[#3A3A3A] text-white rounded text-sm hover:bg-[#4A4A4A]">
          Load
        </button>
      </div>

      {/* Time entries table */}
      <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] overflow-hidden">
        {!entries.length ? (
          <div className="p-8 text-center">
            <p className="text-4xl mb-3">⏱️</p>
            <p className="text-gray-400">
              No time entries for this period. Time entries are created from
              staff check-ins during events.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#1E1E1E]">
              <tr>
                <th className="px-4 py-3 text-left text-gray-400 font-medium">
                  Staff
                </th>
                <th className="px-4 py-3 text-left text-gray-400 font-medium">
                  Event
                </th>
                <th className="px-4 py-3 text-left text-gray-400 font-medium">
                  Date
                </th>
                <th className="px-4 py-3 text-right text-gray-400 font-medium">
                  Hours
                </th>
                <th className="px-4 py-3 text-right text-gray-400 font-medium">
                  Rate
                </th>
                <th className="px-4 py-3 text-right text-gray-400 font-medium">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3A3A3A]">
              {entries.map((entry, i) => (
                <tr key={i} className="hover:bg-[#1E1E1E]">
                  <td className="px-4 py-3 text-white">{entry.staff_name}</td>
                  <td className="px-4 py-3 text-gray-300">
                    {entry.event_name}
                  </td>
                  <td className="px-4 py-3 text-gray-300">{entry.date}</td>
                  <td className="px-4 py-3 text-right text-white">
                    {entry.hours.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-300">
                    ${entry.rate.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-[#D4AF37] font-medium">
                    ${(entry.hours * entry.rate).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
