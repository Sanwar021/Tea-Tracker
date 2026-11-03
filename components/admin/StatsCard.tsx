import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  subtitle?: string
  color?: 'emerald' | 'amber' | 'blue' | 'purple'
}

export function StatsCard({ label, value, icon: Icon, subtitle, color = 'emerald' }: StatsCardProps) {
  const iconColorClasses = {
    emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400',
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400',
    purple: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400',
  }[color]

  return (
    <div className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm border border-gray-100 dark:border-zinc-700/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3.5 mb-2.5">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-xs ${iconColorClasses}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-zinc-400">
          {label}
        </span>
      </div>
      <div className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-zinc-100 pl-0.5">
        {value}
      </div>
      {subtitle && (
        <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1 pl-0.5">
          {subtitle}
        </p>
      )}
    </div>
  )
}

