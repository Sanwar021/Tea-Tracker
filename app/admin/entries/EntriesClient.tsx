'use client'

import { useState, useMemo, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Coffee,
  Search,
  Trash2,
  FileDown,
  X,
} from 'lucide-react'
import { formatDhakaDate, formatDhakaTime, formatBDT, getTeaIcon } from '@/lib/utils'
import { undoTeaEntry } from '@/lib/actions/entries'
import { toast } from 'sonner'
import { ManualTeaEntryDialog } from '@/components/admin/ManualTeaEntryDialog'
import { downloadExcel } from '@/lib/exportExcel'

interface Entry {
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

interface Employee {
  id: number
  name: string
  department: string | null
}

interface TeaType {
  id: number
  name: string
  price: string
}

export function EntriesClient({
  initialEntries,
  employees,
  teaTypes,
}: {
  initialEntries: Entry[]
  employees: Employee[]
  teaTypes: TeaType[]
}) {
  const router = useRouter()
  const [entries, setEntries] = useState(initialEntries)
  const [search, setSearch] = useState('')
  const [selectedTeaType, setSelectedTeaType] = useState<string>('all')
  const [selectedDept, setSelectedDept] = useState<string>('all')
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all')
  const [, startTransition] = useTransition()

  useEffect(() => {
    setEntries(initialEntries)
  }, [initialEntries])

  // Departments list
  const departments = useMemo(() => {
    const set = new Set<string>()
    employees.forEach((e) => {
      if (e.department) set.add(e.department)
    })
    return ['all', ...Array.from(set).sort()]
  }, [employees])

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      const matchSearch =
        search === '' ||
        (e.employee_name && e.employee_name.toLowerCase().includes(search.toLowerCase())) ||
        (e.note && e.note.toLowerCase().includes(search.toLowerCase()))

      const matchTea =
        selectedTeaType === 'all' || e.tea_type_id.toString() === selectedTeaType

      const matchDept =
        selectedDept === 'all' || e.employee_department === selectedDept

      const matchEmp =
        selectedEmployee === 'all' || e.employee_id.toString() === selectedEmployee

      return matchSearch && matchTea && matchDept && matchEmp
    })
  }, [entries, search, selectedTeaType, selectedDept, selectedEmployee])

  const totalCups = filteredEntries.reduce((acc, curr) => acc + curr.quantity, 0)
  const totalAmount = filteredEntries.reduce(
    (acc, curr) => acc + parseFloat(curr.unit_price) * curr.quantity,
    0
  )

  // Soft delete entry
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this tea entry?')) return
    const res = await undoTeaEntry(id)
    if (res.error) {
      toast.error('Failed to delete entry')
      return
    }
    toast.success('Entry deleted')
    setEntries((prev) => prev.filter((e) => e.id !== id))
    startTransition(() => {
      router.refresh()
    })
  }

  // Export to Excel
  const handleExportExcel = async () => {
    const dataToExport = filteredEntries.map((e) => ({
      'ID': e.id,
      'Date': formatDhakaDate(e.entry_at),
      'Time': formatDhakaTime(e.entry_at),
      'Employee': e.employee_name || 'N/A',
      'Department': e.employee_department || 'N/A',
      'Tea Type': e.tea_type_name || 'N/A',
      'Quantity': e.quantity,
      'Sugar Level': e.sugar_level,
      'Unit Price': e.unit_price,
      'Total Price': (parseFloat(e.unit_price) * e.quantity).toFixed(2),
      'Created By': e.created_by,
      'Note': e.note || '',
    }))

    try {
      await downloadExcel(dataToExport, 'Tea Entries', `Tea_Entries_${new Date().toISOString().slice(0, 10)}.xlsx`)
      toast.success('Entries exported to Excel')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Excel export failed')
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-zinc-50 tracking-tight">
            Tea Entries Log
          </h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            Complete audit record of every cup served
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ManualTeaEntryDialog employees={employees} teaTypes={teaTypes} />
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 bg-[#102d20] hover:bg-[#184431] text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm"
          >
            <FileDown className="w-4 h-4" />
            <span>Download Excel</span>
          </button>
        </div>
      </div>

      {/* Summary Chips */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/40 rounded-xl px-4 py-2 flex items-center gap-2">
          <Coffee className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
            Total Cups: <strong>{totalCups}</strong>
          </span>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-800/40 rounded-xl px-4 py-2 flex items-center gap-2">
          <span className="text-xs font-semibold text-amber-900 dark:text-amber-200">
            Total Cost: <strong>{formatBDT(totalAmount)}</strong>
          </span>
        </div>

        <div className="bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-2 flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
            Filtered Entries: <strong>{filteredEntries.length}</strong>
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white/80 dark:bg-zinc-800/80 border border-gray-200/70 dark:border-zinc-700/60 rounded-2xl p-4 shadow-xs flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employee or note..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          />
        </div>

        {/* Tea Type Filter */}
        <select
          value={selectedTeaType}
          onChange={(e) => setSelectedTeaType(e.target.value)}
          className="text-xs py-1.5 px-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 focus:outline-none"
        >
          <option value="all">All Tea Types</option>
          {teaTypes.map((t) => (
            <option key={t.id} value={t.id.toString()}>
              {t.name}
            </option>
          ))}
        </select>

        {/* Department Filter */}
        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="text-xs py-1.5 px-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 focus:outline-none"
        >
          <option value="all">All Departments</option>
          {departments.filter(d => d !== 'all').map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        {/* Employee Filter */}
        <select
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
          className="text-xs py-1.5 px-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 focus:outline-none max-w-[180px]"
        >
          <option value="all">All Employees</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id.toString()}>
              {e.name}
            </option>
          ))}
        </select>

        {(search || selectedTeaType !== 'all' || selectedDept !== 'all' || selectedEmployee !== 'all') && (
          <button
            onClick={() => {
              setSearch('')
              setSelectedTeaType('all')
              setSelectedDept('all')
              setSelectedEmployee('all')
            }}
            className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1 px-2 py-1"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white/80 dark:bg-zinc-900/80 border border-gray-200/70 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#faf9f6] dark:bg-zinc-800/40 text-[11px] uppercase tracking-wider text-gray-400 dark:text-zinc-400 border-b border-gray-100 dark:border-zinc-800 font-semibold">
              <tr>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Tea Type</th>
                <th className="py-3 px-4 text-center">Qty</th>
                <th className="py-3 px-4">Sugar</th>
                <th className="py-3 px-4">Cost</th>
                <th className="py-3 px-4">By</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60 font-sans text-xs sm:text-sm">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400">
                    No tea entries found matching the filters
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="hover:bg-gray-50/70 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 text-gray-600 dark:text-zinc-300 font-mono text-xs whitespace-nowrap">
                      <div>{formatDhakaDate(entry.entry_at)}</div>
                      <div className="text-gray-400 text-[11px]">{formatDhakaTime(entry.entry_at)}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-900 dark:text-zinc-100 whitespace-nowrap">
                      {entry.employee_name}
                    </td>
                    <td className="py-3 px-4 text-gray-500 dark:text-zinc-400 whitespace-nowrap">
                      {entry.employee_department || '—'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="flex items-center gap-1.5 font-medium text-gray-800 dark:text-zinc-200">
                        <span>{getTeaIcon(entry.tea_type_name || '')}</span>
                        <span>{entry.tea_type_name}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-gray-900 dark:text-zinc-100">
                      {entry.quantity}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-zinc-400 capitalize">
                      {entry.sugar_level}
                    </td>
                    <td className="py-3 px-4 font-semibold text-emerald-800 dark:text-emerald-300 whitespace-nowrap">
                      {formatBDT(parseFloat(entry.unit_price) * entry.quantity)}
                    </td>
                    <td className="py-3 px-4 text-gray-400 dark:text-zinc-500 uppercase text-[10px] font-bold">
                      {entry.created_by}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(entry.id)}
                        title="Delete entry"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

