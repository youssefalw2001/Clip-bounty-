import { useState } from 'react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/Button'
import { Bloom } from '@/components/ui/Texture'
import { Display, Label, Marquee, Sticker } from '@/components/ui/Type'
import { SoundToggle } from '@/components/ui/SoundToggle'
import { sfx, unlockAudio, haptic } from '@/lib/audio'
import { useGame } from '@/store/game'

const TICKER = ['NO TAKEBACKS', 'LOSER REVEALS', 'BEST OF THREE', 'ANTE UP', 'SUDDEN DEATH']

/** Per-character drop-in for the wordmark. */
function DropIn({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className}>
      {text.split('').map((ch, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ y: '-120%', opacity: 0, rotate: -12 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          transition={{
            type: 'spring',
            stiffness: 420,
            damping: 18,
            delay: 0.1 + i * 0.045,
          }}
        >
          {ch}
        </motion.span>
      ))}
    </span>
  )
}

export function Landing() {
  const createRoom = useGame((s) => s.createRoom)
  const joinRoom = useGame((s) => s.joinRoom)
  const [joining, setJoining] = useState(false)
  const [code, setCode] = useState('')

  const canJoin = code.trim().length === 4

  return (
    <div className="relative flex min-h-full flex-col">
      <Bloom color="acid" className="top-[-10%] left-[-25%] h-[380px] w-[380px]" />
      <Bloom color="blood" className="right-[-30%] bottom-[-5%] h-[340px] w-[340px]" />

      <Marquee items={TICKER} tone="acid" />

      <div className="relative flex flex-1 flex-col justify-center px-6 py-8">
        {/* chrome row */}
        <motion.div
          className="absolute top-5 right-6 left-6 flex items-start justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Label index="00">ENTRY</Label>
          <SoundToggle />
        </motion.div>

        {/* wordmark */}
        <div className="mb-1 overflow-hidden">
          <Display className="chromatic text-[19vw] leading-[0.8] sm:text-[104px]">
            <DropIn text="MATCH" />
          </Display>
        </div>
        <div className="mb-5 flex items-end gap-3 overflow-hidden">
          <Display chromatic={false} className="text-acid text-[19vw] leading-[0.8] sm:text-[104px]">
            <DropIn text="ME" />
          </Display>
          <motion.div
            className="mb-2 flex-1"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.55, duration: 0.5, ease: [0.2, 0.9, 0.1, 1] }}
            style={{ originX: 0 }}
          >
            <div className="bg-hairline h-px w-full" />
            <div className="font-mono text-faint mt-1.5 text-[9px] tracking-[0.2em]">
              1V1 · STAKES ON
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-7"
        >
          <Sticker rotate={-6} tone="blood">
            two friends · one loser
          </Sticker>
          <p className="text-ash mt-4 max-w-[30ch] text-[15px] leading-snug">
            You both put a photo on the line. You both take the prompt.{' '}
            <span className="text-bone">Whoever loses gets revealed.</span>
          </p>
        </motion.div>

        {/* actions */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.72, type: 'spring', stiffness: 260, damping: 24 }}
        >
          {!joining ? (
            <>
              <Button
                size="lg"
                full
                silent
                onClick={() => {
                  unlockAudio()
                  sfx.confirm()
                  haptic.medium()
                  createRoom()
                }}
              >
                Create a room
              </Button>
              <Button
                variant="ghost"
                size="md"
                full
                onClick={() => {
                  unlockAudio()
                  setJoining(true)
                }}
              >
                I have a code
              </Button>
            </>
          ) : (
            <div className="space-y-3">
              <Label index="01" tone="acid">
                enter room code
              </Label>
              <input
                autoFocus
                value={code}
                onChange={(e) => {
                  const next = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4)
                  if (next.length > code.length) sfx.tick(next.length)
                  setCode(next)
                }}
                placeholder="····"
                maxLength={4}
                className="font-mono border-hairline focus:border-acid bg-surface text-bone placeholder:text-faint w-full border-2 px-4 py-4 text-center text-4xl font-extrabold tracking-[0.5em] outline-none transition-colors"
              />
              <Button
                size="lg"
                full
                silent
                disabled={!canJoin}
                onClick={() => {
                  sfx.join()
                  haptic.medium()
                  joinRoom(code)
                }}
              >
                Join match
              </Button>
              <Button
                variant="ghost"
                size="sm"
                full
                onClick={() => {
                  setJoining(false)
                  setCode('')
                }}
              >
                Back
              </Button>
            </div>
          )}
        </motion.div>

        {/* the honest footer. worth being upfront rather than burying it. */}
        <motion.p
          className="font-mono text-faint mt-8 text-[10px] leading-relaxed tracking-wide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          PHOTOS ARE TAKEN IN-APP ONLY — NO GALLERY ACCESS. THEY NEVER LEAVE YOUR
          DEVICE IN THIS BUILD, AND BURN WHEN THE MATCH ENDS. 18+.
        </motion.p>
      </div>

      <Marquee items={TICKER} tone="dark" reverse />
    </div>
  )
}
