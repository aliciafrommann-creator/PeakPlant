'use client'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useState } from 'react'

export function CursorEffect() {
  const mx = useMotionValue(-100)
  const my = useMotionValue(-100)
  const [hovered, setHovered] = useState(false)

  const dotX = useSpring(mx, { stiffness: 700, damping: 40 })
  const dotY = useSpring(my, { stiffness: 700, damping: 40 })
  const ringX = useSpring(mx, { stiffness: 100, damping: 22 })
  const ringY = useSpring(my, { stiffness: 100, damping: 22 })

  useEffect(() => {
    const move = (e: MouseEvent) => { mx.set(e.clientX); my.set(e.clientY) }
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

  return (
    <>
      <motion.div
        style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999, width: 7, height: 7, borderRadius: '50%', backgroundColor: '#1A1A1A', pointerEvents: 'none', x: dotX, y: dotY, translateX: '-50%', translateY: '-50%' }}
        animate={{ scale: hovered ? 0 : 1 }}
        transition={{ duration: 0.15 }}
      />
      <motion.div
        style={{ position: 'fixed', top: 0, left: 0, zIndex: 9998, borderRadius: '50%', border: '1px solid #1A1A1A', pointerEvents: 'none', x: ringX, y: ringY, translateX: '-50%', translateY: '-50%' }}
        animate={{ width: hovered ? 52 : 30, height: hovered ? 52 : 30, opacity: hovered ? 0.7 : 0.25 }}
        transition={{ duration: 0.3 }}
      />
    </>
  )
}
