'use client'

import { useCallback, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Coffee, Delete, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const MAX_PIN = 4
const KEYS = [['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], ['', '0', 'del']]

export default function CounterLoginPage() {
  const router = useRouter()
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [shake, setShake] = useState(false)
  const [error, setError] = useState('')

  const submitPin = useCallback(async (value: string) => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/auth/counter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pin: value }) })
      const data = await response.json()
      if (response.ok) {
        toast.success('Welcome! Opening counter...')
        router.push('/counter')
      } else {
        setError(data.error || 'Invalid PIN')
        setShake(true)
        setPin('')
        window.setTimeout(() => setShake(false), 600)
      }
    } catch {
      toast.error('Network error. Please try again.')
      setPin('')
    } finally {
      setLoading(false)
    }
  }, [router])

  const handleDigit = useCallback((digit: string) => {
    setError('')
    if (pin.length >= MAX_PIN) return
    const nextPin = pin + digit
    setPin(nextPin)
    if (nextPin.length === MAX_PIN) window.setTimeout(() => submitPin(nextPin), 100)
  }, [pin, submitPin])

  const handleDelete = useCallback(() => {
    setPin((value) => value.slice(0, -1))
    setError('')
  }, [])

  return (
    <main className="admin-login-3d min-h-screen relative overflow-hidden bg-[#06131b]">
      <Image src="/cappuccino-login-hero.png" alt="Premium cappuccino with latte art in a modern cafe" fill priority quality={88} sizes="100vw" className="object-cover object-[68%_center]" />
      <div className="absolute inset-0 login-cinema-overlay" />
      <div className="absolute inset-0 login-light-grid" />
      <div className="login-orb login-orb-one" />
      <div className="login-orb login-orb-two" />

      <div className="relative z-10 min-h-screen w-full max-w-[1500px] mx-auto px-4 sm:px-7 lg:px-12 py-6 sm:py-8 flex flex-col">
        <header className="flex items-center gap-3 text-white">
          <div className="w-11 h-11 rounded-2xl bg-cyan-400/15 border border-cyan-200/30 backdrop-blur-xl flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,.3),0_12px_35px_rgba(0,181,226,.18)]"><span className="text-xs font-black tracking-wide">FIN</span></div>
          <p className="text-xs sm:text-sm font-black tracking-[.08em]">FAME IT NETWORKS</p>
        </header>

        <div className="flex-1 grid lg:grid-cols-[440px_minmax(0,1fr)] items-center gap-8 lg:gap-14 py-7 lg:py-10">
          <motion.section initial={{ opacity: 0, x: -32, rotateY: 8 }} animate={{ opacity: 1, x: 0, rotateY: 4 }} whileHover={{ rotateY: 0, y: -4 }} transition={{ duration: .65, type: 'spring', stiffness: 90 }} className="login-card-3d w-full max-w-[440px] mx-auto lg:mx-0 lg:mr-auto">
            <motion.div animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}} transition={{ duration: .4 }} className="login-card-inner login-card-reference counter-login-reference px-7 pb-6 pt-12 sm:px-10 sm:pb-7 sm:pt-14">
              <div className="login-profile-medallion counter-profile-medallion">
                <div className="login-profile-glow" />
                <Coffee className="relative z-10 w-10 h-10 text-cyan-100/85" strokeWidth={1.4} />
              </div>

              <div className="text-center mb-5">
                <p className="text-[10px] uppercase tracking-[.28em] text-cyan-200/60 font-bold">Counter access</p>
                <h1 className="text-3xl font-serif font-bold tracking-[-.035em] text-white mt-2">Enter your PIN</h1>
              </div>

              <div className="flex justify-center gap-4 mb-5" aria-label={`${pin.length} of ${MAX_PIN} PIN digits entered`}>
                {Array.from({ length: MAX_PIN }).map((_, index) => <motion.span key={index} animate={{ scale: pin.length > index ? 1.18 : 1 }} className={`counter-pin-dot ${pin.length > index ? 'is-filled' : ''}`} />)}
              </div>

              <AnimatePresence mode="wait">
                {error && <motion.p key="error" role="alert" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-rose-300 text-xs text-center mb-3 font-medium">{error}</motion.p>}
              </AnimatePresence>

              <div className="counter-keypad grid grid-cols-3 gap-2.5">
                {KEYS.flat().map((key, index) => {
                  if (!key) return <span key={`empty-${index}`} />
                  if (key === 'del') return <button key={key} type="button" aria-label="Delete last digit" onClick={handleDelete} disabled={loading || pin.length === 0} className="counter-key counter-key-delete disabled:opacity-35"><Delete size={19} /></button>
                  return <motion.button key={`${key}-${index}`} type="button" whileTap={{ scale: .92 }} onClick={() => handleDigit(key)} disabled={loading} className="counter-key disabled:opacity-35">{key}</motion.button>
                })}
              </div>

              <div className="h-6 mt-3 flex items-center justify-center">{loading && <Loader2 className="animate-spin text-cyan-300" size={20} />}</div>
              <Link href="/admin-login" className="mt-1 w-full min-h-10 flex items-center justify-center gap-2 text-[11px] font-semibold text-slate-200/45 hover:text-white transition-all"><ArrowLeft size={13} /> Admin login</Link>
            </motion.div>
          </motion.section>
        </div>
      </div>
    </main>
  )
}
