import {
  getDashboardStats,
  getTeaTypeBreakdown,
  getDailyTrend,
  getDeptBreakdown,
  getTopDrinkers,
} from '@/lib/actions/reports'
import { DashboardClient } from './DashboardClient'
import { db } from '@/lib/db'
import { employees, teaTypes } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const [stats, teaTypeBreakdown, dailyTrend, deptBreakdown, topDrinkers, activeEmployees, availableTeaTypes] = await Promise.all([
    getDashboardStats(),
    getTeaTypeBreakdown(),
    getDailyTrend(7),
    getDeptBreakdown(),
    getTopDrinkers(5),
    db.select({ id: employees.id, name: employees.name, department: employees.department }).from(employees).where(eq(employees.status, 'active')).orderBy(employees.serial_no),
    db.select({ id: teaTypes.id, name: teaTypes.name, price: teaTypes.price }).from(teaTypes).where(eq(teaTypes.is_active, true)).orderBy(teaTypes.sort_order),
  ])

  return (
    <DashboardClient
      stats={stats}
      teaTypes={teaTypeBreakdown}
      dailyTrend={dailyTrend}
      deptBreakdown={deptBreakdown}
      topDrinkers={topDrinkers}
      employees={activeEmployees}
      availableTeaTypes={availableTeaTypes}
    />
  )
}

