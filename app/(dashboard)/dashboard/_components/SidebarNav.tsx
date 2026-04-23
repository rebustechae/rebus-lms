"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SidebarNav() {
  const pathname = usePathname();
  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(path);
  };

  const navItems = [
    { name: "My Learning", href: "/dashboard" },
    { name: "Explore Courses", href: "/dashboard/courses" },
  ];

  return (
    <nav className="flex-1 p-4 space-y-1">
      <div className="px-3 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
        Navigation
      </div>

      {navItems.map((item) => {
        const active = isActive(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`group relative flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all
          ${
            active
              ? "bg-slate-100 text-slate-900"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
          }`}
          >
            {active && (
              <div className="absolute left-0 w-1 h-6 bg-[#662D91] rounded-r-full" />
            )}

            <span className="relative">{item.name}</span>

            {!active && (
              <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-slate-300">
                <ChevronRight size={14} />
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
