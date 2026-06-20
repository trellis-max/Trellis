import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function VendorsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: vendors } = await supabase
    .from("vendors")
    .select("*")
    .order("name", { ascending: true });

  const categories = [
    "catering",
    "florals",
    "photography",
    "videography",
    "dj",
    "officiant",
    "baker",
    "rentals",
    "lighting",
    "planner",
    "other",
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#D4AF37]">Vendors</h1>
          <p className="text-sm text-gray-400 mt-1">
            Preferred vendor list. Assign vendors to events during planning.
          </p>
        </div>
        <button className="px-4 py-2 bg-[#D4AF37] text-black rounded-lg font-medium hover:bg-[#C4A030] text-sm">
          + Add Vendor
        </button>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <span className="px-3 py-1 bg-[#D4AF37] text-black rounded-full text-xs font-medium">
          All
        </span>
        {categories.map((cat) => (
          <span
            key={cat}
            className="px-3 py-1 bg-[#2A2A2A] text-gray-300 rounded-full text-xs hover:bg-[#3A3A3A] cursor-pointer capitalize"
          >
            {cat}
          </span>
        ))}
      </div>

      {!vendors?.length ? (
        <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-8 text-center">
          <p className="text-4xl mb-3">🤝</p>
          <p className="text-gray-400">
            No vendors yet. Add your preferred vendors to assign them to
            events.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vendors.map((vendor) => (
            <div
              key={vendor.id}
              className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-5"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-white font-semibold">
                  {String(vendor.name)}
                </h3>
                {vendor.is_preferred && (
                  <span className="text-xs px-2 py-0.5 bg-[#D4AF37] text-black rounded-full font-medium">
                    ★ Preferred
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 capitalize mb-3">
                {String(vendor.category)}
              </p>
              {vendor.contact_name && (
                <p className="text-sm text-gray-300">
                  {String(vendor.contact_name)}
                </p>
              )}
              {vendor.email && (
                <p className="text-sm text-gray-400">{String(vendor.email)}</p>
              )}
              {vendor.phone && (
                <p className="text-sm text-gray-400">{String(vendor.phone)}</p>
              )}
              {vendor.website && (
                <a
                  href={String(vendor.website)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#D4AF37] hover:underline"
                >
                  Website →
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
