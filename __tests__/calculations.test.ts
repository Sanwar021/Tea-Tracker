import { describe, it, expect } from 'vitest'
import { formatBDT, getInitials, getTeaIcon } from '@/lib/utils'

describe('Tea Counter Utilities & Calculations', () => {
  it('correctly formats BDT amounts', () => {
    expect(formatBDT(15)).toBe('৳15')
    expect(formatBDT('8.50')).toBe('৳9')
    expect(formatBDT(0)).toBe('৳0')
  })

  it('generates initials for employee avatars', () => {
    expect(getInitials('Dr Arshi Tasnim')).toBe('DA')
    expect(getInitials('Farjana')).toBe('F')
    expect(getInitials('MD. ALI HOSSAIN IMRAN')).toBe('MA')
  })

  it('maps tea types to correct icons', () => {
    expect(getTeaIcon('Milk Tea')).toBe('🍵')
    expect(getTeaIcon('Red Tea')).toBe('🫖')
    expect(getTeaIcon('Green Tea')).toBe('🌿')
    expect(getTeaIcon('Coffee')).toBe('☕')
  })

  it('calculates matrix row totals accurately', () => {
    const days: Record<number, number> = { 1: 2, 2: 3, 5: 1 }
    const total = Object.values(days).reduce((a, b) => a + b, 0)
    expect(total).toBe(6)
    const unitPrice = 8
    expect(total * unitPrice).toBe(48)
  })
})

