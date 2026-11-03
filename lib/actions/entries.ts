'use server'

import { db } from '@/lib/db'
import { teaEntries, teaTypes, employees } from '@/lib/db/schema'
import { eq, and, gte, lte, isNull } from 'drizzle-orm'
import { getSession } from '@/lib/auth/session'
import { teaEntrySchema } from '@/lib/validations'
import { getDhakaToday } from '@/lib/utils'
import { revalidatePath } from 'next/cache'

export async function addTeaEntry(input: unknown) {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }

  const parsed = teaEntrySchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.flatten() }

  const data = parsed.data

  // Get current tea type price
  const [teaType] = await db.select().from(teaTypes).where(eq(teaTypes.id, data.tea_type_id)).limit(1)
  if (!teaType) return { error: 'Tea type not found' }

  const [entry] = await db.insert(teaEntries).values({
    employee_id: data.employee_id,
    tea_type_id: data.tea_type_id,
    quantity: data.quantity,
    sugar_level: data.sugar_level,
    unit_price: teaType.price,
    note: data.note,
    entry_at: data.entry_at ? new Date(data.entry_at) : new Date(),
    created_by: session.role,
  }).returning()

  revalidatePath('/counter')
  revalidatePath('/admin')
  revalidatePath('/admin/entries')

  return { data: entry }
}

export async function undoTeaEntry(entryId: number) {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }

  const [entry] = await db
    .update(teaEntries)
    .set({ deleted_at: new Date() })
    .where(and(eq(teaEntries.id, entryId), isNull(teaEntries.deleted_at)))
    .returning()

  if (!entry) return { error: 'Entry not found or already deleted' }

  revalidatePath('/counter')
  revalidatePath('/admin')
  revalidatePath('/admin/entries')

  return { data: entry }
}

export async function getTodayEntries() {
  const { start, end } = getDhakaToday()
  
  const entries = await db
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
    .where(
      and(
        gte(teaEntries.entry_at, start),
        lte(teaEntries.entry_at, end),
        isNull(teaEntries.deleted_at)
      )
    )
    .orderBy(teaEntries.entry_at)

  return entries
}

export async function getEmployeeTodayCount(employeeId: number): Promise<number> {
  const { start, end } = getDhakaToday()
  
  const entries = await db
    .select({ id: teaEntries.id })
    .from(teaEntries)
    .where(
      and(
        eq(teaEntries.employee_id, employeeId),
        gte(teaEntries.entry_at, start),
        lte(teaEntries.entry_at, end),
        isNull(teaEntries.deleted_at)
      )
    )

  return entries.length
}
