"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/dashboard/couples", label: "Couples", icon: "💍" },
  { href: "/dashboard/events", label: "Events", icon: "📅" },
  { href: "/dashboard/inventory", label: "Inventory", icon: "📦" },
  { href: "/dashboard/tasks", label: "Tasks", icon: "✅" },
  { href: "/dashboard/finances", label: "Finances", icon: "💰" },
  { href: "/dashboard/receipts", label: "Receipts", icon: "📸" },
  { href: "/dashboard/voice", label: "Voice Tasks", icon: "🎤" },
  { href: "/dashboard/staff", label: "Staff", icon: "👥" },
  { href: "/dashboard/ask", label: "Ask Trellis", icon: "🧠" },
];

export function NavSidebar({ userName, userEmail }: { userName?: string; userEmail?: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#2A2A2A] rounded-lg border border-[#3A3A3A]"
      >
        <span className="text-white text-xl">{open ? "✕" : "☰"}</span>
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-[#1A1A1A] border-r border-[#2A2A2A] transform transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-[#2A2A2A]">
            <h1 className="text-xl font-bold text-[#D4AF37]">
              Trellis
            </h1>
            <p className="text-xs text-gray-500 mt-1">Willow Acres</p>
          </div>

          {/* Nav items */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive(item.href)
                    ? "bg-[#D4AF37]/10 text-[#D4AF37] font-medium"
                    : "text-gray-400 hover:text-white hover:bg-[#2A2A2A]"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-[#2A2A2A]">
            <p className="text-xs text-gray-500 truncate">
              {userName || userEmail || "Not signed in"}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
