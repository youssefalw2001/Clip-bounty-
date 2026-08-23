/**
 * The prompt deck.
 *
 * This is the actual product. The design gets people to open the app once;
 * the deck is what makes them play a sixth round.
 *
 * Design rules for every prompt in here:
 *  1. Achievable in 15 seconds with a phone camera, in any room.
 *  2. Funny because of the *situation*, not because of the person's body.
 *  3. Zero incentive to reach for anything intimate. The prompt is the
 *     content, so there's nothing to gain by escalating.
 *  4. Screenshot-shareable. If a loss can't become someone's story post,
 *     the growth loop is dead.
 */

export type Category = 'cringe' | 'chaos' | 'vanity' | 'evidence' | 'perform'

export interface Prompt {
  id: string
  text: string
  category: Category
  /** 'front' hints selfie camera, 'back' hints world-facing */
  facing: 'front' | 'back'
}

export const CATEGORY_META: Record<Category, { label: string; tone: 'acid' | 'blood' | 'cyan' | 'amber' }> = {
  cringe: { label: 'CRINGE', tone: 'blood' },
  chaos: { label: 'CHAOS', tone: 'amber' },
  vanity: { label: 'VANITY', tone: 'cyan' },
  evidence: { label: 'EVIDENCE', tone: 'acid' },
  perform: { label: 'PERFORM', tone: 'blood' },
}

export const PROMPTS: Prompt[] = [
  // ---- CRINGE: face-based, self-inflicted ----
  { id: 'c1', text: 'Your best impression of your own crying face.', category: 'cringe', facing: 'front' },
  { id: 'c2', text: "The face you made the last time you saw your ex in public.", category: 'cringe', facing: 'front' },
  { id: 'c3', text: 'Your worst angle. On purpose. Commit to it.', category: 'cringe', facing: 'front' },
  { id: 'c4', text: "The face you make when the group chat goes silent after your joke.", category: 'cringe', facing: 'front' },
  { id: 'c5', text: 'Your "I definitely read the whole document" face.', category: 'cringe', facing: 'front' },
  { id: 'c6', text: 'Recreate your most recent passport or ID photo. From memory.', category: 'cringe', facing: 'front' },
  { id: 'c7', text: 'The exact face you make when someone says "we need to talk".', category: 'cringe', facing: 'front' },
  { id: 'c8', text: 'Your fake laugh, frozen at its peak.', category: 'cringe', facing: 'front' },

  // ---- CHAOS: your environment betrays you ----
  { id: 'h1', text: 'Your fridge. Wide open. No tidying. Go.', category: 'chaos', facing: 'back' },
  { id: 'h2', text: 'The inside of your bag. Dumped out.', category: 'chaos', facing: 'back' },
  { id: 'h3', text: 'Your desk, exactly as it is right now.', category: 'chaos', facing: 'back' },
  { id: 'h4', text: 'Whatever is under your bed. We know.', category: 'chaos', facing: 'back' },
  { id: 'h5', text: 'Your shoes. The real condition of them.', category: 'chaos', facing: 'back' },
  { id: 'h6', text: 'The floor of your room. Do not move anything.', category: 'chaos', facing: 'back' },
  { id: 'h7', text: 'Your sink. Right now. As-is.', category: 'chaos', facing: 'back' },
  { id: 'h8', text: 'The most embarrassing thing within arm\u2019s reach.', category: 'chaos', facing: 'back' },
  { id: 'h9', text: 'Your charging cable situation.', category: 'chaos', facing: 'back' },

  // ---- EVIDENCE: photograph your own screen. brutal, and very shareable ----
  { id: 'e1', text: 'Photograph your screen time. Full number. No cropping.', category: 'evidence', facing: 'back' },
  { id: 'e2', text: 'Photograph your most recent Notes app entry.', category: 'evidence', facing: 'back' },
  { id: 'e3', text: 'Photograph your battery percentage and your step count together.', category: 'evidence', facing: 'back' },
  { id: 'e4', text: 'Photograph your most-played song of the year.', category: 'evidence', facing: 'back' },
  { id: 'e5', text: 'Photograph your search bar suggestions. Just the suggestions.', category: 'evidence', facing: 'back' },
  { id: 'e6', text: 'Photograph how many unread emails you have.', category: 'evidence', facing: 'back' },
  { id: 'e7', text: 'Photograph your last takeaway order.', category: 'evidence', facing: 'back' },
  { id: 'e8', text: 'Photograph the number of open browser tabs.', category: 'evidence', facing: 'back' },

  // ---- VANITY: full commitment required, comedy comes from effort ----
  { id: 'v1', text: 'One serious model shot. Full commitment. No smiling.', category: 'vanity', facing: 'front' },
  { id: 'v2', text: 'Your action-movie-poster pose. You are the hero.', category: 'vanity', facing: 'front' },
  { id: 'v3', text: 'Sell me a product using only your facial expression.', category: 'vanity', facing: 'front' },
  { id: 'v4', text: 'Album cover. Debut album. Deeply serious genre.', category: 'vanity', facing: 'front' },
  { id: 'v5', text: 'Your LinkedIn headshot, but you\u2019ve been awake for 40 hours.', category: 'vanity', facing: 'front' },
  { id: 'v6', text: 'Pose like you\u2019re in a perfume ad you don\u2019t understand.', category: 'vanity', facing: 'front' },

  // ---- PERFORM: acting, frozen mid-motion ----
  { id: 'p1', text: 'Your worst celebrity impression. Frozen mid-impression.', category: 'perform', facing: 'front' },
  { id: 'p2', text: 'Act out losing this game. Right now. Pre-emptively.', category: 'perform', facing: 'front' },
  { id: 'p3', text: 'Your most dramatic "betrayed" face. Theatre-level.', category: 'perform', facing: 'front' },
  { id: 'p4', text: 'Pretend you just walked into the wrong room.', category: 'perform', facing: 'front' },
  { id: 'p5', text: 'Silently express "I told you so" with your whole body.', category: 'perform', facing: 'front' },
  { id: 'p6', text: 'You have just seen a ghost. It is mildly disappointing.', category: 'perform', facing: 'front' },
  { id: 'p7', text: 'Mid-sneeze. Or a convincing recreation.', category: 'perform', facing: 'front' },
]

/**
 * The alternative to revealing. Giving the loser a real choice is what
 * keeps this feeling like a game they're playing rather than something
 * being done to them — and the forfeits are often funnier than the photo.
 */
export const FORFEITS = [
  'Winner writes your status for the next 24 hours.',
  'Voice-note the winner singing a chorus of their choosing.',
  'Text your most recent contact: "I just lost a bet."',
  'Winner picks your profile picture until tomorrow.',
  'Answer one question with total honesty. No pass allowed.',
  'Post your prompt photo to your story anyway. Willingly.',
  'Winner gets to send one message from your account. You watch.',
  'Do the prompt again, harder, and this time it\u2019s public.',
]

export function drawPrompt(exclude: string[] = []): Prompt {
  const pool = PROMPTS.filter((p) => !exclude.includes(p.id))
  const deck = pool.length > 0 ? pool : PROMPTS
  return deck[Math.floor(Math.random() * deck.length)]
}

export function drawForfeit(): string {
  return FORFEITS[Math.floor(Math.random() * FORFEITS.length)]
}

export function makeRoomCode(): string {
  // no vowels, no 0/O/1/I — unambiguous when read aloud to a friend
  const chars = 'BCDFGHJKLMNPQRSTVWXYZ23456789'
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}
