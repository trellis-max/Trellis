"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavSidebarProps {
  userName?: string;
  userEmail?: string;
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/dashboard/couples", label: "Couples / CRM", icon: "💍" },
  { href: "/dashboard/events", label: "Events", icon: "📅" },
  { href: "/dashboard/tasks", label: "Tasks", icon: "✅" },
  { href: "/dashboard/checklists", label: "Checklists", icon: "📋" },
  { href: "/dashboard/inventory", label: "Inventory", icon: "📦" },
  { href: "/dashboard/vendors", label: "Vendors", icon: "🤝" },
  { href: "/dashboard/finances", label: "Finances", icon: "💰" },
  { href: "/dashboard/finances/invoicing", label: "Invoicing", icon: "🧾", indent: true },
  { href: "/dashboard/finances/tax", label: "Sales Tax", icon: "🏛️", indent: true },
  { href: "/dashboard/staff", label: "Staff", icon: "👥" },
  { href: "/dashboard/staff/payroll", label: "Payroll Export", icon: "💵", indent: true },
  { href: "/dashboard/receipts", label: "Receipts", icon: "🧾" },
  { href: "/dashboard/voice", label: "Voice Memos", icon: "🎤" },
  { href: "/dashboard/ask", label: "Ask Trellis", icon: "🤖" },
  { href: "/dashboard/tools/migration", label: "HB Migration", icon: "📥" },
  { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
];

export function NavSidebar({ userName, userEmail }: NavSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#1A1A1A] border-r border-[#2A2A2A] flex flex-col min-h-screen">
      {/* Brand */}
      <div className="p-5 border-b border-[#2A2A2A]">
        <h1 className="text-xl font-bold text-[#D4AF37]">Willow Acres</h1>
        <p className="text-xs text-gray-500 mt-0.5">Event Management</p>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const indent = "indent" in item && item.indent;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
                indent ? "pl-10" : ""
              } ${
                isActive
                  ? "bg-[#2A2A2A] text-[#D4AF37] border-r-2 border-[#D4AF37]"
                  : "text-gray-400 hover:text-white hover:bg-[#222]"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-[#2A2A2A]">
        <p className="text-sm text-white truncate">{userName || "User"}</p>
        <p className="text-xs text-gray-500 truncate">{userEmail || ""}</p>
      </div>
    </aside>
  );
}
