'use server'

import { db } from '@/lib/db'
import { employees, teaEntries } from '@/lib/db/schema'
import { eq, and, gte, lte, isNull, sql } from 'drizzle-orm'
import { getSession } from '@/lib/auth/session'
import { employeeSchema } from '@/lib/validations'
import { getDhakaToday } from '@/lib/utils'
import { revalidatePath } from 'next/cache'

export async function getEmployees() {
  return db.select().from(employees).orderBy(employees.serial_no)
}

export async function getActiveEmployees() {
  return db
    .select()
    .from(employees)
    .where(eq(employees.status, 'active'))
    .orderBy(employees.serial_no)
}

export async function getEmployeesWithTodayCount() {
  const { start, end } = getDhakaToday()

  const emps = await db.select().from(employees).where(eq(employees.status, 'active')).orderBy(employees.serial_no)

  const today = await db
    .select({
      employee_id: teaEntries.employee_id,
      count: sql<number>`count(*)::int`,
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

  const countMap = new Map(today.map((t) => [t.employee_id, t.count]))

  return emps.map((e) => ({
    ...e,
    today_count: countMap.get(e.id) || 0,
  }))
}

export async function createEmployee(input: unknown) {
  const session = await getSession()
  if (session?.role !== 'admin') return { error: 'Unauthorized' }

  const parsed = employeeSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.flatten() }

  const [emp] = await db.insert(employees).values(parsed.data).returning()
  revalidatePath('/admin/employees')
  return { data: emp }
}

export async function updateEmployee(id: number, input: unknown) {
  const session = await getSession()
  if (session?.role !== 'admin') return { error: 'Unauthorized' }

  const parsed = employeeSchema.partial().safeParse(input)
  if (!parsed.success) return { error: parsed.error.flatten() }

  const [emp] = await db.update(employees).set(parsed.data).where(eq(employees.id, id)).returning()
  revalidatePath('/admin/employees')
  return { data: emp }
}

export async function deleteEmployee(id: number) {
  const session = await getSession()
  if (session?.role !== 'admin') return { error: 'Unauthorized' }

  await db.update(employees).set({ status: 'inactive' }).where(eq(employees.id, id))
  revalidatePath('/admin/employees')
  return { success: true }
}
