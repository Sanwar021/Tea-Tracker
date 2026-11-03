import { db } from '@/lib/db'
import { employees, teaEntries } from '@/lib/db/schema'
import { and, gte, lte, isNull, sql } from 'drizzle-orm'
import { getDhakaToday } from '@/lib/utils'
import { EmployeesClient } from './EmployeesClient'

export const dynamic = 'force-dynamic'

export default async function AdminEmployeesPage() {
  const { start, end } = getDhakaToday()

  // Fetch all employees
  const allEmployees = await db
    .select()
    .from(employees)
    .orderBy(employees.serial_no)

  // Fetch today's cups count per employee
  const todayCounts = await db
    .select({
      employee_id: teaEntries.employee_id,
      count: sql<number>`sum(${teaEntries.quantity})::int`,
    })
    .from(teaEntries)
    .where(
      and(
        gte(teaEntries.entry_at, start),
        lte(teaEntries.entry_at, end),
        isNull(teaEntries.deleted_at)
      )
    )
    .groupBy(teaEntries.employee_id)

  const countMap = new Map(todayCounts.map((t) => [t.employee_id, t.count || 0]))

  const employeesWithData = allEmployees.map((e) => ({
    ...e,
    today_cups: countMap.get(e.id) || 0,
  }))

  return <EmployeesClient initialEmployees={employeesWithData} />
}
