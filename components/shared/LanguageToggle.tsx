'use client'

import { useState, useEffect } from 'react'
import { Languages } from 'lucide-react'

export function LanguageToggle() {
  const [lang, setLang] = useState<'en' | 'bn'>('en')

  useEffect(() => {
    const saved = localStorage.getItem('app_lang') as 'en' | 'bn' | null
    if (saved) setLang(saved)
  }, [])

  const toggle = () => {
    const next = lang === 'en' ? 'bn' : 'en'
    setLang(next)
    localStorage.setItem('app_lang', next)
    window.dispatchEvent(new CustomEvent('app_lang_change', { detail: next }))
  }

  return (
    <button
      onClick={toggle}
      title="Switch Language (English / বাংলা)"
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/80 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors shadow-sm"
    >
      <Languages className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
      <span>{lang === 'en' ? 'বাং' : 'EN'}</span>
    </button>
  )
}

