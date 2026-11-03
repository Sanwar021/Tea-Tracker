import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { migrate } from 'drizzle-orm/neon-http/migrator'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function main() {
  console.log('Running migrations...')
  const sql = neon(process.env.DATABASE_URL!)
  const db = drizzle(sql)
  
  await migrate(db, { migrationsFolder: './drizzle' })
  console.log('Migrations completed successfully!')
  process.exit(0)
}

main().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
