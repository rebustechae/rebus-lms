"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  LogOut,
  ShieldCheck,
  ChevronLeft,
  Menu,
} from "lucide-react";
import { signOutAction } from "@/app/(auth)/actions";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Manage Users", href: "/admin/users", icon: Users },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900">
      {/* SIDEBAR */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? "80px" : "288px" }}
        className="bg-slate-950 text-white flex flex-col sticky top-0 h-screen border-r border-slate-800 shadow-2xl z-30 transition-all duration-300 ease-in-out"
      >
        {/* LOGO SECTION & TOGGLE */}
        <div className={`p-6 flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="bg-[#00ADEF] p-1.5 rounded-lg shrink-0">
              <ShieldCheck size={20} className="text-white" strokeWidth={2.5} />
            </div>
            {!isCollapsed && (
              <motion.h1 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xl font-bold tracking-tight whitespace-nowrap"
              >
                REBUS <span className="text-slate-500 font-medium">ADMIN</span>
              </motion.h1>
            )}
          </div>
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors ${isCollapsed ? "absolute -right-3 top-20 bg-slate-950 border border-slate-800" : ""}`}
          >
            {isCollapsed ? <Menu size={16} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-4 space-y-1.5 mt-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? "bg-[#00ADEF]/10 text-[#00ADEF] border border-[#00ADEF]/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-900/50"
                } ${isCollapsed ? "justify-center" : ""}`}
              >
                <item.icon 
                  size={18} 
                  className={isActive ? "text-[#00ADEF]" : "text-slate-500 group-hover:text-slate-300"} 
                />
                
                {!isCollapsed && (
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-xs font-bold uppercase tracking-widest whitespace-nowrap"
                  >
                    {item.name}
                  </motion.span>
                )}

                {/* Tooltip for collapsed mode */}
                {isCollapsed && (
                    <div className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                        {item.name}
                    </div>
                )}

                {isActive && !isCollapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00ADEF] shadow-[0_0_10px_#00ADEF]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* FOOTER ACTIONS */}
        <div className={`p-4 mt-auto space-y-3 border-t border-slate-900`}>
          <Link
            href="/dashboard"
            title="Student View"
            className={`flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 py-3.5 rounded-xl hover:bg-white/10 transition-all ${isCollapsed ? "justify-center" : "px-4"}`}
          >
            <GraduationCap size={16} />
            {!isCollapsed && <span>Student View</span>}
          </Link>

          <form
            action={async () => {
              await signOutAction();
            }}
          >
            <button
              type="submit"
              className={`w-full flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 py-3 rounded-xl transition-all ${isCollapsed ? "justify-center" : "px-4"}`}
            >
              <LogOut size={16} />
              {!isCollapsed && <span>Log Out</span>}
            </button>
          </form>
        </div>
      </motion.aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 border-b border-slate-200 bg-white/50 backdrop-blur-md sticky top-0 z-20 flex items-center px-8 md:px-12">
          <p className="text-[10px] font-semibold uppercase text-slate-500 tracking-widest">
            {pathname.replace("/admin", "Admin").replace("/", " / ")}
          </p>
        </header>

        <div className="p-8 md:p-12">
          <div className="max-w-6xl mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
}