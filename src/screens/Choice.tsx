import { useEffect } from 'react'
import { motion } from 'motion/react'
import { Display, Label } from '@/components/ui/Type'
import { ArrowRight } from '@/components/ui/Icon'
import { sfx, haptic } from '@/lib/audio'
import { useGame } from '@/store/game'

/**
 * The fork. The loser picks: open the photo, or take the forfeit.
 *
 * This is the most important screen in the app from a safety *and* a
 * retention standpoint, and they point the same direction. A forced reveal
 * makes people feel trapped and they quit. A real choice keeps consent live
 * at the moment it actually matters, and the forfeit branch produces content
 * that's often funnier than the photo would have been.
 *
 * The reveal option is deliberately the slower, heavier one to pick.
 */
export function Choice() {
  const { matchLoser, forfeit, choose, mode } = useGame()
  const iLost = matchLoser === 'me'

  // Solo only: the bot takes a beat and then opens up. Online, we simply wait
  // for the real loser's decision to arrive over the wire.
  useEffect(() => {
    if (iLost || mode === 'online') return
    const t = setTimeout(() => {
      sfx.confirm()
      choose('reveal')
    }, 2800)
    return () => clearTimeout(t)
  }, [iLost, mode, choose])

  if (!iLost) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center px-6">
        <Label className="mb-6" tone="blood">
          they are deciding
        </Label>
        <div className="mb-8 flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="bg-blood h-3 w-3"
              animate={{ opacity: [0.25, 1, 0.25], y: [0, -6, 0] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
        <p className="text-ash max-w-[28ch] text-center text-[14px] leading-snug">
          They can open the photo, or take a forfeit instead. Their call.
        </p>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-full flex-col px-6 py-7">
      <Label index="07" tone="blood">
        your call
      </Label>

      <div className="flex flex-1 flex-col justify-center">
        <Display className="chromatic mb-3 text-[15vw] leading-[0.85] sm:text-[72px]">
          pay up
        </Display>
        <p className="text-ash mb-8 max-w-[32ch] text-[14px] leading-snug">
          Two ways out. Pick one — there is no third option.
        </p>

        <div className="space-y-4">
          {/* reveal */}
          <motion.button
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 280, damping: 24 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              sfx.riser(1.8)
              haptic.heavy()
              choose('reveal')
            }}
            className="panel hard-shadow border-blood/60 hover:border-blood w-full border-2 px-5 py-5 text-left transition-colors"
          >
            <div className="mb-2 flex items-center justify-between">
              <Display chromatic={false} className="text-blood text-2xl">
                open the photo
              </Display>
              <ArrowRight className="text-blood" size={20} />
            </div>
            <p className="text-ash text-[13px] leading-snug">
              It unblurs, all the way, in front of them. Fast and final.
            </p>
          </motion.button>

          {/* forfeit */}
          <motion.button
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.26, type: 'spring', stiffness: 280, damping: 24 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              sfx.deny()
              haptic.double()
              choose('forfeit')
            }}
            className="panel hard-shadow border-hairline hover:border-bone/50 w-full border-2 px-5 py-5 text-left transition-colors"
          >
            <div className="mb-2 flex items-center justify-between">
              <Display chromatic={false} className="text-bone text-2xl">
                take the forfeit
              </Display>
              <ArrowRight className="text-ash" size={20} />
            </div>
            <p className="text-ash mb-3 text-[13px] leading-snug">
              Photo stays sealed and burns. Instead you do this:
            </p>
            <p className="font-mono text-acid border-hairline border-l-2 pl-3 text-[12px] leading-relaxed">
              {forfeit.toUpperCase()}
            </p>
          </motion.button>
        </div>
      </div>

      <p className="font-mono text-faint text-center text-[10px] tracking-wide">
        YOU CAN ALWAYS CHOOSE THE FORFEIT. THAT NEVER CHANGES.
      </p>
    </div>
  )
}
