'use client'

import { signOut } from "@/app/(auth)/actions"
import SidebarNav from "./_components/SidebarNav"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLessonPage = pathname.includes("/lessons/") || pathname.includes("/final-quiz");

  if (isLessonPage) {
    return <div className="min-h-screen bg-white">{children}</div>;
  }
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col sticky top-0 h-screen">
        <div className="p-8 pb-4">
          <Link href='/dashboard' className='group'>
            <Image
              src="/header.svg"
              alt="Rebus Logo"
              width={192}
              height={128}
              loading="eager"
            />
          </Link>
        </div>
        
        {/* CLIENT COMPONENT FOR NAVIGATION */}
        <SidebarNav />

        {/* Logout Section */}
        <div className="p-6 mt-auto">
          <form action={signOut}>
            <button className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-slate-500 hover:text-rebus-blue rounded-lg transition-all group">
              <span>Logout</span>
              <span className="opacity-0 group-hover:opacity-100 group-hoveer:translate-x-1 transition-all">→</span>
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}