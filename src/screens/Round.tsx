import { useGame } from '@/store/game'
import { RoundOnline } from './round/RoundOnline'
import { RoundSolo } from './round/RoundSolo'

/**
 * REFLEX — best of three.
 *
 * Chosen over a pure chance mechanic on purpose. A coin-flip loss feels
 * arbitrary and people resent the reveal; a reflex loss feels earned, so they
 * accept the consequence and immediately want a rematch. That distinction
 * matters more than the mechanic's complexity.
 *
 * Jumping the gun is a foul and loses the round outright, which is what creates
 * the actual tension — you can't just mash.
 */
export function Round() {
  const mode = useGame((s) => s.mode)
  return mode === 'online' ? <RoundOnline /> : <RoundSolo />
}
