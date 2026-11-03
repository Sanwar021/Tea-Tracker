import {
  pgTable,
  serial,
  varchar,
  text,
  numeric,
  boolean,
  integer,
  timestamp,
  pgEnum,
  index,
  jsonb,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const statusEnum = pgEnum('status', ['active', 'inactive'])
export const sugarLevelEnum = pgEnum('sugar_level', ['none', 'less', 'normal', 'extra'])
export const createdByEnum = pgEnum('created_by', ['counter', 'admin'])
export const actionEnum = pgEnum('action', ['INSERT', 'UPDATE', 'DELETE'])

export const employees = pgTable('employees', {
  id: serial('id').primaryKey(),
  serial_no: integer('serial_no').notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  department: varchar('department', { length: 100 }),
  email: varchar('email', { length: 255 }),
  status: statusEnum('status').default('active').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  serialIdx: index('employees_serial_idx').on(table.serial_no),
  statusIdx: index('employees_status_idx').on(table.status),
}))

export const teaTypes = pgTable('tea_types', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  is_active: boolean('is_active').default(true).notNull(),
  sort_order: integer('sort_order').default(0).notNull(),
})

export const teaEntries = pgTable('tea_entries', {
  id: serial('id').primaryKey(),
  employee_id: integer('employee_id').notNull().references(() => employees.id),
  tea_type_id: integer('tea_type_id').notNull().references(() => teaTypes.id),
  quantity: integer('quantity').default(1).notNull(),
  sugar_level: sugarLevelEnum('sugar_level').default('normal').notNull(),
  unit_price: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
  note: text('note'),
  entry_at: timestamp('entry_at', { withTimezone: true }).defaultNow().notNull(),
  created_by: createdByEnum('created_by').default('counter').notNull(),
  deleted_at: timestamp('deleted_at', { withTimezone: true }),
}, (table) => ({
  employeeEntryAtIdx: index('tea_entries_employee_entry_at_idx').on(table.employee_id, table.entry_at),
  entryAtIdx: index('tea_entries_entry_at_idx').on(table.entry_at),
  deletedAtIdx: index('tea_entries_deleted_at_idx').on(table.deleted_at),
}))

export const settings = pgTable('settings', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 100 }).notNull().unique(),
  value: text('value').notNull(),
})

export const auditLog = pgTable('audit_log', {
  id: serial('id').primaryKey(),
  table_name: varchar('table_name', { length: 100 }).notNull(),
  record_id: integer('record_id').notNull(),
  action: actionEnum('action').notNull(),
  old_data: jsonb('old_data'),
  new_data: jsonb('new_data'),
  performed_by: varchar('performed_by', { length: 50 }).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

// Relations
export const employeesRelations = relations(employees, ({ many }) => ({
  teaEntries: many(teaEntries),
}))

export const teaTypesRelations = relations(teaTypes, ({ many }) => ({
  teaEntries: many(teaEntries),
}))

export const teaEntriesRelations = relations(teaEntries, ({ one }) => ({
  employee: one(employees, {
    fields: [teaEntries.employee_id],
    references: [employees.id],
  }),
  teaType: one(teaTypes, {
    fields: [teaEntries.tea_type_id],
    references: [teaTypes.id],
  }),
}))

export type Employee = typeof employees.$inferSelect
export type NewEmployee = typeof employees.$inferInsert
export type TeaType = typeof teaTypes.$inferSelect
export type NewTeaType = typeof teaTypes.$inferInsert
export type TeaEntry = typeof teaEntries.$inferSelect
export type NewTeaEntry = typeof teaEntries.$inferInsert
export type Setting = typeof settings.$inferSelect
export type AuditLog = typeof auditLog.$inferSelect
