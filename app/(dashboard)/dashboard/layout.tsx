import { signOut } from "@/app/(auth)/actions"
import SidebarNav from "./_components/SidebarNav"
import Image from "next/image"
import Link from "next/link"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white text-black font-sans">
      <aside className="w-64 border-r-2 border-black flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b-2 border-black">
          <Link href='/dashboard' className='group'>
            <Image
              src="/header.svg"
              alt="Rebus Logo"
              width={192}
              height={128}
            />
          </Link>
        </div>
        
        {/* CLIENT COMPONENT FOR NAVIGATION */}
        <SidebarNav />

        {/* Logout Section */}
        <div className="p-4 border-t-2 border-black bg-zinc-50">
          <form action={signOut}>
            <button className="w-full text-left px-3 py-3 text-xs font-black tracking-widest hover:bg-rebus-blue hover:text-white hover:border-rebus-blue transition-all border-2 border-black uppercase">
              Logout →
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto bg-[#fafafa]">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}