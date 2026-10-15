-- ══════════════════════════════════════════════════════
--  SEASON 0 · THE HOLLOW NIGHT — the Halloween finale
--  Run once in the Supabase SQL Editor (after schema.sql). Safe to run again.
--
--  Schedules THE WARDEN OF CHERRY HILL at Eastern State Penitentiary,
--  Halloween night 8 PM to midnight (Eastern). The seven nightly lieutenants
--  before it need no server: every phone works them out from the date.
--  At 7:55 PM on Halloween the boss is sized to the crowd (pg_cron, if enabled).
-- ══════════════════════════════════════════════════════

alter table public.raid_bosses add column if not exists season text;

insert into public.raid_bosses (world, season, name, landmark, lore, emoji, portrait, type, color,
                                lat, lng, max_hp, hp, atk, def, xp, gold_min, gold_max, spawn_at, ends_at, clues)
select 'philadelphia', 'hollow-2026', 'THE WARDEN OF CHERRY HILL', 'Eastern State Penitentiary',
       'The first warden of Eastern State kept every key on one iron ring. The prison closed in 1971. He never handed the ring back.',
       '🗝', 'iron-officer.jpg', 'SEASON 0 · FINALE', '#e8862e',
       39.9679, -75.1727, 400000, 400000, 760, 130, 12000, 3000, 6000,
       timestamptz '2026-10-31 20:00:00 America/New_York', timestamptz '2026-11-01 00:00:00 America/New_York',
       array['Seven locks, one each night from October 24.',
             'The last lock is on the Art Museum steps.',
             'He comes out on Halloween at 8 PM, at the gate on Fairmount Avenue.']
where not exists (select 1 from public.raid_bosses where season = 'hollow-2026');

-- Arm the City: from the omen until the Warden comes out, influence also counts here.
insert into public.season_efforts (season, opens_at, closes_at, goal)
values ('hollow-2026', timestamptz '2026-10-13 00:00:00 America/New_York', timestamptz '2026-10-31 20:00:00 America/New_York', 250000)
on conflict (season) do nothing;

-- Size the Warden to the crowd: 120K HP per hunter seen in the last week, never below 400K
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

-- 23:55 UTC on Oct 31 is 7:55 PM Eastern. Needs the pg_cron extension (see SUPABASE-SETUP.md).
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule('darkworld-hollow-size', '55 23 31 10 *', $c$select public.size_season_finale('hollow-2026')$c$);
  end if;
end $$;
