import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function CouplePortalPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Find the couple record for this user
  const { data: couple } = await supabase
    .from("couples")
    .select("*")
    .eq("email", user?.email ?? "")
    .single();

  // Find their events
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("couple_id", couple?.id ?? "")
    .order("event_date", { ascending: true });

  // Find their invoices
  const { data: invoices } = await supabase
    .from("invoices")
    .select("*")
    .eq("couple_id", couple?.id ?? "")
    .order("created_at", { ascending: false });

  const upcomingEvents = (events || []).filter(
    (e) => new Date(String(e.event_date)) >= new Date(),
  );

  const totalOwed = (invoices || [])
    .filter((inv) => inv.status !== "paid")
    .reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0);

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-2xl font-bold text-[#1A1A1A]">
          Welcome{couple ? `, ${String(couple.partner1_first_name)} & ${String(couple.partner2_first_name)}` : ""}! 💍
        </h2>
        <p className="text-gray-500 mt-1">
          {couple
            ? `Customer ID: ${String(couple.customer_id)}`
            : "Your portal is being set up."}
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500">Upcoming Events</p>
          <p className="text-3xl font-bold text-[#1A1A1A] mt-1">
            {upcomingEvents.length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500">Outstanding Balance</p>
          <p className="text-3xl font-bold text-[#1A1A1A] mt-1">
            ${totalOwed.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500">Stage</p>
          <p className="text-lg font-semibold text-[#D4AF37] mt-1 capitalize">
            {couple
              ? String(couple.lifecycle_stage).replace(/_/g, " ")
              : "—"}
          </p>
        </div>
      </div>

      {/* Upcoming events */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
          Your Events
        </h3>
        {!upcomingEvents.length ? (
          <p className="text-gray-400">No upcoming events yet.</p>
        ) : (
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-[#1A1A1A]">
                    {String(event.title)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(String(event.event_date)).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )}
                  </p>
                </div>
                <span className="text-sm text-gray-500 capitalize">
                  {String(event.event_type).replace(/_/g, " ")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invoices */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
          Invoices & Payments
        </h3>
        {!invoices?.length ? (
          <p className="text-gray-400">No invoices yet.</p>
        ) : (
          <div className="space-y-3">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-[#1A1A1A]">
                    Invoice #{String(inv.invoice_number)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {String(inv.description || "Service invoice")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[#1A1A1A]">
                    ${Number(inv.total_amount || 0).toLocaleString()}
                  </p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      inv.status === "paid"
                        ? "bg-green-100 text-green-700"
                        : inv.status === "overdue"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {String(inv.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Payments are processed securely via Square. Payment links will
            appear here when invoices are ready.
          </p>
        </div>
      </div>
    </div>
  );
}
