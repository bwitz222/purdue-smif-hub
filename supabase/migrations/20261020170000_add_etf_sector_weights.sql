-- Latest published sector breakdown per ETF we look through (currently SPY).
-- Written by the scheduled hook src/routes/api/public/hooks/refresh-etf-weights.ts
-- (scrapes State Street's fund page); read server-side by getEtfSectorWeights.
-- `weights` is keyed by this site's industry names (see src/lib/etf-sectors.ts).
create table if not exists public.etf_sector_weights (
  symbol text primary key,
  weights jsonb not null,
  as_of date not null,
  source text not null,
  fetched_at timestamptz not null default now()
);

grant all on public.etf_sector_weights to service_role;

alter table public.etf_sector_weights enable row level security;
-- No anon/authenticated policy: RLS default-denies all client access.
