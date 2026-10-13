# Turning on DARKWORLD online (Supabase)

This turns on three things: **accounts**, **cloud saves** (your hunter follows you to any phone), and **live raids** (one boss HP bar shared by everyone in the city).

Until you do this, the game works exactly like before: offline, with saves on the phone only.

---

## 1. Create the database (5 minutes)

1. Open your Supabase org → **New project**. Call it `darkworld`, pick the US East region (closest to Philly), and save the database password somewhere.
2. When it finishes, go to **SQL Editor** → **New query**.
3. Open `supabase/schema.sql` from this repo, copy the whole file, paste it in, and press **Run**. You should see "Success. No rows returned."
   - Running it again later is safe. It won't wipe anything.

## 2. Auth settings

1. **Authentication → URL Configuration → Site URL**: set this to your Netlify URL (for example `https://darkworld.netlify.app`). The "confirm your email" link sends players back here.
2. Optional, for testing: **Authentication → Sign In / Providers → Email** → turn off **Confirm email**. Players can then sign in right after creating an account. Turn it back on before you share the game widely.

## 3. Give Netlify the keys

1. In Supabase: **Project Settings → API Keys**. Copy:
   - the **Project URL** (looks like `https://abcd1234.supabase.co`), from **Project Settings → Data API** if it isn't on that page
   - the **anon / public** key. If you see both "publishable" and "legacy anon" keys, either one works.
2. ⚠️ **Never** copy the `service_role` / `secret` key anywhere. That key can do anything to your database.
3. In Netlify: your site → **Site configuration → Environment variables** → add:
   - `SUPABASE_URL` = the Project URL
   - `SUPABASE_ANON_KEY` = the anon/publishable key
4. **Deploys → Trigger deploy**. The build log should say `config.js written (online mode)`.

> The keys go into a generated `config.js` at deploy time. They never get committed to GitHub.
> Note: drag-and-drop deploys skip the build step, so they stay offline. Deploy from the GitHub repo.

## 4. Check it works

1. Open the game on your phone. Under **ENTER THE DARKNESS** there's now a **☁ SIGN IN · CLOUD SAVE** button.
2. Create an account and play for a minute.
3. In Supabase → **Table Editor → characters** you should see your hunter.

> **Updating?** When a new version of the game adds online features, paste `supabase/schema.sql` into the SQL Editor and run it again. It only adds what's missing.

## What players get online

- **☁ Cloud save:** sign in once and your hunter follows you to any phone.
- **👥 Hunters nearby:** a count of other signed-in hunters within about a mile. Players only ever see a number, never where anyone is.
- **🏆 Ranks:** a leaderboard in 📖 HUNT → RANKS, sorted by level, distance walked, or bestiary.
- **⚑ Turf wars:** from level 3 players swear to one of three orders (Lantern, Bell, River). Kills, shrines and walking earn influence for their order in the Philadelphia district they're standing in; each week (Monday to Sunday, Eastern time) the top order holds the district, and members get +10% XP and gold there. Standings are in 📖 HUNT → TURF and as banners on the map.
- **⚔ Raids:** see below.

## 5. Turn on automatic weekly raids (recommended)

1. Supabase → **Database → Extensions** → search **pg_cron** → enable it.
2. **SQL Editor** → paste `supabase/weekly-raids.sql` → **Run**.

That's it. Every Monday at 9 AM Eastern the server picks the next boss in the rotation (The Founder's Wrath → The Plague Ship → The Mummer's Horror → The Broad Street Beast → The Fishtown Fiend) and schedules it for **Friday 7 PM**. It stays until Sunday 11 PM.

**All week is the clue hunt.** The map shows **☠ SOON** with a countdown, but *not* where the boss will rise. Lighting shrines sometimes reveals a **fragment** (a riddle about the location). Each hunter finds different fragments at different shrines, so people have to walk and compare notes to work it out. The location goes public the moment the raid rises.

Boss HP sizes itself to your crowd: **40,000 HP per hunter who was active that week**, with a minimum of 100,000 (the `max_hp` column in `raid_rotation`). Everyone who deals damage gets **raid spoils** sized to their share when it falls, even if they had already left.

To change a boss's clues, HP floor or location, edit it in **Table Editor → raid_rotation**.

## 6. Start a one-off raid (optional)

1. Open `supabase/start-raid.sql`, change the boss name, landmark, coordinates, HP and times if you like, then paste it into the **SQL Editor** and **Run**.
2. Everyone playing in that world sees a pulsing **⚔ RAID** bar on the map within about 20 seconds.
3. Players must be signed in and physically within about 260 ft of the landmark to fight it. Every hit comes off the same HP bar.
4. The **☰ STATS** panel shows the shared HP, time left and the top 5 damage dealers. Whoever lands the final blow gets double gold.

To schedule a raid for later, set `spawn_at` to a future time (for example `'2026-10-17 19:00-04'`). Until then the map shows a **☠ SOON** countdown.

Handy queries are at the bottom of `start-raid.sql`: live raids, the full damage leaderboard, and how to end a raid early.

---

## Local testing (optional)

Copy `config.example.js` to `config.js`, fill in the same two values, and run `python3 -m http.server`. `config.js` is gitignored.
To test raids at your desk without GPS, set `raidRequireGps: false` in your local `config.js` only.

## How cheating is limited

Phones can be tampered with, so the server never trusts the damage number blindly. `raid_hit()` clamps each report (250K max) and each player's total over any 10 seconds (1M max). Players can't write to the raid tables directly. Raise those caps in `schema.sql` as players get stronger.

Turf influence works the same way: it only goes through `add_influence()`, which takes the player's order from the server, ignores district names that aren't real, and caps each player at 400 points an hour. Players can switch orders once every 30 days.
