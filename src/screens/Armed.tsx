import { useEffect } from 'react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/Button'
import { Bloom } from '@/components/ui/Texture'
import { Display, Label, Sticker } from '@/components/ui/Type'
import { sfx, haptic } from '@/lib/audio'
import { useGame } from '@/store/game'

/**
 * The pot. Both stakes are in, both sealed.
 *
 * Showing the stakes as two face-down cards is what makes the wager feel
 * real before a single round is played. This screen has no mechanic at all —
 * it exists purely to build dread, which is the product.
 */
export function Armed() {
  const { beginCountdown, prompt } = useGame()

  // slow heartbeat under the pot
  useEffect(() => {
    const id = setInterval(() => sfx.heartbeat(), 1400)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="relative flex min-h-full flex-col px-6 py-7">
      <Bloom color="blood" className="top-[25%] left-[-20%] h-[300px] w-[300px]" />
      <Bloom color="acid" className="right-[-20%] bottom-[10%] h-[260px] w-[260px]" />

      <div className="flex items-start justify-between">
        <Label index="04" tone="blood">
          the pot
        </Label>
        <Label>sealed</Label>
      </div>

      <div className="flex flex-1 flex-col justify-center">
        <div className="mb-8 text-center">
          <Display className="chromatic mb-3 text-[13vw] sm:text-[62px]">both in</Display>
          <p className="text-ash mx-auto max-w-[30ch] text-[14px] leading-snug">
            Neither of you can see the other&apos;s photo. Only the loser&apos;s opens.
          </p>
        </div>

        {/* face-down stakes */}
        <div className="mb-9 flex items-center justify-center gap-4">
          {(['YOU', 'RIVAL'] as const).map((who, i) => (
            <motion.div
              key={who}
              initial={{ y: 60, opacity: 0, rotate: i === 0 ? -14 : 14 }}
              animate={{ y: 0, opacity: 1, rotate: i === 0 ? -6 : 6 }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 18,
                delay: 0.15 + i * 0.14,
              }}
              className="panel hard-shadow relative flex aspect-[3/4] w-[38%] flex-col items-center justify-center border-2 border-bone/15"
            >
              <div className="scanlines absolute inset-0 opacity-40" />
              <span className="font-display text-faint mb-1 text-5xl">?</span>
              <span className="font-mono text-faint text-[9px] tracking-[0.2em]">{who}</span>
              <div className="absolute inset-x-0 bottom-0 h-1 bg-blood/60" />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-6 text-center"
        >
          <Sticker rotate={-3} tone="bone">
            best of 3 · reflex
          </Sticker>
          <p className="font-mono text-faint mt-3 text-[10px] tracking-[0.16em]">
            {prompt?.text.toUpperCase().slice(0, 42)}
            {(prompt?.text.length ?? 0) > 42 ? '…' : ''}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.72, type: 'spring', stiffness: 280, damping: 24 }}
        >
          <Button
            size="xl"
            full
            variant="danger"
            silent
            onClick={() => {
              sfx.riser(1.2)
              haptic.double()
              beginCountdown()
            }}
          >
            Fight
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
