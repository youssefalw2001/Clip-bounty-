import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Display, Label } from '@/components/ui/Type'
import { Burst } from '@/components/fx/Particles'
import { useShake } from '@/components/fx/Shake'
import { useFlash } from '@/components/fx/Flash'
import { sfx, haptic } from '@/lib/audio'
import { FOUL, TOTAL_ROUNDS, isDecided, useGame, type RoundResult } from '@/store/game'

type Stage = 'wait' | 'go' | 'result'

/**
 * REFLEX — best of three.
 *
 * Chosen over a pure chance mechanic on purpose. A coin-flip loss feels
 * arbitrary and people resent the reveal; a reflex loss feels earned, so
 * they accept the consequence and immediately want a rematch. That
 * distinction matters more than the mechanic's complexity.
 *
 * Jumping the gun is a foul and loses the round outright, which is what
 * creates the actual tension — you can't just mash.
 */
export function Round() {
  const { score, rounds, recordRound, setPhase } = useGame()
  const shake = useShake()
  const flash = useFlash()

  const [stage, setStage] = useState<Stage>('wait')
  const [result, setResult] = useState<RoundResult | null>(null)
  const [attempt, setAttempt] = useState(0)

  const goAt = useRef(0)
  const timer = useRef<number | undefined>(undefined)
  const locked = useRef(false)

  // arm the round: random hold, then the signal
  useEffect(() => {
    locked.current = false
    setResult(null)
    setStage('wait')

    const delay = 1300 + Math.random() * 2700
    timer.current = window.setTimeout(() => {
      goAt.current = performance.now()
      setStage('go')
      sfx.go()
      haptic.heavy()
      flash('acid', 0.07)
    }, delay)

    return () => window.clearTimeout(timer.current)
  }, [attempt, flash])

  const settle = useCallback(
    (mine: number) => {
      if (locked.current) return
      locked.current = true
      window.clearTimeout(timer.current)

      const r = recordRound(mine)
      setResult(r)
      setStage('result')

      if (r.winner === 'me') {
        sfx.impact()
        haptic.success()
        shake(7)
      } else {
        sfx.deny()
        haptic.fail()
        shake(12)
        flash('blood', 0.14)
      }

      window.setTimeout(() => {
        const s = useGame.getState()
        if (isDecided(s.score, s.rounds.length)) {
          setPhase('verdict')
        } else {
          setAttempt((a) => a + 1)
        }
      }, 2000)
    },
    [recordRound, setPhase, shake, flash],
  )

  const onTap = useCallback(() => {
    if (stage === 'wait') {
      settle(FOUL) // jumped the gun
    } else if (stage === 'go') {
      settle(Math.round(performance.now() - goAt.current))
    }
  }, [stage, settle])

  const bg =
    stage === 'go'
      ? 'bg-acid'
      : stage === 'result'
        ? result?.winner === 'me'
          ? 'bg-surface'
          : 'bg-blood/12'
        : 'bg-surface'

  return (
    <button
      onPointerDown={onTap}
      className={`relative flex min-h-full w-full cursor-pointer flex-col items-center justify-center px-6 text-left transition-colors duration-150 ${bg}`}
    >
      {/* scoreboard */}
      <div className="absolute top-6 right-6 left-6 flex items-center justify-between">
        <Label index="05" tone={stage === 'go' ? 'ash' : 'blood'}>
          round {Math.min(rounds.length + (stage === 'result' ? 0 : 1), TOTAL_ROUNDS)} / {TOTAL_ROUNDS}
        </Label>
        <div className="flex items-center gap-4">
          <Pips label="YOU" n={score.me} active={stage !== 'go'} tone="acid" />
          <Pips label="RIVAL" n={score.them} active={stage !== 'go'} tone="blood" />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {stage === 'wait' && (
          <motion.div
            key="wait"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            className="text-center"
          >
            <motion.div
              animate={{ opacity: [1, 0.45, 1] }}
              transition={{ duration: 1.1, repeat: Infinity }}
            >
              <Display className="text-blood text-[22vw] leading-none sm:text-[110px]">
                wait
              </Display>
            </motion.div>
            <p className="font-mono text-faint mt-4 text-[11px] tracking-[0.2em]">
              TAP EARLY AND YOU LOSE THE ROUND
            </p>
          </motion.div>
        )}

        {stage === 'go' && (
          <motion.div
            key="go"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 700, damping: 20 }}
            className="text-center"
          >
            <Display chromatic={false} className="text-ink text-[30vw] leading-none sm:text-[150px]">
              tap
            </Display>
          </motion.div>
        )}

        {stage === 'result' && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="w-full max-w-sm text-center"
          >
            {result.winner === 'me' && <Burst count={20} spread={160} />}

            <Display
              chromatic={false}
              className={`mb-7 text-[15vw] leading-none sm:text-[76px] ${
                result.winner === 'me' ? 'text-acid' : 'text-blood'
              }`}
            >
              {result.mine === FOUL ? 'too early' : result.winner === 'me' ? 'faster' : 'slower'}
            </Display>

            <div className="grid grid-cols-2 gap-3">
              <TimeCard label="YOU" ms={result.mine} won={result.winner === 'me'} />
              <TimeCard label="RIVAL" ms={result.theirs} won={result.winner === 'them'} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {stage !== 'result' && (
        <p
          className={`font-mono absolute bottom-8 text-[10px] tracking-[0.2em] ${
            stage === 'go' ? 'text-ink/50' : 'text-faint'
          }`}
        >
          TAP ANYWHERE
        </p>
      )}
    </button>
  )
}

function Pips({
  label,
  n,
  active,
  tone,
}: {
  label: string
  n: number
  active: boolean
  tone: 'acid' | 'blood'
}) {
  const won = tone === 'acid' ? 'bg-acid' : 'bg-blood'
  return (
    <div className="flex flex-col items-end gap-1">
      <span
        className={`font-mono text-[8px] tracking-[0.2em] ${active ? 'text-faint' : 'text-ink/40'}`}
      >
        {label}
      </span>
      <div className="flex gap-1">
        {[0, 1].map((i) => (
          <motion.span
            key={i}
            animate={{ scale: i < n ? 1 : 0.75 }}
            className={`h-2 w-5 ${i < n ? won : active ? 'bg-hairline' : 'bg-ink/20'}`}
          />
        ))}
      </div>
    </div>
  )
}

function TimeCard({ label, ms, won }: { label: string; ms: number; won: boolean }) {
  return (
    <div
      className={`panel border-2 px-3 py-4 ${won ? 'border-acid' : 'border-hairline opacity-65'}`}
    >
      <div className="font-mono text-faint mb-1.5 text-[9px] tracking-[0.2em]">{label}</div>
      <div className={`font-mono text-2xl font-extrabold ${won ? 'text-acid' : 'text-ash'}`}>
        {ms === FOUL ? 'FOUL' : `${ms}`}
        {ms !== FOUL && <span className="text-faint ml-1 text-sm font-normal">ms</span>}
      </div>
    </div>
  )
}
