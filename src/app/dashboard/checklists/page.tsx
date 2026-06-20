import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ChecklistsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: checklists } = await supabase
    .from("checklists")
    .select("*, checklist_items(id, title, is_completed)")
    .order("created_at", { ascending: false });

  const templates = (checklists || []).filter((c) => c.is_template);
  const eventChecklists = (checklists || []).filter((c) => !c.is_template);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#D4AF37]">Checklists</h1>
          <p className="text-sm text-gray-400 mt-1">
            Day-of checklists with live check-off. Create templates for
            reuse across events.
          </p>
        </div>
        <button className="px-4 py-2 bg-[#D4AF37] text-black rounded-lg font-medium hover:bg-[#C4A030] text-sm">
          + New Checklist
        </button>
      </div>

      {/* Templates */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">
          📋 Templates
        </h2>
        {!templates.length ? (
          <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6 text-center">
            <p className="text-gray-400 text-sm">
              No templates yet. Create a checklist template to reuse across
              events.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((cl) => {
              const items = (cl.checklist_items as Array<{ id: string; title: string; is_completed: boolean }>) || [];
              return (
                <div
                  key={cl.id}
                  className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-4"
                >
                  <h3 className="text-white font-semibold">
                    {String(cl.title)}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {items.length} items
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Event checklists */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">
          ✅ Event Checklists
        </h2>
        {!eventChecklists.length ? (
          <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6 text-center">
            <p className="text-gray-400 text-sm">
              No event checklists yet. Checklists are created from templates
              or built for individual events.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {eventChecklists.map((cl) => {
              const items = (cl.checklist_items as Array<{ id: string; title: string; is_completed: boolean }>) || [];
              const completed = items.filter((i) => i.is_completed).length;
              const progress = items.length
                ? Math.round((completed / items.length) * 100)
                : 0;
              return (
                <div
                  key={cl.id}
                  className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-semibold">
                      {String(cl.title)}
                    </h3>
                    <span className="text-sm text-gray-400">
                      {completed}/{items.length}
                    </span>
                  </div>
                  <div className="w-full bg-[#1E1E1E] rounded-full h-2">
                    <div
                      className="bg-[#D4AF37] h-2 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
