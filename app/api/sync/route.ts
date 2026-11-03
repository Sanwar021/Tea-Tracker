import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { teaEntries, teaTypes } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getSession } from '@/lib/auth/session'
import { teaEntrySchema } from '@/lib/validations'
import { z } from 'zod'

const syncSchema = z.object({
  entries: z.array(teaEntrySchema.extend({ local_id: z.string() }))
})

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid body' }, { status: 400 }) }

  const parsed = syncSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const results: Array<{ local_id: string; id?: number; error?: string }> = []

  for (const entryInput of parsed.data.entries) {
    const { local_id, ...data } = entryInput
    try {
      const [teaType] = await db.select().from(teaTypes).where(eq(teaTypes.id, data.tea_type_id)).limit(1)
      if (!teaType) {
        results.push({ local_id, error: 'Tea type not found' })
        continue
      }

      const [entry] = await db.insert(teaEntries).values({
        ...data,
        unit_price: teaType.price,
        created_by: session.role,
        entry_at: data.entry_at ? new Date(data.entry_at) : new Date(),
      }).returning()

      results.push({ local_id, id: entry.id })
    } catch {
      results.push({ local_id, error: 'Failed to save entry' })
    }
  }

  return NextResponse.json({ results })
}
