'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileSpreadsheet, FileDown, Printer, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatBDT } from '@/lib/utils'
import { toast } from 'sonner'
import Papa from 'papaparse'
import { downloadExcel } from '@/lib/exportExcel'

interface MatrixRow {
  employee: {
    id: number
    serial_no: number
    name: string
    department: string | null
  }
  days: Record<number, number>
  total: number
}

interface MonthlyMatrixProps {
  initialMatrix: MatrixRow[]
  daysInMonth: number
  currentYear: number
  currentMonth: number
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export function MonthlyMatrixClient({
  initialMatrix,
  daysInMonth,
  currentYear,
  currentMonth,
}: MonthlyMatrixProps) {
  const router = useRouter()
  const [selectedDept, setSelectedDept] = useState<string>('all')

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  // Departments
  const departments = ['all', ...Array.from(new Set(initialMatrix.map(m => m.employee.department).filter(Boolean))) as string[]]

  const filteredMatrix = initialMatrix.filter(
    (m) => selectedDept === 'all' || m.employee.department === selectedDept
  )

  const grandTotalCups = filteredMatrix.reduce((acc, m) => acc + m.total, 0)
  // Assuming average price ~8 BDT per cup for estimation or calculate accurately
  const estimatedCost = grandTotalCups * 8

  // Change month
  const handleMonthChange = (offset: number) => {
    let nextMonth = currentMonth + offset
    let nextYear = currentYear
    if (nextMonth > 12) {
      nextMonth = 1
      nextYear += 1
    } else if (nextMonth < 1) {
      nextMonth = 12
      nextYear -= 1
    }
    router.push(`/admin/reports/monthly?year=${nextYear}&month=${nextMonth}`)
  }

  // Export to Excel
  const handleExportExcel = async () => {
    const sheetData = filteredMatrix.map((m) => {
      const row: Record<string, any> = {
        'SL': m.employee.serial_no,
        'Employee Name': m.employee.name,
        'Department': m.employee.department || 'N/A',
      }
      daysArray.forEach((d) => {
        row[`Day ${d}`] = m.days[d] || 0
      })
      row['Total Cups'] = m.total
      row['Est. Cost (BDT)'] = m.total * 8
      return row
    })

    try {
      await downloadExcel(sheetData, `${MONTH_NAMES[currentMonth - 1]} ${currentYear}`, `Tea_Report_${MONTH_NAMES[currentMonth - 1]}_${currentYear}.xlsx`)
      toast.success('Excel report downloaded')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Excel export failed')
    }
  }

  // Export to CSV
  const handleExportCSV = () => {
    const csvData = filteredMatrix.map((m) => {
      const row: Record<string, any> = {
        'Serial': m.employee.serial_no,
        'Name': m.employee.name,
        'Department': m.employee.department || 'N/A',
      }
      daysArray.forEach((d) => {
        row[`D${d}`] = m.days[d] || 0
      })
      row['Total'] = m.total
      return row
    })

    const csv = Papa.unparse(csvData)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Tea_Matrix_${MONTH_NAMES[currentMonth - 1]}_${currentYear}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('CSV report downloaded')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-zinc-50 tracking-tight">
            Monthly Matrix Report
          </h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            Complete day-by-day staff consumption matrix
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Month Navigator */}
          <div className="flex items-center bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-2 py-1 shadow-sm">
            <button
              onClick={() => handleMonthChange(-1)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg text-gray-600 dark:text-zinc-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-gray-800 dark:text-zinc-100 font-serif">
              {MONTH_NAMES[currentMonth - 1]} {currentYear}
            </span>
            <button
              onClick={() => handleMonthChange(1)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg text-gray-600 dark:text-zinc-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 bg-[#102d20] hover:bg-[#184431] text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel (.xls)</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-200 border border-gray-200 dark:border-zinc-700 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm"
          >
            <FileDown className="w-4 h-4" />
            <span>CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="p-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-700 dark:text-zinc-200 shadow-sm"
            title="Print report"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#fcfaf7] dark:bg-zinc-800/60 border border-gray-200/80 dark:border-zinc-700/60 rounded-2xl p-4 shadow-xs">
          <span className="text-xs uppercase font-medium text-gray-500 dark:text-zinc-400">Total Cups ({MONTH_NAMES[currentMonth - 1]})</span>
          <div className="text-2xl font-extrabold text-emerald-800 dark:text-emerald-400 mt-1">
            {grandTotalCups} cups
          </div>
        </div>

        <div className="bg-[#fcfaf7] dark:bg-zinc-800/60 border border-gray-200/80 dark:border-zinc-700/60 rounded-2xl p-4 shadow-xs">
          <span className="text-xs uppercase font-medium text-gray-500 dark:text-zinc-400">Estimated Total Cost</span>
          <div className="text-2xl font-extrabold text-amber-700 dark:text-amber-400 mt-1">
            {formatBDT(estimatedCost)}
          </div>
        </div>

        <div className="bg-[#fcfaf7] dark:bg-zinc-800/60 border border-gray-200/80 dark:border-zinc-700/60 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-medium text-gray-500 dark:text-zinc-400">Department</span>
            <div className="mt-1">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="text-xs font-bold py-1 px-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-800 dark:text-zinc-100"
              >
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d === 'all' ? 'All Departments' : d}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* The Big Matrix Table */}
      <div className="bg-white/80 dark:bg-zinc-900/80 border border-gray-200/70 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#faf9f6] dark:bg-zinc-800/60 text-gray-500 dark:text-zinc-400 border-b border-gray-200 dark:border-zinc-700">
              <tr>
                <th className="py-2.5 px-3 sticky left-0 bg-[#faf9f6] dark:bg-zinc-800 z-10 w-44 font-bold border-r border-gray-200 dark:border-zinc-700">
                  Employee
                </th>
                <th className="py-2.5 px-2 text-center font-bold text-gray-400 w-16">
                  Dept
                </th>
                {daysArray.map((d) => (
                  <th key={d} className="py-2.5 px-1.5 text-center font-medium min-w-[28px]">
                    {d}
                  </th>
                ))}
                <th className="py-2.5 px-3 text-center font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 min-w-[50px]">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800 font-sans">
              {filteredMatrix.map((m) => (
                <tr key={m.employee.id} className="hover:bg-gray-50/80 dark:hover:bg-zinc-800/40">
                  <td className="py-2.5 px-3 font-semibold text-gray-900 dark:text-zinc-100 sticky left-0 bg-white dark:bg-zinc-900 z-10 border-r border-gray-200 dark:border-zinc-700 whitespace-nowrap">
                    <span className="text-gray-400 font-mono text-[10px] mr-1.5">
                      #{m.employee.serial_no}
                    </span>
                    {m.employee.name}
                  </td>
                  <td className="py-2.5 px-2 text-center text-gray-400 dark:text-zinc-500 text-[10px] whitespace-nowrap">
                    {m.employee.department ? m.employee.department.slice(0, 8) : '—'}
                  </td>
                  {daysArray.map((d) => {
                    const count = m.days[d] || 0
                    return (
                      <td
                        key={d}
                        className={`py-2 px-1 text-center font-mono ${
                          count > 0
                            ? 'font-bold text-gray-900 dark:text-zinc-100 bg-amber-50/40 dark:bg-amber-950/20'
                            : 'text-gray-300 dark:text-zinc-700'
                        }`}
                      >
                        {count > 0 ? count : '·'}
                      </td>
                    )
                  })}
                  <td className="py-2.5 px-3 text-center font-black text-emerald-800 dark:text-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/40">
                    {m.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

