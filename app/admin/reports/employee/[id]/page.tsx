import { db } from '@/lib/db'
import { employees, teaEntries, teaTypes } from '@/lib/db/schema'
import { eq, and, gte, lte, isNull, desc } from 'drizzle-orm'
import { getDhakaMonth } from '@/lib/utils'
import { EmployeeReportClient } from './EmployeeReportClient'

export const dynamic = 'force-dynamic'

export default async function EmployeeReportPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { year?: string; month?: string }
}) {
  const employeeId = Number(params.id) || 1
  const now = new Date()
  const year = Number(searchParams.year) || now.getFullYear()
  const month = Number(searchParams.month) || now.getMonth() + 1

  const { start, end } = getDhakaMonth(year, month)

  // Fetch all employees for switcher
  const allEmployees = await db.select().from(employees).orderBy(employees.serial_no)
  const allTeaTypes = await db.select().from(teaTypes).orderBy(teaTypes.sort_order)
  const currentEmployee = allEmployees.find((e) => e.id === employeeId) || allEmployees[0]

  if (!currentEmployee) {
    return <div className="p-8">No employees found.</div>
  }

  // Fetch entries for this employee in this month
  const monthEntries = await db
    .select({
      id: teaEntries.id,
      quantity: teaEntries.quantity,
      sugar_level: teaEntries.sugar_level,
      unit_price: teaEntries.unit_price,
      entry_at: teaEntries.entry_at,
      tea_type_name: teaTypes.name,
      note: teaEntries.note,
    })
    .from(teaEntries)
    .leftJoin(teaTypes, eq(teaEntries.tea_type_id, teaTypes.id))
    .where(
      and(
        eq(teaEntries.employee_id, currentEmployee.id),
        gte(teaEntries.entry_at, start),
        lte(teaEntries.entry_at, end),
        isNull(teaEntries.deleted_at)
      )
    )
    .orderBy(desc(teaEntries.entry_at))

  // Fetch the complete monthly roster so a date can show everyone who took tea.
  const rosterEntries = await db
    .select({
      id: teaEntries.id,
      employee_id: employees.id,
      employee_name: employees.name,
      department: employees.department,
      quantity: teaEntries.quantity,
      unit_price: teaEntries.unit_price,
      entry_at: teaEntries.entry_at,
      tea_type_name: teaTypes.name,
      tea_type_id: teaEntries.tea_type_id,
      sugar_level: teaEntries.sugar_level,
      note: teaEntries.note,
    })
    .from(teaEntries)
    .innerJoin(employees, eq(teaEntries.employee_id, employees.id))
    .leftJoin(teaTypes, eq(teaEntries.tea_type_id, teaTypes.id))
    .where(
      and(
        gte(teaEntries.entry_at, start),
        lte(teaEntries.entry_at, end),
        isNull(teaEntries.deleted_at)
      )
    )
    .orderBy(desc(teaEntries.entry_at))

  // Group by day for calendar
  const dailyCounts: Record<number, number> = {}
  monthEntries.forEach((e) => {
    const day = new Date(e.entry_at).getDate()
    dailyCounts[day] = (dailyCounts[day] || 0) + e.quantity
  })

  // Group by tea type
  const teaTypeCounts: Record<string, number> = {}
  monthEntries.forEach((e) => {
    const name = e.tea_type_name || 'Tea'
    teaTypeCounts[name] = (teaTypeCounts[name] || 0) + e.quantity
  })

  const daysInMonth = new Date(year, month, 0).getDate()

  return (
    <EmployeeReportClient
      employee={currentEmployee}
      allEmployees={allEmployees}
      teaTypes={allTeaTypes}
      year={year}
      month={month}
      entries={monthEntries}
      rosterEntries={rosterEntries}
      dailyCounts={dailyCounts}
      teaTypeCounts={teaTypeCounts}
      daysInMonth={daysInMonth}
    />
  )
}

