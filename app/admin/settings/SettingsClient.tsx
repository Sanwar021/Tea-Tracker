'use client'

import { useState } from 'react'
import { Building2, KeyRound, Lock } from 'lucide-react'
import { updateSetting, changeCounterPin, changeAdminPassword } from '@/lib/actions/settings'
import { toast } from 'sonner'

interface SettingsClientProps {
  officeName: string
  currency: string
}

export function SettingsClient({ officeName: initialOfficeName, currency: initialCurrency }: SettingsClientProps) {
  const [officeName, setOfficeName] = useState(initialOfficeName)
  const [currency, setCurrency] = useState(initialCurrency)
  const [newPin, setNewPin] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loadingOffice, setLoadingOffice] = useState(false)
  const [loadingPin, setLoadingPin] = useState(false)
  const [loadingPassword, setLoadingPassword] = useState(false)

  const handleSaveOffice = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingOffice(true)
    try {
      await updateSetting('office_name', officeName.trim())
      await updateSetting('currency', currency.trim())
      toast.success('Office details saved')
    } catch {
      toast.error('Failed to update office settings')
    } finally {
      setLoadingOffice(false)
    }
  }

  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^\d{4}$/.test(newPin)) {
      toast.error('PIN must be 4 numeric digits')
      return
    }

    setLoadingPin(true)
    try {
      const res = await changeCounterPin(newPin)
      if (res.error) throw new Error(res.error)
      toast.success('Counter PIN updated to ' + newPin)
      setNewPin('')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update PIN')
    } finally {
      setLoadingPin(false)
    }
  }

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoadingPassword(true)
    try {
      const res = await changeAdminPassword(newPassword)
      if (res.error) throw new Error(res.error)
      toast.success('Admin password updated successfully')
      setNewPassword('')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password')
    } finally {
      setLoadingPassword(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-zinc-50 tracking-tight">
          System Settings
        </h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
          Configure office identity, security PINs, and passwords
        </p>
      </div>

      <div className="space-y-6">
        {/* Office Branding */}
        <div className="bg-white/80 dark:bg-zinc-800/80 border border-gray-100 dark:border-zinc-700/60 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-gray-900 dark:text-zinc-100">
                Office Information
              </h3>
              <p className="text-xs text-gray-400 dark:text-zinc-500">
                Displayed on the counter screen and reports
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveOffice} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  Office Name
                </label>
                <input
                  type="text"
                  value={officeName}
                  onChange={(e) => setOfficeName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  Currency Symbol
                </label>
                <input
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loadingOffice}
              className="px-4 py-2 text-xs font-bold bg-[#102d20] hover:bg-[#184431] text-white rounded-xl shadow-xs"
            >
              {loadingOffice ? 'Saving...' : 'Save Office Details'}
            </button>
          </form>
        </div>

        {/* Counter PIN Security */}
        <div className="bg-white/80 dark:bg-zinc-800/80 border border-gray-100 dark:border-zinc-700/60 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-gray-900 dark:text-zinc-100">
                Counter Screen Access PIN
              </h3>
              <p className="text-xs text-gray-400 dark:text-zinc-500">
                The 4-digit code entered on the counter tablet/phone (Default: 1234)
              </p>
            </div>
          </div>

          <form onSubmit={handleSavePin} className="space-y-4">
            <div className="max-w-xs">
              <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                New 4-Digit PIN
              </label>
              <input
                type="password"
                maxLength={4}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-full px-3 py-2 text-center text-lg tracking-widest font-mono rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loadingPin || newPin.length !== 4}
              className="px-4 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-xs disabled:opacity-50"
            >
              {loadingPin ? 'Updating...' : 'Update Counter PIN'}
            </button>
          </form>
        </div>

        {/* Admin Password */}
        <div className="bg-white/80 dark:bg-zinc-800/80 border border-gray-100 dark:border-zinc-700/60 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center">
              <Lock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-gray-900 dark:text-zinc-100">
                Admin Password
              </h3>
              <p className="text-xs text-gray-400 dark:text-zinc-500">
                Password used to access this admin panel (Default: admin123)
              </p>
            </div>
          </div>

          <form onSubmit={handleSavePassword} className="space-y-4">
            <div className="max-w-xs">
              <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                New Admin Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loadingPassword || newPassword.length < 6}
              className="px-4 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-xs disabled:opacity-50"
            >
              {loadingPassword ? 'Updating...' : 'Change Admin Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

