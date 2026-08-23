import { useCallback, useEffect, useRef } from 'react'
import { useShake } from '@/components/fx/Shake'
import { useFlash } from '@/components/fx/Flash'
import { sfx, haptic } from '@/lib/audio'
import { FOUL, useGame } from '@/store/game'
import { RoundView } from './RoundView'

/**
 * Online controller — the server owns all timing and scoring.
 *
 * This component holds no game state of its own; it reads the stage the server
 * put us in and reports taps. The reaction time it sends is measured from when
 * *this* client received the go signal, so the comparison stays fair even when
 * the two players have very different latency.
 */
export function RoundOnline() {
  const { roundStage, lastResult, score, rounds, goAt, opponentTapped, submitTap } = useGame()
  const shake = useShake()
  const flash = useFlash()

  const tapped = useRef(false)
  const announced = useRef<string>('')

  // reset the local tap guard whenever the server arms a new round
  useEffect(() => {
    if (roundStage === 'arm') tapped.current = false
  }, [roundStage])

  // juice on the go signal
  useEffect(() => {
    if (roundStage !== 'go') return
    sfx.go()
    haptic.heavy()
    flash('acid', 0.07)
  }, [roundStage, flash])

  // juice on the result — keyed so it fires once per round
  useEffect(() => {
    if (roundStage !== 'result' || !lastResult) return
    const key = `${rounds.length}:${lastResult.mine}:${lastResult.theirs}`
    if (announced.current === key) return
    announced.current = key

    if (lastResult.winner === 'me') {
      sfx.impact()
      haptic.success()
      shake(7)
    } else {
      sfx.deny()
      haptic.fail()
      shake(12)
      flash('blood', 0.14)
    }
  }, [roundStage, lastResult, rounds.length, shake, flash])

  const onTap = useCallback(() => {
    if (tapped.current) return
    if (roundStage === 'arm') {
      tapped.current = true
      submitTap(FOUL) // jumped the gun — explicit rather than implied
    } else if (roundStage === 'go') {
      tapped.current = true
      submitTap(Math.round(performance.now() - goAt))
    }
  }, [roundStage, goAt, submitTap])

  return (
    <RoundView
      stage={roundStage}
      result={lastResult}
      score={score}
      roundNumber={rounds.length + (roundStage === 'result' ? 0 : 1)}
      opponentTapped={opponentTapped}
      onTap={onTap}
    />
  )
}
