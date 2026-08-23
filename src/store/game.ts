import { create } from 'zustand'
import { drawForfeit, drawPrompt, makeRoomCode, type Prompt } from '@/lib/prompts'

export type Phase =
  | 'landing' // poster / entry
  | 'lobby' // room code, waiting for opponent
  | 'brief' // the prompt is dealt
  | 'capture' // camera, 15s timer
  | 'armed' // both players have staked
  | 'countdown' // 3 · 2 · 1
  | 'round' // reflex round in progress
  | 'verdict' // match decided
  | 'choice' // loser picks: reveal or forfeit
  | 'reveal' // progressive unblur
  | 'result' // final, rematch

export type Side = 'me' | 'them'

export interface RoundResult {
  mine: number // ms, or FOUL
  theirs: number
  winner: Side
}

export const FOUL = 99_999
export const ROUNDS_TO_WIN = 2
export const TOTAL_ROUNDS = 3

interface GameState {
  phase: Phase
  roomCode: string
  opponentName: string
  soloMode: boolean

  prompt: Prompt | null
  seenPrompts: string[]

  myPhoto: string | null
  theirPhoto: string | null

  round: number
  rounds: RoundResult[]
  score: { me: number; them: number }

  matchLoser: Side | null
  forfeit: string
  lossChoice: 'reveal' | 'forfeit' | null

  // actions
  setPhase: (p: Phase) => void
  createRoom: () => void
  joinRoom: (code: string) => void
  opponentArrives: () => void
  dealPrompt: () => void
  setMyPhoto: (url: string) => void
  stakeOpponent: () => void
  beginCountdown: () => void
  beginRound: () => void
  recordRound: (mine: number) => RoundResult
  choose: (c: 'reveal' | 'forfeit') => void
  rematch: () => void
  reset: () => void
}

/**
 * Bot reaction time, roughly matched to a real human on a phone.
 * Median ~275ms with a long right tail, plus a small chance of jumping
 * the gun. Tuned so a focused player wins more than they lose but never
 * feels safe — losing to the bot has to stay plausible or the stakes
 * stop mattering.
 */
function botReaction(): number {
  if (Math.random() < 0.06) return FOUL
  const g = (Math.random() + Math.random() + Math.random()) / 3 // ~normal
  return Math.round(190 + g * 260 + Math.random() * 40)
}

/**
 * Stand-in stake for the opponent when you're testing alone.
 * Procedurally generated so there's something real to un-blur, and
 * obviously a placeholder so it's never mistaken for a real person.
 */
function placeholderStake(): string {
  const hues = [68, 340, 190, 42]
  const h = hues[Math.floor(Math.random() * hues.length)]
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='720' height='960'>
    <defs>
      <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0%' stop-color='hsl(${h},90%,58%)'/>
        <stop offset='100%' stop-color='hsl(${(h + 50) % 360},80%,32%)'/>
      </linearGradient>
    </defs>
    <rect width='720' height='960' fill='#12111A'/>
    <circle cx='360' cy='400' r='230' fill='url(#g)'/>
    <rect x='0' y='700' width='720' height='260' fill='url(#g)' opacity='0.35'/>
    <text x='360' y='420' font-family='Arial Black, sans-serif' font-size='150'
      fill='#08070D' text-anchor='middle'>?</text>
    <text x='360' y='880' font-family='monospace' font-size='26'
      fill='#F4F1E8' text-anchor='middle' letter-spacing='4'>BOT STAKE — PLACEHOLDER</text>
  </svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

const initial = {
  phase: 'landing' as Phase,
  roomCode: '',
  opponentName: 'RIVAL',
  soloMode: true,
  prompt: null,
  seenPrompts: [] as string[],
  myPhoto: null,
  theirPhoto: null,
  round: 0,
  rounds: [] as RoundResult[],
  score: { me: 0, them: 0 },
  matchLoser: null,
  forfeit: '',
  lossChoice: null,
}

export const useGame = create<GameState>((set, get) => ({
  ...initial,

  setPhase: (phase) => set({ phase }),

  createRoom: () => set({ roomCode: makeRoomCode(), phase: 'lobby', soloMode: true }),

  joinRoom: (code) =>
    set({ roomCode: code.toUpperCase().slice(0, 4), phase: 'lobby', soloMode: true }),

  opponentArrives: () => set({ phase: 'brief' }),

  dealPrompt: () => {
    const { seenPrompts } = get()
    const prompt = drawPrompt(seenPrompts)
    set({ prompt, seenPrompts: [...seenPrompts, prompt.id] })
  },

  setMyPhoto: (url) => set({ myPhoto: url }),

  stakeOpponent: () => set({ theirPhoto: placeholderStake(), phase: 'armed' }),

  beginCountdown: () => set({ phase: 'countdown' }),

  beginRound: () => set({ phase: 'round' }),

  recordRound: (mine) => {
    const theirs = botReaction()
    // lower is better; a foul always loses. simultaneous fouls go to the
    // defender (you), because a coin-flip loss on a foul feels unfair.
    const winner: Side = mine < theirs ? 'me' : mine > theirs ? 'them' : 'me'
    const result: RoundResult = { mine, theirs, winner }

    const { rounds, score } = get()
    const nextScore = {
      me: score.me + (winner === 'me' ? 1 : 0),
      them: score.them + (winner === 'them' ? 1 : 0),
    }
    const nextRounds = [...rounds, result]

    const decided =
      nextScore.me >= ROUNDS_TO_WIN ||
      nextScore.them >= ROUNDS_TO_WIN ||
      nextRounds.length >= TOTAL_ROUNDS

    set({
      rounds: nextRounds,
      score: nextScore,
      round: nextRounds.length,
      ...(decided
        ? {
            matchLoser: (nextScore.me > nextScore.them ? 'them' : 'me') as Side,
            forfeit: drawForfeit(),
          }
        : {}),
    })

    return result
  },

  choose: (lossChoice) => set({ lossChoice, phase: lossChoice === 'reveal' ? 'reveal' : 'result' }),

  rematch: () =>
    set({
      phase: 'brief',
      prompt: null,
      myPhoto: null,
      theirPhoto: null,
      round: 0,
      rounds: [],
      score: { me: 0, them: 0 },
      matchLoser: null,
      lossChoice: null,
      forfeit: '',
    }),

  reset: () => set({ ...initial, seenPrompts: get().seenPrompts }),
}))

/** True once the match is mathematically decided. */
export function isDecided(score: { me: number; them: number }, played: number) {
  return score.me >= ROUNDS_TO_WIN || score.them >= ROUNDS_TO_WIN || played >= TOTAL_ROUNDS
}
