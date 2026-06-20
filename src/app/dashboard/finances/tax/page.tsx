import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function SalesTaxPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Get expenses by category for tax calculation
  const { data: expenses } = await supabase
    .from("expenses")
    .select("*")
    .order("date", { ascending: false });

  // Get invoices for revenue by category
  const { data: invoices } = await supabase
    .from("invoices")
    .select("*")
    .order("created_at", { ascending: false });

  const now = new Date();
  const currentMonth = now.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Calculate filing deadlines
  const year = now.getFullYear();
  const month = now.getMonth();
  const filing20th = new Date(year, month, 20);
  const filing30th = new Date(year, month, 30);
  const daysTo20th = Math.ceil(
    (filing20th.getTime() - now.getTime()) / 86400000,
  );
  const daysTo30th = Math.ceil(
    (filing30th.getTime() - now.getTime()) / 86400000,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#D4AF37]">
          Sales Tax Report
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Tax data assembly for state filing. Owner files on the state site
          manually — no API available.
        </p>
      </div>

      {/* Filing reminders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          className={`rounded-lg border p-4 ${
            daysTo20th <= 5 && daysTo20th >= 0
              ? "bg-red-900/20 border-red-700"
              : "bg-[#2A2A2A] border-[#3A3A3A]"
          }`}
        >
          <p className="text-sm text-gray-400">20th Filing Deadline</p>
          <p className="text-white font-semibold">
            {filing20th.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {daysTo20th > 0
              ? `${daysTo20th} days away`
              : daysTo20th === 0
                ? "TODAY"
                : "Passed"}
          </p>
        </div>
        <div
          className={`rounded-lg border p-4 ${
            daysTo30th <= 5 && daysTo30th >= 0
              ? "bg-red-900/20 border-red-700"
              : "bg-[#2A2A2A] border-[#3A3A3A]"
          }`}
        >
          <p className="text-sm text-gray-400">30th Filing Deadline</p>
          <p className="text-white font-semibold">
            {filing30th.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {daysTo30th > 0
              ? `${daysTo30th} days away`
              : daysTo30th === 0
                ? "TODAY"
                : "Passed"}
          </p>
        </div>
      </div>

      {/* Tax breakdown */}
      <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-5">
        <h3 className="text-white font-semibold mb-3">
          {currentMonth} — Tax Summary
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-sm text-gray-400 font-medium border-b border-[#3A3A3A] pb-2">
            <span>Category</span>
            <span className="text-right">Revenue</span>
            <span className="text-right">Tax Owed</span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <span className="text-white">Rental (7%)</span>
            <span className="text-right text-gray-300">—</span>
            <span className="text-right text-[#D4AF37]">—</span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <span className="text-white">Bar (8%)</span>
            <span className="text-right text-gray-300">—</span>
            <span className="text-right text-[#D4AF37]">—</span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm border-t border-[#3A3A3A] pt-2 font-semibold">
            <span className="text-white">Total</span>
            <span className="text-right text-gray-300">—</span>
            <span className="text-right text-[#D4AF37]">—</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          Tax totals will populate from invoices categorized as bar or rental.
          Data flows from the invoicing helper.
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-5">
        <h3 className="text-white font-semibold mb-2">Filing Instructions</h3>
        <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
          <li>Review the tax summary above for accuracy</li>
          <li>
            Navigate to the state sales-tax portal (link will be in
            Settings → Integrations)
          </li>
          <li>Enter rental revenue and 7% tax owed</li>
          <li>Enter bar revenue and 8% tax owed</li>
          <li>Submit payment before the deadline</li>
          <li>
            Mark as filed below to dismiss the reminder for this period
          </li>
        </ol>
        <button className="mt-4 px-4 py-2 bg-[#3A3A3A] text-white rounded-lg text-sm hover:bg-[#4A4A4A]">
          ✅ Mark as Filed for {currentMonth}
        </button>
      </div>
    </div>
  );
}
