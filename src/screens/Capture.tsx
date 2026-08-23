import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Button } from '@/components/ui/Button'
import { Display, Label } from '@/components/ui/Type'
import { useShake } from '@/components/fx/Shake'
import { useFlash } from '@/components/fx/Flash'
import { sfx, haptic } from '@/lib/audio'
import { useCamera, type CameraStatus } from '@/hooks/useCamera'
import { useGame } from '@/store/game'

const LIMIT = 15

export function Capture() {
  const { prompt, setMyPhoto, stakeOpponent } = useGame()
  const facing = prompt?.facing ?? 'front'
  const { videoRef, status, start, capture } = useCamera(facing)
  const shake = useShake()
  const flash = useFlash()

  const [left, setLeft] = useState(LIMIT)
  const [shot, setShot] = useState<string | null>(null)
  const shotRef = useRef(false)

  useEffect(() => {
    void start()
  }, [start])

  const take = useCallback(
    (fallback = false) => {
      if (shotRef.current) return
      shotRef.current = true

      const img = fallback ? synthFrame() : (capture() ?? synthFrame())
      sfx.shutter()
      haptic.heavy()
      flash('bone', 0.09)
      shake(9)
      setShot(img)
      setMyPhoto(img)

      // beat, then hand off — lets the "STAKED" stamp land
      setTimeout(() => {
        sfx.confirm()
        stakeOpponent()
      }, 1500)
    },
    [capture, flash, shake, setMyPhoto, stakeOpponent],
  )

  // countdown → forced capture at zero. the timer is the point: a rushed
  // photo is a funnier photo, and there's no time to overthink or curate.
  useEffect(() => {
    if (shot || status !== 'live') return
    if (left <= 0) {
      take()
      return
    }
    const t = setTimeout(() => {
      setLeft((n) => n - 1)
      if (left <= 6) sfx.tick(6 - left)
      if (left <= 4) haptic.light()
    }, 1000)
    return () => clearTimeout(t)
  }, [left, shot, status, take])

  const urgent = left <= 5 && !shot
  /** No usable camera. Render instead of the viewfinder — nesting this
   *  inside the (overflow-hidden, max-height) frame clipped it. */
  const blocked = (status === 'denied' || status === 'unavailable') && !shot

  return (
    <div className="relative flex min-h-full flex-col px-5 py-6">
      <div className="mb-3 flex items-start justify-between gap-4">
        <Label index="03" tone="blood">
          ante up
        </Label>
        <motion.div
          animate={urgent ? { scale: [1, 1.18, 1] } : {}}
          transition={{ duration: 0.4, repeat: urgent ? Infinity : 0 }}
          className={`font-mono text-3xl leading-none font-extrabold ${
            urgent ? 'text-blood' : 'text-bone'
          }`}
        >
          {shot ? '--' : String(Math.max(0, left)).padStart(2, '0')}
        </motion.div>
      </div>

      {/* the prompt stays visible — you're shooting against it, not from memory */}
      <p className="text-ash mb-4 text-[13px] leading-snug">
        <span className="text-blood font-bold">TASK: </span>
        {prompt?.text}
      </p>

      <div className="flex flex-1 items-center justify-center">
        {blocked ? (
          <Blocked status={status} onRetry={() => void start()} onStandIn={() => take(true)} />
        ) : (
          <div className="bg-void relative aspect-[3/4] w-full max-w-sm overflow-hidden">
            <video
              ref={videoRef}
              playsInline
              muted
              className="h-full w-full object-cover"
              style={{ transform: facing === 'front' ? 'scaleX(-1)' : undefined }}
            />

            <AnimatePresence>
              {shot && (
                <motion.img
                  src={shot}
                  alt="Your stake"
                  initial={{ opacity: 0, scale: 1.06 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
            </AnimatePresence>

            <Brackets urgent={urgent} />

            {status === 'starting' && !shot && (
              <div className="bg-ink/92 absolute inset-0 flex flex-col items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
                  className="border-acid mb-4 h-7 w-7 border-2 border-t-transparent"
                />
                <Label>opening camera</Label>
              </div>
            )}

            <AnimatePresence>
              {shot && (
                <motion.div
                  initial={{ scale: 2.2, opacity: 0, rotate: -18 }}
                  animate={{ scale: 1, opacity: 1, rotate: -9 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 15 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="border-acid text-acid font-display bg-ink/40 border-4 px-6 py-2 text-4xl backdrop-blur-sm">
                    staked
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* shutter */}
      {!blocked && (
        <div className="mt-5 flex flex-col items-center">
          {!shot ? (
            <>
              <motion.button
                onClick={() => take()}
                disabled={status !== 'live'}
                whileTap={{ scale: 0.86 }}
                transition={{ type: 'spring', stiffness: 800, damping: 22 }}
                className="border-bone relative flex h-[74px] w-[74px] items-center justify-center rounded-full border-[3px] disabled:opacity-30"
                aria-label="Take the photo"
              >
                <motion.span
                  className="bg-blood h-[56px] w-[56px] rounded-full"
                  animate={urgent ? { scale: [1, 0.9, 1] } : {}}
                  transition={{ duration: 0.45, repeat: urgent ? Infinity : 0 }}
                />
                {urgent && (
                  <span className="border-blood pulse-ring absolute inset-0 rounded-full border-2" />
                )}
              </motion.button>
              <Label className="mt-3">
                {urgent ? 'it fires at zero either way' : 'one shot · no retakes'}
              </Label>
            </>
          ) : (
            <Label tone="acid" className="py-6">
              locked in — waiting on your rival
            </Label>
          )}
        </div>
      )}
    </div>
  )
}

function Blocked({
  status,
  onRetry,
  onStandIn,
}: {
  status: CameraStatus
  onRetry: () => void
  onStandIn: () => void
}) {
  return (
    <div className="panel border-hairline w-full border-2 px-6 py-8 text-center">
      <Display chromatic={false} className="text-blood mb-3 text-3xl">
        {status === 'denied' ? 'camera blocked' : 'no camera here'}
      </Display>
      <p className="text-ash mx-auto mb-6 max-w-[30ch] text-[13px] leading-snug">
        Capture is camera-only by design — there is no gallery picker to fall back
        on. Allow access, or use a stand-in to keep testing the flow.
      </p>
      <div className="mx-auto max-w-[260px] space-y-2.5">
        <Button size="sm" full onClick={onRetry}>
          Try again
        </Button>
        <Button variant="ghost" size="sm" full onClick={onStandIn}>
          Use a stand-in
        </Button>
      </div>
    </div>
  )
}

/** Corner brackets + a scanning line. Pure HUD theatre, very effective. */
function Brackets({ urgent }: { urgent: boolean }) {
  const c = urgent ? 'border-blood' : 'border-bone/70'
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {[
        'top-3 left-3 border-t-2 border-l-2',
        'top-3 right-3 border-t-2 border-r-2',
        'bottom-3 left-3 border-b-2 border-l-2',
        'bottom-3 right-3 border-b-2 border-r-2',
      ].map((pos) => (
        <div key={pos} className={`absolute h-7 w-7 ${pos} ${c} transition-colors`} />
      ))}
      <motion.div
        className="bg-acid/50 absolute right-0 left-0 h-px"
        animate={{ top: ['12%', '88%', '12%'] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

/**
 * Synthetic stand-in frame, so the flow stays testable on machines with no
 * camera (desktop browsers, CI). Clearly labelled — never passed off as a
 * real capture.
 */
function synthFrame(): string {
  const h = Math.floor(Math.random() * 360)
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='720' height='960'>
    <rect width='720' height='960' fill='hsl(${h},18%,12%)'/>
    <circle cx='360' cy='380' r='150' fill='hsl(${h},55%,45%)' opacity='0.8'/>
    <rect x='180' y='560' width='360' height='200' fill='hsl(${(h + 40) % 360},50%,40%)' opacity='0.5'/>
    <text x='360' y='400' font-family='Arial Black, sans-serif' font-size='120'
      fill='#08070D' text-anchor='middle'>:|</text>
    <text x='360' y='890' font-family='monospace' font-size='24' fill='#F4F1E8'
      text-anchor='middle' letter-spacing='3'>STAND-IN — NO CAMERA</text>
  </svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}
