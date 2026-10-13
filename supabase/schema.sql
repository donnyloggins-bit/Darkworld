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
