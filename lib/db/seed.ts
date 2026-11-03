import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { employees, teaTypes, settings } from './schema'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const EMPLOYEES = [
  { serial_no: 1, name: 'Dr Arshi Tasnim', department: 'Upasham Plus' },
  { serial_no: 2, name: 'Dr Shuvojit Paik', department: 'Upasham Plus' },
  { serial_no: 3, name: 'Farjana', department: 'Admin' },
  { serial_no: 4, name: 'Habibur Rahman', department: 'IT' },
  { serial_no: 5, name: 'Imtiaz Sajid', department: 'IT' },
  { serial_no: 6, name: 'Jebrun Nesa Jarin', department: 'Upasham Plus' },
  { serial_no: 7, name: 'Md Azizul Haque Nadim', department: 'IT' },
  { serial_no: 8, name: 'Md Sazzad Hossen', department: 'IT' },
  { serial_no: 9, name: 'MD. ALI HOSSAIN IMRAN', department: 'Media' },
  { serial_no: 10, name: 'Md. Imtiaz Rana', department: 'IT' },
  { serial_no: 11, name: 'Md. Monbir Rahman Metul', department: 'IT' },
  { serial_no: 12, name: 'Md. Rabbi Ahmed Noman', department: 'Admin' },
  { serial_no: 13, name: 'Md. Sadad-Ul-Hasan', department: 'Business Analyst' },
  { serial_no: 14, name: 'Md. Sanwarul Islam', department: 'IT' },
  { serial_no: 15, name: 'Monsur', department: 'Media' },
  { serial_no: 16, name: 'Mr. Asad', department: null },
  { serial_no: 17, name: 'Ms. Mohosina Akter Mim', department: 'Upasham Plus' },
  { serial_no: 18, name: 'Ms. Sadia Tabassum', department: 'IT' },
  { serial_no: 19, name: 'Nurun Nahar Nina', department: 'Accounts' },
  { serial_no: 20, name: 'S. M. Fahim Farhat', department: 'Upasham Plus' },
  { serial_no: 21, name: 'S. M. Ruhul Azam Rupom', department: 'Management' },
  { serial_no: 22, name: 'S. M. Ruhul Azim Rifath', department: 'Management' },
]

const TEA_TYPES = [
  { name: 'Milk Tea', price: '8', is_active: true, sort_order: 1 },
  { name: 'Red Tea', price: '5', is_active: true, sort_order: 2 },
  { name: 'Green Tea', price: '6', is_active: true, sort_order: 3 },
  { name: 'Coffee', price: '15', is_active: true, sort_order: 4 },
]

const SETTINGS = [
  { key: 'office_name', value: 'FAME IT NETWORKS' },
  { key: 'currency', value: 'BDT' },
  { key: 'default_tea_type_id', value: '1' },
  { key: 'counter_pin_hash', value: '' },
  { key: 'admin_password_hash', value: '' },
]

async function main() {
  console.log('Seeding database...')
  const sql = neon(process.env.DATABASE_URL!)
  const db = drizzle(sql)

  // Seed employees
  console.log('Inserting employees...')
  for (const emp of EMPLOYEES) {
    await db.insert(employees).values(emp).onConflictDoNothing()
  }

  // Seed tea types
  console.log('Inserting tea types...')
  for (const tea of TEA_TYPES) {
    await db.insert(teaTypes).values(tea).onConflictDoNothing()
  }

  // Seed settings
  console.log('Inserting settings...')
  for (const setting of SETTINGS) {
    await db.insert(settings).values(setting).onConflictDoNothing()
  }

  console.log('Database seeded successfully!')
  process.exit(0)
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
