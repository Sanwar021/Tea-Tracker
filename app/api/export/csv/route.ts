import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { teaEntries, employees, teaTypes } from '@/lib/db/schema'
import { eq, and, gte, lte, isNull, desc } from 'drizzle-orm'
import { getSession } from '@/lib/auth/session'
import { dateRangeSchema } from '@/lib/validations'
import Papa from 'papaparse'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (session?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = req.nextUrl
  const parsed = dateRangeSchema.safeParse(Object.fromEntries(searchParams))

  const filters: any[] = [isNull(teaEntries.deleted_at)]
  if (parsed.success && parsed.data.from) filters.push(gte(teaEntries.entry_at, new Date(parsed.data.from)))
  if (parsed.success && parsed.data.to) filters.push(lte(teaEntries.entry_at, new Date(parsed.data.to)))

  const data = await db
    .select({
      Date: teaEntries.entry_at,
      Employee: employees.name,
      Department: employees.department,
      'Tea Type': teaTypes.name,
      Quantity: teaEntries.quantity,
      'Unit Price': teaEntries.unit_price,
      Total: teaEntries.unit_price,
      'Sugar Level': teaEntries.sugar_level,
      Note: teaEntries.note,
      'Added By': teaEntries.created_by,
    })
    .from(teaEntries)
    .leftJoin(employees, eq(teaEntries.employee_id, employees.id))
    .leftJoin(teaTypes, eq(teaEntries.tea_type_id, teaTypes.id))
    .where(and(...filters))
    .orderBy(desc(teaEntries.entry_at))
    .limit(10000)

  const formatted = data.map((row) => ({
    ...row,
    Date: new Date(row.Date).toLocaleString('en-BD', { timeZone: 'Asia/Dhaka' }),
    Total: `${(parseFloat(String(row['Unit Price'])) * (row.Quantity || 1)).toFixed(2)} BDT`,
    'Unit Price': `${row['Unit Price']} BDT`,
  }))

  const csv = Papa.unparse(formatted)

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="tea-entries-${Date.now()}.csv"`,
    },
  })
}
