-- ══════════════════════════════════════════════════════
--  SEASON 0 · THE HOLLOW NIGHT — autumn 2026 (Sep 22 → Dec 21)
--  Run once in the Supabase SQL Editor (after schema.sql). Safe to run again.
--
--  Seasons are quarterly now (see story.js and the SEASONS block in index.html):
--  a ~3-month build-up with seven locks that open every week and a half and
--  wait for each hunter (phones work them out from the calendar; no server),
--  then ONE daytime finale party: the last Saturday at least a week before the
--  season ends, 1–5 PM Eastern, at a public landmark from the meetup allowlist.
--  Season 0's finale: THE GHOST OF THE NORTH STAR, Sat Dec 12 2026, 1–5 PM,
--  Fairmount Avenue across from Eastern State Penitentiary.
--  The season id must match the client: 'hollow-night' (Season N reruns are
--  '<story>-sN' until their story is written).
-- ══════════════════════════════════════════════════════

alter table public.raid_bosses add column if not exists season text;

-- The 7-day / Halloween schedule used 'hollow-2026': move it to the quarterly id and date
-- (only if it hasn't been fought yet).
update public.raid_bosses
   set season = 'hollow-night',
       spawn_at = timestamptz '2026-12-12 13:00:00 America/New_York',
       ends_at  = timestamptz '2026-12-12 17:00:00 America/New_York'
 where season = 'hollow-2026' and defeated_at is null;

insert into public.raid_bosses (world, season, name, landmark, lore, emoji, portrait, type, color,
                                lat, lng, max_hp, hp, atk, def, xp, gold_min, gold_max, spawn_at, ends_at, clues)
select 'philadelphia', 'hollow-night', 'THE GHOST OF THE NORTH STAR', 'Eastern State Penitentiary',
       'The first warden of Eastern State kept every key on one iron ring. The prison closed in 1971. He never handed the ring back. Now he is the Ghost of the North Star.',
       '🗝', 'iron-officer.jpg', 'SEASON 0 · FINALE', '#e8862e',
       39.9682, -75.1727, 400000, 400000, 760, 130, 12000, 3000, 6000,
       timestamptz '2026-12-12 13:00:00 America/New_York', timestamptz '2026-12-12 17:00:00 America/New_York',
       array['Seven locks across the autumn, one every week and a half from September 22.',
             'The last lock is on the Art Museum steps.',
             'He comes out Saturday, December 12, 1 PM, at the gate on Fairmount Avenue. Daylight. Bring a friend.']
where not exists (select 1 from public.raid_bosses where season = 'hollow-night');

update public.raid_bosses set name = 'THE GHOST OF THE NORTH STAR' where season = 'hollow-night' and name <> 'THE GHOST OF THE NORTH STAR';

-- Arm the City: the whole build-up, until the Ghost comes out, influence also counts here.
insert into public.season_efforts (season, opens_at, closes_at, goal)
values ('hollow-night', timestamptz '2026-09-22 05:00:00 America/New_York', timestamptz '2026-12-12 13:00:00 America/New_York', 250000)
on conflict (season) do update set opens_at = excluded.opens_at, closes_at = excluded.closes_at;

-- Size the Ghost to the crowd: 120K HP per hunter seen in the last week, never below 400K
-- (15% less if the city was fully armed).
create or replace function public.size_season_finale(p_season text)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  active int;
  new_hp bigint;
begin
  select count(*) into active from public.hunter_presence where seen_at > now() - interval '7 days';
  new_hp := greatest(400000, active::bigint * 120000);
  -- The River Is Turned: a fully armed city takes 15% off his health
  if exists (select 1 from public.season_efforts e
              where e.season = p_season
                and (select coalesce(sum(points), 0) from public.war_effort w where w.season = e.season) >= e.goal) then
    new_hp := (new_hp * 85) / 100;
  end if;
  update public.raid_bosses set max_hp = new_hp, hp = new_hp
   where season = p_season and spawn_at > now() and defeated_at is null;
  return new_hp;
end;
$$;
revoke all on function public.size_season_finale(text) from public, anon, authenticated;

-- 17:55 UTC on Dec 12 is 12:55 PM Eastern (EST), five minutes before the party.
-- Needs the pg_cron extension (see SUPABASE-SETUP.md). Unschedules the old Halloween job.
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    begin perform cron.unschedule('darkworld-hollow-size'); exception when others then null; end;
    perform cron.schedule('darkworld-hollow-size', '55 17 12 12 *', $c$select public.size_season_finale('hollow-night')$c$);
  end if;
end $$;

-- Next seasons: copy this file to season-N.sql, change the id ('<story>-sN' or a new
-- story id), the finale Saturday (last Saturday ≥ 7 days before the quarter ends,
-- 1–5 PM Eastern), the landmark (must be on the meetupSpots allowlist in story.js)
-- and the cron date. The client computes the same dates on its own.
