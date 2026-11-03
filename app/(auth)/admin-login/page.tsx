'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Eye, EyeOff, Loader2, LockKeyhole, UserRound } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!password) return
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/auth/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await response.json()
      if (response.ok) {
        toast.success('Welcome, Admin!')
        router.push('/admin')
      } else {
        setError(data.error || 'Invalid password')
        setPassword('')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="admin-login-3d min-h-screen relative overflow-hidden bg-[#06131b]">
      <Image src="/cappuccino-login-hero.png" alt="Premium cappuccino with latte art in a modern café" fill priority quality={88} sizes="100vw" className="object-cover object-[68%_center]" />
      <div className="absolute inset-0 login-cinema-overlay" />
      <div className="absolute inset-0 login-light-grid" />
      <div className="login-orb login-orb-one" />
      <div className="login-orb login-orb-two" />

      <div className="relative z-10 min-h-screen w-full max-w-[1500px] mx-auto px-4 sm:px-7 lg:px-12 py-6 sm:py-8 flex flex-col">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-white">
            <div className="w-11 h-11 rounded-2xl bg-cyan-400/15 border border-cyan-200/30 backdrop-blur-xl flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,.3),0_12px_35px_rgba(0,181,226,.18)]"><span className="text-xs font-black tracking-wide">FIN</span></div>
            <p className="text-xs sm:text-sm font-black tracking-[.08em]">FAME IT NETWORKS</p>
          </div>
        </header>

        <div className="flex-1 grid lg:grid-cols-[440px_minmax(0,1fr)] items-center gap-8 lg:gap-14 py-10 lg:py-14">
          <motion.section initial={{ opacity: 0, x: -32, rotateY: 8 }} animate={{ opacity: 1, x: 0, rotateY: 4 }} whileHover={{ rotateY: 0, rotateX: 0, y: -4 }} transition={{ duration: .65, type: 'spring', stiffness: 90 }} className="login-card-3d w-full max-w-[440px] mx-auto lg:mx-0 lg:mr-auto">
            <div className="login-card-inner login-card-reference px-7 pb-8 pt-16 sm:px-10 sm:pb-10 sm:pt-20">
              <div className="login-profile-medallion">
                <div className="login-profile-glow" />
                <UserRound className="relative z-10 w-12 h-12 text-cyan-100/85" strokeWidth={1.35} />
              </div>

              <div className="text-center mb-9">
                <p className="text-[10px] uppercase tracking-[.28em] text-cyan-200/60 font-bold">Admin console</p>
                <h2 className="text-3xl font-serif font-bold tracking-[-.035em] text-white mt-2">Welcome back</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <div className="login-line-field group">
                    <LockKeyhole className="w-4 h-4 text-cyan-100/65 shrink-0" />
                    <input id="admin-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => { setPassword(event.target.value); setError('') }} placeholder="Password" className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-slate-300/55 outline-none" autoComplete="current-password" autoFocus />
                    <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)} className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-300/50 hover:text-white hover:bg-white/10 transition-colors">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button>
                  </div>
                  {error && <p role="alert" className="text-rose-300 text-xs mt-2.5 font-medium">{error}</p>}
                </div>
                <button type="submit" disabled={loading || !password} className="login-reference-submit w-full h-14 rounded-full font-extrabold uppercase tracking-[.18em] text-xs text-white flex items-center justify-center disabled:opacity-45 disabled:cursor-not-allowed">{loading ? <Loader2 size={19} className="animate-spin" /> : 'Login'}</button>
              </form>

              <Link href="/counter-login" className="mt-6 w-full min-h-10 flex items-center justify-center gap-2 text-[11px] font-semibold text-slate-200/45 hover:text-white transition-all"><ArrowLeft size={13} /> Counter login</Link>
            </div>
          </motion.section>
        </div>

      </div>
    </main>
  )
}
