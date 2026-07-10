-- Pre-computed portfolio risk/performance metrics for the /holdings page.
-- One row per as_of date (history retained). The daily risk job
-- (src/routes/api/public/hooks/compute-risk.ts) computes these from trailing
-- Polygon daily closes + the live 3-month T-bill rate and upserts here; the
-- page reads the latest row (never recomputes client-side).
create table if not exists public.portfolio_risk_metrics (
  as_of date primary key,
  lookback_days integer not null,
  full_year boolean not null default false,   -- >= 252 return observations
  sufficient boolean not null default false,  -- >= 60 obs; else vol/sharpe/var are null
  annualized_return_pct numeric,
  annualized_vol_pct numeric,
  sharpe numeric,                             -- null when vol = 0 or rf unavailable
  risk_free_rate_pct numeric,                 -- null when the rf source failed
  rf_source text,
  var95_pct numeric,
  var95_dollar numeric,
  var99_pct numeric,
  var99_dollar numeric,
  gross_exposure_pct numeric,
  net_exposure_pct numeric,
  portfolio_value numeric,
  symbols_priced integer,                     -- how many holdings had usable history
  computed_at timestamptz not null default now()
);

grant select on public.portfolio_risk_metrics to anon, authenticated;
grant all on public.portfolio_risk_metrics to service_role;

alter table public.portfolio_risk_metrics enable row level security;

create policy "Risk metrics viewable by everyone"
  on public.portfolio_risk_metrics for select using (true);
