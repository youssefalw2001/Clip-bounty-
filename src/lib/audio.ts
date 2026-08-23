/**
 * MATCH ME — procedural sound engine
 *
 * Every sound effect is synthesized at runtime with the Web Audio API.
 * No .mp3/.wav assets, no licensing, no network requests, ~0kb added to
 * the bundle, and every parameter is tunable in code.
 *
 * Sound is the highest-leverage / lowest-effort contributor to "game feel"
 * on the web, and almost nobody does it. This is most of why the app will
 * feel like a game instead of a website.
 */

type Ctx = AudioContext

let ctx: Ctx | null = null
let master: GainNode | null = null
let noiseBuffer: AudioBuffer | null = null
let muted = false

const MUTE_KEY = 'matchme.muted'

if (typeof window !== 'undefined') {
  muted = window.localStorage.getItem(MUTE_KEY) === '1'
}

/** Lazily build the graph. Must be triggered by a user gesture on iOS. */
function ensure(): Ctx | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext ?? (window as never as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = 0.5
    master.connect(ctx.destination)

    // 2s of white noise, reused by every noise-based voice
    const len = ctx.sampleRate * 2
    noiseBuffer = ctx.createBuffer(1, len, ctx.sampleRate)
    const data = noiseBuffer.getChannelData(0)
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

export function unlockAudio() {
  ensure()
}

export function isMuted() {
  return muted
}

export function toggleMute() {
  muted = !muted
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(MUTE_KEY, muted ? '1' : '0')
  }
  if (!muted) blip(880, 0.05, 'sine', 0.2)
  return muted
}

/* ------------------------------------------------------------------ */
/* primitives                                                          */
/* ------------------------------------------------------------------ */

interface ToneOpts {
  freq: number
  to?: number
  dur: number
  type?: OscillatorType
  gain?: number
  delay?: number
  /** simple attack in seconds; keeps transients from clicking */
  attack?: number
}

function tone(o: ToneOpts) {
  const c = ensure()
  if (!c || !master || muted) return
  const t0 = c.currentTime + (o.delay ?? 0)
  const osc = c.createOscillator()
  const g = c.createGain()

  osc.type = o.type ?? 'sine'
  osc.frequency.setValueAtTime(o.freq, t0)
  if (o.to && o.to !== o.freq) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, o.to), t0 + o.dur)
  }

  const peak = o.gain ?? 0.3
  const atk = o.attack ?? 0.004
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(peak, t0 + atk)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur)

  osc.connect(g)
  g.connect(master)
  osc.start(t0)
  osc.stop(t0 + o.dur + 0.02)
}

interface NoiseOpts {
  dur: number
  gain?: number
  delay?: number
  filter?: BiquadFilterType
  freq?: number
  /** sweep the filter to this frequency over dur */
  freqTo?: number
  q?: number
}

function noise(o: NoiseOpts) {
  const c = ensure()
  if (!c || !master || !noiseBuffer || muted) return
  const t0 = c.currentTime + (o.delay ?? 0)
  const src = c.createBufferSource()
  src.buffer = noiseBuffer

  const filt = c.createBiquadFilter()
  filt.type = o.filter ?? 'bandpass'
  filt.frequency.setValueAtTime(o.freq ?? 1200, t0)
  if (o.freqTo) {
    filt.frequency.exponentialRampToValueAtTime(Math.max(20, o.freqTo), t0 + o.dur)
  }
  filt.Q.value = o.q ?? 1

  const g = c.createGain()
  const peak = o.gain ?? 0.2
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(peak, t0 + 0.006)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur)

  src.connect(filt)
  filt.connect(g)
  g.connect(master)
  src.start(t0)
  src.stop(t0 + o.dur + 0.02)
}

function blip(freq: number, dur: number, type: OscillatorType, gain: number) {
  tone({ freq, dur, type, gain })
}

/* ------------------------------------------------------------------ */
/* the kit                                                             */
/* ------------------------------------------------------------------ */

export const sfx = {
  /** tiny UI click — use on every tappable thing */
  tap() {
    tone({ freq: 620, to: 480, dur: 0.05, type: 'triangle', gain: 0.13 })
  },

  /** navigation / selection */
  select() {
    tone({ freq: 480, to: 720, dur: 0.09, type: 'square', gain: 0.09 })
  },

  /** affirmative — two-tone rising */
  confirm() {
    tone({ freq: 523, dur: 0.1, type: 'triangle', gain: 0.2 })
    tone({ freq: 784, dur: 0.14, type: 'triangle', gain: 0.18, delay: 0.07 })
  },

  /** negative — falling saw */
  deny() {
    tone({ freq: 300, to: 120, dur: 0.24, type: 'sawtooth', gain: 0.16 })
    noise({ dur: 0.16, freq: 500, freqTo: 180, gain: 0.07 })
  },

  /** countdown tick — pitch rises as it gets closer */
  tick(step = 0) {
    tone({ freq: 440 + step * 90, dur: 0.06, type: 'square', gain: 0.16 })
  },

  /** GO! — the signal in the reflex round */
  go() {
    tone({ freq: 1046, dur: 0.16, type: 'square', gain: 0.26 })
    tone({ freq: 1568, dur: 0.2, type: 'triangle', gain: 0.16, delay: 0.02 })
    noise({ dur: 0.1, freq: 3000, freqTo: 900, gain: 0.12 })
  },

  /** body impact — noise transient + low sine thud */
  impact() {
    noise({ dur: 0.14, filter: 'lowpass', freq: 2400, freqTo: 300, gain: 0.3, q: 0.7 })
    tone({ freq: 130, to: 45, dur: 0.34, type: 'sine', gain: 0.5 })
  },

  /** big low hit for the reveal landing */
  slam() {
    noise({ dur: 0.3, filter: 'lowpass', freq: 3000, freqTo: 160, gain: 0.34, q: 0.6 })
    tone({ freq: 90, to: 32, dur: 0.6, type: 'sine', gain: 0.6 })
    tone({ freq: 180, to: 60, dur: 0.3, type: 'triangle', gain: 0.2 })
  },

  /** tension riser — filtered noise sweeping up. call before a reveal. */
  riser(dur = 1.6) {
    noise({ dur, filter: 'bandpass', freq: 220, freqTo: 5200, gain: 0.14, q: 2.5 })
    tone({ freq: 110, to: 660, dur, type: 'sawtooth', gain: 0.05 })
  },

  /** camera shutter */
  shutter() {
    noise({ dur: 0.035, filter: 'highpass', freq: 3200, gain: 0.3 })
    noise({ dur: 0.05, filter: 'bandpass', freq: 1600, gain: 0.22, delay: 0.05 })
    tone({ freq: 2400, dur: 0.02, type: 'square', gain: 0.1 })
  },

  /** heartbeat — two thuds. loop while stakes are pending. */
  heartbeat() {
    tone({ freq: 62, to: 40, dur: 0.16, type: 'sine', gain: 0.42, attack: 0.02 })
    tone({ freq: 55, to: 34, dur: 0.2, type: 'sine', gain: 0.3, delay: 0.24, attack: 0.02 })
  },

  /** victory arpeggio */
  win() {
    const notes = [523, 659, 784, 1046, 1319]
    notes.forEach((f, i) => {
      tone({ freq: f, dur: 0.3, type: 'triangle', gain: 0.2, delay: i * 0.075 })
      tone({ freq: f * 2, dur: 0.2, type: 'sine', gain: 0.07, delay: i * 0.075 })
    })
    noise({ dur: 0.5, filter: 'highpass', freq: 4000, gain: 0.06, delay: 0.1 })
  },

  /** defeat — descending, detuned, a little sick */
  lose() {
    const notes = [440, 392, 330, 233]
    notes.forEach((f, i) => {
      tone({ freq: f, to: f * 0.97, dur: 0.42, type: 'sawtooth', gain: 0.13, delay: i * 0.13 })
    })
    tone({ freq: 70, to: 40, dur: 0.9, type: 'sine', gain: 0.34, delay: 0.4 })
  },

  /** unblur / dematerialize whoosh, matched to the reveal duration */
  reveal(dur = 2.2) {
    noise({ dur, filter: 'lowpass', freq: 400, freqTo: 9000, gain: 0.1, q: 0.8 })
  },

  /** room code copied / joined */
  join() {
    tone({ freq: 392, dur: 0.1, type: 'triangle', gain: 0.18 })
    tone({ freq: 523, dur: 0.1, type: 'triangle', gain: 0.18, delay: 0.08 })
    tone({ freq: 784, dur: 0.18, type: 'triangle', gain: 0.2, delay: 0.16 })
  },
}

/* ------------------------------------------------------------------ */
/* haptics                                                             */
/* ------------------------------------------------------------------ */

export const haptic = {
  light() {
    navigator.vibrate?.(8)
  },
  medium() {
    navigator.vibrate?.(18)
  },
  heavy() {
    navigator.vibrate?.(40)
  },
  double() {
    navigator.vibrate?.([16, 60, 16])
  },
  /** long punishing pattern for the loss */
  fail() {
    navigator.vibrate?.([60, 40, 60, 40, 180])
  },
  success() {
    navigator.vibrate?.([12, 40, 12, 40, 60])
  },
}
