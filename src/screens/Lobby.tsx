import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/Button'
import { Bloom } from '@/components/ui/Texture'
import { Display, Label } from '@/components/ui/Type'
import { Check } from '@/components/ui/Icon'
import { sfx, haptic } from '@/lib/audio'
import { useGame } from '@/store/game'
import { useFlash } from '@/components/fx/Flash'

export function Lobby() {
  const {
    mode,
    roomCode,
    opponentName,
    playerName,
    isHost,
    opponentArrives,
    dealPrompt,
    reset,
  } = useGame()

  const online = mode === 'online'
  // online: a real opponent is present once the server gives them a name
  const rivalHere = online ? opponentName !== 'WAITING' && opponentName !== '' : undefined
  const [soloReady, setSoloReady] = useState(false)
  const arrived = online ? !!rivalHere : soloReady

  const [copied, setCopied] = useState(false)
  const flash = useFlash()
  const announced = useRef(false)

  // solo mode simulates the rival turning up
  useEffect(() => {
    if (online) return
    const t = setTimeout(() => setSoloReady(true), 3200)
    return () => clearTimeout(t)
  }, [online])

  // celebrate the arrival exactly once, in either mode
  useEffect(() => {
    if (!arrived || announced.current) return
    announced.current = true
    sfx.join()
    haptic.double()
    flash('acid', 0.12)
  }, [arrived, flash])

  const share = async () => {
    const text = `Match me. Room code: ${roomCode}`
    try {
      if (navigator.share) {
        await navigator.share({ title: 'MATCH ME', text })
      } else {
        await navigator.clipboard.writeText(roomCode)
      }
      setCopied(true)
      sfx.confirm()
      setTimeout(() => setCopied(false), 1600)
    } catch {
      /* user dismissed the share sheet — not an error worth surfacing */
    }
  }

  return (
    <div className="relative flex min-h-full flex-col px-6 py-7">
      <Bloom color="cyan" className="top-[10%] left-[-20%] h-[300px] w-[300px]" />

      <div className="flex items-start justify-between gap-4">
        <Label index="01" tone="cyan">
          {online ? 'the room' : 'practice'}
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          className="mb-9 text-center"
        >
          <Label className="mb-3">
            {online ? 'send this to your friend' : 'practice room'}
          </Label>
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
          {online && (
            <button
              onClick={share}
              className="font-mono text-faint hover:text-acid mt-4 text-[10px] tracking-[0.2em] transition-colors"
            >
              {copied ? 'COPIED' : 'TAP TO SHARE'}
            </button>
          )}
        </motion.div>

        <div className="mb-8 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <PlayerSlot name={playerName || 'YOU'} ready tone="acid" />
          <Display chromatic={false} className="text-faint text-2xl">
            vs
          </Display>
          <PlayerSlot
            name={arrived ? opponentName || 'RIVAL' : 'WAITING'}
            ready={arrived}
            tone="blood"
          />
        </div>

        <motion.div initial={false} animate={{ opacity: arrived ? 1 : 0.35 }} className="space-y-3">
          {online && !isHost ? (
            <div className="panel border-hairline border-2 px-5 py-4 text-center">
              <Label tone={arrived ? 'acid' : 'ash'}>
                {arrived ? 'waiting for the host to deal' : 'connecting…'}
              </Label>
            </div>
          ) : (
            <Button
              size="lg"
              full
              silent
              disabled={!arrived}
              onClick={() => {
                sfx.confirm()
                haptic.medium()
                if (online) {
                  dealPrompt()
                } else {
                  dealPrompt()
                  opponentArrives()
                }
              }}
            >
              {arrived ? 'Deal the prompt' : 'Waiting for rival…'}
            </Button>
          )}
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
      <span
        className={`font-display truncate text-xs tracking-[0.1em] ${
          ready ? 'text-bone' : 'text-faint'
        }`}
      >
        {name}
      </span>
    </div>
  )
}
