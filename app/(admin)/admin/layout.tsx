"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  LogOut,
  ShieldCheck,
  Zap
} from "lucide-react";
import { signOutAction } from "@/app/(auth)/actions";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  const navItems = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Manage Users", href: "/admin/users", icon: Users },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900">
      {/* SIDEBAR */}
      <aside className="w-72 bg-slate-950 text-white flex flex-col sticky top-0 h-screen border-r border-slate-800 shadow-2xl">
        
        {/* LOGO SECTION */}
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="bg-[#00ADEF] p-1.5 rounded-lg">
                <ShieldCheck size={20} className="text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              REBUS <span className="text-slate-500 font-medium">ADMIN</span>
            </h1> 
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-4 space-y-1.5">
          <div className="px-4 mb-4">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Administrative Control</span>
          </div>
          
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "bg-[#00ADEF]/10 text-[#00ADEF] border border-[#00ADEF]/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-900/50"
                }`}
              >
                <item.icon size={18} className={isActive ? "text-[#00ADEF]" : "text-slate-500 group-hover:text-slate-300"} />
                <span className="text-xs font-bold uppercase tracking-widest">
                  {item.name}
                </span>
                {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00ADEF] shadow-[0_0_10px_#00ADEF]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* FOOTER ACTIONS */}
        <div className="p-6 mt-auto space-y-3">

          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 py-3.5 rounded-xl hover:bg-white/10 transition-all"
          >
            <GraduationCap size={16} />
            Student View
          </Link>

          <form
            action={async () => {
              await signOutAction();
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-wider text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 py-3 rounded-xl transition-all"
            >
              <LogOut size={16} />
              Log Out
            </button>
          </form>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto">
        {/* TOP BAR / BREADCRUMB SPACE */}
        <header className="h-16 border-b border-slate-200 bg-white/50 backdrop-blur-md sticky top-0 z-20 flex items-center px-12">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">System Root / {pathname.replace('/admin', 'Admin').replace('/', ' / ')}</p>
        </header>

        <div className="p-12">
            <div className="max-w-6xl mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
}