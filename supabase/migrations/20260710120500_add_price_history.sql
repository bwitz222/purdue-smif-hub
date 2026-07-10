-- Daily per-symbol closes backing the portfolio risk metrics. Server-only: the
-- risk job (src/routes/api/public/hooks/compute-risk.ts) backfills it once from
-- Polygon ranged aggregates, appends one trading day per daily run, and reads
-- the trailing window to build the portfolio NAV series. Nothing client-facing
-- reads it.
create table if not exists public.price_history (
  symbol text not null,
  date date not null,
  close numeric not null,
  updated_at timestamptz not null default now(),
  primary key (symbol, date)
);
create index if not exists idx_price_history_date on public.price_history (date);

grant all on public.price_history to service_role;

alter table public.price_history enable row level security;
-- No anon/authenticated policy: RLS default-denies all client access.
