'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Coffee, DollarSign, ChevronLeft, ChevronRight, ArrowLeft, CalendarDays, Clock3, Users } from 'lucide-react'
import Link from 'next/link'
import { formatBDT, getInitials, getAvatarColor, getTeaIcon } from '@/lib/utils'
import { EditTeaEntryDialog } from '@/components/admin/EditTeaEntryDialog'

interface EmployeeReportClientProps {
  employee: {
    id: number
    serial_no: number
    name: string
    department: string | null
    email: string | null
    status: string
  }
  allEmployees: Array<{ id: number; name: string; serial_no: number }>
  teaTypes: Array<{ id: number; name: string; price: string }>
  year: number
  month: number
  entries: Array<{
    id: number
    quantity: number
    sugar_level: string
    unit_price: string
    entry_at: Date | string
    tea_type_name: string | null
    note: string | null
  }>
  rosterEntries: Array<{
    id: number
    employee_id: number
    employee_name: string
    department: string | null
    quantity: number
    unit_price: string
    entry_at: Date | string
    tea_type_name: string | null
    tea_type_id: number
    sugar_level: string
    note: string | null
  }>
  dailyCounts: Record<number, number>
  teaTypeCounts: Record<string, number>
  daysInMonth: number
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export function EmployeeReportClient({
  employee,
  allEmployees,
  teaTypes,
  year,
  month,
  entries,
  rosterEntries,
  dailyCounts,
  teaTypeCounts,
  daysInMonth,
}: EmployeeReportClientProps) {
  const router = useRouter()

  const rosterByDay = useMemo(() => {
    const grouped: Record<number, typeof rosterEntries> = {}
    rosterEntries.forEach((entry) => {
      const day = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dhaka', day: 'numeric' }).format(new Date(entry.entry_at)))
      ;(grouped[day] ||= []).push(entry)
    })
    return grouped
  }, [rosterEntries])
  const activeRosterDays = useMemo(() => Object.keys(rosterByDay).map(Number).sort((a, b) => a - b), [rosterByDay])
  const [selectedRosterDay, setSelectedRosterDay] = useState(() => activeRosterDays.at(-1) || 1)
  const selectedRosterEntries = rosterByDay[selectedRosterDay] || []
  const selectedPeople = new Set(selectedRosterEntries.map((entry) => entry.employee_id)).size
  const selectedCups = selectedRosterEntries.reduce((total, entry) => total + entry.quantity, 0)

  const totalCups = entries.reduce((acc, curr) => acc + curr.quantity, 0)
  const totalAmount = entries.reduce(
    (acc, curr) => acc + parseFloat(curr.unit_price) * curr.quantity,
    0
  )

  const handleEmployeeChange = (newId: string) => {
    router.push(`/admin/reports/employee/${newId}?year=${year}&month=${month}`)
  }

  const handleMonthChange = (offset: number) => {
    let nextMonth = month + offset
    let nextYear = year
    if (nextMonth > 12) {
      nextMonth = 1
      nextYear += 1
    } else if (nextMonth < 1) {
      nextMonth = 12
      nextYear -= 1
    }
    router.push(`/admin/reports/employee/${employee.id}?year=${nextYear}&month=${nextMonth}`)
  }

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/employees"
            className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-zinc-50 tracking-tight">
              Employee Monthly Summary
            </h1>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
              Detailed tea habits and consumption calendar
            </p>
          </div>
        </div>

        {/* Switchers */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Employee Picker */}
          <select
            value={employee.id.toString()}
            onChange={(e) => handleEmployeeChange(e.target.value)}
            className="text-xs font-semibold py-2 px-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-100 focus:outline-none"
          >
            {allEmployees.map((e) => (
              <option key={e.id} value={e.id.toString()}>
                #{e.serial_no} {e.name}
              </option>
            ))}
          </select>

          {/* Month Navigator */}
          <div className="flex items-center bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-2 py-1 shadow-sm">
            <button
              onClick={() => handleMonthChange(-1)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg text-gray-600 dark:text-zinc-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 text-xs font-bold text-gray-800 dark:text-zinc-100 font-serif">
              {MONTH_NAMES[month - 1]} {year}
            </span>
            <button
              onClick={() => handleMonthChange(1)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg text-gray-600 dark:text-zinc-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Daily employee roster */}
      <section className="bg-white/80 dark:bg-zinc-800/80 border border-gray-100 dark:border-zinc-700/60 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
              <h3 className="font-serif font-bold text-lg text-gray-900 dark:text-zinc-100">Who Took Tea Each Day</h3>
            </div>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">Select a date to see every employee, tea type, time and cup count.</p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100 font-bold"><Users className="w-3.5 h-3.5" />{selectedPeople} people</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-100 font-bold"><Coffee className="w-3.5 h-3.5" />{selectedCups} cups</span>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-thin">
          {daysArray.map((day) => {
            const entriesForDay = rosterByDay[day] || []
            const cupCount = entriesForDay.reduce((total, entry) => total + entry.quantity, 0)
            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedRosterDay(day)}
                className={`shrink-0 min-w-[64px] rounded-xl border px-3 py-2.5 text-center transition-all ${selectedRosterDay === day ? 'bg-emerald-800 border-emerald-800 text-white shadow-lg shadow-emerald-900/15' : cupCount ? 'bg-emerald-50 border-emerald-200 text-emerald-900 hover:border-emerald-400' : 'bg-gray-50 border-gray-100 text-gray-400 hover:border-gray-200'}`}
              >
                <span className="block text-[10px] font-semibold uppercase tracking-wide">Day {day}</span>
                <span className="block text-sm font-extrabold mt-0.5">{cupCount ? `${cupCount} cups` : '—'}</span>
              </button>
            )
          })}
        </div>

        {selectedRosterEntries.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {selectedRosterEntries.map((entry) => (
              <article key={entry.id} className="rounded-2xl border border-gray-100 dark:border-zinc-700/60 bg-[#fcfaf7] dark:bg-zinc-900/35 p-4 flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xs font-extrabold text-white shadow-sm ${getAvatarColor(entry.employee_name)}`}>{getInitials(entry.employee_name)}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-gray-900 dark:text-zinc-100 truncate">{entry.employee_name}</p>
                      <p className="text-[11px] text-gray-500 truncate">{entry.department || 'No department'}</p>
                    </div>
                    <div className="shrink-0 flex items-center gap-1.5">
                      <span className="rounded-lg bg-emerald-100 text-emerald-800 px-2 py-1 text-[10px] font-extrabold">{entry.quantity} {entry.quantity === 1 ? 'cup' : 'cups'}</span>
                      <EditTeaEntryDialog entry={entry} employees={allEmployees} teaTypes={teaTypes} onChanged={() => router.refresh()} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-2 text-[11px] text-gray-500 dark:text-zinc-400">
                    <span className="inline-flex items-center gap-1"><span>{getTeaIcon(entry.tea_type_name || 'Tea')}</span>{entry.tea_type_name || 'Tea'}</span>
                    <span className="inline-flex items-center gap-1"><Clock3 className="w-3 h-3" />{new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Dhaka', hour: 'numeric', minute: '2-digit' }).format(new Date(entry.entry_at))}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 dark:border-zinc-700 py-10 text-center">
            <Coffee className="w-7 h-7 mx-auto text-gray-300 mb-2" />
            <p className="text-sm font-semibold text-gray-500">No tea entries on Day {selectedRosterDay}</p>
          </div>
        )}
      </section>

      {/* Employee Profile Card & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Info */}
        <div className="bg-[#fcfaf7] dark:bg-zinc-800/60 border border-gray-200/80 dark:border-zinc-700/60 rounded-2xl p-5 flex items-center gap-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-white text-lg ${getAvatarColor(
              employee.name
            )} shadow-sm`}
          >
            {getInitials(employee.name)}
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-gray-900 dark:text-zinc-100">
              {employee.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400">
              {employee.department || 'No department'}
            </p>
            <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Active Member
            </span>
          </div>
        </div>

        {/* Total Cups */}
        <div className="bg-[#fcfaf7] dark:bg-zinc-800/60 border border-gray-200/80 dark:border-zinc-700/60 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1">
            <Coffee className="w-4 h-4 text-emerald-600" />
            <span>Total Cups ({MONTH_NAMES[month - 1]})</span>
          </div>
          <div className="text-3xl font-extrabold text-emerald-800 dark:text-emerald-400">
            {totalCups}
          </div>
        </div>

        {/* Total Cost */}
        <div className="bg-[#fcfaf7] dark:bg-zinc-800/60 border border-gray-200/80 dark:border-zinc-700/60 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1">
            <DollarSign className="w-4 h-4 text-amber-600" />
            <span>Total Cost ({MONTH_NAMES[month - 1]})</span>
          </div>
          <div className="text-3xl font-extrabold text-amber-700 dark:text-amber-400">
            {formatBDT(totalAmount)}
          </div>
        </div>
      </div>

      {/* Daily Calendar Heatmap */}
      <div className="bg-white/80 dark:bg-zinc-800/80 border border-gray-100 dark:border-zinc-700/60 rounded-2xl p-5 shadow-xs">
        <h3 className="font-serif font-bold text-base text-gray-900 dark:text-zinc-100 mb-3">
          Daily Consumption Calendar ({MONTH_NAMES[month - 1]} {year})
        </h3>
        <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-16 gap-2">
          {daysArray.map((day) => {
            const count = dailyCounts[day] || 0
            return (
              <div
                key={day}
                className={`p-2.5 rounded-xl text-center border transition-all ${
                  count > 0
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 shadow-xs'
                    : 'bg-gray-50 dark:bg-zinc-800/50 border-gray-100 dark:border-zinc-800'
                }`}
              >
                <div className="text-[10px] text-gray-400 font-medium">Day {day}</div>
                <div
                  className={`text-base font-extrabold mt-0.5 ${
                    count > 0
                      ? 'text-emerald-800 dark:text-emerald-300'
                      : 'text-gray-300 dark:text-zinc-600'
                  }`}
                >
                  {count > 0 ? `${count}x` : '—'}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Tea Types Breakdown */}
      <div className="bg-white/80 dark:bg-zinc-800/80 border border-gray-100 dark:border-zinc-700/60 rounded-2xl p-5 shadow-xs">
        <h3 className="font-serif font-bold text-base text-gray-900 dark:text-zinc-100 mb-3">
          Tea Preferences Breakdown
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(teaTypeCounts).map(([type, count]) => (
            <div
              key={type}
              className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-700/50 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{getTeaIcon(type)}</span>
                <span className="text-xs font-semibold text-gray-800 dark:text-zinc-200">
                  {type}
                </span>
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-zinc-100">
                {count} cups
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

