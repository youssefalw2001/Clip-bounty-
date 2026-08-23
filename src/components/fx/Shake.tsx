import { createContext, useCallback, useContext, type ReactNode } from 'react'
import { useAnimate } from 'motion/react'

type ShakeFn = (intensity?: number) => void

const ShakeCtx = createContext<ShakeFn>(() => {})

/** Call from anywhere to shake the whole viewport. */
export const useShake = () => useContext(ShakeCtx)

/**
 * Screen shake with decay and directional bias.
 *
 * Two details that separate good shake from bad:
 *  - amplitude decays across the keyframes instead of staying constant,
 *    otherwise it reads as vibration rather than impact
 *  - the Y axis is biased and asymmetric to X, so the hit has a direction
 *    instead of feeling like random jitter
 */
export function ShakeProvider({ children }: { children: ReactNode }) {
  const [scope, animate] = useAnimate()

  const shake = useCallback(
    (intensity = 8) => {
      if (!scope.current) return
      const i = intensity
      void animate(
        scope.current,
        {
          x: [0, -i, i * 0.75, -i * 0.5, i * 0.3, -i * 0.15, 0],
          y: [0, i * 0.6, -i * 0.35, i * 0.22, -i * 0.1, i * 0.05, 0],
          rotate: [0, -i * 0.06, i * 0.045, -i * 0.03, 0, 0, 0],
        },
        { duration: 0.42, ease: [0.2, 0.9, 0.1, 1] },
      )
    },
    [animate, scope],
  )

  return (
    <ShakeCtx.Provider value={shake}>
      <div ref={scope} className="h-full w-full">
        {children}
      </div>
    </ShakeCtx.Provider>
  )
}
