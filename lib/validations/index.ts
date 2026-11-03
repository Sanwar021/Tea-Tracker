import { z } from 'zod'

export const teaEntrySchema = z.object({
  employee_id: z.number().int().positive(),
  tea_type_id: z.number().int().positive(),
  quantity: z.number().int().min(1).max(20).default(1),
  sugar_level: z.enum(['none', 'less', 'normal', 'extra']).default('normal'),
  note: z.string().max(500).optional().nullable(),
  entry_at: z.string().datetime().optional(),
})

export const updateTeaEntrySchema = z.object({
  employee_id: z.number().int().positive().optional(),
  tea_type_id: z.number().int().positive().optional(),
  quantity: z.number().int().min(1).max(20).optional(),
  sugar_level: z.enum(['none', 'less', 'normal', 'extra']).optional(),
  note: z.string().max(500).optional().nullable(),
  entry_at: z.string().datetime().optional(),
  deleted_at: z.string().datetime().optional().nullable(),
})

export const employeeSchema = z.object({
  serial_no: z.number().int().positive(),
  name: z.string().min(1).max(255),
  department: z.string().max(100).optional().nullable(),
  email: z.string().email().optional().nullable(),
  status: z.enum(['active', 'inactive']).default('active'),
})

export const teaTypeSchema = z.object({
  name: z.string().min(1).max(100),
  price: z.number().positive(),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().default(0),
})

export const counterLoginSchema = z.object({
  pin: z.string().length(4).regex(/^\d{4}$/),
})

export const adminLoginSchema = z.object({
  password: z.string().min(1),
})

export const dateRangeSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  employee_id: z.coerce.number().optional(),
  tea_type_id: z.coerce.number().optional(),
  department: z.string().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().max(500).default(50),
})

export const monthlyReportSchema = z.object({
  year: z.coerce.number().int().min(2020).max(2100),
  month: z.coerce.number().int().min(1).max(12),
  department: z.string().optional(),
})

export type TeaEntryInput = z.infer<typeof teaEntrySchema>
export type UpdateTeaEntryInput = z.infer<typeof updateTeaEntrySchema>
export type EmployeeInput = z.infer<typeof employeeSchema>
export type TeaTypeInput = z.infer<typeof teaTypeSchema>
export type DateRangeFilter = z.infer<typeof dateRangeSchema>
export type MonthlyReportFilter = z.infer<typeof monthlyReportSchema>
