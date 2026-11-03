import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { settings } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

async function getOrInitHash(key: string, rawEnvValue: string): Promise<string> {
  const [setting] = await db.select().from(settings).where(eq(settings.key, key)).limit(1)
  
  if (setting && setting.value && setting.value.startsWith('$2')) {
    return setting.value
  }
  
  // Hash the raw value and store it
  const hash = await hashPassword(rawEnvValue)
  
  if (setting) {
    await db.update(settings).set({ value: hash }).where(eq(settings.key, key))
  } else {
    await db.insert(settings).values({ key, value: hash })
  }
  
  return hash
}

export async function verifyCounterPin(pin: string): Promise<boolean> {
  const rawPin = process.env.COUNTER_PIN || (process.env.NODE_ENV === 'production' ? '' : '1234')
  if (!rawPin) throw new Error('COUNTER_PIN is required in production')
  try {
    const hash = await getOrInitHash('counter_pin_hash', rawPin)
    return verifyPassword(pin, hash)
  } catch {
    // Fallback to direct comparison during setup
    return pin === rawPin
  }
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const rawPassword = process.env.ADMIN_PASSWORD || (process.env.NODE_ENV === 'production' ? '' : 'admin123')
  if (!rawPassword) throw new Error('ADMIN_PASSWORD is required in production')
  try {
    const hash = await getOrInitHash('admin_password_hash', rawPassword)
    return verifyPassword(password, hash)
  } catch {
    return password === rawPassword
  }
}
