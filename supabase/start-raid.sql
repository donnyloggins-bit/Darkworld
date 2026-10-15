-- ══════════════════════════════════════════════════════
--  Start a weekly raid
--  Edit the values, paste into Supabase → SQL Editor → Run.
--  The boss appears on everyone's map at spawn_at and leaves at ends_at.
-- ══════════════════════════════════════════════════════

insert into public.raid_bosses
  (world, name, landmark, lore, emoji, portrait, type, color,
   lat, lng, max_hp, hp, atk, def, xp, gold_min, gold_max,
   spawn_at, ends_at)
values
  ('philadelphia',
   'THE FOUNDER''S WRATH',
   'Independence Hall',
   'The bell cracked for a reason. Something old woke in the Assembly Room, wearing a founder''s face, and it remembers every oath this city broke.',
   '⚡',
   'forgotten-founder.jpg',
   'RAID BOSS · ANCIENT',
   '#d4a020',
   39.9489, -75.1500,
   500000, 500000,            -- max_hp, hp (start them equal). Size it to your crowd:
                              --   hits needed ≈ hp ÷ average hit. Malechar, the toughest
                              --   solo boss, has 31,250 HP.
   450, 100,                  -- atk, def (Malechar: 563 / 100; each player fights it solo-side)
   8000, 2000, 4000,          -- xp, gold_min, gold_max
   now(),                     -- spawn_at  (e.g. '2026-10-17 19:00-04')
   now() + interval '3 days'  -- ends_at
  );


-- ── Handy queries ───────────────────────────────────────
-- Live raids:
--   select id, name, hp, max_hp, spawn_at, ends_at from raid_bosses
--    where defeated_at is null and now() between spawn_at and ends_at;
--
-- Top damage for a raid:
--   select player_name, total, hits from raid_leaderboard
--    where boss_id = '<raid id>' order by total desc limit 20;
--
-- End a raid early:
--   update raid_bosses set ends_at = now() where id = '<raid id>';
