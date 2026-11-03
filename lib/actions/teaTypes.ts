'use server'

import { db } from '@/lib/db'
import { teaTypes } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getSession } from '@/lib/auth/session'
import { revalidatePath } from 'next/cache'

export async function updateTeaType(id: number, data: { name?: string; price?: string; is_active?: boolean }) {
  const session = await getSession()
  if (session?.role !== 'admin') return { error: 'Unauthorized' }

  const [updated] = await db
    .update(teaTypes)
    .set(data)
    .where(eq(teaTypes.id, id))
    .returning()

  revalidatePath('/admin/tea-types')
  revalidatePath('/counter')
  return { data: updated }
}

export async function createTeaType(data: { name: string; price: string; is_active?: boolean; sort_order?: number }) {
  const session = await getSession()
  if (session?.role !== 'admin') return { error: 'Unauthorized' }

  const [created] = await db
    .insert(teaTypes)
    .values({
      name: data.name,
      price: data.price,
      is_active: data.is_active ?? true,
      sort_order: data.sort_order ?? 0,
    })
    .returning()

  revalidatePath('/admin/tea-types')
  revalidatePath('/counter')
  return { data: created }
}

