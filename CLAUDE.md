# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Darkworld is a location-based AR RPG set in real Philadelphia-area geography (Philadelphia, Ephrata, Lansdowne). It is a **single-file vanilla JavaScript PWA** — the entire game lives in `index.html` (~6,000 lines). There is no build system, no package manager, no framework, and no backend. Deployment is via Netlify as a static site.

## Development Workflow

There is no build, compile, or lint step. Development is:
1. Edit `index.html` directly.
2. Open in a browser (or serve locally with any static file server, e.g. `python3 -m http.server`).
3. Test on mobile or with browser DevTools device emulation in portrait mode — the game enforces portrait orientation.

There are no automated tests.

## Architecture: Single-File Structure

`index.html` is organized top-to-bottom in these distinct sections:

1. **`<head>`** — PWA meta tags, Google Fonts (Metal Mania, IM Fell English, Share Tech Mono), inline `<style>` block with all CSS.
2. **`<body>` HTML scaffold** — Static screen container `<div>`s, all modal overlays, and the AR screen. All content within them is rendered dynamically by JS.
3. **`<script>` data constants** — All game data as `const` objects (lines ~1932–2573).
4. **`<script>` function definitions** — All game logic (lines ~2574–5831).
5. **`<script>` boot** — `startGameTimers()`, game loop start, audio unlock listeners, service worker registration, orientation lock, and `initTitleScreen()` call.

### Body Screen IDs

| ID | Purpose |
|---|---|
| `#rotate-warn` | Landscape orientation blocker (always in DOM, shown via CSS media query) |
| `#screen-intro` | Lore intro slideshow (first launch) |
| `#screen-create` | Character creation (class → stats → name, multi-page) |
| `#screen-world` | World select (Philadelphia / Ephrata / Lansdowne) |
| `#screen-game` | Main game: map canvas + sidebar + HUD buttons |
| `#screen-ar` | AR camera view |
| `#combat-modal` | Combat overlay (shown via `.active` class) |
| `#death-screen` | Death/revive screen |
| `#loot-popup` | Post-combat loot display |
| `#npc-modal` | NPC dialogue sheet |
| `#cutscene-overlay` | Quest cinematic slides |
| `#quest-complete-overlay` | Quest completion summary |
| `#quest-modal` | Quest log |
| `#inv-modal` | Inventory / gear management |
| `#shop-modal` | Black market shop |
| `#skills-modal` | Skill tree |
| `#levelup-modal` | Stat allocation on level-up |

## Core Data Structures

All constants are defined inside `<script>` before any function:

### `CLASSES` (line ~1935)
10 character classes: Fighter, Paladin, Ranger, Magic-User, Illusionist, Cleric, Thief, Assassin, Monk, Druid. Each defines:
- `emoji`, `desc`
- `resource` — the resource type name (Rage, Mana, Energy, Chi, Holy Power, Focus)
- `resColor`, `resMax`, `resStart`, `resRegen` — resource bar styling and regen rate (negative = drains)
- `stats` — `{hp, atk, def, crit, dodge}` multipliers applied during `buildPlayer()`
- `abilities` — array of 4 ability objects `{name, emoji, cd, cost, dmgMult, effect, desc}`. Abilities are: Basic (no cost), Core, Core, Signature (high cost/damage).

### `WORLDS` (line ~2061)
3 world objects keyed `philadelphia`, `ephrata`, `lansdowne`. Each has:
- `center: {lat, lng}` — world origin for projection and GPS fallback
- `zones` — array of 5 zone objects `{max, name, danger, color, dc}` where `max` is radius in miles
- `zoneDescs` — 5 flavor text strings
- `bosses` — array of 7 boss objects `{name, landmark, emoji, lat, lng, hp, atk, def, xp, gold, type, zone, color, uniqueDrop, portrait?, isWorld?}`

### `NPCS` (line ~2166)
Array of NPC objects with `id`, `name`, `title`, `portrait`, `world`, `lat`, `lng`, and `dialogue` (branching tree of `{lines[], options[]}` nodes).

### `DUNGEONS` (line ~2220)
Array of dungeon/location objects with `id`, `name`, `subtitle`, `lat`, `lng`, `color`, `world`, `locked`, `lockMsg`, `portrait`. Currently contains one entry (The Iron Meridian). Rendered on the map; locked dungeons show a tooltip.

### `QUESTS` (line ~2237)
10 quest objects. Each has:
- `id`, `name`, `location`, `type` (`'SOLO'` | `'BOSS CHAIN'`), `color`, `world`
- `npcId` — links to an NPC who starts the quest (or `null` for map-marker quests)
- `lat`/`lng` — map marker position (for non-NPC quests)
- `cutscene` — array of slide objects `{img, label, lines[]}` shown on quest accept
- `stages` — array of stage objects with `type: 'accept'|'kill'|'boss'`, `mob`, `count`, `bossName`, `desc`, `detail`
- `reward: {xp, gold: [min, max]}`, `rewardDesc`

Active quest progress lives in the `playerQuests` global: `{ questId: { stage, kills:{}, status:'available'|'active'|'complete' } }`.

### `MOB_TYPES` (line ~2441)
Array of 27 mob archetypes. Fields: `name`, `emoji`, `zone` (0–4), `hp`, `atk`, `def`, `xp`, `gold: [min, max]`, `portrait`. Optional flags:
- `questOnly: true` — excluded from random map spawns; only appear via quest logic
- `isMini: true` — quest mini-boss (higher stats, treated like a named boss in combat display)

### `ITEMS` (line ~2472)
Object keyed by item name. ~60 items across:
- **Weapons** tier 1–3 (purchasable), tier 4 legendary (drop-only, `classReq` field locks to one class)
- **Armor** tier 1–3
- **Accessories** tier 1–4 (boss unique drops are tier 4)
- **Potions** — `healPct` or `resPct` fields

Fields: `emoji`, `type`, `tier`, stat bonuses (`atk`, `def`, `hp`, `crit`, `dodge`, `resMax`), `cost` (0 = drop-only), `desc`. Optional: `classReq`.

### `SKILL_TREE` (line ~2544)
- `t1`, `t2`, `t3` — arrays of 3 passive skills each, gated by previous tier choice
- `classUnique` — object keyed by class name, one unique passive per class

Key scalar constants:
- `ENGAGE_MILES = 0.1` (line 3685) — tap radius for regular mobs/NPCs (~528 ft)
- `BOSS_ENGAGE_MILES = 0.05` (line 3686) — tap radius for bosses (~264 ft)
- `BAG_SIZE = 12` (line 2574) — inventory bag slots
- `SAVE_KEY = 'darkworld_save_v1'` (line 5232)
- `ACT_LOCKOUT = 350` ms (line 4379) — enforced pause between player actions
- `CD_SCALE = 1800` ms per cooldown unit (line 4380)

## Major Game Systems

### Save / Load (line ~5232)
All persistence is `localStorage` under `SAVE_KEY`. `buildPlayer()` creates a fresh player object. `saveGame()` serializes the full player state (stats, inventory, equipped gear, skills, skill-applied flags, quest progress, GPS position, boss states, selected world). `loadSave()` returns the parsed object or null. Save is called automatically after combat victory, purchases, and skill selection.

### Player Object (`Player`)
Created by `buildPlayer()` after character creation. Key fields: `name`, `className`, `emoji`, `level`, `xp`, `xpNext`, `gold`, `hp`, `maxHp`, `res`, `maxRes`, `atk`, `def`, `crit`, `dodge`, `STR/INT/WIS/DEX/CON/CHA`, `baseStats`, `statPoints`, `skills`, `equipped: {weapon, armor, accessory}`, `inventory: []` (array of item name strings, max `BAG_SIZE`), `lat`, `lng`, plus skill-flag booleans (`_appliedT1Iron`, etc.).

Level cap is 100. Per level: maxHp ×1.12, maxRes ×1.06, atk ×1.10, def ×1.08, crit +0.5 (capped at 50), +2 `statPoints`. XP formula: `xpForLevel(lvl) = Math.floor(120 * lvl^1.85)`.

### Stat Allocation (`STAT_EFFECTS`, line ~5017)
On level-up, `openLevelUpModal()` lets the player spend 2 stat points. Effects: STR→+1 ATK, DEX→+1.5% crit & dodge, INT→+15 res max +1 ATK, CON→+10 max HP, WIS→+20 res max +heal bonus, CHA→+gold & XP bonus.

### GPS & Geolocation (line ~4331)
`distMiles(lat1, lng1, lat2, lng2)` uses the Haversine formula. `bearing()` returns compass heading in degrees. `startGPS()` calls `navigator.geolocation.watchPosition` with a smoothing filter to reduce jitter. When GPS has no first lock (`gpsFirstLock === false`), the system ignores distance checks — all map entities are tappable regardless of player position, and the AR view falls back to center-screen rendering.

### Map Canvas (line ~3227)
`canvas#map-canvas` renders everything via 2D context `ctx`. `ll2px(lat, lng)` converts coordinates to canvas pixels using a flat projection scaled by `zoom` and offset by `viewX/viewY`. `render()` draws: background image, zone polygons, grid, paths, mob spawns, boss markers, NPC markers, dungeon markers, quest markers, player position + engagement radius. Rendering is dirty-flagged: `markDirty()` sets `_renderDirty = true`; the `gameLoop()` only calls `render()` when dirty and not in combat. Pinch-to-zoom and drag panning are supported via touch and mouse events.

### AR Engine (line ~3818)
`startAR()` requests camera via `getUserMedia`, renders overlays on `canvas#ar-canvas` over `video#ar-video`. `renderAR()` runs each animation frame. Enemies visible within range are sorted by bearing vs. device heading (`arHeading`, smoothed from `DeviceOrientationEvent`); each is drawn as a portrait + health bar at a bearing-derived screen X position. NPCs and quest markers also appear in AR. `AR_FILTERS` array (line 3764) defines named visual filter presets (Hellview, Plague Haze, etc.); `cycleARFilter()` / `applyARFilter()` toggle them. When GPS is not locked, all entities render center-screen regardless of compass.

### Combat (line ~4374)
State: `inCombat`, `curEnemy`, `isBoss`. Initiated by `startCombat(entity, isBoss)`. The `combatTick()` interval (every 100ms) manages enemy attack timer, status effect ticks, and resource regen. `playerAct(ability)` enforces `ACT_LOCKOUT` between actions, checks resource cost, calls `calcDamage(ability)`, applies status effects, triggers `doEnemyAttack()` after a delay. Combo meter (`playerCombo`) builds on consecutive hits; Signature ability resets it for a bonus. `victory()` awards XP and gold (with `xpBonus`/`goldBonus` modifiers), rolls loot via `rollLootDrop()`, queues level-ups in `pendingLevelUps`, and auto-saves.

### Loot Drop (`rollLootDrop`, line ~2906)
On boss kill: always drops the boss's `uniqueDrop` if the player doesn't already own it, plus potentially the class legendary weapon. On regular kill: uses `ZONE_DROP_TIERS = [1, 1, 2, 2, 2]` to pick item tier by zone index, then randomly selects a matching item the player doesn't own.

### Intro & Cutscenes
- `INTRO_SLIDES` — 3-slide lore intro sequence shown on first launch (before character creation). Managed by `introStart()` / `introAdvance()`.
- Cutscene overlay (`#cutscene-overlay`) — full-screen cinematic triggered on quest accept. Defined per-quest as `cutscene: [{img, label, lines[]}]`. Managed by `cutscenePlay(slides, doneCb)` / `cutsceneAdvance()`.

### Audio (line ~5834)
Procedural only — Web Audio API. Two primitives: `playTone({type, freq, freq2, gain, attack, decay, sustain, release, duration, detune, filter, filterFreq, filterQ})` and `playNoise({...})`. Named event functions: `sndPlayerHit`, `sndPlayerAttack`, `sndCrit`, `sndSignature`, `sndEnemyAttack`, `sndEnemySpecial`, `sndEnemyCrit`, `sndVictory`, `sndDeath`, `sndLevelUp`, `sndCombatStart`, `sndDodge`, `sndComboRise`, `sndLoot`. Audio context (`_audioCtx`) is lazily created and unlocked on the first user touch/click.

### Game Timers (`startGameTimers`, line ~5820)
Called once at boot. Sets two intervals:
- Every 5s: regenerate 3% of `maxRes` when out of combat, then call `setPUI()`.
- Every 60s: randomly respawn 12% of defeated mobs.

### Screen Navigation
`showScreen(id)` toggles `.active` class. Flow: Title → (Intro lore slides on first load) → Character Creation (class grid → stat roll → name entry, `goCreatePage(n)`) → World Select (`selectWorld(key)`) → Game Map. AR View replaces the game screen (`startAR()` / `stopAR()`). Overlays (inventory, shop, skills, quest log, combat) layer on top of `#screen-game`.

## Conventions & Constraints

- **Portrait-only**: The landscape CSS media query forces `#rotate-warn` visible; `screen.orientation.lock('portrait')` is also called at boot. Don't break either mechanism.
- **No external JS dependencies**: Keep it that way — no npm, no CDN scripts beyond Google Fonts.
- **Image assets**: Boss/NPC/mob portraits are PNG/JPEG files in the repo root, referenced by filename string in data constants. When adding new art, add the file to the root and reference it in the appropriate data constant.
- **CSS custom properties**: Colors are defined as CSS vars at the top of the `<style>` block. Full palette: `--void`, `--abyss`, `--pit`, `--shadow`, `--dark`, `--muted`, `--blood`, `--crimson`, `--ember`, `--gold`, `--pale`, `--bone`, `--ghost`, `--soul`. Use these rather than hardcoding hex values.
- **Service workers**: `sw.js` is the active service worker (network-first for navigation, cache-first for fonts/assets). `service-worker.js` is a legacy stub — do not use it. The cache name is `darkworld-v1` in `sw.js` — bump this string when making breaking asset changes that need cache invalidation.
- **Dirty rendering**: Always call `markDirty()` after any state change that affects the map. The game loop only re-renders when dirty and out of combat.
- **Quest-only mobs**: Mobs with `questOnly: true` in `MOB_TYPES` must never appear in `genSpawns()`. Random spawns already filter them out — preserve that filter.
- **Coordinates**: World zones use real geographic coordinates. Philadelphia center: `(39.9492, -75.1719)`. Ephrata: `(40.1793, -76.1794)`. Lansdowne: `(39.9403, -75.2726)`.
- **`selectedWorld` and derived globals**: After `selectWorld(key)`, the module-level `CENTER`, `ZONES`, `ZONE_DESCS`, and `BOSSES` variables are set from `WORLDS[key]`. Always call `selectWorld()` rather than setting these directly.
- **No `console.log` spam**: The codebase has none. Don't add debug logs to committed code.
