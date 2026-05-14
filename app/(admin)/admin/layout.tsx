"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  LogOut,
  ShieldCheck,
  ChevronLeft,
  Menu,
  X,
} from "lucide-react";
import { signOutAction } from "@/app/(auth)/actions";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const navItems = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Manage Users", href: "/admin/users", icon: Users },
  ];

  const SidebarContent = () => (
    <>
      {/* LOGO SECTION & TOGGLE (Desktop Only Toggle) */}
      <div className={`p-6 flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="bg-[#00ADEF] p-1.5 rounded-lg shrink-0">
            <ShieldCheck size={20} className="text-white" strokeWidth={2.5} />
          </div>
          {(!isCollapsed || isMobileOpen) && (
            <h1 className="text-xl font-bold tracking-tight whitespace-nowrap text-white">
              REBUS <span className="text-slate-500 font-medium">ADMIN</span>
            </h1>
          )}
        </div>
        
        {/* Desktop Collapse Toggle */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`hidden md:flex p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors ${isCollapsed ? "absolute -right-3 top-20 bg-slate-950 border border-slate-800 shadow-xl" : ""}`}
        >
          {isCollapsed ? <Menu size={16} /> : <ChevronLeft size={18} />}
        </button>

        {/* Mobile Close Button */}
        <button 
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden p-2 text-slate-400 hover:text-white"
        >
          <X size={24} />
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
              className={`group relative flex items-center py-3 rounded-xl transition-all duration-200
                ${isCollapsed && !isMobileOpen ? "justify-center px-0" : "px-3.5"}
                ${isActive
                  ? "bg-[#00ADEF]/10 text-[#00ADEF] border border-[#00ADEF]/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-900/50"
                }`}
            >
              <item.icon 
                size={18} 
                className={isActive ? "text-[#00ADEF]" : "text-slate-500 group-hover:text-slate-300"} 
              />
              
              {(!isCollapsed || isMobileOpen) && (
                <span className="ml-3 text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                  {item.name}
                </span>
              )}

              {isCollapsed && !isMobileOpen && (
                <div className="absolute left-16 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-md opacity-0 group-hover:opacity-100 transition-all z-50 whitespace-nowrap shadow-xl pointer-events-none border border-slate-800">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* FOOTER ACTIONS */}
      <div className={`p-4 mt-auto space-y-2 border-t border-slate-900 ${isCollapsed && !isMobileOpen ? "flex flex-col items-center" : ""}`}>
        <Link
          href="/dashboard"
          className={`group relative flex items-center py-3.5 rounded-xl transition-all duration-200 w-full text-[11px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 hover:bg-white/10
            ${isCollapsed && !isMobileOpen ? "justify-center px-0" : "px-4"}
          `}
        >
          <GraduationCap size={16} className="shrink-0" />
          {(!isCollapsed || isMobileOpen) && <span className="ml-2 text-white">Student View</span>}
        </Link>

        <form action={signOutAction} className="w-full">
          <button
            type="submit"
            className={`w-full group relative flex items-center py-3 rounded-xl transition-all duration-200 text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 text-[11px] font-bold uppercase tracking-wider
              ${isCollapsed && !isMobileOpen ? "justify-center px-0" : "px-4"}
            `}
          >
            <LogOut size={16} className="shrink-0" />
            {(!isCollapsed || isMobileOpen) && <span className="ml-2">Log Out</span>}
          </button>
        </form>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900">
      
      {/* MOBILE HAMBURGER (Visible only on small screens) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-40">
        <div className="flex items-center gap-2">
          <ShieldCheck size={20} className="text-[#00ADEF]" />
          <span className="font-bold text-sm tracking-tight">REBUS ADMIN</span>
        </div>
        <button onClick={() => setIsMobileOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
          <Menu size={24} />
        </button>
      </div>

      {/* MOBILE SIDEBAR OVERLAY */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[50] md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-slate-950 z-[51] md:hidden flex flex-col shadow-2xl"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* DESKTOP SIDEBAR */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? "80px" : "288px" }}
        className="hidden md:flex flex-col sticky top-0 h-screen bg-slate-950 text-white border-r border-slate-800 shadow-2xl z-30 overflow-hidden"
      >
        <SidebarContent />
      </motion.aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto">
        {/* Desktop Header Space / Mobile Spacer */}
        <header className="h-16 border-b border-slate-200 bg-white/50 backdrop-blur-md sticky top-0 z-20 flex items-center px-8 md:px-12">
          <p className="hidden md:block text-[10px] font-semibold uppercase text-slate-500 tracking-widest">
            {pathname.replace("/admin", "Admin").replace("/", " / ")}
          </p>
        </header>

        <div className="p-8 md:p-12 pt-24 md:pt-12">
          <div className="max-w-6xl mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
}