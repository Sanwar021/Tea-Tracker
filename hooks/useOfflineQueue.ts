'use client'

import { useCallback, useEffect, useState } from 'react'
import { openDB, type IDBPDatabase } from 'idb'

interface QueuedEntry {
  local_id: string
  employee_id: number
  tea_type_id: number
  quantity: number
  sugar_level: 'none' | 'less' | 'normal' | 'extra'
  note?: string | null
  entry_at: string
  created_at: number
}

const DB_NAME = 'tea-counter-offline'
const STORE_NAME = 'queued-entries'

async function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'local_id' })
      }
    },
  })
}

export function useOfflineQueue() {
  const [pendingCount, setPendingCount] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? navigator.onLine : true)

  const refreshCount = useCallback(async () => {
    try {
      const db = await getDB()
      const count = await db.count(STORE_NAME)
      setPendingCount(count)
    } catch {}
  }, [])

  const enqueue = useCallback(async (entry: Omit<QueuedEntry, 'local_id' | 'created_at'>) => {
    const local_id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    const db = await getDB()
    await db.put(STORE_NAME, { ...entry, local_id, created_at: Date.now() })
    await refreshCount()
    return local_id
  }, [refreshCount])

  const sync = useCallback(async () => {
    if (isSyncing || !isOnline) return
    setIsSyncing(true)
    try {
      const db = await getDB()
      const all = await db.getAll(STORE_NAME)
      if (all.length === 0) { setIsSyncing(false); return }

      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries: all }),
      })

      if (res.ok) {
        const { results } = await res.json()
        const tx = db.transaction(STORE_NAME, 'readwrite')
        for (const r of results) {
          if (r.id && !r.error) await tx.store.delete(r.local_id)
        }
        await tx.done
        await refreshCount()
      }
    } catch {
      // Will retry when online
    } finally {
      setIsSyncing(false)
    }
  }, [isSyncing, isOnline, refreshCount])

  useEffect(() => {
    refreshCount()
    const handleOnline = () => { setIsOnline(true); sync() }
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [refreshCount, sync])

  return { pendingCount, isSyncing, isOnline, enqueue, sync }
}
