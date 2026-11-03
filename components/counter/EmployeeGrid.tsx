'use client'

import { useState, useMemo } from 'react'
import { Search, X, Users } from 'lucide-react'
import { EmployeeCard } from './EmployeeCard'

interface Employee {
  id: number
  serial_no: number
  name: string
  department: string | null
  today_count: number
}

interface EmployeeGridProps {
  employees: Employee[]
  onSelectEmployee: (employee: Employee) => void
  onQuickAdd: (employee: Employee) => void
}

export function EmployeeGrid({ employees, onSelectEmployee, onQuickAdd }: EmployeeGridProps) {
  const [search, setSearch] = useState('')
  const [selectedDept, setSelectedDept] = useState<string>('all')

  const departments = useMemo(() => {
    const set = new Set<string>()
    employees.forEach((e) => {
      if (e.department) set.add(e.department)
    })
    return ['all', ...Array.from(set).sort()]
  }, [employees])

  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      const matchSearch =
        search.trim() === '' ||
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        (e.department && e.department.toLowerCase().includes(search.toLowerCase())) ||
        e.serial_no.toString().includes(search.trim())

      const matchDept = selectedDept === 'all' || e.department === selectedDept

      return matchSearch && matchDept
    })
  }, [employees, search, selectedDept])

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search employee by name, dept or ID..."
          className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-zinc-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm text-base transition-all"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Department Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
        {departments.map((dept) => {
          const isSelected = selectedDept === dept
          const count = dept === 'all' 
            ? employees.length 
            : employees.filter(e => e.department === dept).length

          return (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 touch-target ${
                isSelected
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-700 border border-gray-200/60 dark:border-zinc-700'
              }`}
            >
              <span>{dept === 'all' ? 'All' : dept}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-zinc-700 text-gray-500'
              }`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Employee Grid */}
      {filteredEmployees.length === 0 ? (
        <div className="text-center py-12 bg-white/60 dark:bg-zinc-900/60 rounded-2xl border border-dashed border-gray-300 dark:border-zinc-800 p-6">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-3 opacity-60" />
          <p className="text-gray-600 dark:text-zinc-400 font-medium">No employees found</p>
          <p className="text-gray-400 dark:text-zinc-500 text-sm mt-1">Try another search keyword or department filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {filteredEmployees.map((emp) => (
            <EmployeeCard
              key={emp.id}
              employee={emp}
              onClick={() => onSelectEmployee(emp)}
              onLongPress={() => onQuickAdd(emp)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

