
-- Quote meta (KV for cooldown tracking)
CREATE TABLE public.quote_meta (
  key text PRIMARY KEY,
  value_ts timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.quote_meta TO anon, authenticated;
GRANT ALL ON public.quote_meta TO service_role;
ALTER TABLE public.quote_meta ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Quote meta is viewable by everyone" ON public.quote_meta FOR SELECT USING (true);

-- Fund stats: single-row table
CREATE TABLE public.fund_stats (
  id boolean PRIMARY KEY DEFAULT true CHECK (id = true),
  aum_display text NOT NULL,
  active_members text NOT NULL,
  founded_year integer NOT NULL,
  sector_teams integer NOT NULL,
  cash_holdings numeric NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.fund_stats TO anon, authenticated;
GRANT ALL ON public.fund_stats TO service_role;
ALTER TABLE public.fund_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Fund stats viewable by everyone" ON public.fund_stats FOR SELECT USING (true);

INSERT INTO public.fund_stats (id, aum_display, active_members, founded_year, sector_teams, cash_holdings)
VALUES (true, '$600K', '50+', 2009, 10, 15484.00);

-- Fund performance per-year
CREATE TABLE public.fund_performance (
  year integer PRIMARY KEY,
  smif_return numeric NOT NULL,
  bench_return numeric NOT NULL,
  is_audited boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.fund_performance TO anon, authenticated;
GRANT ALL ON public.fund_performance TO service_role;
ALTER TABLE public.fund_performance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Fund performance viewable by everyone" ON public.fund_performance FOR SELECT USING (true);

INSERT INTO public.fund_performance (year, smif_return, bench_return, is_audited) VALUES
  (2024, 22.4, 24.2, false),
  (2023, 27.1, 26.3, false),
  (2022, -15.8, -18.1, false),
  (2021, 29.6, 28.7, false),
  (2020, 19.2, 18.4, false),
  (2019, 30.1, 31.5, false);

-- Fund performance KPIs (single row)
CREATE TABLE public.fund_performance_kpis (
  id boolean PRIMARY KEY DEFAULT true CHECK (id = true),
  one_year numeric NOT NULL,
  five_year_annualized numeric NOT NULL,
  inception_annualized numeric NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.fund_performance_kpis TO anon, authenticated;
GRANT ALL ON public.fund_performance_kpis TO service_role;
ALTER TABLE public.fund_performance_kpis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Fund perf KPIs viewable by everyone" ON public.fund_performance_kpis FOR SELECT USING (true);

INSERT INTO public.fund_performance_kpis (id, one_year, five_year_annualized, inception_annualized)
VALUES (true, 22.4, 15.6, 12.8);
