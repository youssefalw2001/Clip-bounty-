import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/Button'
import { Bloom } from '@/components/ui/Texture'
import { Display, Label } from '@/components/ui/Type'
import { Check } from '@/components/ui/Icon'
import { sfx, haptic } from '@/lib/audio'
import { useGame } from '@/store/game'
import { useFlash } from '@/components/fx/Flash'

export function Lobby() {
  const { roomCode, opponentName, opponentArrives, dealPrompt, reset } = useGame()
  const [arrived, setArrived] = useState(false)
  const [copied, setCopied] = useState(false)
  const flash = useFlash()

  // Simulated opponent join. In a real build this is a socket event —
  // the phase machine is already shaped for it, so the transport drops in
  // without touching any screen code.
  useEffect(() => {
    const t = setTimeout(() => {
      setArrived(true)
      sfx.join()
      haptic.double()
      flash('acid', 0.12)
    }, 3200)
    return () => clearTimeout(t)
  }, [flash])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(roomCode)
      setCopied(true)
      sfx.confirm()
      setTimeout(() => setCopied(false), 1600)
    } catch {
      sfx.deny()
    }
  }

  return (
    <div className="relative flex min-h-full flex-col px-6 py-7">
      <Bloom color="cyan" className="top-[10%] left-[-20%] h-[300px] w-[300px]" />

      <div className="flex items-start justify-between">
        <Label index="01" tone="cyan">
          the room
        </Label>
        <button
          onClick={() => {
            sfx.tap()
            reset()
          }}
          className="font-mono text-faint hover:text-bone text-[10px] tracking-[0.2em] transition-colors"
        >
          LEAVE
        </button>
      </div>

      <div className="flex flex-1 flex-col justify-center">
        {/* room code */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          className="mb-9 text-center"
        >
          <Label className="mb-3">read this out to your friend</Label>
          <div className="flex justify-center gap-2">
            {roomCode.split('').map((ch, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.4, opacity: 0, rotate: -8 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 16, delay: i * 0.07 }}
                className="panel hard-shadow flex h-[74px] w-[58px] items-center justify-center"
              >
                <span className="font-mono text-acid text-4xl font-extrabold">{ch}</span>
              </motion.div>
            ))}
          </div>
          <button
            onClick={copy}
            className="font-mono text-faint hover:text-acid mt-4 text-[10px] tracking-[0.2em] transition-colors"
          >
            {copied ? 'COPIED' : 'TAP TO COPY'}
          </button>
        </motion.div>

        {/* versus */}
        <div className="mb-8 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <PlayerSlot name="YOU" ready tone="acid" />
          <Display chromatic={false} className="text-faint text-2xl">
            vs
          </Display>
          <PlayerSlot name={arrived ? opponentName : 'WAITING'} ready={arrived} tone="blood" />
        </div>

        <motion.div
          initial={false}
          animate={{ opacity: arrived ? 1 : 0.35 }}
          className="space-y-3"
        >
          <Button
            size="lg"
            full
            silent
            disabled={!arrived}
            onClick={() => {
              sfx.confirm()
              haptic.medium()
              dealPrompt()
              opponentArrives()
            }}
          >
            {arrived ? 'Deal the prompt' : 'Waiting for rival…'}
          </Button>
        </motion.div>
      </div>

      <p className="font-mono text-faint text-center text-[10px] tracking-wide">
        BOTH PLAYERS GET THE SAME PROMPT. BOTH ANTE UP BEFORE ANYONE PLAYS.
      </p>
    </div>
  )
}

function PlayerSlot({
  name,
  ready,
  tone,
}: {
  name: string
  ready: boolean
  tone: 'acid' | 'blood'
}) {
  const ring = tone === 'acid' ? 'border-acid' : 'border-blood'
  const text = tone === 'acid' ? 'text-acid' : 'text-blood'

  return (
    <div className="relative flex flex-col items-center">
      <div
        className={`panel relative mb-2 flex aspect-square w-full items-center justify-center border-2 ${
          ready ? ring : 'border-hairline'
        } transition-colors duration-300`}
      >
        {ready ? (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 14 }}
            className={text}
          >
            <Check size={30} />
          </motion.span>
        ) : (
          <>
            <motion.span
              className="border-hairline absolute h-8 w-8 rounded-full border"
              animate={{ scale: [1, 2.1], opacity: [0.7, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
            />
            <span className="font-mono text-faint text-lg">?</span>
          </>
        )}
      </div>
      <span className={`font-display text-xs tracking-[0.1em] ${ready ? 'text-bone' : 'text-faint'}`}>
        {name}
      </span>
    </div>
  )
}
