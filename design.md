# VALO ROULETTE — DESIGN.md (project constant)

> This file is the single source of truth for the whole project.
> Every page, component, and future mode must obey it. Do not drift.

## 1. Atmosphere

Arcade cabinet meets VALORANT protocol terminal. A pixel-fate machine,
not a stats dashboard. Dark, loud, mysterious, slightly sarcastic.
Reference images (`public/reference/`) define the taste: chunky pixel
headers, black dotted grid backgrounds, marquee ticker strips, OS-window
cards with title bars, sprite coins/stars, ground strips, device frames.

Reading of this site: an underground arcade ritual for players who
refuse to pick their Agent. Keywords: fate, protocol, lock-in, no rerolls.

## 2. Palette (locked, 1 accent)

| Token      | Hex       | Role                                              |
| ---------- | --------- | ------------------------------------------------- |
| `--blood`  | `#FF4655` | SOLE accent. VALORANT official red. CTAs, active states, rare highlights only. |
| `--abyss`  | `#0F1923` | Primary background. VALORANT official ebony.      |
| `--void`   | `#070B12` | Deeper background for wells, chambers, footer.    |
| `--bone`   | `#ECE8E1` | Primary text + button faces. VALORANT off-white.  |
| `--ash`    | `#7D8082` | Borders, dividers, dim labels. VALORANT grey.     |
| `--smoke`  | `#B9BFC6` | Secondary text.                                   |
| `--gold`   | `#FFD694` | Micro-labels, ticker separators, XP bars. Max 1 element per viewport. |
| `--panel`  | `#141D29` | Card / window body on dark.                       |

Rules: never pure `#000`. No gradients except subtle vertical darkening
on the hero well. No purple/blue glow, no neon rainbow. Red is scarce so
the reveal feels expensive. Text contrast must pass WCAG AA.

## 3. Typography (pixel only, no exceptions)

- Display: `Press Start 2P` — H1/H2, logo, CTA labels, result names.
  Uppercase. Sizes via `clamp()`. H1 max 3 lines.
- HUD/body: `VT323` — everything else (labels, paragraphs, buttons,
  stats, tickers). Base 20px, labels uppercase with letter-spacing.
- Never Inter, Roboto, Arial, or any serif. Numbers/percentages in VT323.
- Micro labels look like `// LOCK-IN STREAK: 07` or `[ SEED #4821 ]`.
- No em dashes anywhere. Use `//`, `+`, `>>>`, `[ ]` as separators.

Loaded via `next/font/google` (self-hosted, no layout shift).

## 4. Shape, border, texture (locked)

- `border-radius: 0` everywhere. Every card, button, window, image frame.
- Borders: 2px solid `--ash`; active/important: 2px solid `--blood`;
  inner hairline: 1px solid `#2A3646`.
- Hard offset shadows only: `box-shadow: 6px 6px 0 #000` on buttons and
  windows. No blur shadows, no glass, no translucency.
- Backgrounds: dotted pixel grid (`radial-gradient` dots, 22px tile) over
  `--abyss`; scanline overlay on chambers; stepped pixel-edge divider
  strips between sections (hard squares, no SVG curves).
- Images: `image-rendering: pixelated`. Agent art sits in thick frames
  with corner ticks `[+]`.
- Pixel dividers: rows of 8px squares alternating red/ash/bone.

## 5. Components

- `PixelButton`: bone face, 2px black border, 6px hard shadow, Press Start
  2P label. Primary variant: blood face, bone text. Hover: translate(-2,-2)
  + shadow grows. Active: translate(+4,+4), shadow collapses. Full keyboard
  focus ring in gold.
- `WindowCard`: OS-window card. Title bar (ash border-bottom, VT323
  uppercase title left, `[X]` blocks right, red square glyph), body in
  `--panel`. Used for agent files, chaos output, team list, bingo.
- `Marquee`: exactly 1 per page. Bone text on blood strip, pixel squares
  as separators, CSS steps() scroll. Pauses on reduced motion.
- `HudLabel`: `// TEXT: VALUE` micro labels in VT323 + gold keys.
- `TelemetryStrip`: 1px-divided grid row of stats (rolls, streak,
  most-rolled, pool left). Bordered cells, no cards floating.
- `AgentCell`: sharp bordered roster cell. Portrait top (pixelated),
  name in Press Start 2P, role tag. Hover: red border + 2px lift.
  Selected/locked: blood border + `LOCKED` stamp.
- `ShareCard`: DOM result card built for screenshots: fate header, agent,
  mode, challenge, site footer. Copy-text button included.

## 6. Layout

- Single column arcade flow, `max-w-6xl`, asymmetric (never centered
  everything, never 3 equal cards). Sections separated by pixel dividers.
- Page order: HUD nav > hero chamber (H1 + ROLL AGENT + CHAOS) > marquee >
  telemetry > modes (roulette / chaos / 5-stack tabs in ONE chamber, not
  three cards) > agent archive grid + detail drawer > daily agent >
  bingo (v2 hook, static preview) > footer + Riot disclaimer.
- Hero fits first viewport: H1 <= 3 lines, sub <= 20 words, CTAs visible,
  `min-h-[100dvh]` never `h-screen`.
- Mobile <768px: single column, 44px min targets, clamp() type, no overlap.

## 7. Motion (arcade snap, not soft)

- Roulette: fast name cycling with stepped timing, hard cuts, screen shake
  on lock, red flash frame on reveal. transform/opacity only.
- Scramble text on protocol lines (`INITIALIZING...` etc.).
- Buttons snap; hovers are instant steps, no ease-in-out marathons.
- SFX: original WebAudio bleeps (tick, lock thud), toggle `SFX ON/OFF`,
  default ON, persisted. No copyrighted audio.
- `prefers-reduced-motion`: static reveal, no shake/marquee.

## 8. Voice

Calm, mysterious, slightly sarcastic. System lines from ideas.md:
`YOUR FATE HAS BEEN DECIDED`, `NO REROLLS`, `DON'T BLAME US`,
`THIS WAS A MISTAKE`. Keep playful, never corporate, never mean.

## 9. Data contracts (do not break)

- `src/data/agents.json`: `{name, description, gender, photo
  (placeholder), role, abilities[{name, description, cost}]}`, 29 agents.
- `src/data/maps.json`: `{name, description, photo (placeholder), sites[]}`,
  13 maps. Haven + Lotus have 3 sites.
- Local agent art in `public/agents/` (jett, neon, omen, yoru) overrides
  placeholder via `agentPhoto()` helper with onError fallback.
- localStorage keys: `valo-seen` (no-duplicate pool), `valo-streak`,
  `valo-sfx`, `valo-rolls` (counts), `valo-daily`.

## 10. Bans (from skills, enforced)

No emojis. No Inter/Roboto/Arial/serif. No rounded corners. No purple/blue
gradients or glows. No glassmorphism. No 3-equal-cards. No centered hero
cliche. No `h-screen`. No custom cursor. No `window.scroll` listeners.
No em dashes. No lorem/placeholder copy. No truncated delivery (`TODO`,
`...`, `rest follows`). No emojis in code or UI. Unofficial fan project:
footer disclaimer `Not affiliated with or endorsed by Riot Games` always.

## 11. Routes, OG, showcase, art (added v2, equally constant)

- Routes, never hashes: `/` (lean: hero + marquee + telemetry + roulette),
  `/chaos` (chaos terminal + 5-stack), `/agents` (archive), `/daily`
  (daily gauntlet), `/challenge-run` (active run tracker + hall of fate),
  `/showcase` (gallery: filter/compare completed runs), `/weapons`
  (roulette + armory), `/challenge-room` (per-round generator). Nav shows
  all with active-route blood highlight, wraps on mobile.
- OG: `metadataBase` + `openGraph` + `twitter: summary_large_image` in root
  layout; dynamic `src/app/opengraph-image.tsx` (1200x630, blood frame on
  abyss, Press Start 2P with monospace fallback, edge runtime).
- Challenge run (`src/lib/runs.ts`): `rollChallenge()` builds a loadout
  (agent + weapon + challenge + modifier — no map). Active run in
  `valo-active-run`, stamped history (max 24) in `valo-run-history`, both
  firing `valo:runs` events. Entry points: roulette LOCK IN → CHALLENGE ROOM,
  chaos START THIS RUN, challenge-run NEW RUN.
- Challenge Room (`src/components/challenge-room.tsx`): per-round generator.
  Round 1 = pistol only (budget 800). Each round scales budget
  (eco 2k → full 4.5k → mid 5k → late 6k). Weapon pool = affordable guns
  at that budget; run weapon weighted 60%. Ability focus 50% chance
  (signature, ult, combo, info, heal, space, vision, gunplay-only).
  User generates round-by-round, marks ✓/✗, adds notes. Minimum 13 rounds
  to score. Score = cleared / played × 100%. Persisted in `valo-round-challenges`
  + `valo-active-room-run` (per run ID). End match early allowed with confirm.
- Showcase gallery (`/showcase`): filterable history cards (agent, status,
  weapon). Share row per card. No active run UI.
- Challenge run page (`/challenge-run`): active run card + banner preview +
  share row + hall of fate (completed runs list with share + delete).
- Every share caption opens with `ROLL. LOCK. PLAY.` and closes with the
  `Roll your fate:` page link. The URL lives ONLY in `src/data/config.json`
  (`siteUrl`), re-exported as `SITE_URL` from `src/lib/runs.ts` and used by
  captions, page links, OG `metadataBase`, and both canvas banners (gold
  footer line). Change domains in exactly one place.
- Daily gauntlet: seeded by per-player UID + UTC date via
  `dailyFor()` in `src/lib/fate.ts`. Stable all day, unique per
  player. 10 trials (1 mission + 9 from `MINI_TRIALS`) — all must
  clear before card unlocks and share row appears. Completion persisted
  as `valo-daily-progress` (`{day, mission, tiles}`). Prerendered
  neutral "LOADING" to avoid hydration mismatch; hydration derives
  spec and progress after mount. No standalone Bingo panel.
- Showcase banner: 1080x1350 canvas (Instagram portrait), painted pixel
  via `LOCAL_ART` in `src/lib/fate.ts` (single source of truth). `agentPhoto()`
  falls back to the placeholder JSON URL and blood monogram tiles only if a
  file is missing. Canvas painter draws LOCAL
  art only (same-origin, never taints). Credit: Pinterest creators;
  unofficial fan use only.

## 12. Weapons + anti-slop doctrine (added v3, equally constant)

- `src/data/weapons.json`: `{name, price, type}` for all 21 guns, prices
  verified against valorant-api (current: Frenzy 450, Shorty 300, Stinger
  1100, Bandit 600, Warden 2900). Single source: `WEAPONS` / `WEAPON_META`
  / `WEAPON_TYPES` / `weaponByName()` in `src/lib/fate.ts`. Chaos and
  showcase consume it. Never hardcode gun lists in components.
- `/weapons` route: WeaponRoulette (type filter + no-dupe pool +
  copy loadout) + ArmoryGrid (full price list, seen guns dimmed).
- Anti-slop doctrine (minimalist-ui + reference taste, adapted to our
  dark pixel constant): every string must instruct, report state, or
  delight. If it does none, delete it. No paragraph says twice what a
  label already says. Headers get one short sub max. Placeholders get
  one fragment, not a sentence. Helper text that restates the obvious
  is removed, not rewritten. Voice lines (quips, verdicts, protocol
  chatter) are delight and stay. (Note: no `anti-ui-slop` skill file
  exists under `.agents/skills`; this doctrine synthesizes
  minimalist-ui + design-taste-frontend + the reference images.)
