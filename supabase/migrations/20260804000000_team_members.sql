-- Roster storage, so team changes stop requiring a code change and a deploy.
--
-- Today src/data/team.ts is the source of truth: promoting an analyst is a
-- commit, a pull request and a Vercel build. That works only while the people
-- making changes can use git, and the executive board turns over every year.
--
-- This table mirrors the shape the site already renders. It is NOT yet read by
-- the app — see the note at the bottom for the remaining step.

create table if not exists public.team_members (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  name          text not null,
  role          text not null,
  team          text not null,
  -- Ordering within a team; the lead is 0. Mirrors the array order in team.ts,
  -- where index 0 is rendered as the team's Portfolio Manager.
  sort_order    int  not null default 0,
  grad_year     text,
  email         text,
  linkedin      text,
  bio           text,
  -- Headshots stay bundled in src/assets/team/ (Vite fingerprints them and
  -- serves them from the CDN). This is only for members whose photo is
  -- uploaded to storage instead.
  photo_path    text,
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists team_members_team_idx on public.team_members (team, sort_order);
create index if not exists team_members_active_idx on public.team_members (active);

alter table public.team_members enable row level security;

-- The roster is public information; it is already rendered on /team.
drop policy if exists "team_members are publicly readable" on public.team_members;
create policy "team_members are publicly readable"
  on public.team_members for select
  using (active);

-- Writes go through the service role only (an authenticated editor would add
-- its own policy here).
drop policy if exists "team_members are service-role writable" on public.team_members;
create policy "team_members are service-role writable"
  on public.team_members for all
  to service_role
  using (true) with check (true);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists team_members_set_updated_at on public.team_members;
create trigger team_members_set_updated_at
  before update on public.team_members
  for each row execute function public.set_updated_at();

-- REMAINING STEP (deliberately not done blind):
--   1. Apply this migration and the seed in 20260804000001_team_members_seed.sql.
--   2. Add a getTeamMembers() server function that reads this table and falls
--      back to src/data/team.ts on any error, following the same degrade-don't-
--      throw rule the other loaders now use.
--   3. Point memberDirectory at it.
-- Steps 2 and 3 were left unwritten because they cannot be tested against a
-- real database from here, and an unverified read path on /team is exactly the
-- class of change that took /holdings down with a 500.
