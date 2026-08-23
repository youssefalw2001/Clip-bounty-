import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Grain, Backdrop } from '@/components/ui/Texture'
import { ShakeProvider } from '@/components/fx/Shake'
import { FlashProvider } from '@/components/fx/Flash'
import { Button } from '@/components/ui/Button'
import { Display, Label } from '@/components/ui/Type'
import { unlockAudio } from '@/lib/audio'
import { track } from '@/lib/analytics'
import { useGame, type Phase } from '@/store/game'

import { Landing } from '@/screens/Landing'
import { Lobby } from '@/screens/Lobby'
import { Brief } from '@/screens/Brief'
import { Capture } from '@/screens/Capture'
import { Armed } from '@/screens/Armed'
import { Countdown } from '@/screens/Countdown'
import { Round } from '@/screens/Round'
import { Verdict } from '@/screens/Verdict'
import { Choice } from '@/screens/Choice'
import { Reveal } from '@/screens/Reveal'
import { Result } from '@/screens/Result'

const SCREENS: Record<Phase, React.ComponentType> = {
  landing: Landing,
  lobby: Lobby,
  brief: Brief,
  capture: Capture,
  armed: Armed,
  countdown: Countdown,
  round: Round,
  verdict: Verdict,
  choice: Choice,
  reveal: Reveal,
  result: Result,
}

/** Phases that shouldn't slide — the transition would undercut the moment. */
const NO_SLIDE: Phase[] = ['countdown', 'round', 'reveal']

export default function App() {
  const phase = useGame((s) => s.phase)
  const opponentLeft = useGame((s) => s.opponentLeft)
  const mode = useGame((s) => s.mode)
  const reset = useGame((s) => s.reset)
  const Screen = SCREENS[phase]

  useEffect(() => {
    track('app_opened')
  }, [])

  // browsers require a gesture before audio can start; catch the first one
  // anywhere so sound is live from the very first interaction onward
  useEffect(() => {
    const on = () => unlockAudio()
    window.addEventListener('pointerdown', on, { once: true })
    window.addEventListener('keydown', on, { once: true })
    return () => {
      window.removeEventListener('pointerdown', on)
      window.removeEventListener('keydown', on)
    }
  }, [])

  const slide = !NO_SLIDE.includes(phase)
  const showAbandoned = opponentLeft && mode === 'online' && phase !== 'landing'

  return (
    <ShakeProvider>
      <FlashProvider>
        <Grain />
        <div className="relative flex h-full w-full items-stretch justify-center">
          {/* phone-shaped stage. on desktop it reads as an app, not a webpage. */}
          <div className="bg-ink sm:border-hairline relative h-full w-full max-w-[440px] overflow-hidden sm:border-x">
            <Backdrop />
            <div className="relative h-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={phase}
                  /* scrolls only when the viewport is too short to fit the
                     screen — on a phone nothing ever scrolls */
                  className="no-bar absolute inset-0 overflow-y-auto"
                  initial={slide ? { opacity: 0, x: 26 } : { opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={slide ? { opacity: 0, x: -26 } : { opacity: 0, scale: 0.99 }}
                  transition={{ duration: 0.28, ease: [0.2, 0.9, 0.1, 1] }}
                >
                  <Screen />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* A dropped opponent has to be terminal rather than a soft warning:
                the match can't be resolved, and leaving it ambiguous is how you
                end up with someone's stake in limbo. */}
            <AnimatePresence>
              {showAbandoned && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-ink/95 absolute inset-0 z-50 flex flex-col items-center justify-center px-8 text-center backdrop-blur-sm"
                >
                  <Display className="chromatic text-blood mb-4 text-[16vw] sm:text-[64px]">
                    they bailed
                  </Display>
                  <p className="text-ash mb-8 max-w-[28ch] text-[14px] leading-snug">
                    Your rival left the room, so this match can&apos;t be settled. Both
                    stakes are discarded — nothing was revealed.
                  </p>
                  <div className="w-full max-w-[260px]">
                    <Button size="lg" full onClick={reset}>
                      Back to start
                    </Button>
                  </div>
                  <Label className="mt-6">no photos were sent</Label>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </FlashProvider>
    </ShakeProvider>
  )
}
