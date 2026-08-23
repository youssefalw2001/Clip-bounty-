import { useEffect } from 'react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/Button'
import { Bloom } from '@/components/ui/Texture'
import { Display, Label } from '@/components/ui/Type'
import { ArrowRight } from '@/components/ui/Icon'
import { Burst } from '@/components/fx/Particles'
import { useShake } from '@/components/fx/Shake'
import { useFlash } from '@/components/fx/Flash'
import { sfx, haptic } from '@/lib/audio'
import { FOUL, useGame } from '@/store/game'

export function Verdict() {
  const { matchLoser, score, rounds, setPhase } = useGame()
  const iLost = matchLoser === 'me'
  const shake = useShake()
  const flash = useFlash()

  useEffect(() => {
    const t = setTimeout(() => {
      if (iLost) {
        sfx.lose()
        haptic.fail()
        shake(18)
        flash('blood', 0.2)
      } else {
        sfx.win()
        haptic.success()
        shake(8)
        flash('acid', 0.12)
      }
    }, 250)
    return () => clearTimeout(t)
  }, [iLost, shake, flash])

  return (
    <div className="relative flex min-h-full flex-col px-6 py-7">
      <Bloom
        color={iLost ? 'blood' : 'acid'}
        className="top-[18%] left-[-15%] h-[360px] w-[360px]"
      />

      <Label index="06" tone={iLost ? 'blood' : 'acid'}>
        verdict
      </Label>

      <div className="flex flex-1 flex-col justify-center">
        {!iLost && <Burst count={30} spread={220} />}

        <motion.div
          initial={{ scale: 1.9, opacity: 0, rotate: iLost ? 6 : -6 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 240, damping: 18, delay: 0.15 }}
          className="mb-8"
        >
          <Display
            className={`chromatic text-[24vw] leading-[0.82] sm:text-[118px] ${
              iLost ? 'text-blood' : 'text-acid'
            }`}
          >
            {iLost ? 'you lost' : 'you won'}
          </Display>
        </motion.div>

        {/* scoreline */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <div className="mb-4 flex items-baseline gap-3">
            <span className="font-mono text-bone text-5xl font-extrabold">{score.me}</span>
            <span className="font-mono text-faint text-2xl">—</span>
            <span className="font-mono text-ash text-5xl font-extrabold">{score.them}</span>
          </div>
          <div className="space-y-1.5">
            {rounds.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.09 }}
                className="border-hairline flex items-center justify-between border-b pb-1.5"
              >
                <span className="font-mono text-faint text-[10px] tracking-[0.2em]">
                  R{i + 1}
                </span>
                <span className="font-mono text-[11px]">
                  <span className={r.winner === 'me' ? 'text-acid' : 'text-ash'}>
                    {r.mine === FOUL ? 'FOUL' : `${r.mine}ms`}
                  </span>
                  <span className="text-faint mx-2">vs</span>
                  <span className={r.winner === 'them' ? 'text-blood' : 'text-ash'}>
                    {r.theirs === FOUL ? 'FOUL' : `${r.theirs}ms`}
                  </span>
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, type: 'spring', stiffness: 280, damping: 24 }}
        >
          <p className="text-ash mb-4 text-[14px] leading-snug">
            {iLost
              ? 'Your stake is on the table. You choose how you pay.'
              : 'Their stake is on the table. They choose how they pay.'}
          </p>
          <Button
            size="lg"
            full
            variant={iLost ? 'danger' : 'primary'}
            silent
            onClick={() => {
              sfx.riser(1.1)
              haptic.medium()
              setPhase('choice')
            }}
            className="flex items-center justify-center gap-3"
          >
            {iLost ? 'Face it' : 'Collect'}
            <ArrowRight size={22} />
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
