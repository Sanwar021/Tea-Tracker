'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Plus, Loader2 } from 'lucide-react'
import { cn, getInitials, getAvatarColor, getTeaIcon } from '@/lib/utils'

interface TeaType {
  id: number
  name: string
  price: string
}

interface Employee {
  id: number
  name: string
  department: string | null
}

interface TeaBottomSheetProps {
  employee: Employee | null
  teaTypes: TeaType[]
  onClose: () => void
  onSubmit: (data: {
    employee_id: number
    tea_type_id: number
    quantity: number
    sugar_level: 'none' | 'less' | 'normal' | 'extra'
    note?: string
  }) => Promise<void>
  lastTeaTypeId?: number
}

const SUGAR_LEVELS = [
  { key: 'none' as const, label: 'No Sugar' },
  { key: 'less' as const, label: 'Less' },
  { key: 'normal' as const, label: 'Normal' },
  { key: 'extra' as const, label: 'Extra' },
]

export function TeaBottomSheet({ employee, teaTypes, onClose, onSubmit, lastTeaTypeId }: TeaBottomSheetProps) {
  const [selectedTeaId, setSelectedTeaId] = useState<number>(lastTeaTypeId || teaTypes[0]?.id || 1)
  const [quantity, setQuantity] = useState(1)
  const [sugarLevel, setSugarLevel] = useState<'none' | 'less' | 'normal' | 'extra'>('normal')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (lastTeaTypeId) setSelectedTeaId(lastTeaTypeId)
  }, [lastTeaTypeId])

  if (!employee) return null

  const selectedTea = teaTypes.find((t) => t.id === selectedTeaId)
  const total = (parseFloat(selectedTea?.price || '0') * quantity).toFixed(0)

  const handleSubmit = async () => {
    if (!employee || loading) return
    setLoading(true)
    try {
      await onSubmit({
        employee_id: employee.id,
        tea_type_id: selectedTeaId,
        quantity,
        sugar_level: sugarLevel,
        note: note.trim() || undefined,
      })
      setSuccess(true)
      if (navigator.vibrate) navigator.vibrate(100)
      setTimeout(() => {
        setSuccess(false)
        onClose()
      }, 800)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {employee && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg',
                  getAvatarColor(employee.name)
                )}>
                  {getInitials(employee.name)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                  {employee.department && (
                    <p className="text-xs text-gray-500">{employee.department}</p>
                  )}
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Tea Type Selection */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">Select Tea</p>
                <div className="grid grid-cols-2 gap-3">
                  {teaTypes.map((tea) => (
                    <motion.button
                      key={tea.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedTeaId(tea.id)}
                      className={cn(
                        'tea-btn text-left',
                        selectedTeaId === tea.id
                          ? 'border-accent-400 bg-accent-50 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      )}
                    >
                      <span className="text-3xl">{getTeaIcon(tea.name)}</span>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{tea.name}</p>
                        <p className="text-xs text-gray-500">৳{tea.price}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">Quantity</p>
                <div className="flex items-center gap-4">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 rounded-2xl border border-gray-200 flex items-center justify-center hover:border-primary-300 transition-colors"
                  >
                    <Minus size={20} />
                  </motion.button>
                  <span className="text-2xl font-bold text-gray-900 w-12 text-center">{quantity}</span>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setQuantity(Math.min(20, quantity + 1))}
                    className="w-12 h-12 rounded-2xl border border-gray-200 flex items-center justify-center hover:border-primary-300 transition-colors"
                  >
                    <Plus size={20} />
                  </motion.button>
                  <div className="ml-auto text-lg font-bold text-primary-600">৳{total}</div>
                </div>
              </div>

              {/* Sugar Level */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">Sugar Level</p>
                <div className="flex gap-2 flex-wrap">
                  {SUGAR_LEVELS.map((s) => (
                    <button
                      key={s.key}
                      onClick={() => setSugarLevel(s.key)}
                      className={cn('sugar-btn', sugarLevel === s.key ? 'active' : '')}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Note (optional)</p>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Any special request..."
                  rows={2}
                  maxLength={500}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent"
                />
              </div>

              {/* Submit */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmit}
                disabled={loading}
                className={cn(
                  'w-full h-14 rounded-2xl font-bold text-base transition-all duration-300 flex items-center justify-center gap-3',
                  success
                    ? 'bg-green-500 text-white'
                    : 'bg-accent-400 hover:bg-accent-500 text-sidebar-dark'
                )}
              >
                {loading ? (
                  <Loader2 size={22} className="animate-spin" />
                ) : success ? (
                  <>✓ Added!</>
                ) : (
                  <>
                    {getTeaIcon(selectedTea?.name || '')} Add Tea · ৳{total}
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
