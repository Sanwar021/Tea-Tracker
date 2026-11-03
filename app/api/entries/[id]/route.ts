import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { employees, teaEntries, teaTypes } from '@/lib/db/schema'
import { eq, and, isNull } from 'drizzle-orm'
import { getSession } from '@/lib/auth/session'
import { updateTeaEntrySchema } from '@/lib/validations'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (session?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const id = parseInt((await params).id)
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid body' }, { status: 400 }) }

  const parsed = updateTeaEntrySchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  if (parsed.data.employee_id) {
    const [employee] = await db.select({ id: employees.id }).from(employees).where(eq(employees.id, parsed.data.employee_id)).limit(1)
    if (!employee) return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
  }

  let unitPrice: string | undefined
  if (parsed.data.tea_type_id) {
    const [teaType] = await db.select({ price: teaTypes.price }).from(teaTypes).where(eq(teaTypes.id, parsed.data.tea_type_id)).limit(1)
    if (!teaType) return NextResponse.json({ error: 'Tea type not found' }, { status: 404 })
    unitPrice = teaType.price
  }

  const updateData = {
    ...parsed.data,
    entry_at: parsed.data.entry_at ? new Date(parsed.data.entry_at) : undefined,
    unit_price: unitPrice,
    deleted_at: parsed.data.deleted_at ? new Date(parsed.data.deleted_at) : undefined,
  }

  const [entry] = await db
    .update(teaEntries)
    .set(updateData)
    .where(and(eq(teaEntries.id, id), isNull(teaEntries.deleted_at)))
    .returning()

  if (!entry) return NextResponse.json({ error: 'Entry not found' }, { status: 404 })

  return NextResponse.json({ data: entry })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (session?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const id = parseInt((await params).id)
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

  const [entry] = await db
    .update(teaEntries)
    .set({ deleted_at: new Date() })
    .where(and(eq(teaEntries.id, id), isNull(teaEntries.deleted_at)))
    .returning()

  if (!entry) return NextResponse.json({ error: 'Entry not found' }, { status: 404 })

  return NextResponse.json({ success: true })
}
