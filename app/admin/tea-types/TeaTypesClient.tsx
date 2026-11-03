'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit2, CheckCircle2, PauseCircle, X } from 'lucide-react'
import { getTeaIcon, formatBDT } from '@/lib/utils'
import { updateTeaType, createTeaType } from '@/lib/actions/teaTypes'
import { toast } from 'sonner'

interface TeaType {
  id: number
  name: string
  price: string
  is_active: boolean
  sort_order: number
}

export function TeaTypesClient({ initialTeaTypes }: { initialTeaTypes: TeaType[] }) {
  const router = useRouter()
  const [teaTypes, setTeaTypes] = useState(initialTeaTypes)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingType, setEditingType] = useState<TeaType | null>(null)
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(false)
  const [, startTransition] = useTransition()

  const openAdd = () => {
    setEditingType(null)
    setName('')
    setPrice('10')
    setIsActive(true)
    setIsModalOpen(true)
  }

  const openEdit = (t: TeaType) => {
    setEditingType(t)
    setName(t.name)
    setPrice(t.price)
    setIsActive(t.is_active)
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !price) {
      toast.error('Name and price are required')
      return
    }

    setLoading(true)
    try {
      if (editingType) {
        const res = await updateTeaType(editingType.id, {
          name: name.trim(),
          price: Number(price).toString(),
          is_active: isActive,
        })
        if (res.error) throw new Error('Update failed')
        toast.success('Tea type updated')
      } else {
        const res = await createTeaType({
          name: name.trim(),
          price: Number(price).toString(),
          is_active: isActive,
          sort_order: teaTypes.length + 1,
        })
        if (res.error) throw new Error('Creation failed')
        toast.success('New tea type added')
      }

      setIsModalOpen(false)
      startTransition(() => {
        router.refresh()
      })
    } catch {
      toast.error('Operation failed')
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (t: TeaType) => {
    const next = !t.is_active
    const res = await updateTeaType(t.id, { is_active: next })
    if (res.error) {
      toast.error('Failed to change status')
      return
    }
    toast.success(`${t.name} is now ${next ? 'Active' : 'Inactive'}`)
    setTeaTypes((prev) =>
      prev.map((item) => (item.id === t.id ? { ...item, is_active: next } : item))
    )
    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-zinc-50 tracking-tight">
            Tea Types & Prices
          </h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            Price changes only affect new entries (existing entries retain snapshot prices)
          </p>
        </div>

        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#102d20] hover:bg-[#184431] text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Beverage</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {teaTypes.map((t) => (
          <div
            key={t.id}
            className={`p-5 rounded-2xl border transition-all ${
              t.is_active
                ? 'bg-white/80 dark:bg-zinc-800/80 border-gray-200/80 dark:border-zinc-700/60 shadow-xs'
                : 'bg-gray-50 dark:bg-zinc-900/50 border-gray-200 dark:border-zinc-800 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-3xl">{getTeaIcon(t.name)}</span>
              <button
                onClick={() => handleToggle(t)}
                title={t.is_active ? 'Deactivate' : 'Activate'}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
              >
                {t.is_active ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <PauseCircle className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>

            <h3 className="font-serif font-bold text-lg text-gray-900 dark:text-zinc-100">
              {t.name}
            </h3>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-zinc-700/60">
              <div>
                <span className="text-xs text-gray-400">Unit Price</span>
                <div className="text-xl font-extrabold text-emerald-800 dark:text-emerald-400">
                  {formatBDT(t.price)}
                </div>
              </div>

              <button
                onClick={() => openEdit(t)}
                className="p-2 text-xs font-semibold text-gray-600 dark:text-zinc-300 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl transition-colors flex items-center gap-1"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 dark:border-zinc-800">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800 mb-4">
              <h3 className="font-serif font-bold text-lg text-gray-900 dark:text-zinc-100">
                {editingType ? 'Edit Beverage' : 'Add Beverage'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  Beverage Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ginger Tea"
                  required
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  Price (BDT)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                  Active
                </label>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-xs font-bold bg-[#102d20] hover:bg-[#184431] text-white rounded-xl"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

