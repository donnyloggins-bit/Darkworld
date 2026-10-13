-- ══════════════════════════════════════════════════════
--  DARKWORLD — automatic weekly raids
--  Run AFTER schema.sql. Paste into Supabase → SQL Editor → Run.
--
--  Every Monday the server schedules the next boss in the rotation
--  for Friday 7 PM Eastern (it stays until Sunday 11 PM). All week,
--  hunters find clue fragments at shrines to work out where it rises.
--
--  Needs the pg_cron extension: Database → Extensions → enable "pg_cron".
--  Safe to re-run.
-- ══════════════════════════════════════════════════════

create table if not exists public.raid_rotation (
  key        text primary key,
  sort       int not null,
  world      text not null default 'philadelphia',
  name       text not null,
  landmark   text not null,
  lore       text,
  emoji      text not null,
  portrait   text,
  type       text not null,
  color      text not null default '#d4a020',
  lat        double precision not null,
  lng        double precision not null,
  max_hp     bigint not null default 100000,  -- floor; scaled up by active hunters
  atk        int not null default 450,
  def        int not null default 100,
  clues      text[] not null default '{}',
  last_used  timestamptz
);
alter table public.raid_rotation enable row level security; -- no policies: admin only

insert into public.raid_rotation (key, sort, name, landmark, lore, emoji, portrait, type, lat, lng, clues) values
('founders_wrath', 1, 'THE FOUNDER''S WRATH', 'Independence Hall',
 'The bell cracked for a reason. Something old woke in the Assembly Room, wearing a founder''s face, and it remembers every oath this city broke.',
 '⚡', 'forgotten-founder.png', 'RAID BOSS · ANCIENT', 39.9489, -75.1500, array[
  'A kite in a storm. A key on the string. He wants the lightning back.',
  'Where the ink dried on two promises, the floorboards are warm tonight.',
  'Count the steps from the cracked bell. The thing counts them too.',
  'The clock in the tower stopped at the hour they signed.',
  'Red brick. White steeple. Chestnut Street keeps its head down.',
  'He was a printer once. Now he prints names on the dead.']),
('plague_ship', 2, 'THE PLAGUE SHIP', 'Penn''s Landing',
 '1793. The fever came up the river in the hold of a ship no harbor would take. It never left the water. It has been waiting for the tide.',
 '⚓', 'delaware-tallship.png', 'RAID BOSS · PLAGUE', 39.9447, -75.1410, array[
  'Yellow flags on the mast. No one rings the harbor bell anymore.',
  'Half the city fled in 1793. The other half is still on the docks.',
  'Follow the smell of tar and sickness east, until the land runs out.',
  'A tall ship that never sails. Its crew never left.',
  'Where Penn first stepped off the boat, the river is the wrong color.',
  'The fever wants the waterfront. Bring a strong stomach.']),
('mummers_horror', 3, 'THE MUMMER''S HORROR', 'Mummers Museum',
 'Something marched in the New Year''s parade that nobody signed up. Sequins, feathers, a banjo with too many strings. It is still strutting.',
 '🎭', 'living-mannequin.jpeg', 'RAID BOSS · CHAOS', 39.9334, -75.1473, array[
  'Feathers on the costume. Something wet underneath.',
  'Oh, dem golden slippers. They never come off.',
  'The parade goes up Broad Street. This thing came home after.',
  'Two blocks from the river, a museum keeps the masks. One is missing.',
  'You will hear banjos first. Do not strut back.',
  'Washington Avenue, January first, every year. It is early.']),
('broad_street_beast', 4, 'THE BROAD STREET BEAST', 'Spring Garden Station',
 'The subway was never finished. Under Broad Street, the tunnels kept digging on their own, and something big learned to ride the line.',
 '🚇', 'city-beast-frazetta.png', 'RAID BOSS · COLOSSUS', 39.9625, -75.1608, array[
  'Feel that rumble under Broad Street? No train is scheduled.',
  'North of the Hall, the orange line runs a stop it should not.',
  'A garden of iron and stone. Spring never comes down there.',
  'The tunnel walls are scratched from the inside.',
  'It surfaces where the street names a season.',
  'Mind the gap. It does not.']),
('fishtown_fiend', 5, 'THE FISHTOWN FIEND', 'Penn Treaty Park',
 'The river mills burned iron day and night for a hundred years. When the fires went out, one forge kept glowing, and it learned to walk.',
 '🔥', 'iron-meridian.png', 'RAID BOSS · INFERNAL', 39.9661, -75.1287, array[
  'Smokestacks along the river. One of them is breathing.',
  'Shad ran up this river once. Now something else does.',
  'Under the old elm, a treaty was made. The fiend was not invited.',
  'North of the bridge, where the cranes stand over the water.',
  'The fish town remembers fire.',
  'Bring your heaviest blade. Iron does not bleed easily.'])
on conflict (key) do nothing;

-- Schedules the next raid for the coming Friday 7 PM Eastern, unless one is already set.
create or replace function public.schedule_next_raid()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  r      public.raid_rotation;
  nxt    timestamptz;
  new_id uuid;
  active int;
  hp     bigint;
begin
  nxt := (date_trunc('week', now() at time zone 'America/New_York') + interval '4 days 19 hours') at time zone 'America/New_York';
  if nxt <= now() then
    nxt := nxt + interval '7 days';
  end if;
  if exists (select 1 from public.raid_bosses where spawn_at = nxt) then
    return null;
  end if;

  select * into r from public.raid_rotation order by last_used nulls first, sort limit 1 for update;
  if not found then return null; end if;

  -- Size the boss to the crowd: 40K HP per hunter active in the last week, never below the floor.
  select count(*) into active from public.hunter_presence where seen_at > now() - interval '7 days';
  hp := greatest(r.max_hp, active::bigint * 40000);

  insert into public.raid_bosses (world, name, landmark, lore, emoji, portrait, type, color,
                                  lat, lng, max_hp, hp, atk, def, spawn_at, ends_at, clues)
  values (r.world, r.name, r.landmark, r.lore, r.emoji, r.portrait, r.type, r.color,
          r.lat, r.lng, hp, hp, r.atk, r.def, nxt, nxt + interval '52 hours', r.clues)
  returning id into new_id;

  update public.raid_rotation set last_used = now() where key = r.key;
  return new_id;
end;
$$;
revoke all on function public.schedule_next_raid() from public, anon, authenticated;

-- Schedule this week's raid right now, then every Monday at 9 AM Eastern (13:00 UTC).
select public.schedule_next_raid();

do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule('darkworld-weekly-raid') where exists (select 1 from cron.job where jobname = 'darkworld-weekly-raid');
    perform cron.schedule('darkworld-weekly-raid', '0 13 * * 1', 'select public.schedule_next_raid()');
  else
    raise notice 'pg_cron is not enabled: enable it under Database → Extensions, then run this file again for automatic weekly raids.';
  end if;
end $$;
