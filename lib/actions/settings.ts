'use server'

import { db } from '@/lib/db'
import { settings } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { hashPassword } from '@/lib/auth'
import { getSession } from '@/lib/auth/session'
import { revalidatePath } from 'next/cache'

export async function updateSetting(key: string, value: string) {
  const session = await getSession()
  if (session?.role !== 'admin') return { error: 'Unauthorized' }

  const [existing] = await db.select().from(settings).where(eq(settings.key, key)).limit(1)

  if (existing) {
    await db.update(settings).set({ value }).where(eq(settings.key, key))
  } else {
    await db.insert(settings).values({ key, value })
  }

  revalidatePath('/admin/settings')
  revalidatePath('/counter')
  return { success: true }
}

export async function changeCounterPin(newPin: string) {
  const session = await getSession()
  if (session?.role !== 'admin') return { error: 'Unauthorized' }

  if (!/^\d{4}$/.test(newPin)) {
    return { error: 'PIN must be exactly 4 digits' }
  }

  const hash = await hashPassword(newPin)
  await updateSetting('counter_pin_hash', hash)
  return { success: true }
}

export async function changeAdminPassword(newPassword: string) {
  const session = await getSession()
  if (session?.role !== 'admin') return { error: 'Unauthorized' }

  if (newPassword.length < 6) {
    return { error: 'Password must be at least 6 characters' }
  }

  const hash = await hashPassword(newPassword)
  await updateSetting('admin_password_hash', hash)
  return { success: true }
}

