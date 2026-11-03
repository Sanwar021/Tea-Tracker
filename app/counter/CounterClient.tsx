'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Coffee, Clock } from 'lucide-react'
import { EmployeeGrid } from '@/components/counter/EmployeeGrid'
import { TeaBottomSheet } from '@/components/counter/TeaBottomSheet'
import { TodayLog } from '@/components/counter/TodayLog'
import { OfflineBanner } from '@/components/counter/OfflineBanner'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { LanguageToggle } from '@/components/shared/LanguageToggle'
import { useOfflineQueue } from '@/hooks/useOfflineQueue'
import { useDuplicateGuard } from '@/hooks/useDuplicateGuard'
import { addTeaEntry, undoTeaEntry } from '@/lib/actions/entries'
import { toast } from 'sonner'
import { getDhakaTimeString } from '@/lib/utils'

interface Employee {
  id: number
  serial_no: number
  name: string
  department: string | null
  today_count: number
}

interface TeaType {
  id: number
  name: string
  price: string
}

interface TodayEntry {
  id: number
  employee_id: number
  tea_type_id: number
  quantity: number
  sugar_level: string
  unit_price: string
  note: string | null
  entry_at: Date | string
  created_by: string
  employee_name: string | null
  employee_department: string | null
  tea_type_name: string | null
}

interface CounterClientProps {
  initialEmployees: Employee[]
  initialEntries: TodayEntry[]
  teaTypes: TeaType[]
  officeName: string
}

export function CounterClient({
  initialEmployees,
  initialEntries,
  teaTypes,
  officeName,
}: CounterClientProps) {
  const router = useRouter()
  const [employees, setEmployees] = useState(initialEmployees)
  const [entries, setEntries] = useState(initialEntries)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [currentTime, setCurrentTime] = useState('')
  const [, startTransition] = useTransition()

  const { isOnline, pendingCount, isSyncing, enqueue, sync } = useOfflineQueue()
  const { checkDuplicate, recordEntry } = useDuplicateGuard()

  // Update clock every second
  useEffect(() => {
    const updateTime = () => setCurrentTime(getDhakaTimeString())
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  // Keep state in sync with server revalidations
  useEffect(() => {
    setEmployees(initialEmployees)
    setEntries(initialEntries)
  }, [initialEmployees, initialEntries])

  const totalCups = entries.reduce((acc, curr) => acc + curr.quantity, 0)

  // Submit tea order
  const handleAddTea = async (data: {
    employee_id: number
    tea_type_id: number
    quantity: number
    sugar_level: 'none' | 'less' | 'normal' | 'extra'
    note?: string
  }) => {
    const employee = employees.find((e) => e.id === data.employee_id)
    const teaType = teaTypes.find((t) => t.id === data.tea_type_id)

    // Duplicate prevention check (within 60s)
    if (checkDuplicate(data.employee_id, data.tea_type_id)) {
      const confirmed = window.confirm(
        `Notice: ${employee?.name} already received a ${teaType?.name} less than 60 seconds ago. Add another cup anyway?`
      )
      if (!confirmed) return
    }

    // Offline handling
    if (!navigator.onLine) {
      await enqueue({
        employee_id: data.employee_id,
        tea_type_id: data.tea_type_id,
        quantity: data.quantity,
        sugar_level: data.sugar_level,
        note: data.note,
        entry_at: new Date().toISOString(),
      })

      // Optimistic count update
      setEmployees((prev) =>
        prev.map((e) => (e.id === data.employee_id ? { ...e, today_count: e.today_count + data.quantity } : e))
      )

      toast.info('Saved offline. Will sync when internet is back.')
      setSelectedEmployee(null)
      return
    }

    // Online submission
    const res = await addTeaEntry(data)
    if (res.error) {
      toast.error('Failed to record tea. Please try again.')
      return
    }

    recordEntry(data.employee_id, data.tea_type_id)

    // Trigger haptic vibration on phone
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(50)
      } catch {}
    }

    const createdId = res.data?.id

    // Optimistic UI updates
    setEmployees((prev) =>
      prev.map((e) => (e.id === data.employee_id ? { ...e, today_count: e.today_count + data.quantity } : e))
    )

    if (res.data) {
      const newEntry: TodayEntry = {
        ...res.data,
        employee_name: employee?.name || null,
        employee_department: employee?.department || null,
        tea_type_name: teaType?.name || null,
      }
      setEntries((prev) => [newEntry, ...prev])
    }

    // Success toast with 10s UNDO button
    toast.success(
      <div className="flex items-center justify-between w-full gap-4">
        <span>
          Recorded {data.quantity}x {teaType?.name} for {employee?.name}
        </span>
        {createdId && (
          <button
            onClick={() => handleUndo(createdId)}
            className="px-2.5 py-1 text-xs font-bold bg-amber-600 text-white rounded-md hover:bg-amber-700 transition"
          >
            UNDO
          </button>
        )}
      </div>,
      { duration: 10000 }
    )

    setSelectedEmployee(null)
    startTransition(() => {
      router.refresh()
    })
  }

  // Quick Add (instant 1 cup of Milk Tea or default)
  const handleQuickAdd = async (employee: Employee) => {
    const defaultTea = teaTypes[0] || { id: 1, name: 'Milk Tea', price: '8' }
    await handleAddTea({
      employee_id: employee.id,
      tea_type_id: defaultTea.id,
      quantity: 1,
      sugar_level: 'normal',
    })
  }

  // Undo recent entry
  const handleUndo = async (id: number) => {
    const res = await undoTeaEntry(id)
    if (res.error) {
      toast.error('Failed to undo entry')
      return
    }

    toast.info('Entry undone successfully')
    setEntries((prev) => prev.filter((e) => e.id !== id))
    startTransition(() => {
      router.refresh()
    })
  }

  const handleLogout = async () => {
    if (confirm('Log out from Counter?')) {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/counter-login')
      router.refresh()
    }
  }

  return (
    <div className="premium-counter min-h-screen pb-32 text-gray-900 dark:text-zinc-100">
      {/* Offline sync banner */}
      <OfflineBanner
        isOnline={isOnline}
        pendingCount={pendingCount}
        isSyncing={isSyncing}
        onSync={sync}
      />

      {/* Top Header */}
      <header className="sticky top-0 z-20 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-gray-200/80 dark:border-zinc-800 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          {/* Brand & Time */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#102d20] text-emerald-300 flex items-center justify-center font-black text-sm shadow-md">
              FIN
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-gray-900 dark:text-zinc-100">
                  {officeName}
                </span>
                <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold px-1.5 py-0.5 rounded">
                  COUNTER
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span className="font-medium font-mono">{currentTime || 'Dhaka Time'}</span>
              </div>
            </div>
          </div>

          {/* Right Action Badges */}
          <div className="flex items-center gap-2">
            {/* Total Today Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 dark:bg-primary-950/50 border border-primary-200/60 dark:border-primary-800/50 rounded-full">
              <Coffee className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              <span className="font-bold text-xs sm:text-sm text-primary-800 dark:text-primary-200">
                {totalCups}
              </span>
              <span className="text-[11px] text-primary-600 dark:text-primary-400 hidden sm:inline">
                today
              </span>
            </div>

            <LanguageToggle />
            <ThemeToggle />

            {/* Logout button */}
            <button
              onClick={handleLogout}
              title="Lock Counter"
              className="p-2 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Employee Grid Container */}
      <main className="max-w-4xl mx-auto px-4 py-4 sm:py-6">
        <EmployeeGrid
          employees={employees}
          onSelectEmployee={(emp) => setSelectedEmployee(emp)}
          onQuickAdd={handleQuickAdd}
        />
      </main>

      {/* Bottom Sheet for Recording Tea */}
      <TeaBottomSheet
        employee={selectedEmployee}
        teaTypes={teaTypes}
        onClose={() => setSelectedEmployee(null)}
        onSubmit={handleAddTea}
      />

      {/* Floating Collapsible Today Log */}
      <TodayLog entries={entries} onUndo={handleUndo} />
    </div>
  )
}

