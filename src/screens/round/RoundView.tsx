import { AnimatePresence, motion } from 'motion/react'
import { Display, Label } from '@/components/ui/Type'
import { Burst } from '@/components/fx/Particles'
import { FOUL, TOTAL_ROUNDS, type RoundResult, type RoundStage } from '@/store/game'

/**
 * Presentation only — no timers, no network, no game rules.
 *
 * Both the solo (local timers) and online (server-driven) controllers render
 * this, which is what stops the two modes drifting into two different-feeling
 * games.
 */
export function RoundView({
  stage,
  result,
  score,
  roundNumber,
  opponentTapped,
  onTap,
}: {
  stage: RoundStage
  result: RoundResult | null
  score: { me: number; them: number }
  roundNumber: number
  opponentTapped?: boolean
  onTap: () => void
}) {
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
      <div className="absolute top-6 right-6 left-6 flex items-center justify-between">
        <Label index="05" tone={stage === 'go' ? 'ash' : 'blood'}>
          round {Math.min(roundNumber, TOTAL_ROUNDS)} / {TOTAL_ROUNDS}
        </Label>
        <div className="flex items-center gap-4">
          <Pips label="YOU" n={score.me} active={stage !== 'go'} tone="acid" />
          <Pips label="RIVAL" n={score.them} active={stage !== 'go'} tone="blood" />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {stage === 'arm' && (
          <motion.div
            key="arm"
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

        {stage === 'waiting' && (
          <motion.div
            key="waiting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <Display chromatic={false} className="text-ash mb-5 text-[12vw] sm:text-[56px]">
              locked in
            </Display>
            <div className="flex justify-center gap-2">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="bg-acid h-2.5 w-2.5"
                  animate={{ opacity: [0.25, 1, 0.25] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </div>
            <Label className="mt-5">waiting on your rival</Label>
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

      {stage !== 'result' && stage !== 'waiting' && (
        <p
          className={`font-mono absolute bottom-8 text-[10px] tracking-[0.2em] ${
            stage === 'go' ? 'text-ink/50' : 'text-faint'
          }`}
        >
          {opponentTapped && stage === 'arm' ? 'THEY ALREADY TAPPED' : 'TAP ANYWHERE'}
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
