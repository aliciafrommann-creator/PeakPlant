'use client'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useState } from 'react'

function getBgLuminance(x: number, y: number): 'dark' | 'light' {
  const el = document.elementFromPoint(x, y)
  if (!el) return 'light'
  let current: Element | null = el
  while (current && current !== document.documentElement) {
    const bg = window.getComputedStyle(current).backgroundColor
    const m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?/)
    if (m) {
      const alpha = m[4] !== undefined ? parseFloat(m[4]) : 1
      if (alpha < 0.05) { current = current.parentElement; continue }
      const lum = 0.299 * +m[1] + 0.587 * +m[2] + 0.114 * +m[3]
      if (lum < 100) return 'dark'
      if (lum > 155) return 'light'
    }
    current = current.parentElement
  }
  return 'light'
}

export function CursorEffect() {
  const mx = useMotionValue(-100)
  const my = useMotionValue(-100)
  const [hovered, setHovered] = useState(false)
  const [onDark, setOnDark] = useState(false)

  const x = useSpring(mx, { stiffness: 500, damping: 38 })
  const y = useSpring(my, { stiffness: 500, damping: 38 })

  useEffect(() => {
    const move = (e: MouseEvent) => {
      mx.set(e.clientX)
      my.set(e.clientY)
      setOnDark(getBgLuminance(e.clientX, e.clientY) === 'dark')
    }
    const over = (e: MouseEvent) => {
      const el = e.target as HTMLElement
      setHovered(!!(el.closest('a') || el.closest('button') || el.closest('input')))
    }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseover', over)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseover', over)
    }
  }, [mx, my])

  const color = onDark ? '#ffffff' : '#1A1A1A'
  const size = hovered ? 26 : 16

  return (
    <motion.div
      aria-hidden
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999,
        pointerEvents: 'none',
        x,
        y,
        translateX: '-50%',
        translateY: '-65%',
      }}
    >
      <motion.svg
        width={size}
        height={size * 0.79}
        viewBox="0 0 48 38"
        fill="none"
        animate={{ width: size, height: size * 0.79, opacity: hovered ? 1 : 0.85 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        style={{ display: 'block' }}
      >
        <motion.path
          d="M4 34 L24 4 L44 34"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          animate={{ stroke: color }}
          transition={{ duration: 0.2 }}
        />
      </motion.svg>
    </motion.div>
  )
}
