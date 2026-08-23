/**
 * Typed view over the canonical deck.
 *
 * The data itself lives in `src/shared/deck.js` because the Node server has to
 * import it too — the server is authoritative over prompt selection, so the
 * deck cannot live in TypeScript-only land.
 */
import {
  CATEGORY_META as RAW_META,
  PROMPTS as RAW_PROMPTS,
  FORFEITS as RAW_FORFEITS,
  RULES as RAW_RULES,
  drawPrompt as rawDrawPrompt,
  drawForfeit as rawDrawForfeit,
  makeRoomCode as rawMakeRoomCode,
} from '@/shared/deck.js'

export type Category = 'cringe' | 'chaos' | 'vanity' | 'evidence' | 'perform'

export interface Prompt {
  id: string
  text: string
  category: Category
  /** 'front' hints selfie camera, 'back' hints world-facing */
  facing: 'front' | 'back'
}

interface CategoryMeta {
  label: string
  tone: 'acid' | 'blood' | 'cyan' | 'amber'
}

export const CATEGORY_META = RAW_META as Record<Category, CategoryMeta>
export const PROMPTS = RAW_PROMPTS as Prompt[]
export const FORFEITS = RAW_FORFEITS as string[]

export const RULES = RAW_RULES as {
  FOUL: number
  ROUNDS_TO_WIN: number
  TOTAL_ROUNDS: number
  MIN_HUMAN_MS: number
  TAP_TIMEOUT_MS: number
  CAPTURE_SECONDS: number
}

export const drawPrompt = rawDrawPrompt as (exclude?: string[]) => Prompt
export const drawForfeit = rawDrawForfeit as () => string
export const makeRoomCode = rawMakeRoomCode as () => string

/** Look up a prompt the server chose, by id. */
export function promptById(id: string): Prompt | null {
  return PROMPTS.find((p) => p.id === id) ?? null
}
