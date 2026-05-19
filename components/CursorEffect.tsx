'use client'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useState } from 'react'

export function CursorEffect() {
  const mx = useMotionValue(-200)
  const my = useMotionValue(-200)
  const [hovered, setHovered] = useState(false)
  const [isPointer, setIsPointer] = useState(false)

  const x = useSpring(mx, { stiffness: 80, damping: 20 })
  const y = useSpring(my, { stiffness: 80, damping: 20 })

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    setIsPointer(true)

    const move = (e: MouseEvent) => {
      mx.set(e.clientX)
      my.set(e.clientY)
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
        color: hovered ? 'var(--edition-pink)' : '#1A1A1A',
        rotate: hovered ? 15 : 0,
        opacity: hovered ? 1 : 0.75,
      }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      ∧
    </motion.div>
  )
}
