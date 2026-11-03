import { db } from '@/lib/db'
import { teaEntries, employees, teaTypes } from '@/lib/db/schema'
import { eq, isNull, desc } from 'drizzle-orm'
import { EntriesClient } from './EntriesClient'

export const dynamic = 'force-dynamic'

export default async function AdminEntriesPage() {
  const [entries, allEmployees, allTeaTypes] = await Promise.all([
    db
      .select({
        id: teaEntries.id,
        employee_id: teaEntries.employee_id,
        tea_type_id: teaEntries.tea_type_id,
        quantity: teaEntries.quantity,
        sugar_level: teaEntries.sugar_level,
        unit_price: teaEntries.unit_price,
        note: teaEntries.note,
        entry_at: teaEntries.entry_at,
        created_by: teaEntries.created_by,
        employee_name: employees.name,
        employee_department: employees.department,
        tea_type_name: teaTypes.name,
      })
      .from(teaEntries)
      .leftJoin(employees, eq(teaEntries.employee_id, employees.id))
      .leftJoin(teaTypes, eq(teaEntries.tea_type_id, teaTypes.id))
      .where(isNull(teaEntries.deleted_at))
      .orderBy(desc(teaEntries.entry_at))
      .limit(500),
    db.select().from(employees).orderBy(employees.serial_no),
    db.select().from(teaTypes).orderBy(teaTypes.sort_order),
  ])

  return (
    <EntriesClient
      initialEntries={entries}
      employees={allEmployees}
      teaTypes={allTeaTypes}
    />
  )
}

