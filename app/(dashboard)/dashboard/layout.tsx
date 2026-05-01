'use client'

import { signOut } from "@/app/(auth)/actions"
import SidebarNav from "./_components/SidebarNav"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { LogOut, PanelLeftClose, PanelLeftOpen, Menu, X, User } from "lucide-react"
import { createClient } from "@/utils/supabase/client"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState<{ name: string; email: string; avatar?: string } | null>(null);
  
  const supabase = createClient();

  // Fetch user data for the avatar section
  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserData({
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || "User",
          email: user.email || "",
          avatar: user.user_metadata?.avatar_url
        });
      }
    }
    getUser();
  }, []);

  // Auto-close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const isLessonPage = pathname.includes("/lessons/") || pathname.includes("/final-quiz");

  if (isLessonPage) {
    return <div className="min-h-screen bg-white">{children}</div>;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans overflow-x-hidden">
      
      {/* --- MOBILE HEADER --- */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-50">
        <Link href='/dashboard'>
          <Image src="/header.svg" alt="Logo" width={100} height={32} className="object-contain" />
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
          fixed lg:sticky top-0 h-screen bg-white border-slate-200 flex flex-col transition-all duration-300 ease-in-out z-[70]
          right-0 lg:left-0 lg:border-r
          ${isMobileMenuOpen ? "translate-x-0 w-72 border-l shadow-2xl" : "translate-x-full lg:translate-x-0"}
          ${isCollapsed ? "lg:w-20" : "lg:w-64"}
        `}
      >
        {/* Header Section */}
        <div className={`
          flex flex-col items-center border-b border-slate-50 transition-all duration-300
          ${isCollapsed ? "py-8" : "py-6"}
        `}>
          <div className={`flex items-center w-full px-6 ${isCollapsed ? "flex-col gap-6" : "justify-between"}`}>
            
            <Link href='/dashboard' className="order-1">
              <Image 
                src={isCollapsed ? "/favicon.ico" : "/header.svg"} 
                alt="Logo" 
                width={isCollapsed ? 36 : 120} 
                height={40} 
                className="object-contain transition-transform" 
              />
            </Link>

            <div className="order-2">
              {!isCollapsed ? (
                <button
                  onClick={() => setIsCollapsed(true)}
                  className="hidden lg:block p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-[#00ADEF] transition-all"
                >
                  <PanelLeftClose size={20} />
                </button>
              ) : (
                <button
                  onClick={() => setIsCollapsed(false)}
                  className="hidden lg:block p-2 rounded-xl text-slate-300 hover:text-[#00ADEF] hover:bg-slate-50 transition-all"
                >
                  <PanelLeftOpen size={20} />
                </button>
              )}
            </div>

            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-2 text-slate-400 hover:bg-slate-50 rounded-xl"
            >
              <X size={24} />
            </button>
          </div>
        </div>
        
        {/* Navigation Links */}
        <div className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
          
          {/* USER AVATAR SECTION */}
          <div className={`px-4 mb-4 transition-all duration-300 ${isCollapsed && !isMobileMenuOpen ? "opacity-100" : "opacity-100"}`}>
            <Link 
              href="/dashboard/profile"
              className={`flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 transition-all group ${
                isCollapsed && !isMobileMenuOpen ? "justify-center" : ""
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
                  <div className="w-10 h-10 rounded-full bg-[#00ADEF]/10 border-2 border-white shadow-sm flex items-center justify-center text-[#00ADEF]">
                    <User size={20} />
                  </div>
                )}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
              </div>

              {(isMobileMenuOpen || !isCollapsed) && (
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-slate-900 truncate">
                    {userData?.name}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400 truncate uppercase tracking-wider">
                    View Profile
                  </span>
                </div>
              )}
            </Link>
          </div>

          <div className="h-px bg-slate-50 mx-6 mb-4" />

          <SidebarNav isCollapsed={isCollapsed && !isMobileMenuOpen} />
        </div>

        {/* Logout Section */}
        <div className="p-4 border-t border-slate-50">
          <form action={signOut}>
            <button className={`flex items-center gap-3 text-sm font-bold text-slate-400 hover:text-red-500 transition-all group ${
              isCollapsed && !isMobileMenuOpen ? "justify-center w-full py-4" : "px-4 py-3 w-full hover:bg-red-50 rounded-2xl"
            }`}>
              <LogOut size={20} />
              {(isMobileMenuOpen || !isCollapsed) && <span className="whitespace-nowrap">Sign Out</span>}
            </button>
          </form>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 min-w-0 pt-16 lg:pt-0">
        <div className="p-6 lg:p-10 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}