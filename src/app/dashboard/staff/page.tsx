import { getStaffMembers } from '@/lib/supabase/queries';

export default async function StaffPage() {
  let staff: Array<Record<string, unknown>> = [];
  let dbConnected = false;

  try {
    const result = await getStaffMembers();
    staff = result.data;
    dbConnected = true;
  } catch { /* DB not connected */ }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-trellis-charcoal">Staff</h1>

      {!dbConnected ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-trellis-charcoal/40">Connect Supabase to manage staff</p>
        </div>
      ) : staff.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-lg">👥</p>
          <p className="mt-2 text-trellis-charcoal/50">No staff members yet</p>
          <p className="text-sm text-trellis-charcoal/40">Staff profiles are created when user accounts are set up</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {staff.map((member) => {
            const profile = member.profiles as Record<string, string> | null;
            return (
              <div key={member.id as string} className="rounded-xl bg-white p-5 shadow-sm">
                <p className="font-semibold text-trellis-charcoal">{profile?.full_name ?? 'Staff'}</p>
                <p className="text-sm text-trellis-charcoal/60">{(member.role_title as string) ?? '—'}</p>
                <div className="mt-3 flex gap-2">
                  {Boolean(member.can_bartend) && <span className="rounded bg-purple-100 px-2 py-0.5 text-xs text-purple-700">Bartend</span>}
                  {Boolean(member.can_setup) && <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700">Setup</span>}
                  {Boolean(member.can_coordinate) && <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">Coordinate</span>}
                </div>
                {Number(member.hourly_rate) > 0 && (
                  <p className="mt-2 text-xs text-trellis-charcoal/40">${String(member.hourly_rate)}/hr</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
