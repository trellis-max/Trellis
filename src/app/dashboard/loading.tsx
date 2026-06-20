export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-8 w-40 bg-[#3A3A3A] rounded" />
        <div className="h-4 w-64 bg-[#2A2A2A] rounded mt-2" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-4 h-24" />
        ))}
      </div>

      <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-5 h-32" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-5 h-40" />
        <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-5 h-40" />
      </div>
    </div>
  );
}
