import { ReactNode } from 'react'
import { AdminSidebar } from '@/components/admin/Sidebar'

export const dynamic = 'force-dynamic'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="premium-admin min-h-screen flex flex-col lg:flex-row p-2.5 sm:p-4 lg:p-5 gap-3 sm:gap-4 antialiased">
      <AdminSidebar />

      <main className="premium-main flex-1 min-w-0 rounded-[26px] sm:rounded-[32px] p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
