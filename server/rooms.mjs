import { drawForfeit, drawPrompt, makeRoomCode, RULES } from '../src/shared/deck.js'

/**
 * Authoritative room + match state machine.
 *
 * The server owns everything that decides the outcome: which prompt a match
 * gets, when the GO signal fires, and how reaction times compare. If the
 * client owned any of that, the reflex match would be trivially riggable and
 * the stakes would be meaningless.
 *
 * What the server deliberately does NOT own: the photos. See relayPhoto().
 */

const ROOM_TTL_MS = 5 * 60 * 1000
const COUNTDOWN_STEP_MS = 620
const BETWEEN_ROUNDS_MS = 2000

export class Room {
  constructor(code, io) {
    this.code = code
    this.io = io
    this.createdAt = Date.now()
    /** socketId -> player */
    this.players = new Map()
    this.hostId = null

    this.resetMatch()
    this.seen = []
    this.timers = new Set()
  }

  resetMatch() {
    this.phase = 'lobby'
    this.prompt = null
    this.roundIndex = 0
    this.rounds = []
    this.score = new Map()
    this.taps = new Map()
    this.goAt = 0
    this.loser = null
    this.forfeit = ''
    this.choice = null
    this.clearTimers()
  }

  /* ----------------------------- plumbing ----------------------------- */

  later(fn, ms) {
    const t = setTimeout(() => {
      this.timers.delete(t)
      try {
        fn()
      } catch (err) {
        console.error(`[room ${this.code}] timer error:`, err)
      }
    }, ms)
    this.timers.add(t)
    return t
  }

  clearTimers() {
    if (!this.timers) return
    for (const t of this.timers) clearTimeout(t)
    this.timers.clear()
  }

  broadcast(event, payload) {
    this.io.to(this.code).emit(event, payload)
  }

  toPlayer(socketId, event, payload) {
    this.io.to(socketId).emit(event, payload)
  }

  get connected() {
    return [...this.players.values()].filter((p) => p.connected)
  }

  get isFull() {
    return this.players.size >= 2
  }

  get isEmpty() {
    return this.connected.length === 0
  }

  get isStale() {
    return this.isEmpty && Date.now() - this.createdAt > ROOM_TTL_MS
  }

  opponentOf(socketId) {
    return [...this.players.values()].find((p) => p.id !== socketId) ?? null
  }

  /* ------------------------------ players ----------------------------- */

  addPlayer(socketId, name) {
    if (this.isFull) return { error: 'This room is already full.' }
    const seat = this.players.size
    this.players.set(socketId, {
      id: socketId,
      name: (name || '').trim().slice(0, 14) || (seat === 0 ? 'HOST' : 'RIVAL'),
      seat,
      staked: false,
      connected: true,
    })
    this.score.set(socketId, 0)
    if (seat === 0) this.hostId = socketId
    return { ok: true, seat }
  }

  removePlayer(socketId) {
    const p = this.players.get(socketId)
    if (!p) return
    p.connected = false
    this.clearTimers()
    const other = this.opponentOf(socketId)
    if (other?.connected) {
      this.toPlayer(other.id, 'opponent:left', { name: p.name })
    }
  }

  /** Everything the lobby needs, from each player's own perspective. */
  pushState() {
    for (const p of this.players.values()) {
      if (!p.connected) continue
      const other = this.opponentOf(p.id)
      this.toPlayer(p.id, 'room:state', {
        code: this.code,
        phase: this.phase,
        you: { name: p.name, seat: p.seat, staked: p.staked, isHost: p.id === this.hostId },
        opponent: other
          ? { name: other.name, staked: other.staked, connected: other.connected }
          : null,
        score: {
          me: this.score.get(p.id) ?? 0,
          them: other ? (this.score.get(other.id) ?? 0) : 0,
        },
      })
    }
  }

  /* ------------------------------- match ------------------------------ */

  deal(socketId) {
    if (socketId !== this.hostId) return { error: 'Only the host can deal.' }
    if (!this.isFull) return { error: 'Waiting for your rival.' }

    this.prompt = drawPrompt(this.seen)
    this.seen.push(this.prompt.id)
    this.phase = 'brief'
    for (const p of this.players.values()) p.staked = false

    this.broadcast('match:prompt', { prompt: this.prompt })
    this.pushState()
    return { ok: true }
  }

  /**
   * A player has taken their photo. Note what is NOT sent here: the photo.
   * Only the fact that they're committed.
   */
  stake(socketId) {
    const p = this.players.get(socketId)
    if (!p || this.phase === 'lobby') return
    p.staked = true
    this.pushState()

    if ([...this.players.values()].every((x) => x.staked)) {
      this.phase = 'armed'
      this.broadcast('match:armed', {})
      this.pushState()
    }
  }

  fight(socketId) {
    if (this.phase !== 'armed') return
    if (socketId !== this.hostId) return { error: 'The host starts the match.' }
    this.phase = 'countdown'
    this.runCountdown(3)
  }

  runCountdown(n) {
    if (n <= 0) {
      this.startRound()
      return
    }
    this.broadcast('match:countdown', { n })
    this.later(() => this.runCountdown(n - 1), COUNTDOWN_STEP_MS)
  }

  startRound() {
    this.phase = 'round'
    this.taps.clear()
    this.goAt = 0
    this.broadcast('round:arm', { roundIndex: this.roundIndex })

    // server picks the hold, so neither client can anticipate it
    const hold = 1300 + Math.random() * 2700
    this.later(() => {
      this.goAt = Date.now()
      this.broadcast('round:go', { roundIndex: this.roundIndex })
      // anyone who never taps is scored as a foul
      this.later(() => this.resolveRound(), RULES.TAP_TIMEOUT_MS)
    }, hold)
  }

  /**
   * `reaction` is measured client-side from the moment that client received
   * round:go. Comparing those deltas rather than server arrival times keeps
   * the match fair when the two players have different latency.
   */
  tap(socketId, reaction) {
    if (this.phase !== 'round') return
    if (!this.players.has(socketId)) return
    if (this.taps.has(socketId)) return

    let ms
    if (!this.goAt) {
      ms = RULES.FOUL // tapped before the signal even fired
    } else if (typeof reaction !== 'number' || !Number.isFinite(reaction)) {
      ms = RULES.FOUL
    } else if (reaction < RULES.MIN_HUMAN_MS) {
      // faster than human capability: either a jumped gun or a tampered client
      ms = RULES.FOUL
    } else {
      ms = Math.round(reaction)
    }

    this.taps.set(socketId, ms)
    const other = this.opponentOf(socketId)
    if (other?.connected) this.toPlayer(other.id, 'round:opponentTapped', {})

    if (this.taps.size === this.players.size) this.resolveRound()
  }

  resolveRound() {
    if (this.phase !== 'round') return
    this.phase = 'roundResult'
    this.clearTimers()

    const ids = [...this.players.keys()]
    for (const id of ids) if (!this.taps.has(id)) this.taps.set(id, RULES.FOUL)

    const [a, b] = ids
    const ta = this.taps.get(a)
    const tb = this.taps.get(b)
    // lower wins; a dead tie (incl. double foul) goes to the host so the
    // match can never stall on an unresolvable round
    const winner = ta < tb ? a : tb < ta ? b : this.hostId

    this.score.set(winner, (this.score.get(winner) ?? 0) + 1)
    this.rounds.push({ [a]: ta, [b]: tb, winner })

    for (const id of ids) {
      const other = id === a ? b : a
      this.toPlayer(id, 'round:result', {
        roundIndex: this.roundIndex,
        mine: this.taps.get(id),
        theirs: this.taps.get(other),
        winner: winner === id ? 'me' : 'them',
        score: { me: this.score.get(id) ?? 0, them: this.score.get(other) ?? 0 },
      })
    }

    this.roundIndex += 1
    const decided =
      [...this.score.values()].some((s) => s >= RULES.ROUNDS_TO_WIN) ||
      this.roundIndex >= RULES.TOTAL_ROUNDS

    if (decided) this.later(() => this.finishMatch(), BETWEEN_ROUNDS_MS)
    else this.later(() => this.startRound(), BETWEEN_ROUNDS_MS)
  }

  finishMatch() {
    this.phase = 'verdict'
    const ids = [...this.players.keys()]
    const [a, b] = ids
    const sa = this.score.get(a) ?? 0
    const sb = this.score.get(b) ?? 0
    this.loser = sa < sb ? a : sb < sa ? b : a
    this.forfeit = drawForfeit()

    for (const id of ids) {
      const other = id === a ? b : a
      this.toPlayer(id, 'match:verdict', {
        iLost: this.loser === id,
        forfeit: this.forfeit,
        score: { me: this.score.get(id) ?? 0, them: this.score.get(other) ?? 0 },
        rounds: this.rounds.map((r) => ({
          mine: r[id],
          theirs: r[other],
          winner: r.winner === id ? 'me' : 'them',
        })),
      })
    }
  }

  choose(socketId, choice) {
    if (this.phase !== 'verdict' && this.phase !== 'choice') return
    if (socketId !== this.loser) return { error: 'Only the loser chooses.' }
    if (choice !== 'reveal' && choice !== 'forfeit') return

    this.choice = choice
    this.phase = choice === 'reveal' ? 'revealing' : 'result'
    this.broadcast('loss:choice', { choice })
  }

  /**
   * The photo relay — the one moment a stake crosses the network.
   *
   * Only the loser can send, only after they have chosen 'reveal', and the
   * bytes are forwarded to exactly one recipient and then dropped. Nothing is
   * written to disk and nothing is retained in memory after the forward.
   *
   * The consequence worth stating plainly: if you win, or if the loser takes
   * the forfeit, their photo never leaves their device at all.
   */
  relayPhoto(socketId, dataUrl) {
    if (socketId !== this.loser) return { error: 'Not your stake to reveal.' }
    if (this.choice !== 'reveal') return { error: 'No reveal was agreed.' }
    if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
      return { error: 'Unrecognised image.' }
    }
    if (dataUrl.length > 3_000_000) return { error: 'Image too large.' }

    const other = this.opponentOf(socketId)
    if (other?.connected) {
      this.toPlayer(other.id, 'reveal:photo', { dataUrl })
    }
    this.phase = 'result'
    // not stored on `this` at any point — it exists only as this argument
    return { ok: true }
  }

  rematch(socketId) {
    if (!this.players.has(socketId)) return
    const seen = this.seen
    this.resetMatch()
    this.seen = seen
    for (const p of this.players.values()) p.staked = false
    for (const id of this.players.keys()) this.score.set(id, 0)
    this.broadcast('match:rematch', {})
    this.pushState()
    if (this.isFull) this.deal(this.hostId)
  }
}

/* ------------------------------ manager ------------------------------- */

export class RoomManager {
  constructor(io) {
    this.io = io
    /** code -> Room */
    this.rooms = new Map()
    this.reaper = setInterval(() => this.reap(), 60_000)
  }

  create(socketId, name) {
    let code = makeRoomCode()
    let guard = 0
    while (this.rooms.has(code) && guard++ < 50) code = makeRoomCode()

    const room = new Room(code, this.io)
    this.rooms.set(code, room)
    room.addPlayer(socketId, name)
    return room
  }

  join(socketId, code, name) {
    const room = this.rooms.get(String(code || '').toUpperCase().trim())
    if (!room) return { error: 'No room with that code.' }
    const res = room.addPlayer(socketId, name)
    if (res.error) return res
    return { room }
  }

  find(code) {
    return this.rooms.get(String(code || '').toUpperCase().trim()) ?? null
  }

  roomOf(socketId) {
    for (const room of this.rooms.values()) {
      if (room.players.has(socketId)) return room
    }
    return null
  }

  reap() {
    for (const [code, room] of this.rooms) {
      if (room.isStale) {
        room.clearTimers()
        this.rooms.delete(code)
        console.log(`[rooms] reaped idle room ${code}`)
      }
    }
  }

  get stats() {
    return {
      rooms: this.rooms.size,
      players: [...this.rooms.values()].reduce((n, r) => n + r.connected.length, 0),
    }
  }
}
