import { io, type Socket } from 'socket.io-client'
import type { Prompt } from '@/lib/prompts'

/**
 * Realtime transport.
 *
 * Intentionally knows nothing about the store — it exposes emit helpers and a
 * plain listener API, and the store wires itself up in `initNet()`. Keeping the
 * dependency one-directional avoids a cycle and makes the transport swappable
 * (PartyKit, raw ws, WebRTC) without touching game logic.
 */

export interface RoomState {
  code: string
  phase: string
  you: { name: string; seat: number; staked: boolean; isHost: boolean }
  opponent: { name: string; staked: boolean; connected: boolean } | null
  score: { me: number; them: number }
}

export interface ServerRoundResult {
  roundIndex: number
  mine: number
  theirs: number
  winner: 'me' | 'them'
  score: { me: number; them: number }
}

export interface ServerVerdict {
  iLost: boolean
  forfeit: string
  score: { me: number; them: number }
  rounds: { mine: number; theirs: number; winner: 'me' | 'them' }[]
}

/** Server → client */
export interface ServerEvents {
  'room:state': RoomState
  'room:filled': Record<string, never>
  'match:prompt': { prompt: Prompt }
  'match:armed': Record<string, never>
  'match:countdown': { n: number }
  'round:arm': { roundIndex: number }
  'round:go': { roundIndex: number }
  'round:opponentTapped': Record<string, never>
  'round:result': ServerRoundResult
  'match:verdict': ServerVerdict
  'loss:choice': { choice: 'reveal' | 'forfeit' }
  'reveal:photo': { dataUrl: string }
  'match:rematch': Record<string, never>
  'opponent:left': { name: string }
}

const SERVER_URL: string | undefined =
  (import.meta.env.VITE_SERVER_URL as string | undefined) ??
  (import.meta.env.DEV ? 'http://localhost:8787' : undefined)

let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) {
    socket = SERVER_URL
      ? io(SERVER_URL, { transports: ['websocket', 'polling'] })
      : io({ transports: ['websocket', 'polling'] }) // same origin in production
  }
  return socket
}

/** Emit with an ack, resolving to an error shape rather than throwing on timeout. */
function request<T>(event: string, payload: unknown): Promise<T> {
  return new Promise((resolve) => {
    getSocket()
      .timeout(8000)
      .emit(event, payload, (err: unknown, res: T) => {
        if (err) {
          resolve({
            error: 'No server reachable — try practice mode.',
          } as T)
        } else {
          resolve(res)
        }
      })
  })
}

export const net = {
  get connected() {
    return socket?.connected ?? false
  },

  connect() {
    return getSocket()
  },

  createRoom(name: string) {
    return request<{ code?: string; error?: string }>('room:create', { name })
  },

  joinRoom(code: string, name: string) {
    return request<{ code?: string; error?: string }>('room:join', { code, name })
  },

  deal() {
    getSocket().emit('match:deal', {})
  },

  /** Announce commitment only — the photo itself stays on this device. */
  stake() {
    getSocket().emit('stake:ready', {})
  },

  fight() {
    getSocket().emit('match:fight', {})
  },

  tap(reaction: number) {
    getSocket().emit('round:tap', { reaction })
  },

  choose(choice: 'reveal' | 'forfeit') {
    getSocket().emit('loss:choice', { choice })
  },

  /** The single moment a stake crosses the network. Loser only, after choosing. */
  sendPhoto(dataUrl: string) {
    getSocket().emit('reveal:photo', { dataUrl })
  },

  rematch() {
    getSocket().emit('match:rematch', {})
  },

  leave() {
    socket?.emit('room:leave')
  },

  on<K extends keyof ServerEvents>(event: K, cb: (payload: ServerEvents[K]) => void) {
    getSocket().on(event as string, cb as (...args: unknown[]) => void)
    return () => {
      socket?.off(event as string, cb as (...args: unknown[]) => void)
    }
  },

  onConnectionChange(cb: (connected: boolean) => void) {
    const s = getSocket()
    const up = () => cb(true)
    const down = () => cb(false)
    s.on('connect', up)
    s.on('disconnect', down)
    return () => {
      s.off('connect', up)
      s.off('disconnect', down)
    }
  },
}
