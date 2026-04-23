"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  ChevronRight,
  LogOut
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
    <div className="flex min-h-screen bg-zinc-50 text-black">
      {/* SIDEBAR */}
      <aside className="w-72 bg-black text-white flex flex-col sticky top-0 h-screen">
        <div className="p-8 border-b border-white/10">
          <h1 className="text-2xl font-black tracking-tighter italic">
            REBUS <span className="text-zinc-500">ADMIN</span>
          </h1> 
        </div>

        <nav className="flex-1 p-6 space-y-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 border-2 transition-all group ${
                  isActive
                    ? "bg-white text-black border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)]"
                    : "bg-transparent text-zinc-400 border-transparent hover:border-white/20 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} />
                  <span className="text-xs font-black uppercase tracking-widest">
                    {item.name}
                  </span>
                </div>
                {isActive && <ChevronRight size={14} />}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 space-y-4">
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 text-[10px] font-black uppercase border-2 border-zinc-700 py-3 hover:bg-white hover:text-black hover:border-white transition-all tracking-tighter"
          >
            <GraduationCap size={14} />
            Student View
          </Link>
          <div className="h-1 w-full bg-zinc-900 overflow-hidden">
            <div className="h-full bg-zinc-700 w-1/3" />
          </div>
        </div>

        <form
          action={async () => {
            await signOutAction();
          }}
        >
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 text-[10px] font-black uppercase text-red-500 border-2 border-transparent hover:border-red-500 py-3 transition-all tracking-tighter"
          >
            <LogOut size={14} />
            Terminate Session
          </button>
        </form>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
