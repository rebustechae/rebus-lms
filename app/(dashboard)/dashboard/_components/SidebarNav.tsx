"use client";

import { ChevronRight, LayoutDashboard, Compass } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Add the interface to handle the prop
interface SidebarNavProps {
  isCollapsed: boolean;
}

export default function SidebarNav({ isCollapsed }: SidebarNavProps) {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    if (path === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(path);
  };

  const navItems = [
    { name: "My Learning", href: "/dashboard", icon: LayoutDashboard },
    { name: "Explore Courses", href: "/dashboard/courses", icon: Compass },
  ];

  return (
    <nav className="flex-1 p-4 space-y-2">
      {navItems.map((item) => {
        const active = isActive(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`group relative flex items-center py-2.5 rounded-xl transition-all duration-200
              ${isCollapsed ? "justify-center px-0" : "px-4"}
              ${active ? "bg-slate-100 text-slate-900 shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}
            `}
          >
            {active && (
              <div className="absolute left-0 w-1 h-6 bg-[#662D91] rounded-r-full" />
            )}

            <Icon 
              size={20} 
              className={`flex-shrink-0 ${active ? "text-[#00ADEF]" : "text-slate-400"}`} 
            />

            {!isCollapsed && (
              <span className="ml-3 font-semibold text-sm whitespace-nowrap animate-in fade-in slide-in-from-left-2">
                {item.name}
              </span>
            )}

            {isCollapsed && (
              <div className="absolute left-14 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-md opacity-0 group-hover:opacity-100 transition-all z-50 whitespace-nowrap shadow-xl">
                {item.name}
              </div>
            )}
          </Link>
        );
      })}
    </nav>
  );
}