import { create } from 'zustand'
import { drawForfeit, drawPrompt, makeRoomCode, RULES, type Prompt } from '@/lib/prompts'
import { net } from '@/net/client'
import { track } from '@/lib/analytics'

export type Mode = 'solo' | 'online'

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

/** Where a round is within its own little lifecycle. */
export type RoundStage = 'arm' | 'go' | 'waiting' | 'result'

export interface RoundResult {
  mine: number
  theirs: number
  winner: Side
}

export const FOUL = RULES.FOUL
export const ROUNDS_TO_WIN = RULES.ROUNDS_TO_WIN
export const TOTAL_ROUNDS = RULES.TOTAL_ROUNDS

interface GameState {
  mode: Mode
  phase: Phase

  // identity + room
  playerName: string
  roomCode: string
  opponentName: string
  isHost: boolean
  youStaked: boolean
  theyStaked: boolean
  connected: boolean
  netError: string | null
  opponentLeft: boolean
  joining: boolean

  prompt: Prompt | null
  seenPrompts: string[]

  myPhoto: string | null
  theirPhoto: string | null

  countdownN: number
  roundStage: RoundStage
  goAt: number
  opponentTapped: boolean
  lastResult: RoundResult | null

  round: number
  rounds: RoundResult[]
  score: { me: number; them: number }

  matchLoser: Side | null
  forfeit: string
  lossChoice: 'reveal' | 'forfeit' | null

  // actions
  setPhase: (p: Phase) => void
  setPlayerName: (n: string) => void
  initNet: () => void
  clearNetError: () => void

  createRoom: () => void // solo
  createOnlineRoom: () => Promise<void>
  joinOnlineRoom: (code: string) => Promise<void>

  opponentArrives: () => void // solo
  dealPrompt: () => void
  setMyPhoto: (url: string) => void
  commitStake: () => void
  beginCountdown: () => void
  beginRound: () => void
  submitTap: (reaction: number) => void
  recordRound: (mine: number) => RoundResult // solo
  choose: (c: 'reveal' | 'forfeit') => void
  sendReveal: () => void
  rematch: () => void
  reset: () => void
}

/**
 * Bot reaction time, roughly matched to a real human on a phone.
 * Median ~275ms with a long right tail, plus a small chance of jumping the
 * gun. Tuned so a focused player wins more than they lose but never feels
 * safe — losing to the bot has to stay plausible or the stakes stop mattering.
 */
function botReaction(): number {
  if (Math.random() < 0.06) return FOUL
  const g = (Math.random() + Math.random() + Math.random()) / 3 // ~normal
  return Math.round(190 + g * 260 + Math.random() * 40)
}

/** Stand-in stake for the bot, so there's something real to un-blur in solo. */
function placeholderStake(): string {
  const hues = [68, 340, 190, 42]
  const h = hues[Math.floor(Math.random() * hues.length)]
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='720' height='960'>
    <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0%' stop-color='hsl(${h},90%,58%)'/>
      <stop offset='100%' stop-color='hsl(${(h + 50) % 360},80%,32%)'/>
    </linearGradient></defs>
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

const NAME_KEY = 'matchme.name'

const matchFields = {
  prompt: null as Prompt | null,
  myPhoto: null as string | null,
  theirPhoto: null as string | null,
  countdownN: 3,
  roundStage: 'arm' as RoundStage,
  goAt: 0,
  opponentTapped: false,
  lastResult: null as RoundResult | null,
  round: 0,
  rounds: [] as RoundResult[],
  score: { me: 0, them: 0 },
  matchLoser: null as Side | null,
  forfeit: '',
  lossChoice: null as 'reveal' | 'forfeit' | null,
  youStaked: false,
  theyStaked: false,
}

const initial = {
  mode: 'solo' as Mode,
  phase: 'landing' as Phase,
  playerName:
    (typeof localStorage !== 'undefined' ? localStorage.getItem(NAME_KEY) : '') || '',
  roomCode: '',
  opponentName: 'RIVAL',
  isHost: true,
  connected: false,
  netError: null as string | null,
  opponentLeft: false,
  joining: false,
  seenPrompts: [] as string[],
  ...matchFields,
}

let netBound = false

export const useGame = create<GameState>((set, get) => ({
  ...initial,

  setPhase: (phase) => set({ phase }),

  setPlayerName: (n) => {
    const name = n.slice(0, 14)
    try {
      localStorage.setItem(NAME_KEY, name)
    } catch {
      /* non-fatal */
    }
    set({ playerName: name })
  },

  clearNetError: () => set({ netError: null }),

  /**
   * Wire server events into the store. Idempotent — safe to call from an
   * effect. All online phase transitions are driven from here rather than from
   * screens, so the server stays the single source of truth for match state.
   */
  initNet: () => {
    if (netBound) return
    netBound = true

    net.onConnectionChange((connected) => set({ connected }))

    net.on('room:state', (s) => {
      set({
        roomCode: s.code,
        isHost: s.you.isHost,
        youStaked: s.you.staked,
        theyStaked: s.opponent?.staked ?? false,
        opponentName: s.opponent?.name ?? 'WAITING',
        score: s.score,
      })
    })

    net.on('room:filled', () => {
      track('rival_arrived')
    })

    net.on('match:prompt', ({ prompt }) => {
      track('prompt_dealt', { id: prompt.id })
      set((st) => ({
        ...matchFields,
        prompt,
        seenPrompts: [...st.seenPrompts, prompt.id],
        phase: 'brief',
        opponentLeft: false,
      }))
    })

    net.on('match:armed', () => set({ phase: 'armed' }))

    net.on('match:countdown', ({ n }) => set({ phase: 'countdown', countdownN: n }))

    net.on('round:arm', () =>
      set({ phase: 'round', roundStage: 'arm', opponentTapped: false, lastResult: null }),
    )

    net.on('round:go', () => set({ roundStage: 'go', goAt: performance.now() }))

    net.on('round:opponentTapped', () => set({ opponentTapped: true }))

    net.on('round:result', (r) => {
      if (r.mine === FOUL) track('round_fouled')
      set((st) => ({
        roundStage: 'result',
        lastResult: { mine: r.mine, theirs: r.theirs, winner: r.winner },
        score: r.score,
        rounds: [...st.rounds, { mine: r.mine, theirs: r.theirs, winner: r.winner }],
        round: st.rounds.length + 1,
      }))
    })

    net.on('match:verdict', (v) => {
      track('match_finished', { lost: v.iLost })
      set({
        phase: 'verdict',
        matchLoser: v.iLost ? 'me' : 'them',
        forfeit: v.forfeit,
        score: v.score,
        rounds: v.rounds,
      })
    })

    net.on('loss:choice', ({ choice }) => {
      set({ lossChoice: choice, phase: choice === 'reveal' ? 'reveal' : 'result' })
    })

    net.on('reveal:photo', ({ dataUrl }) => set({ theirPhoto: dataUrl }))

    net.on('match:rematch', () =>
      set((st) => ({ ...matchFields, seenPrompts: st.seenPrompts, phase: 'brief' })),
    )

    net.on('opponent:left', () => {
      track('opponent_left')
      set({ opponentLeft: true })
    })
  },

  /* ----------------------------- solo mode ----------------------------- */

  createRoom: () => {
    track('room_created', { mode: 'solo' })
    set({ mode: 'solo', roomCode: makeRoomCode(), phase: 'lobby', opponentName: 'RIVAL' })
  },

  opponentArrives: () => set({ phase: 'brief' }),

  /* ---------------------------- online mode ---------------------------- */

  createOnlineRoom: async () => {
    set({ joining: true, netError: null })
    get().initNet()
    net.connect()
    const res = await net.createRoom(get().playerName)
    if (res.error || !res.code) {
      set({ joining: false, netError: res.error ?? 'Could not create a room.' })
      return
    }
    track('room_created', { mode: 'online' })
    set({
      joining: false,
      mode: 'online',
      roomCode: res.code,
      isHost: true,
      phase: 'lobby',
      opponentName: 'WAITING',
      opponentLeft: false,
    })
  },

  joinOnlineRoom: async (code) => {
    set({ joining: true, netError: null })
    get().initNet()
    net.connect()
    const res = await net.joinRoom(code, get().playerName)
    if (res.error || !res.code) {
      set({ joining: false, netError: res.error ?? 'Could not join that room.' })
      return
    }
    track('room_joined')
    set({
      joining: false,
      mode: 'online',
      roomCode: res.code,
      isHost: false,
      phase: 'lobby',
      opponentLeft: false,
    })
  },

  /* ------------------------------ shared ------------------------------- */

  dealPrompt: () => {
    if (get().mode === 'online') {
      net.deal()
      return
    }
    const { seenPrompts } = get()
    const prompt = drawPrompt(seenPrompts)
    track('prompt_dealt', { id: prompt.id })
    set({ prompt, seenPrompts: [...seenPrompts, prompt.id] })
  },

  setMyPhoto: (url) => set({ myPhoto: url }),

  /**
   * Commit to the stake. In online mode this sends only a flag — the photo
   * itself stays on this device unless and until this player loses AND chooses
   * to reveal.
   */
  commitStake: () => {
    track('stake_committed')
    if (get().mode === 'online') {
      set({ youStaked: true })
      net.stake()
      return
    }
    set({ theirPhoto: placeholderStake(), youStaked: true, theyStaked: true, phase: 'armed' })
  },

  beginCountdown: () => {
    track('match_started')
    if (get().mode === 'online') {
      net.fight()
      return
    }
    set({ phase: 'countdown', countdownN: 3 })
  },

  beginRound: () => set({ phase: 'round', roundStage: 'arm' }),

  submitTap: (reaction) => {
    if (get().mode === 'online') {
      set({ roundStage: 'waiting' })
      net.tap(reaction)
    }
  },

  recordRound: (mine) => {
    const theirs = botReaction()
    // lower is better; a foul always loses. a dead tie goes to the defender
    // (you), because a coin-flip loss on a tie feels unfair.
    const winner: Side = mine < theirs ? 'me' : mine > theirs ? 'them' : 'me'
    const result: RoundResult = { mine, theirs, winner }
    if (mine === FOUL) track('round_fouled')

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
      lastResult: result,
      ...(decided
        ? {
            matchLoser: (nextScore.me > nextScore.them ? 'them' : 'me') as Side,
            forfeit: drawForfeit(),
          }
        : {}),
    })

    if (decided) track('match_finished', { lost: nextScore.me < nextScore.them })
    return result
  },

  choose: (lossChoice) => {
    track(lossChoice === 'reveal' ? 'chose_reveal' : 'chose_forfeit')
    if (get().mode === 'online') {
      net.choose(lossChoice) // server broadcasts, both sides transition
      return
    }
    set({ lossChoice, phase: lossChoice === 'reveal' ? 'reveal' : 'result' })
  },

  /** Loser-side: actually hand over the photo, now that they've agreed to. */
  sendReveal: () => {
    const { mode, myPhoto, matchLoser } = get()
    if (mode !== 'online' || matchLoser !== 'me' || !myPhoto) return
    net.sendPhoto(myPhoto)
    track('reveal_completed')
  },

  rematch: () => {
    track('rematch_started')
    if (get().mode === 'online') {
      net.rematch()
      return
    }
    set((st) => ({ ...matchFields, seenPrompts: st.seenPrompts, phase: 'brief' }))
  },

  reset: () => {
    track('room_left')
    if (get().mode === 'online') net.leave()
    set((st) => ({
      ...initial,
      playerName: st.playerName,
      seenPrompts: st.seenPrompts,
      connected: st.connected,
    }))
  },
}))

/** True once the match is mathematically decided. */
export function isDecided(score: { me: number; them: number }, played: number) {
  return score.me >= ROUNDS_TO_WIN || score.them >= ROUNDS_TO_WIN || played >= TOTAL_ROUNDS
}
