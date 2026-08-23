import { motion } from 'motion/react'
import { useMemo } from 'react'

interface BurstProps {
  count?: number
  colors?: string[]
  /** px spread radius */
  spread?: number
  duration?: number
}

/**
 * One-shot particle burst, centred on its parent.
 *
 * Particles inherit outward velocity and rotate independently, and they
 * shrink as they travel. Uniform particles that just fade look glued to
 * the screen; varied size/rotation/distance reads as debris.
 */
export function Burst({
  count = 26,
  colors = ['#D4FF3F', '#FF2D55', '#00E5FF', '#F4F1E8'],
  spread = 180,
  duration = 0.9,
}: BurstProps) {
  const shards = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5
        const dist = spread * (0.45 + Math.random() * 0.75)
        return {
          id: i,
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist,
          rot: (Math.random() - 0.5) * 720,
          size: 4 + Math.random() * 9,
          color: colors[i % colors.length],
          delay: Math.random() * 0.06,
          long: Math.random() > 0.6,
        }
      }),
    [count, spread, colors],
  )

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
      {shards.map((s) => (
        <motion.div
          key={s.id}
          className="absolute"
          initial={{ x: 0, y: 0, scale: 1, opacity: 1, rotate: 0 }}
          animate={{
            x: s.x,
            y: s.y,
            scale: 0.2,
            opacity: 0,
            rotate: s.rot,
          }}
          transition={{ duration, delay: s.delay, ease: [0.15, 0.8, 0.2, 1] }}
          style={{
            width: s.long ? s.size * 2.4 : s.size,
            height: s.size,
            background: s.color,
          }}
        />
      ))}
    </div>
  )
}

/**
 * Slow falling confetti for sustained celebration (win screen).
 * Deliberately sparse — dense confetti obscures the content it's
 * celebrating.
 */
export function Confetti({ count = 40 }: { count?: number }) {
  const bits = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 3,
        dur: 2.6 + Math.random() * 2.4,
        size: 5 + Math.random() * 7,
        drift: (Math.random() - 0.5) * 120,
        color: ['#D4FF3F', '#FF2D55', '#00E5FF', '#FFB302'][i % 4],
      })),
    [count],
  )

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {bits.map((b) => (
        <motion.div
          key={b.id}
          className="absolute top-0"
          style={{
            left: `${b.left}%`,
            width: b.size,
            height: b.size * 1.8,
            background: b.color,
          }}
          initial={{ y: -40, opacity: 0, rotate: 0 }}
          animate={{
            y: ['-5vh', '105vh'],
            x: [0, b.drift],
            opacity: [0, 1, 1, 0],
            rotate: [0, 540],
          }}
          transition={{
            duration: b.dur,
            delay: b.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  )
}
