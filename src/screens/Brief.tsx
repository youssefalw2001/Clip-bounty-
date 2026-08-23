import { useEffect } from 'react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/Button'
import { Bloom } from '@/components/ui/Texture'
import { Display, Label, Sticker } from '@/components/ui/Type'
import { ArrowRight, Camera, Globe } from '@/components/ui/Icon'
import { Burst } from '@/components/fx/Particles'
import { useShake } from '@/components/fx/Shake'
import { useFlash } from '@/components/fx/Flash'
import { sfx, haptic } from '@/lib/audio'
import { CATEGORY_META } from '@/lib/prompts'
import { useGame } from '@/store/game'

/**
 * The prompt is dealt. This is a deliberate beat — the card lands hard,
 * the screen shakes, and only then does the text arrive. Anticipation
 * before payoff is the whole trick; showing the prompt instantly would
 * waste the most dramatic moment in the flow.
 */
export function Brief() {
  const { prompt, dealPrompt, setPhase } = useGame()
  const shake = useShake()
  const flash = useFlash()

  useEffect(() => {
    if (!prompt) dealPrompt()
  }, [prompt, dealPrompt])

  // land the card
  useEffect(() => {
    if (!prompt) return
    const t = setTimeout(() => {
      sfx.impact()
      haptic.heavy()
      shake(14)
      flash('bone', 0.1)
    }, 380)
    return () => clearTimeout(t)
  }, [prompt, shake, flash])

  if (!prompt) return null
  const meta = CATEGORY_META[prompt.category]

  return (
    <div className="relative flex min-h-full flex-col px-6 py-7">
      <Bloom color="blood" className="top-[15%] right-[-25%] h-[320px] w-[320px]" />

      <div className="flex items-start justify-between">
        <Label index="02" tone="blood">
          the prompt
        </Label>
        <Label>same task</Label>
      </div>

      <div className="flex flex-1 flex-col justify-center">
        <motion.div
          initial={{ scale: 2.4, opacity: 0, rotate: -14 }}
          animate={{ scale: 1, opacity: 1, rotate: -1.5 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
          className="panel hard-shadow relative border-2 border-bone/15 px-6 py-9"
        >
          {/* burst on landing */}
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ delay: 1.3, duration: 0.2 }}
            className="pointer-events-none absolute inset-0"
          >
            <Burst count={22} spread={150} />
          </motion.div>

          <div className="mb-5 flex items-center justify-between">
            <Sticker rotate={-4} tone={meta.tone === 'amber' ? 'acid' : meta.tone}>
              {meta.label}
            </Sticker>
            <div className="text-ash flex items-center gap-1.5">
              {prompt.facing === 'front' ? <Camera size={14} /> : <Globe size={14} />}
              <Label>{prompt.facing === 'front' ? 'selfie' : 'world'}</Label>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.62, type: 'spring', stiffness: 300, damping: 24 }}
          >
            <Display chromatic={false} className="text-bone text-[30px] leading-[0.95]">
              {prompt.text}
            </Display>
          </motion.div>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            style={{ originX: 0 }}
            className="bg-hairline mt-6 h-px"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.95 }}
            className="text-ash mt-4 text-[13px] leading-snug"
          >
            You get <span className="text-bone font-bold">15 seconds</span> and one
            shot. No retakes, no gallery. Whatever the camera catches is what&apos;s
            on the line.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.15, type: 'spring', stiffness: 280, damping: 24 }}
          className="mt-8"
        >
          <Button
            size="lg"
            full
            variant="danger"
            silent
            onClick={() => {
              sfx.riser(0.9)
              haptic.medium()
              setPhase('capture')
            }}
            className="flex items-center justify-center gap-3"
          >
            Ante up
            <ArrowRight size={22} />
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
