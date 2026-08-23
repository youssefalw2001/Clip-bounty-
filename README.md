# MATCH ME

Two friends. One room. Something on the line. Lose the match, and your photo opens.

A playable prototype of a 1v1 stakes game: both players get the same absurd prompt,
both shoot a photo in-app against a 15-second clock, then play a best-of-three
reflex match. The loser chooses how they pay — open the photo, or take a forfeit.

## Run it

```bash
npm install
npm run dev
```

Open on a phone (or emulate one) — it's designed mobile-first. **Turn sound on.**
Roughly half the experience is audio, and it's muted-by-default-hostile: the whole
thing feels inert without it.

## What's actually interesting in here

**Every sound is synthesized at runtime.** `src/lib/audio.ts` builds each effect
from oscillators and noise buffers via the Web Audio API — no audio files, no
licensing, nothing added to the bundle. Sound is the biggest single contributor to
"this feels like a game" and almost no web app bothers. Every effect is a few lines
and tunable by hand.

**Capture is camera-only, with no file-picker fallback.** `src/hooks/useCamera.ts`
has no `<input type="file">` anywhere, deliberately. Combined with prompt-driven
capture on a timer, this means there's no gallery to reach into and nothing to gain
by escalating — the prompt *is* the content. If the camera is unavailable you simply
can't ante up, which is the correct failure mode.

**The loser always has a real choice.** `src/screens/Choice.tsx` — open the photo, or
take a forfeit. Consent stays live at the moment it matters instead of being
collected up-front in a checkbox, and the forfeits are frequently funnier than the
photo. This is the most important screen in the app.

**The reveal is banded, not blurred.** `src/screens/Reveal.tsx` wipes a sharp copy of
the image over a blurred one in 26 discrete bands behind a glowing scan line. A
smooth linear unblur reads as a loading spinner; chunky bands read as something
being forced open.

## Design notes

The look is deliberately *not* assembled from a component library. Magic UI /
Aceternity / shadcn defaults have a recognizable house style at this point, and
leaning on them is the fastest way to look machine-generated. Instead:

- **Palette** — warm-tinted charcoal (never `#000`), warm off-white (never `#fff`),
  acid lime as the primary instead of the default purple/blue.
- **Type** — Anton for display (condensed, poster-loud), Space Grotesk for UI,
  JetBrains Mono for codes/timers/HUD. Mono numerals are most of the arcade feel.
- **Texture** — SVG `feTurbulence` film grain over everything, plus a faint
  blueprint grid and vignette. Cheap, and it stops the screen reading as a flat
  gradient.
- **Chromatic aberration** on display text — offset cyan/magenta ghosts, mimicking
  print misregistration.
- **No soft grey drop-shadows.** Hard offset shadows only. Buttons translate *into*
  their own shadow on press so they physically depress.
- **Icons are SVG, never unicode glyphs.** Anton has essentially no symbol coverage,
  so `♪ ✓ → ✦` render as tofu boxes. See `src/components/ui/Icon.tsx`.

Juice layer: `src/components/fx/` — screen shake with decay and directional bias,
particle bursts with varied size/rotation/distance, and a hit flash that starts at
full opacity and decays (a flash that fades *in* has no impact).

## Structure

```
src/
  lib/audio.ts        procedural Web Audio SFX + haptics
  lib/prompts.ts      the prompt deck + forfeits  ← the actual product
  store/game.ts       phase machine, scoring, bot opponent
  hooks/useCamera.ts  camera-only capture
  components/ui/      Button, Type, Icon, Texture, SoundToggle
  components/fx/      Shake, Flash, Particles
  screens/            one file per phase
```

The phase machine (`Phase` in `store/game.ts`) runs
`landing → lobby → brief → capture → armed → countdown → round → verdict → choice → reveal → result`.

## Prototype scope

Single-device with a bot opponent. The rival "joining" in the lobby and their
reaction times are simulated, and the bot's stake is a generated placeholder. The
phase machine is shaped so a realtime transport drops into the store without
touching any screen code — that's the next piece, not a rewrite.

Photos live in memory as data URLs for the length of a match. Nothing is uploaded,
nothing is written to disk.

## Before this ships to real users

The prototype is safe because it's local and single-device. Multiplayer changes that,
and these are load-bearing rather than nice-to-have:

- **Real age assurance.** A self-attested 18+ checkbox is not a control. An app in
  this shape will attract minors, and a minor staking a photo is a category of
  problem that ends companies.
- **Server-side moderation** on any image that crosses the network, before delivery.
- **Screenshots are unpreventable.** Snapchat spent a decade failing at this. Design
  as though every revealed photo is permanent, because it is.
- **Reporting, blocking, and one-tap retraction** on every match.
- Keep the deck in the funny/embarrassing lane. It isn't only the safer choice — it's
  the one that travels, because embarrassing content is shareable and intimate
  content structurally isn't. The safe version is the viral version.

## Stack

Vite 8 · React 19 · TypeScript · Tailwind CSS v4 · Motion 13 · Zustand 5
