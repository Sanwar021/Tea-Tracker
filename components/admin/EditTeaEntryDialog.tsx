'use client'

import { useEffect, useState } from 'react'
import { CalendarClock, Loader2, Pencil, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'

interface EditableEntry {
  id: number
  employee_id: number
  tea_type_id: number
  quantity: number
  sugar_level: string
  note: string | null
  entry_at: Date | string
}

interface Option { id: number; name: string }

function toDhakaInput(value: Date | string) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Dhaka', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date(value))
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value || ''
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`
}

function dhakaInputToIso(value: string) {
  return new Date(`${value}:00+06:00`).toISOString()
}

export function EditTeaEntryDialog({ entry, employees, teaTypes, onChanged }: {
  entry: EditableEntry
  employees: Option[]
  teaTypes: Option[]
  onChanged: () => void
}) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [employeeId, setEmployeeId] = useState(entry.employee_id)
  const [teaTypeId, setTeaTypeId] = useState(entry.tea_type_id)
  const [quantity, setQuantity] = useState(entry.quantity)
  const [sugarLevel, setSugarLevel] = useState(entry.sugar_level)
  const [entryAt, setEntryAt] = useState(toDhakaInput(entry.entry_at))
  const [note, setNote] = useState(entry.note || '')

  useEffect(() => {
    if (!open) return
    setEmployeeId(entry.employee_id)
    setTeaTypeId(entry.tea_type_id)
    setQuantity(entry.quantity)
    setSugarLevel(entry.sugar_level)
    setEntryAt(toDhakaInput(entry.entry_at))
    setNote(entry.note || '')
  }, [entry, open])

  const save = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    try {
      const response = await fetch(`/api/entries/${entry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee_id: employeeId, tea_type_id: teaTypeId, quantity, sugar_level: sugarLevel, entry_at: dhakaInputToIso(entryAt), note: note.trim() || null }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(typeof data.error === 'string' ? data.error : 'Could not update entry')
      toast.success('Tea entry updated')
      setOpen(false)
      onChanged()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not update entry')
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!window.confirm('Delete this tea entry? This will update all report totals.')) return
    setSaving(true)
    try {
      const response = await fetch(`/api/entries/${entry.id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Could not delete entry')
      toast.success('Tea entry deleted')
      setOpen(false)
      onChanged()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not delete entry')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} title="Edit tea entry" aria-label="Edit tea entry" className="shrink-0 w-8 h-8 grid place-items-center rounded-lg border border-gray-200 bg-white/70 text-gray-500 hover:text-emerald-800 hover:border-emerald-300 transition-colors">
        <Pencil className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div className="fixed inset-0 z-[100] bg-slate-950/45 backdrop-blur-sm p-4 grid place-items-center" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false) }}>
          <div role="dialog" aria-modal="true" aria-labelledby={`edit-entry-${entry.id}`} className="w-full max-w-lg rounded-3xl border border-white/70 bg-[#f8fbfc] shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 grid place-items-center"><CalendarClock className="w-5 h-5" /></span>
                <div><h2 id={`edit-entry-${entry.id}`} className="font-serif font-bold text-xl text-slate-900">Edit tea entry</h2><p className="text-xs text-slate-500">Update the necessary record details.</p></div>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="w-9 h-9 grid place-items-center rounded-xl hover:bg-slate-100 text-slate-500"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={save} className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="sm:col-span-2 text-xs font-bold text-slate-600">Employee<select value={employeeId} onChange={(event) => setEmployeeId(Number(event.target.value))} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-900">{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name}</option>)}</select></label>
              <label className="text-xs font-bold text-slate-600">Tea type<select value={teaTypeId} onChange={(event) => setTeaTypeId(Number(event.target.value))} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900">{teaTypes.map((teaType) => <option key={teaType.id} value={teaType.id}>{teaType.name}</option>)}</select></label>
              <label className="text-xs font-bold text-slate-600">Quantity<input type="number" min={1} max={20} value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900" /></label>
              <label className="text-xs font-bold text-slate-600">Date and time<input type="datetime-local" required value={entryAt} onChange={(event) => setEntryAt(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900" /></label>
              <label className="text-xs font-bold text-slate-600">Sugar level<select value={sugarLevel} onChange={(event) => setSugarLevel(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm capitalize text-slate-900"><option value="none">None</option><option value="less">Less</option><option value="normal">Normal</option><option value="extra">Extra</option></select></label>
              <label className="sm:col-span-2 text-xs font-bold text-slate-600">Note<textarea rows={2} maxLength={500} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Optional note" className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900" /></label>
              <div className="sm:col-span-2 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <button type="button" onClick={remove} disabled={saving} className="h-11 px-4 rounded-xl text-sm font-bold text-rose-700 hover:bg-rose-50 inline-flex items-center justify-center gap-2 disabled:opacity-50"><Trash2 className="w-4 h-4" />Delete entry</button>
                <div className="flex gap-2"><button type="button" onClick={() => setOpen(false)} className="h-11 px-4 rounded-xl border border-slate-200 text-sm font-bold text-slate-600">Cancel</button><button type="submit" disabled={saving} className="h-11 min-w-32 px-5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-bold inline-flex items-center justify-center gap-2 disabled:opacity-50">{saving && <Loader2 className="w-4 h-4 animate-spin" />}Save changes</button></div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
