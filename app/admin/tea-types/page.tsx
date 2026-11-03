import { db } from '@/lib/db'
import { teaTypes } from '@/lib/db/schema'
import { TeaTypesClient } from './TeaTypesClient'

export const dynamic = 'force-dynamic'

export default async function AdminTeaTypesPage() {
  const allTeaTypes = await db.select().from(teaTypes).orderBy(teaTypes.sort_order)

  return <TeaTypesClient initialTeaTypes={allTeaTypes} />
}

