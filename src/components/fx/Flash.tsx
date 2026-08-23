import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'

type FlashColor = 'bone' | 'acid' | 'blood' | 'void'
type FlashFn = (color?: FlashColor, duration?: number) => void

const FlashCtx = createContext<FlashFn>(() => {})

export const useFlash = () => useContext(FlashCtx)

const colors: Record<FlashColor, string> = {
  bone: '#F4F1E8',
  acid: '#D4FF3F',
  blood: '#FF2D55',
  void: '#08070D',
}

/**
 * Full-viewport hit flash.
 *
 * Fires at full opacity on frame one and decays out — a flash that fades
 * *in* has no impact. Kept short (≤180ms) so it punctuates rather than
 * interrupts.
 */
export function FlashProvider({ children }: { children: ReactNode }) {
  const [flash, setFlash] = useState<{ id: number; color: FlashColor; dur: number } | null>(null)

  const fire = useCallback<FlashFn>((color = 'bone', duration = 0.16) => {
    setFlash({ id: Date.now(), color, dur: duration })
  }, [])

  return (
    <FlashCtx.Provider value={fire}>
      {children}
      <AnimatePresence>
        {flash && (
          <motion.div
            key={flash.id}
            className="pointer-events-none fixed inset-0 z-[9998]"
            style={{ background: colors[flash.color], mixBlendMode: 'screen' }}
            initial={{ opacity: 0.85 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: flash.dur, ease: 'easeOut' }}
            onAnimationComplete={() => setFlash(null)}
            aria-hidden
          />
        )}
      </AnimatePresence>
    </FlashCtx.Provider>
  )
}
