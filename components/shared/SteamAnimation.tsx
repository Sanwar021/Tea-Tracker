'use client'

import { motion } from 'framer-motion'

export function SteamAnimation({ className = '' }: { className?: string }) {
  const steamPaths = [
    { x: 50, delay: 0 },
    { x: 30, delay: 0.3 },
    { x: 70, delay: 0.6 },
  ]

  return (
    <svg width="80" height="60" viewBox="0 0 100 60" className={className} style={{ overflow: 'visible' }}>
      {steamPaths.map((s, i) => (
        <motion.path
          key={i}
          d={`M${s.x} 50 Q${s.x + 10} 30 ${s.x} 10`}
          fill="none"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0, y: 0 }}
          animate={{
            pathLength: [0, 1, 1],
            opacity: [0, 0.8, 0],
            y: [-0, -15, -25],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: s.delay,
            ease: 'easeOut',
          }}
        />
      ))}
    </svg>
  )
}
