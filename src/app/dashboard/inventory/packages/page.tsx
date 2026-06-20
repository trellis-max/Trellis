import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function BarPackagesPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: packages } = await supabase
    .from("bar_packages")
    .select("*")
    .order("name", { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#D4AF37]">Bar Packages</h1>
          <p className="text-sm text-gray-400 mt-1">
            Pre-configured drink menus for events. Assigned during planning
            intake.
          </p>
        </div>
        <button className="px-4 py-2 bg-[#D4AF37] text-black rounded-lg font-medium hover:bg-[#C4A030] text-sm">
          + New Package
        </button>
      </div>

      {!packages?.length ? (
        <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-8 text-center">
          <p className="text-4xl mb-3">🍸</p>
          <p className="text-gray-400">
            No bar packages yet. Create your first package to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white">
                  {String(pkg.name)}
                </h3>
                <span className="text-[#D4AF37] font-bold">
                  ${Number(pkg.price_per_person || 0).toFixed(0)}/person
                </span>
              </div>
              <p className="text-sm text-gray-400 mb-3">
                {String(pkg.description || "No description")}
              </p>
              <div className="flex flex-wrap gap-1">
                {(pkg.included_items as string[] || []).map(
                  (item: string, i: number) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-1 bg-[#1E1E1E] text-gray-300 rounded"
                    >
                      {item}
                    </span>
                  ),
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-[#3A3A3A] flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Min {Number(pkg.min_guests || 0)} guests •{" "}
                  {String(pkg.drink_types || "mixed")}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    pkg.is_active
                      ? "bg-green-900 text-green-200"
                      : "bg-gray-700 text-gray-400"
                  }`}
                >
                  {pkg.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
