"use client";

import { signOut } from "@/app/(auth)/actions";
import SidebarNav from "./_components/SidebarNav";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
  User,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState<{
    name: string;
    email: string;
    avatar?: string;
  } | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserData({
          name:
            user.user_metadata?.full_name ||
            user.email?.split("@")[0] ||
            "User",
          email: user.email || "",
          avatar: user.user_metadata?.avatar_url,
        });
      }
    }
    getUser();
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const isLessonPage =
    pathname.includes("/lessons/") || pathname.includes("/final-quiz");

  if (isLessonPage) {
    return <div className="min-h-screen bg-white">{children}</div>;
  }

  return (
    // FIX 1: Ensure the outer container is exactly the viewport height and prevents weird horizontal shifts
    <div className="flex h-screen w-screen bg-slate-50 font-sans overflow-hidden">
      {/* --- MOBILE HEADER --- */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-50">
        <Link href="/dashboard">
          <Image
            src="/header.png"
            alt="Logo"
            width={100}
            height={32}
            className="object-contain"
          />
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* --- MOBILE OVERLAY --- */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] animate-in fade-in duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* --- SIDEBAR --- */}
      <aside
        className={`
    fixed lg:relative top-0 h-screen bg-white border-slate-200 flex flex-col transition-all duration-300 ease-in-out z-[70]
    right-0 lg:left-0 lg:border-r shrink-0
    /* ADDED: overflow-x-hidden here */
    overflow-x-hidden 
    ${isMobileMenuOpen ? "translate-x-0 w-72 border-l shadow-2xl" : "translate-x-full lg:translate-x-0"}
    ${isCollapsed ? "lg:w-20" : "lg:w-64"}
  `}
      >
        {/* Header Section */}
        <div
          className={`
    flex flex-col items-center border-b border-slate-50 transition-all duration-300
    ${isCollapsed ? "py-8" : "py-6"}
  `}
        >
          {/* ADDED: w-full and overflow-hidden on the inner container */}
          <div
            className={`flex items-center w-full px-6 overflow-hidden ${isCollapsed ? "flex-col gap-6 px-2" : "justify-between"}`}
          >
            <Link href="/dashboard" className="flex-shrink-0">
              <Image
                src={isCollapsed ? "/favicon.ico" : "/header.png"}
                alt="Logo"
                width={isCollapsed ? 32 : 96}
                height={40}
                className="object-contain"
              />
            </Link>

            {/* Button container */}
            <div className={isCollapsed ? "w-full flex justify-center" : ""}>
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:block p-2 rounded-xl text-slate-400 hover:bg-slate-50 transition-all"
              >
                {isCollapsed ? (
                  <PanelLeftOpen size={20} />
                ) : (
                  <PanelLeftClose size={20} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        {/* ADDED: overflow-x-hidden here as well */}
        <div className="flex-1 py-4 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <div className="px-4 mb-4">
            <Link
              href="/dashboard/profile"
              className={`flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 transition-all ${
                isCollapsed ? "justify-center px-0" : ""
              }`}
            >
              <div className="relative flex-shrink-0">
                {userData?.avatar ? (
                  <Image
                    src={userData.avatar}
                    alt="Avatar"
                    width={40}
                    height={40}
                    className="rounded-full border-2 border-white shadow-sm object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#00ADEF]/10 border-2 border-white flex items-center justify-center text-[#00ADEF]">
                    <User size={20} />
                  </div>
                )}
              </div>

              {/* Use hidden class instead of conditional rendering for smoother transition */}
              <div
                className={`flex flex-col min-w-0 transition-opacity duration-200 ${isCollapsed ? "w-0 h-0 opacity-0 overflow-hidden" : "opacity-100"}`}
              >
                <span className="text-sm font-bold text-slate-900 truncate">
                  {userData?.name}
                </span>
                <span className="text-[10px] font-medium text-slate-400 truncate uppercase tracking-wider">
                  View Profile
                </span>
              </div>
            </Link>
          </div>

          <div className="h-px bg-slate-50 mx-6 mb-4" />
          <SidebarNav isCollapsed={isCollapsed} />
        </div>

        {/* Logout Section */}
        <div className="p-4 border-t border-slate-50 bg-white overflow-hidden">
          <form action={signOut}>
            <button
              className={`flex items-center gap-3 text-sm font-bold text-slate-400 hover:text-red-500 transition-all ${
                isCollapsed
                  ? "justify-center p-0"
                  : "px-4 py-3 w-full hover:bg-red-50 rounded-2xl"
              }`}
            >
              <LogOut size={20} className="shrink-0" />
              <span
                className={`transition-opacity duration-200 ${isCollapsed ? "w-0 h-0 opacity-0 overflow-hidden" : "opacity-100"}`}
              >
                Sign Out
              </span>
            </button>
          </form>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      {/* FIX 4: h-full and overflow-y-auto makes the content scrollable while the sidebar stays fixed */}
      <main className="flex-1 h-full overflow-y-auto pt-16 lg:pt-0">
        <div className="p-6 lg:p-10 max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
