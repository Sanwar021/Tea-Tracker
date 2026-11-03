'use client'

import { useRef, useCallback } from 'react'

interface EntryKey {
  employee_id: number
  tea_type_id: number
}

export function useDuplicateGuard(windowMs = 60000) {
  const recentEntries = useRef<Map<string, number>>(new Map())

  const check = useCallback((entry: EntryKey): boolean => {
    const key = `${entry.employee_id}-${entry.tea_type_id}`
    const now = Date.now()
    const last = recentEntries.current.get(key)
    if (last && now - last < windowMs) {
      return true // duplicate
    }
    return false
  }, [windowMs])

  const record = useCallback((entry: EntryKey) => {
    const key = `${entry.employee_id}-${entry.tea_type_id}`
    recentEntries.current.set(key, Date.now())
  }, [])

  const clear = useCallback((entry: EntryKey) => {
    const key = `${entry.employee_id}-${entry.tea_type_id}`
    recentEntries.current.delete(key)
  }, [])

  const checkDuplicate = useCallback((employee_id: number, tea_type_id: number) => {
    return check({ employee_id, tea_type_id })
  }, [check])

  const recordEntry = useCallback((employee_id: number, tea_type_id: number) => {
    record({ employee_id, tea_type_id })
  }, [record])

  return { check, record, clear, checkDuplicate, recordEntry }
}
