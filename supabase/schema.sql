-- ══════════════════════════════════════════════════════
--  DARKWORLD — Supabase schema
--  Paste this whole file into Supabase → SQL Editor → Run.
--  Safe to re-run: everything is "create if not exists" / "create or replace".
-- ══════════════════════════════════════════════════════

-- ── CHARACTERS: one cloud save per account ──────────────
-- The full save blob lives in `data` (same shape as the localStorage save).
-- name/class/level are copied out so they can be queried (leaderboards, admin).
create table if not exists public.characters (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  name        text,
  class_name  text,
  level       int,
  world       text,
  data        jsonb not null,
  saved_at    timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.characters enable row level security;

drop policy if exists "characters: read own"   on public.characters;
drop policy if exists "characters: insert own" on public.characters;
drop policy if exists "characters: update own" on public.characters;
drop policy if exists "characters: delete own" on public.characters;
create policy "characters: read own"   on public.characters for select to authenticated using (auth.uid() = user_id);
create policy "characters: insert own" on public.characters for insert to authenticated with check (auth.uid() = user_id);
create policy "characters: update own" on public.characters for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "characters: delete own" on public.characters for delete to authenticated using (auth.uid() = user_id);


-- ── RAID BOSSES: one shared HP pool per raid ────────────
-- You (the admin) create these from the SQL editor or Table Editor.
-- A raid is live while: spawn_at <= now < ends_at, and defeated_at is null.
create table if not exists public.raid_bosses (
  id           uuid primary key default gen_random_uuid(),
  world        text not null default 'philadelphia',   -- matches WORLDS key in index.html
  name         text not null,
  landmark     text,
  lore         text,
  emoji        text not null default '💀',
  portrait     text,                                   -- image filename in the repo root
  type         text not null default 'RAID BOSS',
  color        text not null default '#ff2200',
  lat          double precision not null,
  lng          double precision not null,
  max_hp       bigint not null check (max_hp > 0),
  hp           bigint not null check (hp >= 0),
  atk          int not null default 700,
  def          int not null default 120,
  xp           int not null default 8000,
  gold_min     int not null default 2000,
  gold_max     int not null default 4000,
  spawn_at     timestamptz not null default now(),
  ends_at      timestamptz not null,
  defeated_at  timestamptz,
  killed_by    uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now()
);

alter table public.raid_bosses enable row level security;

-- Everyone (even signed-out players) can watch the raid HP bar.
-- No insert/update/delete policies: only the raid_hit() function and the dashboard can change rows.
drop policy if exists "raid_bosses: public read" on public.raid_bosses;
create policy "raid_bosses: public read" on public.raid_bosses for select to anon, authenticated using (true);


-- ── RAID DAMAGE: every hit, for contribution tracking ───
create table if not exists public.raid_damage (
  id           bigint generated always as identity primary key,
  boss_id      uuid not null references public.raid_bosses(id) on delete cascade,
  player_id    uuid not null references auth.users(id) on delete cascade,
  player_name  text,
  damage       int not null check (damage > 0),
  created_at   timestamptz not null default now()
);
create index if not exists raid_damage_boss_player on public.raid_damage (boss_id, player_id);
create index if not exists raid_damage_player_time on public.raid_damage (player_id, created_at);

alter table public.raid_damage enable row level security;

drop policy if exists "raid_damage: public read" on public.raid_damage;
create policy "raid_damage: public read" on public.raid_damage for select to anon, authenticated using (true);


-- ── LEADERBOARD: total damage per player per raid ───────
create or replace view public.raid_leaderboard
with (security_invoker = true) as
select boss_id,
       player_id,
       max(player_name)  as player_name,
       sum(damage)::bigint as total,
       count(*)::int     as hits
from public.raid_damage
group by boss_id, player_id;


-- ── raid_hit(): the ONLY way to damage a raid boss ──────
-- Runs as the table owner so it can bypass RLS, but only after checking the caller.
-- The client is untrusted, so damage is clamped. Tune the two caps below as
-- player power grows (they're generous on purpose — they stop absurd values, not good players).
create or replace function public.raid_hit(p_boss uuid, p_damage int, p_name text default null)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  max_per_call   constant int := 250000;    -- biggest single report accepted
  max_per_10s    constant int := 1000000;   -- rolling cap per player
  uid    uuid := auth.uid();
  b      public.raid_bosses;
  recent bigint;
  dmg    int;
begin
  if uid is null then
    raise exception 'Sign in to join the raid';
  end if;

  dmg := least(greatest(coalesce(p_damage, 0), 0), max_per_call);

  select coalesce(sum(damage), 0) into recent
    from public.raid_damage
   where player_id = uid and created_at > now() - interval '10 seconds';
  dmg := least(dmg, greatest(0, max_per_10s - recent)::int);

  select * into b from public.raid_bosses where id = p_boss for update;
  if not found then
    raise exception 'No such raid';
  end if;

  -- Raid already over (or not started): report state, change nothing.
  if b.defeated_at is not null or b.hp <= 0 or now() < b.spawn_at or now() >= b.ends_at then
    return json_build_object('hp', b.hp, 'max_hp', b.max_hp,
                             'killed', (b.defeated_at is not null or b.hp <= 0),
                             'killing_blow', false, 'applied', 0);
  end if;

  if dmg > 0 then
    dmg := least(dmg::bigint, b.hp)::int;
    update public.raid_bosses
       set hp          = hp - dmg,
           defeated_at = case when hp - dmg <= 0 then now() else null end,
           killed_by   = case when hp - dmg <= 0 then uid  else null end
     where id = p_boss
    returning * into b;

    insert into public.raid_damage (boss_id, player_id, player_name, damage)
    values (p_boss, uid, left(coalesce(nullif(trim(p_name), ''), 'Wanderer'), 24), dmg);
  end if;

  return json_build_object('hp', b.hp, 'max_hp', b.max_hp,
                           'killed', b.hp <= 0,
                           'killing_blow', (b.hp <= 0 and dmg > 0 and b.killed_by = uid),
                           'applied', dmg);
end;
$$;

revoke all on function public.raid_hit(uuid, int, text) from public, anon;
grant execute on function public.raid_hit(uuid, int, text) to authenticated;


-- ── REALTIME: push raid HP changes to every player ──────
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
     where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'raid_bosses'
  ) then
    alter publication supabase_realtime add table public.raid_bosses;
  end if;
end $$;


-- ══════════════════════════════════════════════════════
--  SOCIAL — leaderboards + "hunters nearby"
-- ══════════════════════════════════════════════════════

-- Leaderboard stats, sent alongside each cloud save.
alter table public.characters add column if not exists walked_mi double precision not null default 0;
alter table public.characters add column if not exists species   int not null default 0;
alter table public.characters add column if not exists kills     int not null default 0;

-- Public leaderboard: only safe columns, never user ids or emails.
-- Runs as the owner (not security_invoker) so it can read across accounts.
create or replace view public.hunter_leaderboard as
select name, class_name, level, world, walked_mi, species, kills, updated_at,
       (user_id = auth.uid()) as is_me
from public.characters
where name is not null;
grant select on public.hunter_leaderboard to anon, authenticated;

-- Presence: a ~1 km grid square per active hunter. Nobody can read rows;
-- other players only ever get a count back from hunters_near().
create table if not exists public.hunter_presence (
  user_id  uuid primary key references auth.users(id) on delete cascade,
  world    text not null,
  cell     text not null,
  seen_at  timestamptz not null default now()
);
alter table public.hunter_presence enable row level security;
drop policy if exists "presence: insert own" on public.hunter_presence;
drop policy if exists "presence: update own" on public.hunter_presence;
create policy "presence: insert own" on public.hunter_presence for insert to authenticated with check (auth.uid() = user_id);
create policy "presence: update own" on public.hunter_presence for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.hunters_near(p_world text, p_cells text[])
returns int
language sql
stable
security definer
set search_path = public
as $$
  select case when cardinality(p_cells) > 9 then 0 else (
    select count(*)::int from public.hunter_presence
     where world = p_world
       and cell = any(p_cells)
       and seen_at > now() - interval '10 minutes'
       and user_id is distinct from auth.uid()
  ) end;
$$;
revoke all on function public.hunters_near(text, text[]) from public;
grant execute on function public.hunters_near(text, text[]) to anon, authenticated;


-- ══════════════════════════════════════════════════════
--  RAID CLUE HUNT — upcoming raids stay secret until they rise
-- ══════════════════════════════════════════════════════
alter table public.raid_bosses add column if not exists clues text[] not null default '{}';

-- Players can only read raids that have already spawned (no peeking at
-- the landmark through the API). Upcoming raids are visible only through
-- raid_teasers, which leaves out the location.
drop policy if exists "raid_bosses: public read" on public.raid_bosses;
create policy "raid_bosses: public read" on public.raid_bosses for select to anon, authenticated using (spawn_at <= now());

create or replace view public.raid_teasers as
select id, world, name, emoji, spawn_at, clues
from public.raid_bosses
where defeated_at is null and spawn_at > now();
grant select on public.raid_teasers to anon, authenticated;


-- ══════════════════════════════════════════════════════
--  ACCOUNT DELETION (required by the App Store and Google Play)
--  Deletes the caller's login. Their cloud save, presence and raid
--  damage go with it (on delete cascade); raids they killed keep the
--  kill but forget who landed it.
-- ══════════════════════════════════════════════════════
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not signed in';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;


-- ══════════════════════════════════════════════════════
--  TURF WARS — three orders fight for Philadelphia's districts
--  Influence earned in a district (kills, shrines, walking) counts for
--  the player's order that week (weeks start Monday, Eastern time).
--  The order with the most influence in a district holds it.
-- ══════════════════════════════════════════════════════
create table if not exists public.player_faction (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  faction    text not null check (faction in ('lantern','bell','river')),
  chosen_at  timestamptz not null default now()
);
alter table public.player_faction enable row level security;
drop policy if exists "player_faction: read own" on public.player_faction;
create policy "player_faction: read own" on public.player_faction for select to authenticated using (auth.uid() = user_id);

create table if not exists public.turf_influence (
  week      date not null,
  district  text not null check (char_length(district) <= 40),
  faction   text not null check (faction in ('lantern','bell','river')),
  points    bigint not null default 0,
  primary key (week, district, faction)
);
alter table public.turf_influence enable row level security;
drop policy if exists "turf_influence: public read" on public.turf_influence;
create policy "turf_influence: public read" on public.turf_influence for select to anon, authenticated using (true);

-- hourly budget per player, so nobody can flood a district from their couch
create table if not exists public.turf_user_hour (
  user_id  uuid not null references auth.users(id) on delete cascade,
  hour     timestamptz not null,
  points   int not null default 0,
  primary key (user_id, hour)
);
alter table public.turf_user_hour enable row level security; -- no policies: only the functions below touch it

-- The only district names influence can go to (keep in sync with PHILLY_DISTRICTS in index.html)
create table if not exists public.turf_districts (name text primary key);
alter table public.turf_districts enable row level security;
drop policy if exists "turf_districts: public read" on public.turf_districts;
create policy "turf_districts: public read" on public.turf_districts for select to anon, authenticated using (true);
insert into public.turf_districts (name) values
  ('Rittenhouse'),
  ('Logan Square'),
  ('Fitler Square'),
  ('Graduate Hospital'),
  ('Washington Square West'),
  ('Chinatown'),
  ('Callowhill'),
  ('Old City'),
  ('Society Hill'),
  ('Queen Village'),
  ('Bella Vista'),
  ('Pennsport'),
  ('Passyunk Square'),
  ('East Passyunk'),
  ('Point Breeze'),
  ('Grays Ferry'),
  ('Girard Estate'),
  ('Whitman'),
  ('Sports Complex'),
  ('Northern Liberties'),
  ('Fishtown'),
  ('Olde Kensington'),
  ('Kensington'),
  ('Port Richmond'),
  ('Fairhill'),
  ('Poplar'),
  ('Francisville'),
  ('Spring Garden'),
  ('Fairmount'),
  ('Brewerytown'),
  ('North Central'),
  ('Strawberry Mansion'),
  ('Nicetown'),
  ('Hunting Park'),
  ('Frankford'),
  ('East Falls'),
  ('Manayunk'),
  ('Roxborough'),
  ('Germantown'),
  ('Mount Airy'),
  ('Chestnut Hill'),
  ('University City'),
  ('Powelton'),
  ('Mantua'),
  ('Spruce Hill'),
  ('Cedar Park'),
  ('Mill Creek'),
  ('Cobbs Creek'),
  ('Wynnefield'),
  ('Overbrook'),
  ('Kingsessing'),
  ('Eastwick'),
  ('Mayfair'),
  ('Fox Chase')
on conflict (name) do nothing;

create or replace function public.turf_week() returns date
language sql stable as $$ select (date_trunc('week', now() at time zone 'America/New_York'))::date $$;

-- Join an order. Switching is allowed once every 30 days.
create or replace function public.choose_faction(p_faction text)
returns text
language plpgsql security definer set search_path = public
as $$
declare uid uuid := auth.uid(); cur public.player_faction;
begin
  if uid is null then raise exception 'Sign in to join an order'; end if;
  if p_faction not in ('lantern','bell','river') then raise exception 'Unknown order'; end if;
  select * into cur from public.player_faction where user_id = uid;
  if found and cur.faction = p_faction then return p_faction; end if;
  if found and cur.chosen_at > now() - interval '30 days' then
    raise exception 'You can change orders once a month';
  end if;
  insert into public.player_faction (user_id, faction) values (uid, p_faction)
  on conflict (user_id) do update set faction = excluded.faction, chosen_at = now();
  return p_faction;
end $$;
revoke all on function public.choose_faction(text) from public, anon;
grant execute on function public.choose_faction(text) to authenticated;

-- Add influence: p = {"Fishtown": 7, "Kensington": 2}. The order comes from the
-- server, never the client; at most 400 points per player per hour.
create or replace function public.add_influence(p jsonb)
returns int
language plpgsql security definer set search_path = public
as $$
declare
  hourly_cap constant int := 400;
  uid uuid := auth.uid(); fac text; wk date := public.turf_week(); hr timestamptz := date_trunc('hour', now());
  budget int; total int := 0; pts int; r record;
begin
  if uid is null then return 0; end if;
  select faction into fac from public.player_faction where user_id = uid;
  if fac is null or jsonb_typeof(p) <> 'object' then return 0; end if;
  select greatest(0, hourly_cap - coalesce((select points from public.turf_user_hour where user_id = uid and hour = hr), 0)) into budget;
  for r in select key, value from jsonb_each_text(p) loop
    exit when budget <= 0;
    continue when r.value !~ '^\d{1,6}$' or not exists (select 1 from public.turf_districts where name = r.key);
    pts := least(r.value::int, budget);
    continue when pts <= 0;
    insert into public.turf_influence (week, district, faction, points) values (wk, r.key, fac, pts)
    on conflict (week, district, faction) do update set points = public.turf_influence.points + excluded.points;
    budget := budget - pts; total := total + pts;
  end loop;
  if total > 0 then
    insert into public.turf_user_hour (user_id, hour, points) values (uid, hr, total)
    on conflict (user_id, hour) do update set points = public.turf_user_hour.points + excluded.points;
  end if;
  return total;
end $$;
revoke all on function public.add_influence(jsonb) from public, anon;
grant execute on function public.add_influence(jsonb) to authenticated;
