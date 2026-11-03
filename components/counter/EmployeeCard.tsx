'use client'

import { motion } from 'framer-motion'
import { cn, getInitials, getAvatarColor, getDepartmentColor } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { useLongPress } from '@/hooks/useLongPress'

interface EmployeeCardProps {
  employee: {
    id: number
    name: string
    department: string | null
    today_count: number
  }
  onClick: () => void
  onLongPress?: () => void
}

export function EmployeeCard({ employee, onClick, onLongPress }: EmployeeCardProps) {
  const initials = getInitials(employee.name)
  const avatarColor = getAvatarColor(employee.name)
  const deptColor = getDepartmentColor(employee.department)

  const longPressProps = useLongPress({
    onClick,
    onLongPress: onLongPress || (() => {}),
    delay: 500,
  })

  return (
    <motion.div
      whileTap={{ scale: 0.95 }}
      whileHover={{ y: -2 }}
      className={cn(
        'employee-card flex flex-col gap-3',
        employee.today_count > 0 && 'ring-2 ring-accent-300 ring-offset-1'
      )}
      {...longPressProps}
    >
      {/* Avatar */}
      <div className="flex items-center gap-3">
        <div className={cn(
          'flex items-center justify-center rounded-2xl text-white font-bold text-lg flex-shrink-0',
          'w-12 h-12 shadow-sm',
          avatarColor
        )}>
          {initials}
        </div>
        {employee.today_count > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="ml-auto"
          >
            <Badge variant="gold" className="text-xs px-2 py-0.5 font-bold">
              {employee.today_count}x
            </Badge>
          </motion.div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
          {employee.name}
        </p>
        {employee.department && (
          <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium mt-1.5 inline-block', deptColor)}>
            {employee.department}
          </span>
        )}
      </div>
    </motion.div>
  )
}
