import { createServer } from 'node:http'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import { Server } from 'socket.io'
import { RoomManager } from './rooms.mjs'

/**
 * MATCH ME realtime server.
 *
 * Plain ESM, no build step — runs with `node server/index.mjs` anywhere that
 * supports websockets (Render, Railway, Fly, a VPS). Note that Vercel's
 * serverless functions are a poor fit for persistent socket connections, so
 * don't deploy this half there.
 *
 * Also serves the built client from ./dist so the whole thing is one process.
 */

const __dirname = dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT ?? 8787
const ORIGIN = process.env.CORS_ORIGIN ?? '*'

const app = express()
const http = createServer(app)
const io = new Server(http, {
  cors: { origin: ORIGIN, methods: ['GET', 'POST'] },
  // stakes are relayed as data URLs, so allow a generous frame
  maxHttpBufferSize: 4e6,
})

const rooms = new RoomManager(io)

app.get('/healthz', (_req, res) => res.json({ ok: true, ...rooms.stats }))

const dist = join(__dirname, '..', 'dist')
app.use(express.static(dist))
app.get(/.*/, (_req, res) => res.sendFile(join(dist, 'index.html')))

/* ---------------------------------------------------------------------- */

io.on('connection', (socket) => {
  const log = (...a) => console.log(`[${socket.id.slice(0, 5)}]`, ...a)
  log('connected')

  socket.on('room:create', ({ name } = {}, ack) => {
    const room = rooms.create(socket.id, name)
    socket.join(room.code)
    log('created room', room.code)
    ack?.({ code: room.code })
    room.pushState()
  })

  socket.on('room:join', ({ code, name } = {}, ack) => {
    const existing = rooms.roomOf(socket.id)
    if (existing) return ack?.({ error: 'You are already in a room.' })

    const res = rooms.join(socket.id, code, name)
    if (res.error) return ack?.(res)

    socket.join(res.room.code)
    log('joined room', res.room.code)
    ack?.({ code: res.room.code })
    res.room.pushState()
    // let the host know the room is live
    res.room.broadcast('room:filled', {})
  })

  const withRoom = (fn) => (payload, ack) => {
    const room = rooms.roomOf(socket.id)
    if (!room) return ack?.({ error: 'You are not in a room.' })
    const res = fn(room, payload ?? {}) ?? {}
    ack?.(res)
  }

  socket.on('match:deal', withRoom((room) => room.deal(socket.id)))
  socket.on('stake:ready', withRoom((room) => room.stake(socket.id)))
  socket.on('match:fight', withRoom((room) => room.fight(socket.id)))
  socket.on('round:tap', withRoom((room, { reaction }) => room.tap(socket.id, reaction)))
  socket.on('loss:choice', withRoom((room, { choice }) => room.choose(socket.id, choice)))
  socket.on('reveal:photo', withRoom((room, { dataUrl }) => room.relayPhoto(socket.id, dataUrl)))
  socket.on('match:rematch', withRoom((room) => room.rematch(socket.id)))

  socket.on('room:leave', () => {
    const room = rooms.roomOf(socket.id)
    if (!room) return
    room.removePlayer(socket.id)
    socket.leave(room.code)
  })

  socket.on('disconnect', (reason) => {
    log('disconnected:', reason)
    const room = rooms.roomOf(socket.id)
    if (room) room.removePlayer(socket.id)
  })
})

http.listen(PORT, () => {
  console.log(`MATCH ME server listening on :${PORT}`)
  console.log(`serving client from ${dist}`)
})
