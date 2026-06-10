# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Darkworld is a location-based AR RPG set in real Philadelphia-area geography (Philadelphia, Ephrata, Lansdowne). It is a **single-file vanilla JavaScript PWA** — the entire game lives in `index.html` (~5,800 lines). There is no build system, no package manager, no framework, and no backend. Deployment is via Netlify as a static site.

## Development Workflow

There is no build, compile, or lint step. Development is:
1. Edit `index.html` directly.
2. Open in a browser (or serve locally with any static file server, e.g. `python3 -m http.server`).
3. Test on mobile or with browser DevTools device emulation in portrait mode — the game enforces portrait orientation.

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
All persistence is `localStorage` under `SAVE_KEY`. `buildPlayer()` creates a fresh player object; the save system serializes/deserializes the entire player state including inventory, quest progress, skill choices, and position history.

### GPS & Geolocation
`distMiles(lat1, lng1, lat2, lng2)` uses the Haversine formula. `bearing()` returns compass heading in degrees. A smoothing filter reduces GPS jitter. When GPS is not locked, the system falls back to a 2-mile detection radius centered on the world center coordinates. Geolocation requires HTTPS (Netlify provides this).

### Map Canvas
Custom 2D lat/lng → pixel projection renders zone polygons, boss/NPC/dungeon markers, and the player position on an HTML5 canvas. No WebGL. Viewport panning is handled via mouse/touch events; pinch-to-zoom is supported. Portrait images are preloaded and cached for reuse each frame.

### AR Engine
Accesses `getUserMedia` for the device camera, overlays game objects on the video feed using canvas, and uses GPS + compass bearing to position enemies and quest markers. AR filters (Day/Night/Corrupted) are applied as CSS/canvas effects.

### Combat
Real-time with action cooldowns. On each player action: check resource cost, apply damage formula (base stats + weapon + crit roll + modifiers), apply status effects (bleed, poison, stun, slow, confuse), then schedule the enemy's response turn. The combo meter accumulates to grant bonus damage. Victory triggers a level-up queue; XP formula is `xpForLevel(lvl) = 120 * lvl^1.85`.

### Audio
Procedural only — Web Audio API synthesizes all sounds (sine/triangle/sawtooth oscillators, filtered noise). No audio asset files. Audio context is unlocked on the first user interaction.

### Screen Navigation
Screens are `<div>` containers toggled visible/hidden. The flow is: Title → Character Creation (class select → stat roll → name entry) → World Map → AR View. Inventory, shop, skills, and quest log are overlay panels on top of the map.

## Conventions & Constraints

- **Portrait-only**: A landscape warning modal blocks play. Don't break this.
- **No external JS dependencies**: Keep it that way — no npm, no CDN scripts beyond Google Fonts.
- **Image assets**: Boss/NPC/mob portraits are PNG/JPEG files in the repo root, referenced by filename string in data constants. When adding new art, add the file to the root and reference it in the appropriate data constant.
- **CSS custom properties**: Colors are defined as CSS vars at the top of the `<style>` block (`--void`, `--abyss`, `--blood`, `--gold`, etc.). Use these rather than hardcoding hex values.
- **Service workers**: `sw.js` is the active service worker (network-first for navigation, cache-first for fonts). `service-worker.js` is a legacy file. The cache name is `darkworld-v1` — bump this string when making breaking asset changes that need cache invalidation.
- **Coordinates**: World zones use real geographic coordinates. Philadelphia center: `(39.9492, -75.1719)`. Ephrata: `(40.1793, -76.1794)`. Lansdowne: `(39.9403, -75.2726)`.
