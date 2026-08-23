import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Type'
import { Burst } from '@/components/fx/Particles'
import { useShake } from '@/components/fx/Shake'
import { useFlash } from '@/components/fx/Flash'
import { sfx, haptic } from '@/lib/audio'
import { useGame } from '@/store/game'

const DURATION = 3800
/** Quantising the wipe into bands makes it read as *decrypting* rather than as
 *  a CSS transition. A smooth linear unblur looks like a loading state; chunky
 *  bands look like something being forced open. */
const BANDS = 26

export function Reveal() {
  const { matchLoser, myPhoto, theirPhoto, setPhase, prompt, mode, sendReveal } = useGame()
  const iLost = matchLoser === 'me'
  const photo = iLost ? myPhoto : theirPhoto

  const shake = useShake()
  const flash = useFlash()

  const [p, setP] = useState(0)
  const [done, setDone] = useState(false)
  const bandRef = useRef(-1)
  const sent = useRef(false)

  // Loser side, online: this is the single moment the photo crosses the network.
  // It happens only here — after losing and after explicitly choosing to reveal.
  useEffect(() => {
    if (mode !== 'online' || !iLost || sent.current) return
    sent.current = true
    sendReveal()
  }, [mode, iLost, sendReveal])

  // Winner side waits for the bytes to land before the theatre starts.
  useEffect(() => {
    if (!photo) return

    sfx.reveal(DURATION / 1000)
    sfx.riser(DURATION / 1000)

    const start = performance.now()
    let raf = 0

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION)
      // ease-in-out: slow, agonising start, then it rips open
      const eased = t * t * (3 - 2 * t)
      setP(eased)

      const band = Math.floor(eased * BANDS)
      if (band !== bandRef.current) {
        bandRef.current = band
        if (band > 2 && band % 3 === 0) {
          sfx.tick(Math.min(6, Math.floor(band / 4)))
          haptic.light()
        }
      }

      if (t < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        setDone(true)
        sfx.slam()
        haptic.fail()
        shake(20)
        flash('bone', 0.14)
      }
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [photo, shake, flash])

  const banded = Math.ceil(p * BANDS) / BANDS
  const hidden = (1 - banded) * 100
  const waiting = !photo

  return (
    <div className="relative flex min-h-full flex-col px-5 py-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <Label index="08" tone="blood">
          {iLost ? 'your stake' : 'their stake'}
        </Label>
        <div className="font-mono text-blood text-2xl leading-none font-extrabold tabular-nums">
          {waiting ? '···' : `${String(Math.floor(p * 100)).padStart(3, '0')}%`}
        </div>
      </div>

      <div className="relative flex flex-1 items-center justify-center">
        <div className="relative aspect-[3/4] w-full max-w-[330px] overflow-hidden">
          {waiting ? (
            <div className="panel border-hairline flex h-full flex-col items-center justify-center border-2 px-6 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                className="border-blood mb-5 h-8 w-8 border-2 border-t-transparent"
              />
              <Label tone="blood">receiving their stake</Label>
              <p className="text-faint mt-3 max-w-[26ch] text-[11px] leading-snug">
                It is being sent now. Until this moment it never left their phone.
              </p>
            </div>
          ) : (
            <>
              {/* blurred base — always present underneath */}
              <img
                src={photo}
                alt=""
                aria-hidden
                className="absolute inset-0 h-full w-full object-cover"
                style={{
                  filter: `blur(${44 - 34 * p}px) saturate(${0.5 + 0.5 * p}) brightness(${0.7 + 0.3 * p})`,
                  transform: `scale(${1.12 - 0.12 * p})`,
                }}
              />

              {/* sharp copy, wiped in from the top in bands */}
              <img
                src={photo}
                alt={iLost ? 'Your revealed stake' : "Your rival's revealed stake"}
                className="absolute inset-0 h-full w-full object-cover"
                style={{ clipPath: `inset(0 0 ${hidden}% 0)` }}
              />

              {/* the leading edge — a bright scan line doing the cutting */}
              {!done && (
                <div
                  className="absolute right-0 left-0 h-[3px]"
                  style={{
                    top: `${banded * 100}%`,
                    background: 'var(--color-acid)',
                    boxShadow: '0 0 18px 4px rgba(212,255,63,0.7)',
                  }}
                />
              )}

              <div
                className="scanlines pointer-events-none absolute inset-0"
                style={{ opacity: 0.55 * (1 - p) }}
              />
              <div className="border-blood/50 pointer-events-none absolute inset-0 border-2" />
            </>
          )}

          <AnimatePresence>
            {done && (
              <>
                <Burst count={30} spread={220} />
                <motion.div
                  initial={{ scale: 2.6, opacity: 0, rotate: -22 }}
                  animate={{ scale: 1, opacity: 1, rotate: -11 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 14 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="border-blood text-blood font-display bg-ink/35 border-4 px-5 py-1.5 text-4xl backdrop-blur-sm">
                    revealed
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* what they were actually asked to do — the joke needs its setup */}
      <p className="text-ash mt-4 text-center text-[12px] leading-snug">
        <span className="text-faint font-mono text-[10px] tracking-[0.18em]">THE TASK WAS: </span>
        {prompt?.text}
      </p>

      <div className="mt-5">
        <AnimatePresence>
          {done ? (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            >
              <Button
                size="lg"
                full
                silent
                onClick={() => {
                  sfx.tap()
                  setPhase('result')
                }}
              >
                {iLost ? 'Take it on the chin' : 'Nice'}
              </Button>
            </motion.div>
          ) : (
            <div className="py-5 text-center">
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 0.9, repeat: Infinity }}
              >
                <Label tone="blood">{waiting ? 'standby' : 'opening'}</Label>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
