'use client'

import { WifiOff, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface OfflineBannerProps {
  isOnline: boolean
  pendingCount: number
  isSyncing: boolean
  onSync: () => void
}

export function OfflineBanner({ isOnline, pendingCount, isSyncing, onSync }: OfflineBannerProps) {
  const showBanner = !isOnline || pendingCount > 0

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          className={`flex items-center justify-between px-4 py-2 text-sm font-medium ${
            !isOnline ? 'bg-red-500 text-white' : 'bg-amber-400 text-amber-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <WifiOff size={14} />
            {!isOnline
              ? `Offline mode — ${pendingCount} entries queued`
              : `${pendingCount} entries pending sync`
            }
          </div>
          {isOnline && pendingCount > 0 && (
            <button
              onClick={onSync}
              disabled={isSyncing}
              className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-900/20 hover:bg-amber-900/30 transition-colors"
            >
              <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
              {isSyncing ? 'Syncing...' : 'Sync now'}
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
