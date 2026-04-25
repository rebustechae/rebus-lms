'use client'

import { signOut } from "@/app/(auth)/actions"
import SidebarNav from "./_components/SidebarNav"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const isLessonPage = pathname.includes("/lessons/") || pathname.includes("/final-quiz");

  if (isLessonPage) {
    return <div className="min-h-screen bg-white">{children}</div>;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <aside 
        className={`relative border-r border-slate-200 bg-white flex flex-col sticky top-0 h-screen transition-all duration-300 ease-in-out z-40 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Toggle & Logo Header */}
        <div className={`flex flex-col items-center border-b border-slate-50 transition-all duration-300 ${
          isCollapsed ? "h-24 py-4" : "h-24 py-6"
        }`}>
          <div className={`flex items-center w-full px-6 ${isCollapsed ? "justify-center px-0" : "justify-between"}`}>
            <Link href='/dashboard'>
              <Image 
                src={isCollapsed ? "/favicon.ico" : "/header.svg"} 
                alt="Logo" 
                width={isCollapsed ? 40 : 120} 
                height={40} 
                className="object-contain transition-all duration-300" 
              />
            </Link>

            {!isCollapsed && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-[#00ADEF] transition-all"
              >
                <PanelLeftClose size={20} />
              </button>
            )}
          </div>

          {isCollapsed && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="mt-2 p-1.5 rounded-lg text-slate-300 hover:text-[#00ADEF] hover:bg-slate-50 transition-all"
            >
              <PanelLeftOpen size={16} />
            </button>
          )}
        </div>
        
        {/* Pass the state to the Nav */}
        <div className="flex-1 py-6 overflow-y-auto overflow-x-hidden">
          <SidebarNav isCollapsed={isCollapsed} />
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-slate-50">
          <form action={signOut}>
            <button className={`flex items-center gap-3 text-sm font-bold text-slate-400 hover:text-red-500 transition-all group ${
              isCollapsed ? "justify-center w-full py-4" : "px-4 py-3 w-full hover:bg-red-50 rounded-2xl"
            }`}>
              <LogOut size={20} />
              {!isCollapsed && <span className="whitespace-nowrap">Sign Out</span>}
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  )
}