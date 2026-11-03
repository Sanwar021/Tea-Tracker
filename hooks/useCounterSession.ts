'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function useCounterSession() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const logout = async () => {
    setIsLoading(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/counter-login')
    } finally {
      setIsLoading(false)
    }
  }

  return { logout, isLoading }
}
