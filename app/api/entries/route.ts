import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { teaEntries, employees, teaTypes } from '@/lib/db/schema'
import { eq, and, gte, lte, isNull, desc } from 'drizzle-orm'
import { getSession } from '@/lib/auth/session'
import { teaEntrySchema, dateRangeSchema } from '@/lib/validations'
import { getDhakaToday } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const parsed = dateRangeSchema.safeParse(Object.fromEntries(searchParams))
  
  let startDate: Date, endDate: Date

  if (parsed.success && parsed.data.from) {
    startDate = new Date(parsed.data.from)
    endDate = parsed.data.to ? new Date(parsed.data.to) : new Date()
  } else {
    const { start, end } = getDhakaToday()
    startDate = start
    endDate = end
  }

  const filters: Parameters<typeof and>[] = [
    gte(teaEntries.entry_at, startDate) as any,
    lte(teaEntries.entry_at, endDate) as any,
    isNull(teaEntries.deleted_at) as any,
  ]

  if (parsed.success) {
    if (parsed.data.employee_id) filters.push(eq(teaEntries.employee_id, parsed.data.employee_id) as any)
    if (parsed.data.tea_type_id) filters.push(eq(teaEntries.tea_type_id, parsed.data.tea_type_id) as any)
  }

  const page = parsed.success ? parsed.data.page : 1
  const limit = parsed.success ? parsed.data.limit : 50
  const offset = (page - 1) * limit

  const data = await db
    .select({
      id: teaEntries.id,
      quantity: teaEntries.quantity,
      sugar_level: teaEntries.sugar_level,
      unit_price: teaEntries.unit_price,
      note: teaEntries.note,
      entry_at: teaEntries.entry_at,
      created_by: teaEntries.created_by,
      employee: {
        id: employees.id,
        name: employees.name,
        department: employees.department,
      },
      tea_type: {
        id: teaTypes.id,
        name: teaTypes.name,
        price: teaTypes.price,
      },
    })
    .from(teaEntries)
    .leftJoin(employees, eq(teaEntries.employee_id, employees.id))
    .leftJoin(teaTypes, eq(teaEntries.tea_type_id, teaTypes.id))
    .where(and(...(filters as any[])))
    .orderBy(desc(teaEntries.entry_at))
    .limit(limit)
    .offset(offset)

  return NextResponse.json({ data, page, limit })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid body' }, { status: 400 }) }

  const parsed = teaEntrySchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const [teaType] = await db.select().from(teaTypes).where(eq(teaTypes.id, parsed.data.tea_type_id)).limit(1)
  if (!teaType) return NextResponse.json({ error: 'Tea type not found' }, { status: 404 })

  const [entry] = await db.insert(teaEntries).values({
    ...parsed.data,
    unit_price: teaType.price,
    created_by: session.role,
    entry_at: parsed.data.entry_at ? new Date(parsed.data.entry_at) : new Date(),
  }).returning()

  return NextResponse.json({ data: entry }, { status: 201 })
}
