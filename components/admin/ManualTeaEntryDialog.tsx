'use client'

import { FormEvent, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarClock, Check, Clock3, Coffee, Minus, Plus, Search, X } from 'lucide-react'
import { toast } from 'sonner'
import { addTeaEntry } from '@/lib/actions/entries'
import { formatBDT, getTeaIcon } from '@/lib/utils'

type Employee = {
  id: number
  name: string
  department: string | null
}

type TeaType = {
  id: number
  name: string
  price: string
}

interface ManualTeaEntryDialogProps {
  employees: Employee[]
  teaTypes: TeaType[]
  triggerLabel?: string
  compact?: boolean
}

function getDhakaDateTimeValue() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Dhaka',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date())
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${value.year}-${value.month}-${value.day}T${value.hour}:${value.minute}`
}

function dhakaLocalToIso(value: string) {
  return new Date(`${value}:00+06:00`).toISOString()
}

export function ManualTeaEntryDialog({
  employees,
  teaTypes,
  triggerLabel = 'Add Tea Entry',
  compact = false,
}: ManualTeaEntryDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [employeeId, setEmployeeId] = useState<number | null>(null)
  const [teaTypeId, setTeaTypeId] = useState<number>(teaTypes[0]?.id || 0)
  const [quantity, setQuantity] = useState(1)
  const [sugarLevel, setSugarLevel] = useState('normal')
  const [note, setNote] = useState('')
  const [timeMode, setTimeMode] = useState<'now' | 'custom'>('now')
  const [customDateTime, setCustomDateTime] = useState(getDhakaDateTimeValue)
  const [search, setSearch] = useState('')

  const selectedEmployee = employees.find((employee) => employee.id === employeeId)
  const selectedTea = teaTypes.find((tea) => tea.id === teaTypeId)
  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return employees
    return employees.filter(
      (employee) =>
        employee.name.toLowerCase().includes(query) ||
        employee.department?.toLowerCase().includes(query)
    )
  }, [employees, search])

  const closeDialog = () => {
    if (!isPending) setOpen(false)
  }

  const resetForm = () => {
    setEmployeeId(null)
    setTeaTypeId(teaTypes[0]?.id || 0)
    setQuantity(1)
    setSugarLevel('normal')
    setNote('')
    setTimeMode('now')
    setCustomDateTime(getDhakaDateTimeValue())
    setSearch('')
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!employeeId) {
      toast.error('Please select an employee')
      return
    }
    if (!teaTypeId) {
      toast.error('Please select a tea type')
      return
    }
    if (timeMode === 'custom' && !customDateTime) {
      toast.error('Please choose a date and time')
      return
    }

    startTransition(async () => {
      const result = await addTeaEntry({
        employee_id: employeeId,
        tea_type_id: teaTypeId,
        quantity,
        sugar_level: sugarLevel,
        note: note.trim() || undefined,
        entry_at: timeMode === 'custom' ? dhakaLocalToIso(customDateTime) : undefined,
      })

      if (result.error) {
        toast.error(typeof result.error === 'string' ? result.error : 'Could not add the tea entry')
        return
      }

      toast.success(`Tea entry added for ${selectedEmployee?.name}`)
      setOpen(false)
      resetForm()
      router.refresh()
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setCustomDateTime(getDhakaDateTimeValue())
          setOpen(true)
        }}
        className={`inline-flex items-center justify-center gap-2 bg-[#10594f] hover:bg-[#0b473f] text-white font-semibold rounded-xl shadow-[0_10px_25px_-12px_rgba(16,89,79,0.8)] transition-all hover:-translate-y-0.5 ${
          compact ? 'px-3.5 py-2 text-xs' : 'px-4 py-2.5 text-sm'
        }`}
      >
        <Plus className="w-4 h-4" />
        <span>{triggerLabel}</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#071c17]/65 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDialog()
          }}
        >
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-3xl max-h-[94vh] overflow-y-auto rounded-[28px] border border-white/70 bg-[#f7f8f3]/95 dark:bg-zinc-900/95 shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 px-5 sm:px-7 py-5 bg-[#f7f8f3]/95 dark:bg-zinc-900/95 backdrop-blur-xl border-b border-emerald-950/10 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#10594f] text-white flex items-center justify-center shadow-lg">
                  <Coffee className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#143c34] dark:text-white">Add tea entry</h2>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">Record it now or for any past date and time</p>
                </div>
              </div>
              <button type="button" onClick={closeDialog} className="p-2 rounded-xl text-gray-500 hover:bg-black/5 dark:hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-7 space-y-6">
              <section>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-bold text-[#143c34] dark:text-zinc-100">1. Select employee</label>
                  {selectedEmployee && <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Selected: {selectedEmployee.name}</span>}
                </div>
                <div className="relative mb-3">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by name or department..."
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/80 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-sm outline-none focus:ring-2 focus:ring-emerald-600/25 focus:border-emerald-700"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                  {filteredEmployees.map((employee) => {
                    const selected = employee.id === employeeId
                    return (
                      <button
                        key={employee.id}
                        type="button"
                        onClick={() => setEmployeeId(employee.id)}
                        className={`flex items-center justify-between gap-3 text-left p-3 rounded-xl border transition-all ${
                          selected
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-sm'
                            : 'bg-white/70 dark:bg-zinc-800/70 border-gray-200 dark:border-zinc-700 hover:border-emerald-300'
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{employee.name}</p>
                          <p className="text-[11px] text-gray-500 dark:text-zinc-400 truncate">{employee.department || 'General'}</p>
                        </div>
                        <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${selected ? 'bg-[#10594f] border-[#10594f] text-white' : 'border-gray-300'}`}>
                          {selected && <Check className="w-3 h-3" />}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </section>

              <section>
                <label className="block text-sm font-bold text-[#143c34] dark:text-zinc-100 mb-3">2. Choose beverage</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {teaTypes.map((tea) => {
                    const selected = tea.id === teaTypeId
                    return (
                      <button
                        key={tea.id}
                        type="button"
                        onClick={() => setTeaTypeId(tea.id)}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          selected
                            ? 'bg-[#10594f] border-[#10594f] text-white shadow-lg'
                            : 'bg-white/75 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 hover:border-emerald-400'
                        }`}
                      >
                        <span className="text-2xl">{getTeaIcon(tea.name)}</span>
                        <p className={`mt-2 text-xs font-bold truncate ${selected ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{tea.name}</p>
                        <p className={`text-[11px] mt-0.5 ${selected ? 'text-emerald-100' : 'text-gray-500'}`}>{formatBDT(parseFloat(tea.price))}</p>
                      </button>
                    )
                  })}
                </div>
              </section>

              <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#143c34] dark:text-zinc-100 mb-3">3. Quantity</label>
                  <div className="h-12 flex items-center justify-between rounded-xl bg-white/80 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 p-1">
                    <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-zinc-700"><Minus className="w-4 h-4" /></button>
                    <strong className="text-lg text-[#143c34] dark:text-white">{quantity}</strong>
                    <button type="button" onClick={() => setQuantity((value) => Math.min(20, value + 1))} className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-zinc-700"><Plus className="w-4 h-4" /></button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#143c34] dark:text-zinc-100 mb-3">Sugar level</label>
                  <select value={sugarLevel} onChange={(event) => setSugarLevel(event.target.value)} className="w-full h-12 px-4 rounded-xl bg-white/80 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-sm outline-none focus:border-emerald-700">
                    <option value="none">No sugar</option>
                    <option value="less">Less sugar</option>
                    <option value="normal">Normal sugar</option>
                    <option value="extra">Extra sugar</option>
                  </select>
                </div>
              </section>

              <section>
                <label className="block text-sm font-bold text-[#143c34] dark:text-zinc-100 mb-3">4. When was it served?</label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button type="button" onClick={() => setTimeMode('now')} className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${timeMode === 'now' ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500' : 'bg-white/70 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700'}`}>
                    <Clock3 className="w-5 h-5 text-emerald-700" />
                    <div><p className="text-sm font-bold text-gray-900 dark:text-white">Right now</p><p className="text-[11px] text-gray-500">Use current Dhaka time</p></div>
                  </button>
                  <button type="button" onClick={() => setTimeMode('custom')} className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${timeMode === 'custom' ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-500' : 'bg-white/70 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700'}`}>
                    <CalendarClock className="w-5 h-5 text-amber-700" />
                    <div><p className="text-sm font-bold text-gray-900 dark:text-white">Choose date & time</p><p className="text-[11px] text-gray-500">Add for any day</p></div>
                  </button>
                </div>
                {timeMode === 'custom' && (
                  <div className="mt-3 p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50">
                    <label className="block text-xs font-semibold text-amber-900 dark:text-amber-200 mb-2">Date and time (Asia/Dhaka)</label>
                    <input
                      type="datetime-local"
                      required
                      value={customDateTime}
                      max={getDhakaDateTimeValue()}
                      onChange={(event) => setCustomDateTime(event.target.value)}
                      className="w-full h-11 px-3 rounded-xl bg-white dark:bg-zinc-800 border border-amber-200 dark:border-amber-800 text-sm outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                )}
              </section>

              <section>
                <label className="block text-sm font-bold text-[#143c34] dark:text-zinc-100 mb-2">Note <span className="font-normal text-gray-400">(optional)</span></label>
                <textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={250} rows={2} placeholder="Add a short note..." className="w-full px-4 py-3 rounded-xl bg-white/80 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-sm resize-none outline-none focus:border-emerald-700" />
              </section>
            </div>

            <div className="sticky bottom-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 sm:px-7 py-4 bg-white/90 dark:bg-zinc-900/95 backdrop-blur-xl border-t border-gray-200 dark:border-zinc-800">
              <div className="text-xs text-gray-500 dark:text-zinc-400">
                Total <strong className="ml-1 text-lg text-[#143c34] dark:text-white">{formatBDT((parseFloat(selectedTea?.price || '0') || 0) * quantity)}</strong>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={closeDialog} className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 text-sm font-semibold text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800">Cancel</button>
                <button type="submit" disabled={isPending || !employeeId} className="min-w-36 px-5 py-2.5 rounded-xl bg-[#10594f] hover:bg-[#0b473f] text-white text-sm font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                  {isPending ? 'Saving...' : 'Save tea entry'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
