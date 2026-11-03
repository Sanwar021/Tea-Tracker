import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { teaEntries, employees, teaTypes } from '@/lib/db/schema'
import { eq, and, gte, lte, isNull, desc } from 'drizzle-orm'
import { getSession } from '@/lib/auth/session'
import { dateRangeSchema } from '@/lib/validations'

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
      'Unit Price (BDT)': teaEntries.unit_price,
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
    'Total (BDT)': parseFloat(String(row['Unit Price (BDT)'])) * (row.Quantity || 1),
  }))

  const headers = formatted.length ? Object.keys(formatted[0]) : ['Date', 'Employee', 'Department', 'Tea Type', 'Quantity', 'Unit Price (BDT)', 'Sugar Level', 'Note', 'Added By', 'Total (BDT)']
  const escapeHtml = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character] || character))
  const headerHtml = headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')
  const bodyHtml = formatted.map((row) => `<tr>${headers.map((header) => `<td>${escapeHtml(row[header as keyof typeof row])}</td>`).join('')}</tr>`).join('')
  const document = `<!doctype html><html><head><meta charset="utf-8"><style>table{border-collapse:collapse;font:12px Arial}th{background:#078bc8;color:#fff}th,td{border:1px solid #cbdde6;padding:7px 10px}tr:nth-child(even){background:#f0f8fc}</style></head><body><table><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table></body></html>`

  return new NextResponse(`\ufeff${document}`, {
    headers: {
      'Content-Type': 'application/vnd.ms-excel; charset=utf-8',
      'Content-Disposition': `attachment; filename="tea-entries-${Date.now()}.xls"`,
    },
  })
}
