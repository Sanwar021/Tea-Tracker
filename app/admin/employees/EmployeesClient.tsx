'use client'

import { useState, useMemo, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users,
  ShieldCheck,
  PauseCircle,
  Plus,
  FileDown,
  Moon,
  Sun,
  Search,
  Edit2,
  CheckCircle2,
  X,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { createEmployee, updateEmployee } from '@/lib/actions/employees'
import { toast } from 'sonner'
import { downloadExcel } from '@/lib/exportExcel'

interface EmployeeData {
  id: number
  serial_no: number
  name: string
  department: string | null
  email: string | null
  status: 'active' | 'inactive'
  today_cups: number
}

export function EmployeesClient({ initialEmployees }: { initialEmployees: EmployeeData[] }) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [employees, setEmployees] = useState(initialEmployees)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<EmployeeData | null>(null)
  const [, startTransition] = useTransition()

  // Form state
  const [formName, setFormName] = useState('')
  const [formDept, setFormDept] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formSerial, setFormSerial] = useState<number>(employees.length + 1)
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active')
  const [loading, setLoading] = useState(false)

  // Stats calculation
  const totalEmployees = employees.length
  const activeCount = employees.filter((e) => e.status === 'active').length
  const inactiveCount = employees.filter((e) => e.status === 'inactive').length

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      const matchSearch =
        search === '' ||
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        (e.department && e.department.toLowerCase().includes(search.toLowerCase())) ||
        (e.email && e.email.toLowerCase().includes(search.toLowerCase())) ||
        e.serial_no.toString().includes(search)

      const matchStatus = statusFilter === 'all' || e.status === statusFilter

      return matchSearch && matchStatus
    })
  }, [employees, search, statusFilter])

  // Reset form
  const resetForm = () => {
    setFormName('')
    setFormDept('')
    setFormEmail('')
    setFormSerial(employees.length + 1)
    setFormStatus('active')
    setEditingEmployee(null)
  }

  // Open Edit
  const openEdit = (emp: EmployeeData) => {
    setEditingEmployee(emp)
    setFormName(emp.name)
    setFormDept(emp.department || '')
    setFormEmail(emp.email || '')
    setFormSerial(emp.serial_no)
    setFormStatus(emp.status)
    setIsAddModalOpen(true)
  }

  // Handle Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim()) {
      toast.error('Employee name is required')
      return
    }

    setLoading(true)
    try {
      if (editingEmployee) {
        const res = await updateEmployee(editingEmployee.id, {
          name: formName.trim(),
          department: formDept.trim() || undefined,
          email: formEmail.trim() || undefined,
          serial_no: Number(formSerial),
          status: formStatus,
        })
        if (res.error) throw new Error(JSON.stringify(res.error))
        toast.success('Employee updated successfully')
      } else {
        const res = await createEmployee({
          name: formName.trim(),
          department: formDept.trim() || undefined,
          email: formEmail.trim() || undefined,
          serial_no: Number(formSerial),
          status: formStatus,
        })
        if (res.error) throw new Error(JSON.stringify(res.error))
        toast.success('Employee added successfully')
      }

      setIsAddModalOpen(false)
      resetForm()
      startTransition(() => {
        router.refresh()
      })
    } catch (err: any) {
      toast.error(err.message || 'Operation failed')
    } finally {
      setLoading(false)
    }
  }

  // Toggle status
  const handleToggleStatus = async (emp: EmployeeData) => {
    const nextStatus = emp.status === 'active' ? 'inactive' : 'active'
    const res = await updateEmployee(emp.id, { status: nextStatus })
    if (res.error) {
      toast.error('Failed to change status')
      return
    }
    toast.success(`Marked as ${nextStatus}`)
    setEmployees((prev) =>
      prev.map((e) => (e.id === emp.id ? { ...e, status: nextStatus } : e))
    )
    startTransition(() => {
      router.refresh()
    })
  }

  // Export to Excel
  const handleExportExcel = async () => {
    const dataToExport = filteredEmployees.map((e) => ({
      'Serial No': e.serial_no,
      'Name': e.name,
      'Department': e.department || 'N/A',
      'Email': e.email || 'N/A',
      'Status': e.status,
      "Today's Cups": e.today_cups,
    }))

    try {
      await downloadExcel(dataToExport, 'Employees', `FAME_IT_Employees_${new Date().toISOString().slice(0, 10)}.xlsx`)
      toast.success('Excel downloaded successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Excel export failed')
    }
  }

  // Print PDF view
  const handlePrintPDF = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      {/* Top Header matching UI screenshot */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-zinc-50 tracking-tight">
            Employees
          </h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            People devices and stationery can be assigned to
          </p>
        </div>

        {/* Action Buttons matching screenshot */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              resetForm()
              setIsAddModalOpen(true)
            }}
            className="flex items-center gap-2 bg-[#102d20] hover:bg-[#184431] text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Employee</span>
          </button>

          <button
            onClick={handlePrintPDF}
            className="flex items-center gap-2 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-200 border border-gray-200 dark:border-zinc-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm"
          >
            <FileDown className="w-4 h-4 text-gray-500" />
            <span>Download PDF</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-200 border border-gray-200 dark:border-zinc-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm"
          >
            <FileDown className="w-4 h-4 text-emerald-600" />
            <span>Download Excel</span>
          </button>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2.5 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-200 border border-gray-200 dark:border-zinc-700 rounded-xl transition-all shadow-sm"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-gray-600" />}
          </button>
        </div>
      </div>

      {/* 3 Stats Cards row matching screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total employees */}
        <div className="bg-[#fcfaf7] dark:bg-zinc-800/60 border border-gray-200/80 dark:border-zinc-700/60 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-3 text-gray-500 dark:text-zinc-400 mb-2">
            <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-zinc-700 flex items-center justify-center">
              <Users className="w-4 h-4 text-gray-600 dark:text-zinc-300" />
            </div>
            <span className="text-xs uppercase font-medium tracking-wide">Total employees</span>
          </div>
          <div className="text-3xl font-extrabold text-gray-900 dark:text-zinc-100 pl-1">
            {totalEmployees}
          </div>
        </div>

        {/* Active */}
        <div className="bg-[#fcfaf7] dark:bg-zinc-800/60 border border-gray-200/80 dark:border-zinc-700/60 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-3 text-gray-500 dark:text-zinc-400 mb-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-xs uppercase font-medium tracking-wide">Active</span>
          </div>
          <div className="text-3xl font-extrabold text-gray-900 dark:text-zinc-100 pl-1">
            {activeCount}
          </div>
        </div>

        {/* Inactive */}
        <div className="bg-[#fcfaf7] dark:bg-zinc-800/60 border border-gray-200/80 dark:border-zinc-700/60 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-3 text-gray-500 dark:text-zinc-400 mb-2">
            <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-zinc-700 flex items-center justify-center">
              <PauseCircle className="w-4 h-4 text-gray-500 dark:text-zinc-400" />
            </div>
            <span className="text-xs uppercase font-medium tracking-wide">Inactive</span>
          </div>
          <div className="text-3xl font-extrabold text-gray-900 dark:text-zinc-100 pl-1">
            {inactiveCount}
          </div>
        </div>
      </div>

      {/* Table Card matching screenshot */}
      <div className="bg-white/80 dark:bg-zinc-900/80 border border-gray-200/70 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
        {/* Table Filter Top Bar */}
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-lg font-serif font-bold text-gray-900 dark:text-zinc-100">
              All employees
            </span>
            <span className="ml-2 text-xs text-gray-400 dark:text-zinc-500 font-medium">
              {filteredEmployees.length} employees
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email, department..."
                className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 w-56 sm:w-64"
              />
            </div>

            {/* Status Select */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs py-1.5 px-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 focus:outline-none"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Table Rows */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#faf9f6] dark:bg-zinc-800/40 text-[11px] uppercase tracking-wider text-gray-400 dark:text-zinc-400 border-b border-gray-100 dark:border-zinc-800 font-semibold">
              <tr>
                <th className="py-3 px-5">Name</th>
                <th className="py-3 px-5">Email</th>
                <th className="py-3 px-5">Department</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-center">Cups Today</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60 font-sans">
              {filteredEmployees.map((emp) => (
                <tr
                  key={emp.id}
                  className="hover:bg-gray-50/70 dark:hover:bg-zinc-800/40 transition-colors text-xs sm:text-sm"
                >
                  <td className="py-3.5 px-5 font-semibold text-gray-900 dark:text-zinc-100">
                    {emp.name}
                  </td>
                  <td className="py-3.5 px-5 text-gray-400 dark:text-zinc-500">
                    {emp.email || '—'}
                  </td>
                  <td className="py-3.5 px-5 text-gray-600 dark:text-zinc-300">
                    {emp.department || '—'}
                  </td>
                  <td className="py-3.5 px-5">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        emp.status === 'active'
                          ? 'bg-[#dcfce7] text-[#15803d] dark:bg-emerald-950/70 dark:text-emerald-300'
                          : 'bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-zinc-400'
                      }`}
                    >
                      {emp.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-center font-bold text-gray-800 dark:text-zinc-200">
                    {emp.today_cups}
                  </td>
                  <td className="py-3.5 px-5 text-right space-x-1">
                    <button
                      onClick={() => openEdit(emp)}
                      title="Edit Employee"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(emp)}
                      title={emp.status === 'active' ? 'Deactivate' : 'Activate'}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
                    >
                      {emp.status === 'active' ? (
                        <PauseCircle className="w-3.5 h-3.5" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Add / Edit Employee */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-zinc-800">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-zinc-800 mb-4">
              <h3 className="font-serif font-bold text-lg text-gray-900 dark:text-zinc-100">
                {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  Serial No
                </label>
                <input
                  type="number"
                  value={formSerial}
                  onChange={(e) => setFormSerial(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Dr Arshi Tasnim"
                  required
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={formDept}
                  onChange={(e) => setFormDept(e.target.value)}
                  placeholder="e.g. IT, Admin, Upasham Plus"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  Email (optional)
                </label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="e.g. name@famenetworks.net"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  Status
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as 'active' | 'inactive')}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-xs font-bold bg-[#102d20] hover:bg-[#184431] text-white rounded-xl shadow-sm transition-all"
                >
                  {loading ? 'Saving...' : editingEmployee ? 'Update Employee' : 'Create Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
