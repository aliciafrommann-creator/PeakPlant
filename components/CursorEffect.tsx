'use client'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useState } from 'react'

function getBgLuminance(x: number, y: number): 'dark' | 'light' {
  const el = document.elementFromPoint(x, y)
  if (!el) return 'light'
  let current: Element | null = el
  while (current && current !== document.documentElement) {
    const bg = window.getComputedStyle(current).backgroundColor
    const m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
    if (m) {
      const r = +m[1], g = +m[2], b = +m[3]
      const lum = 0.299 * r + 0.587 * g + 0.114 * b
      if (lum < 80) return 'dark'
      if (lum > 180) return 'light'
    }
    current = current.parentElement
  }
  return 'light'
}

export function CursorEffect() {
  const mx = useMotionValue(-200)
  const my = useMotionValue(-200)
  const [hovered, setHovered] = useState(false)
  const [isPointer, setIsPointer] = useState(false)
  const [onDark, setOnDark] = useState(false)

  const x = useSpring(mx, { stiffness: 80, damping: 20 })
  const y = useSpring(my, { stiffness: 80, damping: 20 })

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    setIsPointer(true)

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

  if (!isPointer) return null

  const baseColor = onDark ? 'var(--edition-white)' : '#1A1A1A'

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
        translateY: '-60%',
        lineHeight: 1,
        userSelect: 'none',
        fontFamily: 'sans-serif',
      }}
      animate={{
        fontSize: hovered ? '26px' : '13px',
        color: hovered ? 'var(--edition-pink)' : baseColor,
        rotate: hovered ? 15 : 0,
        opacity: hovered ? 1 : 0.75,
      }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      ∧
    </motion.div>
  )
}
