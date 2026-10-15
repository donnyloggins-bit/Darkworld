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
-- Season finales are raids too; the client gives them phases and a city-wide siege.
alter table public.raid_bosses add column if not exists season text;

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


-- ══════════════════════════════════════════════════════
--  CREWS — up to 6 friends who hunt and raid together
--  No table here is readable or writable directly. Everything goes through the
--  functions below, and a crew only ever sees its own members and pings.
-- ══════════════════════════════════════════════════════
create table if not exists public.crews (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,
  name        text not null check (char_length(name) between 2 and 24),
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);
create table if not exists public.crew_members (
  user_id     uuid primary key references auth.users(id) on delete cascade,  -- one crew per hunter
  crew_id     uuid not null references public.crews(id) on delete cascade,
  name        text not null default 'Hunter',
  class_name  text,
  level       int not null default 1,
  district    text,
  world       text,
  cell        text,                                   -- the same ~1 km square as hunter_presence
  seen_at     timestamptz not null default now(),
  joined_at   timestamptz not null default now()
);
create index if not exists crew_members_crew on public.crew_members(crew_id);
create table if not exists public.crew_pings (
  id          bigserial primary key,
  crew_id     uuid not null references public.crews(id) on delete cascade,
  user_id     uuid references auth.users(id) on delete cascade,
  name        text not null,
  kind        text not null check (kind in ('rally','here','omw','lock','done')),
  district    text,
  lat         double precision,                       -- only for 'here', rounded to ~100 m
  lng         double precision,
  created_at  timestamptz not null default now()
);
create index if not exists crew_pings_crew on public.crew_pings(crew_id, created_at desc);
alter table public.crews        enable row level security;
alter table public.crew_members enable row level security;
alter table public.crew_pings   enable row level security;

create or replace function public.create_crew(p_name text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  nm text := btrim(coalesce(p_name, ''));
  c text;
  cid uuid;
  alphabet text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
begin
  if uid is null then raise exception 'Sign in to form a crew'; end if;
  if char_length(nm) < 2 or char_length(nm) > 24 then raise exception 'Crew names are 2 to 24 characters'; end if;
  if exists (select 1 from crew_members where user_id = uid) then raise exception 'Leave your crew first'; end if;
  loop
    c := '';
    for i in 1..6 loop c := c || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1); end loop;
    exit when not exists (select 1 from crews where code = c);
  end loop;
  insert into crews (code, name, created_by) values (c, nm, uid) returning id into cid;
  insert into crew_members (user_id, crew_id, name)
    values (uid, cid, coalesce((select left(data->'player'->>'name', 20) from characters where user_id = uid), 'Hunter'));
  return c;
end;
$$;

create or replace function public.join_crew(p_code text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  cr crews;
  mine uuid;
begin
  if uid is null then raise exception 'Sign in to join a crew'; end if;
  select * into cr from crews where code = upper(btrim(coalesce(p_code, ''))) for update;
  if not found then raise exception 'No crew has that code'; end if;
  select crew_id into mine from crew_members where user_id = uid;
  if mine = cr.id then return cr.name; end if;
  if mine is not null then raise exception 'Leave your crew first'; end if;
  if (select count(*) from crew_members where crew_id = cr.id) >= 6 then raise exception 'That crew is full (6 hunters)'; end if;
  insert into crew_members (user_id, crew_id, name)
    values (uid, cr.id, coalesce((select left(data->'player'->>'name', 20) from characters where user_id = uid), 'Hunter'));
  return cr.name;
end;
$$;

create or replace function public.leave_crew()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  cid uuid;
begin
  delete from crew_members where user_id = auth.uid() returning crew_id into cid;
  if cid is not null and not exists (select 1 from crew_members where crew_id = cid) then
    delete from crews where id = cid;
  end if;
end;
$$;

-- Called by the game about every 30 s: who I am and roughly where (district + 1 km square).
create or replace function public.crew_heartbeat(p_name text, p_class text, p_level int, p_district text, p_world text, p_cell text)
returns void
language sql
security definer
set search_path = public
as $$
  update crew_members set
    name       = coalesce(nullif(left(btrim(coalesce(p_name, '')), 20), ''), name),
    class_name = left(p_class, 20),
    level      = greatest(1, least(100, coalesce(p_level, 1))),
    district   = case when p_district is null or exists (select 1 from turf_districts where name = p_district) then p_district else district end,
    world      = left(p_world, 20),
    cell       = case when p_cell ~ '^-?\d{1,6}:-?\d{1,6}$' then p_cell else null end,
    seen_at    = now()
  where user_id = auth.uid();
$$;

create or replace function public.crew_ping(p_kind text, p_district text, p_lat double precision, p_lng double precision)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  me crew_members;
begin
  select * into me from crew_members where user_id = auth.uid();
  if not found then raise exception 'You are not in a crew'; end if;
  if p_kind not in ('rally','here','omw','lock','done') then raise exception 'Unknown call'; end if;
  if exists (select 1 from crew_pings where user_id = me.user_id and created_at > now() - interval '15 seconds') then
    raise exception 'Give your crew a moment';
  end if;
  insert into crew_pings (crew_id, user_id, name, kind, district, lat, lng)
  values (me.crew_id, me.user_id, me.name, p_kind,
          case when exists (select 1 from turf_districts where name = p_district) then p_district end,
          case when p_kind = 'here' and p_lat between -90 and 90 then round(p_lat::numeric, 3)::double precision end,
          case when p_kind = 'here' and p_lng between -180 and 180 then round(p_lng::numeric, 3)::double precision end);
  delete from crew_pings where crew_id = me.crew_id and created_at < now() - interval '1 day';
end;
$$;

-- Everything the crew panel needs. Never returns user ids, emails or anyone's exact position
-- (only a 'here' call, which its sender chose to send).
create or replace function public.crew_state()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with me as (select * from crew_members where user_id = auth.uid())
  select case when not exists (select 1 from me) then null else jsonb_build_object(
    'crew', (select jsonb_build_object('name', c.name, 'code', c.code) from crews c, me where c.id = me.crew_id),
    'members', (select coalesce(jsonb_agg(jsonb_build_object(
        'name', m.name, 'class', m.class_name, 'level', m.level, 'district', m.district,
        'seen', m.seen_at, 'me', m.user_id = me.user_id,
        'online', m.seen_at > now() - interval '3 minutes',
        'near', m.user_id <> me.user_id and m.world = me.world and m.cell = me.cell
                and m.seen_at > now() - interval '3 minutes' and me.seen_at > now() - interval '3 minutes')
        order by m.joined_at), '[]'::jsonb)
      from crew_members m, me where m.crew_id = me.crew_id),
    'pings', (select coalesce(jsonb_agg(jsonb_build_object(
        'id', x.id, 'name', x.name, 'kind', x.kind, 'district', x.district, 'lat', x.lat, 'lng', x.lng,
        'at', x.created_at, 'mine', x.mine) order by x.created_at desc), '[]'::jsonb)
      from (select p.id, p.name, p.kind, p.district, p.lat, p.lng, p.created_at,
                   p.user_id = (select user_id from me) as mine
              from crew_pings p
             where p.crew_id = (select crew_id from me) and p.created_at > now() - interval '2 hours'
             order by p.created_at desc limit 20) x)
  ) end;
$$;

revoke all on function public.create_crew(text) from public, anon;
revoke all on function public.join_crew(text) from public, anon;
revoke all on function public.leave_crew() from public, anon;
revoke all on function public.crew_heartbeat(text, text, int, text, text, text) from public, anon;
revoke all on function public.crew_ping(text, text, double precision, double precision) from public, anon;
revoke all on function public.crew_state() from public, anon;
grant execute on function public.create_crew(text) to authenticated;
grant execute on function public.join_crew(text) to authenticated;
grant execute on function public.leave_crew() to authenticated;
grant execute on function public.crew_heartbeat(text, text, int, text, text, text) to authenticated;
grant execute on function public.crew_ping(text, text, double precision, double precision) to authenticated;
grant execute on function public.crew_state() to authenticated;


-- ══════════════════════════════════════════════════════
--  WARBANDS — raid groups of 25 or 50 hunters with roles (tank / healer / damage)
--  Like crews: nothing is readable directly, everything goes through the functions,
--  and a warband sees only its own members. A hunter can be in a crew and a warband.
-- ══════════════════════════════════════════════════════
create table if not exists public.warbands (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,
  name        text not null check (char_length(name) between 2 and 28),
  max_size    int not null default 25 check (max_size in (25, 50)),
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);
create table if not exists public.warband_members (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  warband_id  uuid not null references public.warbands(id) on delete cascade,
  name        text not null default 'Hunter',
  class_name  text,
  level       int not null default 1,
  role        text not null default 'dps' check (role in ('tank','healer','dps')),
  raid_id     uuid,                                  -- the raid this hunter is at right now
  raid_seen   timestamptz,
  seen_at     timestamptz not null default now(),
  joined_at   timestamptz not null default now()
);
create index if not exists warband_members_band on public.warband_members(warband_id);
create table if not exists public.warband_calls (
  id          bigserial primary key,
  warband_id  uuid not null references public.warbands(id) on delete cascade,
  user_id     uuid references auth.users(id) on delete cascade,
  name        text not null,
  landmark    text,
  created_at  timestamptz not null default now()
);
alter table public.warbands        enable row level security;
alter table public.warband_members enable row level security;
alter table public.warband_calls   enable row level security;

create or replace function public.create_warband(p_name text, p_size int)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  nm text := btrim(coalesce(p_name, ''));
  c text;
  wid uuid;
  alphabet text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
begin
  if uid is null then raise exception 'Sign in to raise a warband'; end if;
  if char_length(nm) < 2 or char_length(nm) > 28 then raise exception 'Warband names are 2 to 28 characters'; end if;
  if exists (select 1 from warband_members where user_id = uid) then raise exception 'Leave your warband first'; end if;
  loop
    c := 'W';
    for i in 1..5 loop c := c || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1); end loop;
    exit when not exists (select 1 from warbands where code = c);
  end loop;
  insert into warbands (code, name, max_size, created_by)
    values (c, nm, case when p_size = 50 then 50 else 25 end, uid) returning id into wid;
  insert into warband_members (user_id, warband_id, name)
    values (uid, wid, coalesce((select left(data->'player'->>'name', 20) from characters where user_id = uid), 'Hunter'));
  return c;
end;
$$;

create or replace function public.join_warband(p_code text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  wb warbands;
  mine uuid;
begin
  if uid is null then raise exception 'Sign in to join a warband'; end if;
  select * into wb from warbands where code = upper(btrim(coalesce(p_code, ''))) for update;
  if not found then raise exception 'No warband has that code'; end if;
  select warband_id into mine from warband_members where user_id = uid;
  if mine = wb.id then return wb.name; end if;
  if mine is not null then raise exception 'Leave your warband first'; end if;
  if (select count(*) from warband_members where warband_id = wb.id) >= wb.max_size then
    raise exception 'That warband is full (% hunters)', wb.max_size;
  end if;
  insert into warband_members (user_id, warband_id, name)
    values (uid, wb.id, coalesce((select left(data->'player'->>'name', 20) from characters where user_id = uid), 'Hunter'));
  return wb.name;
end;
$$;

create or replace function public.leave_warband()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  wid uuid;
begin
  delete from warband_members where user_id = auth.uid() returning warband_id into wid;
  if wid is not null and not exists (select 1 from warband_members where warband_id = wid) then
    delete from warbands where id = wid;
  end if;
end;
$$;

-- Every ~25 s: who I am, the role I play, and which raid (if any) I'm fighting at.
create or replace function public.warband_heartbeat(p_name text, p_class text, p_level int, p_role text, p_raid uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update warband_members set
    name       = coalesce(nullif(left(btrim(coalesce(p_name, '')), 20), ''), name),
    class_name = left(p_class, 20),
    level      = greatest(1, least(100, coalesce(p_level, 1))),
    role       = case when p_role in ('tank','healer','dps') then p_role else role end,
    raid_id    = case when exists (select 1 from raid_bosses where id = p_raid and defeated_at is null and ends_at > now()) then p_raid end,
    raid_seen  = case when p_raid is not null then now() else raid_seen end,
    seen_at    = now()
  where user_id = auth.uid();
$$;

-- "Muster at the raid!" Only one call per hunter every 2 minutes.
create or replace function public.warband_muster(p_landmark text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  me warband_members;
begin
  select * into me from warband_members where user_id = auth.uid();
  if not found then raise exception 'You are not in a warband'; end if;
  if exists (select 1 from warband_calls where user_id = me.user_id and created_at > now() - interval '2 minutes') then
    raise exception 'The horn needs a moment';
  end if;
  insert into warband_calls (warband_id, user_id, name, landmark) values (me.warband_id, me.user_id, me.name, left(p_landmark, 60));
  delete from warband_calls where warband_id = me.warband_id and created_at < now() - interval '1 day';
end;
$$;

-- The warband panel: roster with roles, who is at the current raid, recent musters,
-- and the top warbands on that raid by damage (names and totals only).
create or replace function public.warband_state(p_raid uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with me as (select * from warband_members where user_id = auth.uid())
  select case when not exists (select 1 from me) then null else jsonb_build_object(
    'warband', (select jsonb_build_object('name', w.name, 'code', w.code, 'size', w.max_size) from warbands w where w.id = (select warband_id from me)),
    'members', (select coalesce(jsonb_agg(jsonb_build_object(
        'name', m.name, 'class', m.class_name, 'level', m.level, 'role', m.role,
        'me', m.user_id = (select user_id from me),
        'online', m.seen_at > now() - interval '3 minutes',
        'at_raid', p_raid is not null and m.raid_id = p_raid and m.raid_seen > now() - interval '3 minutes')
        order by m.joined_at), '[]'::jsonb)
      from warband_members m where m.warband_id = (select warband_id from me)),
    'calls', (select coalesce(jsonb_agg(jsonb_build_object('id', x.id, 'name', x.name, 'landmark', x.landmark, 'at', x.created_at, 'mine', x.mine)
        order by x.created_at desc), '[]'::jsonb)
      from (select c.id, c.name, c.landmark, c.created_at, c.user_id = (select user_id from me) as mine
              from warband_calls c where c.warband_id = (select warband_id from me) and c.created_at > now() - interval '2 hours'
             order by c.created_at desc limit 10) x),
    'board', (select coalesce(jsonb_agg(jsonb_build_object('name', b.name, 'total', b.total, 'hunters', b.hunters, 'mine', b.mine)
        order by b.total desc), '[]'::jsonb)
      from (select w.name, sum(d.damage)::bigint as total, count(distinct d.player_id)::int as hunters,
                   w.id = (select warband_id from me) as mine
              from raid_damage d join warband_members m on m.user_id = d.player_id join warbands w on w.id = m.warband_id
             where p_raid is not null and d.boss_id = p_raid
             group by w.id, w.name order by total desc limit 5) b)
  ) end;
$$;

revoke all on function public.create_warband(text, int) from public, anon;
revoke all on function public.join_warband(text) from public, anon;
revoke all on function public.leave_warband() from public, anon;
revoke all on function public.warband_heartbeat(text, text, int, text, uuid) from public, anon;
revoke all on function public.warband_muster(text) from public, anon;
revoke all on function public.warband_state(uuid) from public, anon;
grant execute on function public.create_warband(text, int) to authenticated;
grant execute on function public.join_warband(text) to authenticated;
grant execute on function public.leave_warband() to authenticated;
grant execute on function public.warband_heartbeat(text, text, int, text, uuid) to authenticated;
grant execute on function public.warband_muster(text) to authenticated;
grant execute on function public.warband_state(uuid) to authenticated;
