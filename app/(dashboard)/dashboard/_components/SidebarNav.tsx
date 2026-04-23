"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function SidebarNav() {
  const pathname = usePathname()

  // Helper to check if a link is active
  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(path)
  }

  const navItems = [
    { name: 'My Learning', href: '/dashboard' },
    { name: 'Explore Courses', href: '/dashboard/courses' },
  ]

  return (
    <nav className="flex-1 p-4 space-y-2">
      <div className="px-3 py-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.2em]">
        Navigation
      </div>
      
      {navItems.map((item) => {
        const active = isActive(item.href)
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`block px-3 py-3 text-sm font-bold uppercase tracking-tight transition-all border-2 
              ${active 
                ? "bg-rebus-purple text-white border-rebus-purple shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]" 
                : "hover:bg-zinc-100 border-transparent text-zinc-600"
              }`}
          >
            {item.name}
          </Link>
        )
      })}
    </nav>
  )
}