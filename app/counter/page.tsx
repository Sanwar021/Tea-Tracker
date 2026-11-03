import { getEmployeesWithTodayCount } from '@/lib/actions/employees'
import { getTodayEntries } from '@/lib/actions/entries'
import { db } from '@/lib/db'
import { teaTypes, settings } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { CounterClient } from './CounterClient'

export const dynamic = 'force-dynamic'

export default async function CounterPage() {
  const [employees, todayEntries, allTeaTypes, officeSettings] = await Promise.all([
    getEmployeesWithTodayCount(),
    getTodayEntries(),
    db.select().from(teaTypes).where(eq(teaTypes.is_active, true)).orderBy(teaTypes.sort_order),
    db.select().from(settings),
  ])

  const settingsMap = Object.fromEntries(officeSettings.map((s) => [s.key, s.value]))
  const officeName = settingsMap['office_name'] || 'FAME IT NETWORKS'

  return (
    <CounterClient
      initialEmployees={employees}
      initialEntries={todayEntries}
      teaTypes={allTeaTypes}
      officeName={officeName}
    />
  )
}

