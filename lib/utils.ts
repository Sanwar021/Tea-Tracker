import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns'
import { toZonedTime, fromZonedTime } from 'date-fns-tz'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const DHAKA_TZ = 'Asia/Dhaka'

export function toDhakaTime(date: Date | string): Date {
  return toZonedTime(new Date(date), DHAKA_TZ)
}

export function fromDhakaTime(date: Date | string): Date {
  return fromZonedTime(new Date(date), DHAKA_TZ)
}

export function formatDhaka(date: Date | string, fmt: string = 'PPpp'): string {
  return format(toDhakaTime(date), fmt)
}

export function getDhakaToday(): { start: Date; end: Date } {
  const now = toDhakaTime(new Date())
  const start = fromDhakaTime(startOfDay(now))
  const end = fromDhakaTime(endOfDay(now))
  return { start, end }
}

export function getDhakaMonth(year: number, month: number): { start: Date; end: Date } {
  const date = new Date(year, month - 1, 1)
  const zonedDate = toDhakaTime(date)
  const start = fromDhakaTime(startOfMonth(zonedDate))
  const end = fromDhakaTime(endOfMonth(zonedDate))
  return { start, end }
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export function formatDhakaDate(date: Date | string): string {
  try {
    return format(toDhakaTime(date), 'MMM dd, yyyy')
  } catch {
    return String(date)
  }
}

export function formatDhakaTime(date: Date | string): string {
  try {
    return format(toDhakaTime(date), 'hh:mm a')
  } catch {
    return ''
  }
}

export function getDhakaTimeString(): string {
  try {
    return format(toDhakaTime(new Date()), 'hh:mm:ss a')
  } catch {
    return ''
  }
}

export function formatBDT(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return `৳${isNaN(num) ? '0' : num.toFixed(0)}`
}

export function formatCurrency(amount: number, currency = 'BDT'): string {
  if (currency === 'BDT') {
    return `৳${amount.toFixed(0)}`
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
}

export function getAvatarColor(name: string): string {
  const colors = [
    'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500',
    'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500',
    'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500',
    'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500',
    'bg-rose-500',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

export function getDepartmentColor(dept: string | null): string {
  if (!dept) return 'bg-gray-100 text-gray-600'
  const map: Record<string, string> = {
    'IT': 'bg-blue-100 text-blue-700',
    'Media': 'bg-purple-100 text-purple-700',
    'Admin': 'bg-orange-100 text-orange-700',
    'Upasham Plus': 'bg-green-100 text-green-700',
    'Management': 'bg-indigo-100 text-indigo-700',
    'Accounts': 'bg-yellow-100 text-yellow-700',
    'Business Analyst': 'bg-teal-100 text-teal-700',
  }
  return map[dept] || 'bg-gray-100 text-gray-600'
}

export const TEA_ICONS: Record<string, string> = {
  'Milk Tea': '🍵',
  'Red Tea': '🫖',
  'Green Tea': '🌿',
  'Coffee': '☕',
}

export function getTeaIcon(name: string): string {
  return TEA_ICONS[name] || '🍵'
}

export const DEPARTMENTS = [
  'All',
  'IT',
  'Media',
  'Admin',
  'Upasham Plus',
  'Management',
  'Accounts',
  'Business Analyst',
]
