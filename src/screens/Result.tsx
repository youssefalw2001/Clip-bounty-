import { useEffect } from 'react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/Button'
import { Bloom } from '@/components/ui/Texture'
import { Display, Label, Marquee, Sticker } from '@/components/ui/Type'
import { Confetti } from '@/components/fx/Particles'
import { sfx, haptic } from '@/lib/audio'
import { useGame } from '@/store/game'

export function Result() {
  const { matchLoser, lossChoice, forfeit, score, rematch, reset } = useGame()
  const iLost = matchLoser === 'me'
  const forfeited = lossChoice === 'forfeit'

  useEffect(() => {
    if (!iLost) {
      const t = setTimeout(() => sfx.win(), 200)
      return () => clearTimeout(t)
    }
  }, [iLost])

  return (
    <div className="relative flex min-h-full flex-col">
      {!iLost && <Confetti count={34} />}
      <Bloom
        color={iLost ? 'blood' : 'acid'}
        className="top-[20%] right-[-20%] h-[320px] w-[320px]"
      />

      <div className="flex flex-1 flex-col justify-center px-6 py-7">
        <Label index="09" className="mb-5">
          match closed
        </Label>

        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          <Display
            className={`chromatic mb-4 text-[19vw] leading-[0.84] sm:text-[92px] ${
              iLost ? 'text-blood' : 'text-acid'
            }`}
          >
            {forfeited ? 'forfeit taken' : iLost ? 'paid up' : 'collected'}
          </Display>
        </motion.div>

        <div className="mb-7 flex items-baseline gap-3">
          <span className="font-mono text-bone text-4xl font-extrabold">{score.me}</span>
          <span className="font-mono text-faint text-xl">—</span>
          <span className="font-mono text-ash text-4xl font-extrabold">{score.them}</span>
          <Sticker rotate={-7} tone={iLost ? 'blood' : 'acid'} className="ml-2">
            {iLost ? 'L' : 'W'}
          </Sticker>
        </div>

        {forfeited && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="panel hard-shadow border-hairline mb-7 border-2 px-5 py-5"
          >
            <Label tone="acid" className="mb-2.5">
              {iLost ? 'you owe this' : 'they owe this'}
            </Label>
            <p className="font-display text-bone text-xl leading-tight">{forfeit}</p>
            <p className="font-mono text-faint mt-3 text-[10px] tracking-[0.16em]">
              PHOTO WAS NEVER OPENED. IT IS GONE.
            </p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42, type: 'spring', stiffness: 280, damping: 24 }}
          className="space-y-3"
        >
          <Button
            size="lg"
            full
            silent
            onClick={() => {
              sfx.confirm()
              haptic.medium()
              rematch()
            }}
          >
            Run it back
          </Button>
          <Button
            variant="ghost"
            size="md"
            full
            onClick={() => {
              haptic.light()
              reset()
            }}
          >
            Leave the room
          </Button>
        </motion.div>

        <p className="font-mono text-faint mt-7 text-[10px] leading-relaxed tracking-wide">
          BOTH STAKES HAVE BEEN DISCARDED FROM MEMORY. NOTHING WAS UPLOADED,
          NOTHING WAS STORED.
        </p>
      </div>

      <Marquee
        items={iLost ? ['REMATCH', 'YOU OWE ONE', 'AGAIN', 'DOUBLE OR NOTHING'] : ['UNDEFEATED', 'COLLECTED', 'AGAIN', 'RUN IT BACK']}
        tone={iLost ? 'blood' : 'acid'}
      />
    </div>
  )
}
