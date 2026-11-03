'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp, ChevronDown, Clock, Undo2, Coffee } from 'lucide-react'
import { formatDhakaTime, formatBDT, getTeaIcon } from '@/lib/utils'

interface TodayEntry {
  id: number
  employee_id: number
  employee_name: string | null
  tea_type_name: string | null
  quantity: number
  sugar_level: string
  unit_price: string
  entry_at: Date | string
  created_by: string
}

interface TodayLogProps {
  entries: TodayEntry[]
  onUndo: (id: number) => Promise<void>
}

export function TodayLog({ entries, onUndo }: TodayLogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [undoingId, setUndoingId] = useState<number | null>(null)

  const totalCups = entries.reduce((acc, curr) => acc + curr.quantity, 0)
  const totalAmount = entries.reduce(
    (acc, curr) => acc + parseFloat(curr.unit_price) * curr.quantity,
    0
  )

  const handleUndo = async (id: number) => {
    setUndoingId(id)
    try {
      await onUndo(id)
    } finally {
      setUndoingId(null)
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto z-30 px-3 pb-2 sm:pb-4 pointer-events-none">
      <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-gray-200/80 dark:border-zinc-800 shadow-xl rounded-2xl overflow-hidden pointer-events-auto transition-all">
        {/* Toggle Bar */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-zinc-800/60 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-400 flex items-center justify-center font-bold text-sm">
              <Coffee className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-gray-900 dark:text-zinc-100">Today&apos;s Served Log</span>
                <span className="bg-primary-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {totalCups} {totalCups === 1 ? 'cup' : 'cups'}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                {entries.length} orders • {formatBDT(totalAmount)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-gray-400 text-xs font-medium">
            <span>{isOpen ? 'Hide' : 'View'}</span>
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </div>
        </button>

        {/* Collapsible Content */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-gray-100 dark:border-zinc-800 max-h-72 overflow-y-auto"
            >
              {entries.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-400">
                  No tea served yet today. Tap an employee card to start!
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-zinc-800/60 p-2 space-y-1">
                  {entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{getTeaIcon(entry.tea_type_name || '')}</span>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-zinc-100 flex items-center gap-1.5">
                            <span>{entry.employee_name}</span>
                            <span className="text-xs font-semibold px-1.5 py-0.2 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 rounded">
                              x{entry.quantity}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                            <span>{entry.tea_type_name}</span>
                            <span>•</span>
                            <span className="capitalize">{entry.sugar_level} sugar</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-gray-400" />
                              {formatDhakaTime(entry.entry_at)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                          {formatBDT(parseFloat(entry.unit_price) * entry.quantity)}
                        </span>
                        <button
                          onClick={() => handleUndo(entry.id)}
                          disabled={undoingId === entry.id}
                          title="Undo order"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all touch-target flex items-center justify-center"
                        >
                          <Undo2 className={`w-4 h-4 ${undoingId === entry.id ? 'animate-spin' : ''}`} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

