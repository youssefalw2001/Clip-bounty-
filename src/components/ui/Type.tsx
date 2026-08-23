import clsx from 'clsx'
import { motion } from 'motion/react'

/**
 * Display headline with optional chromatic aberration.
 *
 * The offset cyan/magenta ghosting mimics print misregistration. It's a
 * tiny detail but it's the kind of thing that reads as "art directed"
 * rather than "generated" — because a generator wouldn't bother.
 */
export function Display({
  children,
  className,
  chromatic = true,
  as: Tag = 'h1',
}: {
  children: React.ReactNode
  className?: string
  chromatic?: boolean
  as?: 'h1' | 'h2' | 'h3' | 'div'
}) {
  return (
    <Tag className={clsx('font-display leading-[0.82]', chromatic && 'chromatic', className)}>
      {children}
    </Tag>
  )
}

/**
 * Small mono label with a leading index, e.g. "03 / STAKE".
 * Numbered UI chrome makes an interface feel like a system with rules —
 * which is exactly the feeling you want in a game about stakes.
 */
export function Label({
  index,
  children,
  tone = 'ash',
  className,
}: {
  index?: string
  children: React.ReactNode
  tone?: 'ash' | 'acid' | 'blood' | 'cyan'
  className?: string
}) {
  const tones = {
    ash: 'text-ash',
    acid: 'text-acid',
    blood: 'text-blood',
    cyan: 'text-cyan',
  }
  return (
    <div
      className={clsx(
        // nowrap: the wide tracking makes these wrap into two lines inside
        // flex headers, which looks broken rather than intentional
        'font-mono text-[10px] font-bold whitespace-nowrap uppercase tracking-[0.28em]',
        tones[tone],
        className,
      )}
    >
      {index && <span className="text-faint">{index} / </span>}
      {children}
    </div>
  )
}

/** Rotated sticker badge. Off-axis elements break the grid monotony. */
export function Sticker({
  children,
  rotate = -8,
  tone = 'acid',
  className,
}: {
  children: React.ReactNode
  rotate?: number
  tone?: 'acid' | 'blood' | 'cyan' | 'bone'
  className?: string
}) {
  const tones = {
    acid: 'bg-acid text-ink',
    blood: 'bg-blood text-bone',
    cyan: 'bg-cyan text-ink',
    bone: 'bg-bone text-ink',
  }
  return (
    <motion.div
      initial={{ scale: 0, rotate: rotate - 20 }}
      animate={{ scale: 1, rotate }}
      transition={{ type: 'spring', stiffness: 400, damping: 14, delay: 0.15 }}
      className={clsx(
        'font-display inline-block px-3 py-1 text-sm uppercase tracking-[0.06em]',
        tones[tone],
        className,
      )}
      style={{ boxShadow: '3px 3px 0 0 var(--color-void)' }}
    >
      {children}
    </motion.div>
  )
}

/** Infinite ticker strip. */
export function Marquee({
  items,
  tone = 'acid',
  reverse,
}: {
  items: string[]
  tone?: 'acid' | 'blood' | 'dark'
  reverse?: boolean
}) {
  const tones = {
    acid: 'bg-acid text-ink border-y-acid',
    blood: 'bg-blood text-bone border-y-blood',
    dark: 'bg-raised text-ash border-y-hairline',
  }
  const doubled = [...items, ...items]
  return (
    <div className={clsx('overflow-hidden border-y-2 py-1.5', tones[tone])}>
      <div
        className="marquee-track"
        style={{ animationDirection: reverse ? 'reverse' : 'normal' }}
      >
        {doubled.map((t, i) => (
          <span
            key={i}
            className="font-display flex items-center px-4 text-sm uppercase tracking-[0.1em] whitespace-nowrap"
          >
            {t}
            {/* CSS diamond rather than a unicode glyph — Anton has no
                symbol coverage, so ✦ renders as tofu */}
            <span className="mx-5 inline-block h-1.5 w-1.5 rotate-45 bg-current opacity-45" />
          </span>
        ))}
      </div>
    </div>
  )
}
