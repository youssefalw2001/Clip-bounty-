import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Display, Label } from '@/components/ui/Type'
import { useShake } from '@/components/fx/Shake'
import { sfx, haptic } from '@/lib/audio'
import { useGame } from '@/store/game'

/**
 * 3 · 2 · 1.
 *
 * Each number slams in oversized and settles, rather than fading. The pitch
 * of the tick rises with each count, which is doing most of the tension work
 * without any visual cost.
 */
export function Countdown() {
  const beginRound = useGame((s) => s.beginRound)
  const [n, setN] = useState(3)
  const shake = useShake()

  useEffect(() => {
    if (n === 0) {
      const t = setTimeout(beginRound, 260)
      return () => clearTimeout(t)
    }
    sfx.tick(3 - n)
    haptic.medium()
    shake(4)
    const t = setTimeout(() => setN((v) => v - 1), 620)
    return () => clearTimeout(t)
  }, [n, beginRound, shake])

  return (
    <div className="relative flex min-h-full flex-col items-center justify-center">
      <Label className="absolute top-7">get ready</Label>
      <AnimatePresence mode="popLayout">
        {n > 0 && (
          <motion.div
            key={n}
            initial={{ scale: 3.4, opacity: 0, rotate: -8 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 20 }}
          >
            <Display className="chromatic text-[42vw] leading-none sm:text-[220px]">{n}</Display>
          </motion.div>
        )}
      </AnimatePresence>
      <p className="font-mono text-faint absolute bottom-10 text-[10px] tracking-[0.2em]">
        TAP THE MOMENT IT TURNS GREEN — NOT BEFORE
      </p>
    </div>
  )
}
