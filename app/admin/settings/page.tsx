import { db } from '@/lib/db'
import { settings } from '@/lib/db/schema'
import { SettingsClient } from './SettingsClient'

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  const allSettings = await db.select().from(settings)
  const settingsMap = Object.fromEntries(allSettings.map((s) => [s.key, s.value]))

  return (
    <SettingsClient
      officeName={settingsMap['office_name'] || 'FAME IT NETWORKS'}
      currency={settingsMap['currency'] || 'BDT'}
    />
  )
}

