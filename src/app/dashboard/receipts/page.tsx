import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ReceiptUploader } from "./receipt-uploader";

export default async function ReceiptsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Fetch recent receipts/expenses
  const { data: expenses } = await supabase
    .from("expenses")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#D4AF37]">
          Snap-a-Receipt
        </h1>
      </div>

      <ReceiptUploader />

      <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Recent Receipts
        </h2>
        {!expenses?.length ? (
          <p className="text-gray-400">
            No receipts yet. Upload your first receipt above.
          </p>
        ) : (
          <div className="space-y-3">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-3 bg-[#1E1E1E] rounded-lg"
              >
                <div>
                  <p className="text-white font-medium">
                    {String(expense.vendor || "Unknown Vendor")}
                  </p>
                  <p className="text-sm text-gray-400">
                    {String(expense.category)} •{" "}
                    {new Date(
                      String(expense.date || expense.created_at),
                    ).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[#D4AF37] font-semibold">
                    ${Number(expense.amount || 0).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {String(expense.status || "pending")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
