'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard, Users, Coffee, CalendarDays, FileSpreadsheet,
  Settings, LogOut, SlidersHorizontal, Menu, X, Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/employees', label: 'Employees', icon: Users },
  { href: '/admin/entries', label: 'Tea Entries', icon: Coffee },
  { href: '/admin/reports/monthly', label: 'Monthly Matrix', icon: FileSpreadsheet },
  { href: '/admin/reports/employee/1', label: 'Employee Report', icon: CalendarDays },
  { href: '/admin/tea-types', label: 'Tea Types', icon: SlidersHorizontal },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => setMobileOpen(false), [pathname])

  const handleLogout = async () => {
    if (confirm('Are you sure you want to log out from Admin?')) {
      await fetch('/api/auth/logout', { method: 'POST' })
      toast.success('Logged out successfully')
      router.push('/admin-login')
      router.refresh()
    }
  }

  const sidebar = (
    <aside className="premium-sidebar h-full text-slate-700 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-5 rounded-[28px] select-none">
      <div className="space-y-6">
        <div className="premium-brand flex items-center gap-3 p-3 rounded-2xl">
          <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-700 flex items-center justify-center text-white font-black text-xs shadow-[0_8px_24px_rgba(14,165,233,.3)]">
            FIN
            <span className="absolute -right-1 -top-1 w-3 h-3 rounded-full bg-cyan-300 border-2 border-white" />
          </div>
          <div className="min-w-0 leading-tight">
            <span className="block text-[12px] font-black tracking-wide text-slate-900 dark:text-white truncate">FAME IT NETWORKS</span>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-sky-600 dark:text-sky-300 mt-1"><Sparkles className="w-3 h-3" /> Tea Intelligence</span>
          </div>
        </div>

        <div className="px-2 text-[10px] uppercase tracking-[.24em] text-sky-700/60 dark:text-sky-300/60 font-bold">Control Center</div>

        <nav className="space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href} className={`premium-nav-item ${isActive ? 'active' : ''}`}>
                <span className="nav-icon"><Icon className="w-4 h-4" /></span>
                <span>{item.label}</span>
                {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="pt-5 border-t border-sky-900/10 dark:border-white/10 space-y-3">
        <div className="text-[10px] text-slate-500 dark:text-slate-400 px-2 font-mono truncate">support@famenetworks.net</div>
        <button onClick={handleLogout} className="premium-logout">
          <LogOut className="w-4 h-4" /><span>Log out</span>
        </button>
      </div>
    </aside>
  )

  return (
    <>
      <div className="premium-mobile-bar lg:hidden flex items-center justify-between p-2.5 rounded-2xl">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-700 text-white flex items-center justify-center text-[10px] font-black">FIN</div>
          <div><p className="text-xs font-black text-slate-900 dark:text-white">FAME IT NETWORKS</p><p className="text-[10px] text-sky-600 dark:text-sky-300">Tea Intelligence</p></div>
        </div>
        <button aria-label="Open navigation" onClick={() => setMobileOpen(true)} className="w-11 h-11 rounded-xl premium-icon-button flex items-center justify-center"><Menu className="w-5 h-5" /></button>
      </div>

      <div className="hidden lg:block w-[270px] shrink-0 sticky top-5 h-[calc(100vh-40px)]">{sidebar}</div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden bg-slate-950/40 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setMobileOpen(false) }}>
          <div className="absolute inset-y-2 left-2 w-[min(86vw,300px)] animate-slide-up">
            {sidebar}
            <button aria-label="Close navigation" onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 w-9 h-9 rounded-xl premium-icon-button flex items-center justify-center"><X className="w-4 h-4" /></button>
          </div>
        </div>
      )}
    </>
  )
}
