import { useCallback, useEffect, useRef, useState } from 'react'
import { useShake } from '@/components/fx/Shake'
import { useFlash } from '@/components/fx/Flash'
import { sfx, haptic } from '@/lib/audio'
import { FOUL, isDecided, useGame, type RoundResult, type RoundStage } from '@/store/game'
import { RoundView } from './RoundView'

/**
 * Solo controller — all timing is local, opponent is the bot.
 * Used for practice and for testing the feel without a second device.
 */
export function RoundSolo() {
  const { score, rounds, recordRound, setPhase } = useGame()
  const shake = useShake()
  const flash = useFlash()

  const [stage, setStage] = useState<RoundStage>('arm')
  const [result, setResult] = useState<RoundResult | null>(null)
  const [attempt, setAttempt] = useState(0)

  const goAt = useRef(0)
  const timer = useRef<number | undefined>(undefined)
  const locked = useRef(false)

  useEffect(() => {
    locked.current = false
    setResult(null)
    setStage('arm')

    const delay = 1300 + Math.random() * 2700
    timer.current = window.setTimeout(() => {
      goAt.current = performance.now()
      setStage('go')
      sfx.go()
      haptic.heavy()
      flash('acid', 0.07)
    }, delay)

    return () => window.clearTimeout(timer.current)
  }, [attempt, flash])

  const settle = useCallback(
    (mine: number) => {
      if (locked.current) return
      locked.current = true
      window.clearTimeout(timer.current)

      const r = recordRound(mine)
      setResult(r)
      setStage('result')

      if (r.winner === 'me') {
        sfx.impact()
        haptic.success()
        shake(7)
      } else {
        sfx.deny()
        haptic.fail()
        shake(12)
        flash('blood', 0.14)
      }

      window.setTimeout(() => {
        const s = useGame.getState()
        if (isDecided(s.score, s.rounds.length)) setPhase('verdict')
        else setAttempt((a) => a + 1)
      }, 2000)
    },
    [recordRound, setPhase, shake, flash],
  )

  const onTap = useCallback(() => {
    if (stage === 'arm') settle(FOUL)
    else if (stage === 'go') settle(Math.round(performance.now() - goAt.current))
  }, [stage, settle])

  return (
    <RoundView
      stage={stage}
      result={result}
      score={score}
      roundNumber={rounds.length + (stage === 'result' ? 0 : 1)}
      onTap={onTap}
    />
  )
}
