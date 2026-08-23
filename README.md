# MATCH ME

Two friends. One room. Something on the line. Lose the match, and your photo opens.

Both players get the same absurd prompt, both shoot a photo in-app against a
15-second clock, then play a best-of-three reflex match. The loser chooses how
they pay — open the photo, or take a forfeit.

## Run it

Online play needs two processes: the realtime server, and the client.

```bash
npm install

# terminal 1 — realtime server on :8787 (also serves the production build)
npm run server

# terminal 2 — client dev server
npm run dev
```

Then open the client on two devices, or two browser windows. One creates a room,
the other joins with the 4-character code.

For a single-process production run:

```bash
npm run build && npm run server   # everything on http://localhost:8787
```

**Turn sound on.** Roughly half the experience is audio and the whole thing feels
inert muted. Open it on a phone — it's mobile-first, and the camera needs HTTPS
or localhost.

There's also a **practice mode** against a bot, for testing the feel without a
second device.

## The privacy property, which is also the product design

During a match, **only a "staked" flag is sent to the server.** Your photo stays
on your device.

The photo crosses the network exactly once: if you lose, *and* you choose to
reveal rather than take the forfeit. It's forwarded to one recipient and dropped
— never written to disk, never retained after the forward
(`Room.relayPhoto` in `server/rooms.mjs`).

So: if you win, or if the loser takes the forfeit, that photo never leaves their
phone at all. Combined with camera-only capture (`src/hooks/useCamera.ts` has no
file picker, deliberately — there is no gallery to reach into), this is what makes
the mechanic defensible rather than reckless.

**The forfeit is always free.** Never paywall it. The moment the safe option
costs money, this stops being a game and becomes a coercion device — and that is
exactly how a regulator will read it.

## Architecture

**The server is authoritative** over everything that decides the outcome: which
prompt a match gets, when the GO signal fires, how reactions compare, and who
lost. If the client owned any of that, the reflex match would be trivially
riggable and the stakes would mean nothing.

Reaction times are measured client-side from when *that* client received the go
signal, and the server compares those deltas. That keeps the match fair when the
two players have very different latency. A reaction under 80ms is scored as a
foul, since it isn't humanly possible — which also catches a tampered client.

```
src/
  shared/deck.js      canonical prompt deck — plain ESM so the Node server
                      imports the same data the client does
  lib/audio.ts        procedural Web Audio SFX + haptics (no audio files)
  lib/analytics.ts    funnel counters
  net/client.ts       socket transport; no store import, so no cycle
  store/game.ts       mode-aware phase machine (solo | online)
  hooks/useCamera.ts  camera-only capture
  components/ui|fx/   design system + juice layer
  screens/            one file per phase
server/
  index.mjs           express + socket.io, also serves ./dist
  rooms.mjs           authoritative room + match state machine
```

Phases: `landing → lobby → brief → capture → armed → countdown → round →
verdict → choice → reveal → result`.

## What's interesting in here

**Every sound is synthesized at runtime.** `src/lib/audio.ts` builds each effect
from oscillators and noise buffers. No audio assets, no licensing, ~0kb of
bundle. Sound is the biggest single contributor to "this feels like a game" and
almost nobody does it on the web.

**The reveal is banded, not blurred.** `src/screens/Reveal.tsx` wipes a sharp
copy over a blurred one in 26 discrete bands behind a glowing scan line. A smooth
linear unblur reads as a loading spinner; chunky bands read as something being
forced open.

**The loser always has a real choice.** `src/screens/Choice.tsx`. Consent stays
live at the moment it matters instead of being collected up-front in a checkbox,
and the forfeits are frequently funnier than the photo.

**The design system is custom, not assembled.** Magic UI / Aceternity / shadcn
defaults have a recognizable house style, and leaning on them is the fastest way
to look machine-generated. Instead: warm-tinted charcoal (never `#000`), warm
off-white (never `#fff`), acid lime instead of the default purple, Anton for
poster display type, SVG `feTurbulence` grain over everything, chromatic
aberration on headlines, hard offset shadows only — buttons translate *into*
their own shadow so they physically depress.

**Icons are SVG, never unicode glyphs.** Anton has essentially no symbol
coverage, so `♪ ✓ → ✦` render as tofu boxes. See `src/components/ui/Icon.tsx`.

## Measure these four numbers

`window.matchme.funnel()` in the console:

- **rematchRate** — the single most important number. Is it actually fun?
- **joinsPerRoomCreated** — does the invite loop work?
- **revealRate** — reveal vs forfeit. Too low means the stake feels too harsh.
- **matchesFinished**

If rematch rate and join rate are weak, no amount of store design or polish
fixes it. Nothing here records anything about a photo.

## Testing

```bash
bash scripts/e2e-two-players.sh
```

Drives two independent browser sessions through a full online match against each
other and asserts they stay in sync, verdicts come out opposite, and the photo
relays to the winner. Requires `agent-browser` and a build in `./dist`.

## Deploying

The server needs **persistent websockets**, so Vercel's serverless functions are
the wrong host for it. Render, Railway, Fly, or any VPS work fine.

```
build:  npm install && npm run build
start:  npm run server        # binds process.env.PORT
```

If you host the client separately from the server, point it at the server with
`VITE_SERVER_URL` at build time. Same-origin is the default in production.

## Prototype scope / known gaps

- **Reconnection isn't handled.** A disconnect ends the match — deliberately, so
  a stake can't end up in limbo, but it means a subway tunnel kills your game.
- **Reaction times are self-reported** by each client. Fine among friends,
  trivially cheatable by a determined one. Server-side timing with latency
  compensation is the fix if it ever matters.
- **Rooms are in-memory**, so a server restart drops every match. Redis if you
  ever run more than one instance.
- No accounts, no persistent friend graph, no rivalry history.

## Before this goes near real users

- **Real age assurance, not a checkbox.** An app in this shape will attract
  minors, and a minor staking a photo is the category of problem that ends
  companies. The FTC's NGL order banned that app from under-18s outright.
- **Server-side moderation** on any image that crosses the network.
- **Screenshots are unpreventable.** Design as though every revealed photo is
  permanent, because it is.
- **Reporting, blocking, one-tap retraction** on every match.
- Keep the deck in the funny/embarrassing lane. Not only safer — it's the lane
  that travels, because embarrassing content is shareable and intimate content
  structurally isn't.

## Stack

Vite 8 · React 19 · TypeScript · Tailwind CSS v4 · Motion 13 · Zustand 5 ·
Socket.IO 4 · Express 5
