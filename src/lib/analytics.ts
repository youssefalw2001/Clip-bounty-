/**
 * Minimal funnel instrumentation.
 *
 * Deliberately tiny and provider-free. The point isn't dashboards, it's that
 * the handful of numbers that actually decide whether this product is worth
 * monetizing are being counted from day one:
 *
 *   room created → rival joined → both staked → match finished
 *                → revealed vs forfeited → rematched
 *
 * The two that matter most are **rematch rate** (is it fun?) and **join rate
 * per created room** (does the invite loop work?). If those two are weak, no
 * amount of store design fixes it.
 *
 * Swap `sink()` for PostHog/Amplitude/etc. later; call sites don't change.
 * Nothing here records anything about a photo or its contents.
 */

export type Event =
  | 'app_opened'
  | 'room_created'
  | 'room_joined'
  | 'rival_arrived'
  | 'prompt_dealt'
  | 'stake_committed'
  | 'stake_skipped_no_camera'
  | 'match_started'
  | 'round_fouled'
  | 'match_finished'
  | 'chose_reveal'
  | 'chose_forfeit'
  | 'reveal_completed'
  | 'rematch_started'
  | 'room_left'
  | 'opponent_left'

const KEY = 'matchme.analytics.v1'
const SESSION = Math.random().toString(36).slice(2, 8)

type Counts = Partial<Record<Event, number>>

function load(): Counts {
  if (typeof localStorage === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}') as Counts
  } catch {
    return {}
  }
}

function save(counts: Counts) {
  try {
    localStorage.setItem(KEY, JSON.stringify(counts))
  } catch {
    /* storage full or blocked — metrics are never worth breaking the app for */
  }
}

function sink(event: Event, props?: Record<string, unknown>) {
  // replace with a real provider when there's traffic worth measuring
  if (import.meta.env.DEV) {
    console.log(`%c▸ ${event}`, 'color:#D4FF3F;font-weight:bold', props ?? '')
  }
}

export function track(event: Event, props?: Record<string, unknown>) {
  const counts = load()
  counts[event] = (counts[event] ?? 0) + 1
  save(counts)
  sink(event, { ...props, session: SESSION })
}

/** The numbers you actually want to look at. Call `matchme.funnel()` in console. */
export function funnel() {
  const c = load()
  const created = c.room_created ?? 0
  const joined = c.room_joined ?? 0
  const finished = c.match_finished ?? 0
  const rematched = c.rematch_started ?? 0
  const revealed = c.chose_reveal ?? 0
  const forfeited = c.chose_forfeit ?? 0

  const pct = (n: number, d: number) => (d > 0 ? `${Math.round((n / d) * 100)}%` : '—')

  return {
    counts: c,
    rates: {
      // does the invite loop work?
      joinsPerRoomCreated: pct(joined, created),
      // is it actually fun? this is the single most important number.
      rematchRate: pct(rematched, finished),
      // are people willing to pay the stake, or does the reveal feel too harsh?
      revealRate: pct(revealed, revealed + forfeited),
      matchesFinished: finished,
    },
  }
}

if (typeof window !== 'undefined') {
  ;(window as unknown as { matchme: unknown }).matchme = { funnel, track }
}
