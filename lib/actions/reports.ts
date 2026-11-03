'use server'

import { db } from '@/lib/db'
import { teaEntries, employees, teaTypes } from '@/lib/db/schema'
import { eq, and, gte, lte, isNull, sql, desc } from 'drizzle-orm'
import { getDhakaToday, getDhakaMonth } from '@/lib/utils'

export async function getDashboardStats() {
  const { start: todayStart, end: todayEnd } = getDhakaToday()
  
  const now = new Date()
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [todayStats] = await db
    .select({ count: sql<number>`sum(quantity)::int`, revenue: sql<number>`sum(quantity * unit_price::numeric)` })
    .from(teaEntries)
    .where(and(gte(teaEntries.entry_at, todayStart), lte(teaEntries.entry_at, todayEnd), isNull(teaEntries.deleted_at)))

  const [weekStats] = await db
    .select({ count: sql<number>`sum(quantity)::int`, revenue: sql<number>`sum(quantity * unit_price::numeric)` })
    .from(teaEntries)
    .where(and(gte(teaEntries.entry_at, weekStart), isNull(teaEntries.deleted_at)))

  const [monthStats] = await db
    .select({ count: sql<number>`sum(quantity)::int`, revenue: sql<number>`sum(quantity * unit_price::numeric)` })
    .from(teaEntries)
    .where(and(gte(teaEntries.entry_at, monthStart), isNull(teaEntries.deleted_at)))

  const [empCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(employees)
    .where(eq(employees.status, 'active'))

  return {
    today: { count: todayStats?.count || 0, revenue: Number(todayStats?.revenue || 0) },
    week: { count: weekStats?.count || 0, revenue: Number(weekStats?.revenue || 0) },
    month: { count: monthStats?.count || 0, revenue: Number(monthStats?.revenue || 0) },
    employees: empCount?.count || 0,
  }
}

export async function getTeaTypeBreakdown() {
  const { start, end } = getDhakaToday()
  return db
    .select({
      name: teaTypes.name,
      count: sql<number>`sum(tea_entries.quantity)::int`,
      revenue: sql<number>`sum(tea_entries.quantity * tea_entries.unit_price::numeric)`,
    })
    .from(teaEntries)
    .leftJoin(teaTypes, eq(teaEntries.tea_type_id, teaTypes.id))
    .where(and(gte(teaEntries.entry_at, start), lte(teaEntries.entry_at, end), isNull(teaEntries.deleted_at)))
    .groupBy(teaTypes.name)
}

export async function getDailyTrend(days = 7) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  return db
    .select({
      date: sql<string>`DATE(entry_at AT TIME ZONE 'Asia/Dhaka')`,
      count: sql<number>`sum(quantity)::int`,
    })
    .from(teaEntries)
    .where(and(gte(teaEntries.entry_at, startDate), isNull(teaEntries.deleted_at)))
    .groupBy(sql`DATE(entry_at AT TIME ZONE 'Asia/Dhaka')`)
    .orderBy(sql`DATE(entry_at AT TIME ZONE 'Asia/Dhaka')`)
}

export async function getDeptBreakdown() {
  const { start, end } = getDhakaToday()
  return db
    .select({
      department: employees.department,
      count: sql<number>`sum(tea_entries.quantity)::int`,
    })
    .from(teaEntries)
    .leftJoin(employees, eq(teaEntries.employee_id, employees.id))
    .where(and(gte(teaEntries.entry_at, start), lte(teaEntries.entry_at, end), isNull(teaEntries.deleted_at)))
    .groupBy(employees.department)
    .orderBy(desc(sql`sum(tea_entries.quantity)`))
}

export async function getTopDrinkers(limit = 10) {
  const { start: monthStart } = getDhakaMonth(new Date().getFullYear(), new Date().getMonth() + 1)
  return db
    .select({
      id: employees.id,
      name: employees.name,
      department: employees.department,
      count: sql<number>`sum(tea_entries.quantity)::int`,
    })
    .from(teaEntries)
    .leftJoin(employees, eq(teaEntries.employee_id, employees.id))
    .where(and(gte(teaEntries.entry_at, monthStart), isNull(teaEntries.deleted_at)))
    .groupBy(employees.id, employees.name, employees.department)
    .orderBy(desc(sql`sum(tea_entries.quantity)`))
    .limit(limit)
}

export async function getMonthlyMatrix(year: number, month: number) {
  const { start, end } = getDhakaMonth(year, month)
  
  const emps = await db.select().from(employees).where(eq(employees.status, 'active')).orderBy(employees.serial_no)
  
  const entries = await db
    .select({
      employee_id: teaEntries.employee_id,
      day: sql<number>`EXTRACT(DAY FROM entry_at AT TIME ZONE 'Asia/Dhaka')::int`,
      count: sql<number>`sum(quantity)::int`,
    })
    .from(teaEntries)
    .where(and(gte(teaEntries.entry_at, start), lte(teaEntries.entry_at, end), isNull(teaEntries.deleted_at)))
    .groupBy(teaEntries.employee_id, sql`EXTRACT(DAY FROM entry_at AT TIME ZONE 'Asia/Dhaka')`)

  const daysInMonth = new Date(year, month, 0).getDate()
  
  const matrix = emps.map((emp) => {
    const empEntries = entries.filter((e) => e.employee_id === emp.id)
    const days: Record<number, number> = {}
    let total = 0
    for (const e of empEntries) {
      days[e.day] = e.count
      total += e.count
    }
    return { employee: emp, days, total }
  })

  return { matrix, daysInMonth, year, month }
}
