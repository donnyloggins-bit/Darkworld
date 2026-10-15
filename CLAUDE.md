# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Darkworld is a location-based AR RPG set in real Philadelphia-area geography (Philadelphia, Ephrata, Lansdowne). It is a **single-file vanilla JavaScript PWA** — the entire game lives in `index.html` (~5,800 lines). There is no package manager and no framework. An optional Supabase backend (accounts, cloud save, live raids) is reached with plain `fetch` + one WebSocket — no SDK. Deployment is via Netlify as a static site.

## Development Workflow

There is no compile or lint step. The only build step is `netlify-build.sh`, which writes `config.js` (Supabase URL + anon key) from Netlify env vars. Development is:
1. Edit `index.html` directly.
2. For online features locally, copy `config.example.js` to `config.js` (gitignored) and fill it in. Without `config.js` the game runs fully offline.
3. Open in a browser (or serve locally with any static file server, e.g. `python3 -m http.server`).
4. Test on mobile or with browser DevTools device emulation in portrait mode — the game enforces portrait orientation.

There are no automated tests.

## Architecture: Single-File Structure

`index.html` is organized top-to-bottom in distinct sections:

1. **`<head>`** — PWA meta tags, Google Fonts (Metal Mania, IM Fell English, Share Tech Mono), inline `<style>` block with all CSS.
2. **Data constants block** — All game data defined as `const` objects before any functions.
3. **Function definitions** — 164+ functions covering all game systems.
4. **`<body>`** — Minimal HTML scaffold (a handful of `<div id="...">` screen containers); all UI is rendered dynamically by JS.
5. **`<script>` boot** — Service worker registration and game initialization call at the bottom.

## Core Data Structures

All constants are at the top of the `<script>` block:

- **`CLASSES`** — 10 character classes (Fighter, Paladin, Ranger, Magic-User, Illusionist, Cleric, Thief, Assassin, Monk, Druid). Each defines stat multipliers (1.0–1.8×), a resource type (Rage, Mana, Energy, Chi, Holy Power, Focus), and 4 abilities (Basic, Core, Core, Signature) with cooldowns and costs.
- **`WORLDS`** — 3 world objects, each with a center lat/lng, 7 named zones with danger levels and colors, and a world boss definition.
- **`NPCS`** — Quest-giver objects with portrait references and multi-branch dialogue trees.
- **`QUESTS`** — Multi-stage quest objects with objective types (`accept`, `kill`, `boss`), cutscene slide arrays, and XP/gold rewards.
- **`MOB_TYPES`** — Enemy archetypes with stat ranges and portrait filename references.
- **`ITEMS`** — 50+ item definitions across weapons (tier 1–4, class-locked legendaries), armor, accessories, potions, and boss unique drops.
- **`SKILL_TREE`** — 3-tier passive tree plus class-unique actives.

Key scalar constants: `ENGAGE_MILES = 0.1`, `BOSS_ENGAGE_MILES = 0.05`, `SAVE_KEY = 'darkworld_save_v1'`.

## Major Game Systems

### Save / Load
The source of truth on-device is `localStorage` under `SAVE_KEY`; when signed in, `saveGame()` also queues a debounced cloud push (see Online below). `buildPlayer()` creates a fresh player object; the save system serializes/deserializes the entire player state including inventory, quest progress, skill choices, and position history.

### GPS & Geolocation
`distMiles(lat1, lng1, lat2, lng2)` uses the Haversine formula. `bearing()` returns compass heading in degrees. A smoothing filter reduces GPS jitter. When GPS is not locked, the system falls back to a 2-mile detection radius centered on the world center coordinates. Geolocation requires HTTPS (Netlify provides this).

### Map Canvas
Custom 2D lat/lng → pixel projection renders zone polygons, boss/NPC/dungeon markers, and the player position on an HTML5 canvas. No WebGL. Viewport panning is handled via mouse/touch events; pinch-to-zoom is supported. Portrait images are preloaded and cached for reuse each frame.

### AR Engine
Accesses `getUserMedia` for the device camera and overlays game objects on the video feed with a canvas. The camera pose comes from `arPoseFromEuler()` (heading of the back camera + elevation, correct when the phone is held upright); iOS uses `webkitCompassHeading`. Once `deviceorientationabsolute` readings arrive, relative `deviceorientation` events are ignored (they use a different zero and made the view flip). Sprites are placed with a real tan projection (`AR_HFOV`) and move with tilt; `arSmoothAngle` smooths small wobbles heavily but follows real turns quickly — don't add per-sprite smoothing on top. `arSlowTick()` (4×/s) picks the nearest `AR_MAX_DRAWN` monsters and quest markers; the per-frame `renderAR()` only draws. Atmosphere (vignette, mist, tint, red sky, VHS scanlines) is CSS layers (`#ar-atmo`, `#ar-tint`, `#ar-sky`, `#ar-dread`), not canvas fills. Portraits/glows are pre-rendered once (`arCircleSprite`, `arGlowSprite`).

### Combat
Real-time with action cooldowns. On each player action: check resource cost, apply damage formula (base stats + weapon + crit roll + modifiers), apply status effects (bleed, poison, stun, slow, confuse), then schedule the enemy's response turn. The combo meter accumulates to grant bonus damage. Victory triggers a level-up queue; XP formula is `xpForLevel(lvl) = 120 * lvl^1.85`.

### Audio
Procedural only — no audio files. Everything routes through `_bus` (master gain → limiter, plus a shared generated convolution reverb); build sounds from `voice()`, `noise()` and `bell()` (their `at` offset is sample-accurate — prefer it to `setTimeout`). Noise buffers are generated once in `buildAudioBus`, never per hit. `creatureCry()` gives each family (undead / specter / beast / construct / demon, via `creatureFamily()`) its own voice. The map has an ambient bed (`startAmbience`/`updateAmbience`, every 2 s) whose drone darkens with danger ring, boss and raid proximity and ducks during combat; schedule gain changes with `cancelScheduledValues` + `setTargetAtTime`. `combatHeartbeat()` and the riposte tell run from `combatTick`. Haptics go through `buzz(kind)` (Capacitor Haptics plugin in the app, `navigator.vibrate` on Android web; iOS Safari has none). The 🔊 button cycles sound+buzz → sound only → muted, saved under `darkworld_audio_v1`. The audio context is unlocked on first interaction and suspended while the page is hidden.

### Screen Navigation
Screens are `<div>` containers toggled visible/hidden. The flow is: Title → Character Creation (class select → stat roll → name entry) → World Map → AR View. Inventory, shop, skills, and quest log are overlay panels on top of the map.

### Living City (spawns + shrines)
World monsters are not random per device. `refreshLiving()` rolls each ~170m cell (`CELL_LAT`/`CELL_LNG`) from a seed of world + cell + 15-minute window (staggered per cell), so every player sees the same monsters in the same places. Keep it deterministic: never call `Math.random()` inside the roll, and keep the number of `rng()` draws per mob fixed (`buildLivingMob` is always called, even when a mob is reused). Species/positions are shared; stats scale to the viewer's level. Kills and shrine cooldowns live in `localStorage` under `darkworld_living_v1`. Quest mobs (`questMob:true`) live in the same `spawns` array and must survive refreshes. The map plays at street level: `MAP_MILES` is the half-screen height at zoom 1.

### Philadelphia (districts + landmarks)
`PHILLY_DISTRICTS` (~55 real neighborhoods, matched by nearest center within 1.2 mi) and `PHILLY_LANDMARKS` (~46 real places) live in the Living City section. Districts name the HUD, are claimed on first visit (`Player.districts`), and bias spawns toward their biome's species (`DISTRICT_BIOMES`) by weighting the pick — no extra rng draws. Landmarks become larger shrines with double offerings and lore (`Player.landmarks`); random shrines yield within ~100m of one. Philadelphia is the reference city: real names, coordinates people can actually stand on (not in the river). Canvas emoji that default to text presentation need `\uFE0F` and a visible `fillStyle`.

### The Hunt (bounties, bestiary, walking)
Daily bounties are seeded by the local date (`genBounties`), so everyone shares them. `huntOnKill`/`huntProgress`/`huntOnGPS` feed progress; `Player.daily`, `Player.bestiary`, `Player.walkedMi`, `Player.ripostes` are saved with the character. Walking ignores jitter (<10m) and pace above `WALK_MAX_MPH`. `huntLevelCheck()` must not level up while `inCombat` (victory() does it).

### First Hunt (tutorial)
New characters get `Player.tutorial` = 'fight' → 'riposte' → 'shrine' → 'hunt' → 'walk' → 'done' (saves without the field count as done). The tutorial monster/shrine (`TUT_MOB`, `TUT_SHRINE`) are personal, not part of the seeded world, and `tutKeepClose()` re-places them near the hunter (GPS can lock anywhere). Hooks: `tutOnCombatStart`, `tutOnPlayerAct`, `tutOnVictory`, `tutOnShrine`, `tutOnHuntOpen/Closed`. The coach card (`coach()`, `coachGlow()`) sits above combat but below menus (z-index 140). Character creation goes straight to Philadelphia, auto-rolls stats, pre-fills a name and pre-selects Fighter.

### Riposte
Using a damaging ability in the last `RIPOSTE_FRAC` of the enemy's attack bar parries the hit (resets `nextAttackAt`) and deals 1.5x.

### Turf Wars
Three orders (`FACTIONS`: lantern, bell, river) compete for `PHILLY_DISTRICTS` each week (Monday 00:00 Eastern; `turfWeekKey()` must match the server's `turf_week()`). `turfEarn(kind)` adds `TURF_POINTS` for the district the player is in to `turfPending` (and to `turfStandings` at once so the tab moves); `turfFlush()` sends the batch to `add_influence()` every 60s and requeues on failure. Holder = most points; members get `turfBonus()` (+10% XP/gold) in held districts. Hooks: `huntOnKill` (not raids or the tutorial mob), `spinShrine`, `huntOnGPS`, `victory`, `checkDistrict`, `drawTurfBanners` in `render`. Recruiting opens the TURF tab once at level 3. The server's faction wins (`turfSyncFaction`). Online-only: the tab is `net-only`. Never let the client pick the faction or district in SQL: `add_influence()` reads the faction from `player_faction`, validates districts against `turf_districts` and caps 400 points/hour.

### Seasons
Each season builds to one giant fight somewhere in the city. `SEASONS` holds the data (Season 0, The Hollow Night: Oct 24–31 2026, finale at Eastern State). Phases come from the clock (`seasonPhase()`: omen → nights → finale → after; all Eastern time) via `seasonNow()`, which tests shift with `window.__dwTimeShift`. Each night 6 PM–5 AM one lieutenant (`tonightsLieutenant()`) joins `BOSSES` with `isSeason:true` (`seasonSync()` every 2 s; excluded from `bossStates`, scaled to the viewer's level). Breaking one records `Player.season[id].nights[date]` and a shard; 3 shards give the Hollow Lantern, finale damage gives the Key of Cherry Hill (keepsakes have `season:true` and are filtered out of the shop and loot). After dark during a season `seasonNightSurge()` raises spawn odds in `refreshLiving` (same clock for everyone, so the city stays shared). The finale online is a raid row with `season` set (`supabase/season-0.sql`; `applyRaidRow` flags `isFinale`); offline it is a solo boss. `seasonFinalePhaseTick()` drives the HP phases and scales the Warden's attack/defense to each hunter; `seasonSiegeMult()` halves damage beyond `SEASON_SIEGE_MI` of the site and `bossTooFar()` lets the finale be joined from anywhere in the city. The omen cutscene plays once per season after the tutorial (`seasonMaybeOmen`). The HUD's `#goal-hud` (`goalTick()`) always shows the season line and the next thing to do; the title shows `#title-season`.

### Crews
Up to 6 friends (`CREW_MAX`) who hunt together. Online-only (`#crew-btn` is `net-only`); everything goes through RPCs in `supabase/schema.sql` (`create_crew`, `join_crew`, `leave_crew`, `crew_heartbeat`, `crew_ping`, `crew_state`); the tables have RLS on and no policies. `crewTick()` (every `CREW_TICK_MS`) sends a heartbeat (name, class, level, district, presence cell) and reads `crew_state`, which returns members with `online`/`near` (same ~1 km cell, seen in the last 3 min) and the last 2 h of calls, never user ids or positions. `crewNear` drives `crewBonus()` (+5% XP/gold each, max 3, in `victory`/`spinShrine`) and `crewFury()` (+10% raid damage each, in `calcDamage`). Calls (`CREW_CALLS`) carry a district; only "I'm here" carries a position, rounded server-side to ~100 m, and `drawCrewSpots()` shows it for 30 min. Invite links are `?crew=CODE`; `crewReadInvite()` stores the code under `darkworld_crew_invite` and `crewMaybeInvite()` opens the panel after the tutorial.

### Warbands
Raid groups of 25 or 50 (`create_warband(name, size)`), shown in the ALLIES modal's WARBAND tab next to CREW (`partyTab`). A hunter can be in one crew and one warband. Roles come from the class (`CLASS_ROLES`; `Player.role`, saved). `warbandTick()` runs with `crewTick()` and sends `warband_heartbeat` with the current `RAID` id when the hunter is fighting it or within `WARBAND_RAID_MI`; `warband_state(p_raid)` returns the roster with `at_raid`, recent musters and the top warbands on that raid (summed from `raid_damage`). At a raid: `warbandDmg()` (+2% per other member present, max +30%, +10% for a full line-up of 1 tank / 2 healers / 5 damage) is added in `calcDamage`, `warbandMitigation()` (-15% with a tank) in the enemy hit, and `warbandCombatTick()` heals 1.5–2.5% every 3 s with healers. `warband_muster` is the warband-wide call, limited to one every 2 minutes per hunter.

### Online (Supabase)
The `ONLINE` section of `index.html` (after the save system) holds everything server-side. Schema, RLS and the `raid_hit()` function live in `supabase/schema.sql`; `supabase/start-raid.sql` starts a raid; `supabase/season-0.sql` schedules the Halloween finale. Setup steps for humans are in `SUPABASE-SETUP.md`.
- **Gate**: `NET_ON` is false when `window.DW_CONFIG` is missing — every online entry point must no-op in that case.
- **Auth**: email + password via the GoTrue REST endpoints; session in `localStorage` under `darkworld_session_v1`, refreshed by `netAccessToken()`.
- **Cloud save**: `characters` table, one row per account, full save blob in `data`. Newest `savedAt` wins; local saves carry an `owner` uid. Mid-game, a newer cloud hunter is never swapped in silently (`netCloudConflict`).
- **Raids**: the live raid row becomes `RAID`, appended to `BOSSES` with `isRaid:true` (excluded from `bossStates`). Local hits lower `RAID.hp`; `raidFlush()` sends the difference to `raid_hit()` every 1.5s. `_srv`/`_inflight` reconcile server HP with unsent damage. `victory()` defers to the server for raid kills. HP changes arrive over Supabase Realtime (raw Phoenix WebSocket) with a 20s poll as fallback.
- **Social**: `hunter_leaderboard` view (safe columns only) and `hunters_near()` (counts only; presence rows are unreadable, ~1 km cells). Never expose `user_id`, emails or exact positions.
- **Trust**: the client is untrusted. Never add RLS policies that let players write `raid_bosses` or `raid_damage` directly; damage goes through `raid_hit()`, which clamps it.

### Native apps (`app/`)
`app/` wraps the game with Capacitor 8 for iOS/Android; it is the only place npm is used. `npm run build:web` (`app/scripts/build-www.mjs`) copies `index.html`, `privacy.html`, `manifest.json`, `icons/` and every root image into `app/www` and writes `config.js` from `SUPABASE_URL`/`SUPABASE_ANON_KEY`. `npx cap sync` copies it into the native projects. `.github/workflows/android.yml` builds a debug APK and a release AAB (signed when the `ANDROID_KEYSTORE_*` secrets exist). iOS must be built on a Mac (`npm run ios`). The service worker is skipped inside the app (`IS_NATIVE_APP`). Safe areas: use `var(--sat)`/`var(--sab)` for anything pinned to the top/bottom edge. Store requirements live in-game: Delete Account (`delete_my_account()`) and `privacy.html`. See `app/STORE-GUIDE.md`.

## Conventions & Constraints

- **Portrait-only**: A landscape warning modal blocks play. Don't break this.
- **No external JS dependencies**: Keep it that way — no npm in the game, no CDN scripts beyond Google Fonts (npm lives only in `app/` for the native shell). Talk to Supabase with `netRequest()`/`netAuthed()`, not the SDK.
- **Secrets**: never commit `config.js` or `.env`. The anon key is injected at deploy time; the service-role key never goes anywhere near the client.
- **Image assets**: Boss/NPC/mob portraits are PNG/JPEG files in the repo root, referenced by filename string in data constants. When adding new art, add the file to the root and reference it in the appropriate data constant.
- **CSS custom properties**: Colors are defined as CSS vars at the top of the `<style>` block (`--void`, `--abyss`, `--blood`, `--gold`, etc.). Use these rather than hardcoding hex values.
- **Service workers**: `sw.js` is the active service worker (network-first for navigation and `config.js`, cache-first for fonts; Supabase requests bypass it). `service-worker.js` is a legacy file. The cache name is `darkworld-v4` — bump this string when making breaking asset changes that need cache invalidation.
- **Coordinates**: World zones use real geographic coordinates. Philadelphia center: `(39.9492, -75.1719)`. Ephrata: `(40.1793, -76.1794)`. Lansdowne: `(39.9403, -75.2726)`.
