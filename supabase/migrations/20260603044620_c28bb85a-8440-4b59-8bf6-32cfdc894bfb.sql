CREATE TABLE public.quote_cache (
  symbol text PRIMARY KEY,
  price numeric NOT NULL,
  change_pct numeric NOT NULL DEFAULT 0,
  fetched_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.quote_cache TO anon;
GRANT SELECT ON public.quote_cache TO authenticated;
GRANT ALL ON public.quote_cache TO service_role;

ALTER TABLE public.quote_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Quote cache is viewable by everyone"
ON public.quote_cache
FOR SELECT
USING (true);

-- Seed with current holdings snapshot so the table is never empty on first deploy.
INSERT INTO public.quote_cache (symbol, price, change_pct, fetched_at) VALUES
  ('SPY',   756.48,  0.25, now() - interval '2 days'),
  ('MNST',  88.08,   0.10, now() - interval '2 days'),
  ('USB',   54.85,   0.73, now() - interval '2 days'),
  ('BRK.B', 474.48, -0.62, now() - interval '2 days'),
  ('META',  632.51, -0.44, now() - interval '2 days'),
  ('AMZN',  270.64, -1.23, now() - interval '2 days'),
  ('MSFT',  450.24,  5.45, now() - interval '2 days'),
  ('CMI',   646.63, -3.30, now() - interval '2 days'),
  ('CIFR',  23.65,  -3.82, now() - interval '2 days'),
  ('ALLY',  42.81,   0.02, now() - interval '2 days'),
  ('CEG',   287.75,  0.50, now() - interval '2 days'),
  ('LLY',   1105.00,-1.93, now() - interval '2 days'),
  ('PANW',  281.69,  9.28, now() - interval '2 days'),
  ('ORN',   13.76,  -4.04, now() - interval '2 days'),
  ('STLD',  260.15, -0.23, now() - interval '2 days'),
  ('OXY',   56.63,  -1.20, now() - interval '2 days'),
  ('RL',    363.90, -1.85, now() - interval '2 days'),
  ('VZ',    47.81,  -0.42, now() - interval '2 days'),
  ('DE',    542.18,  0.59, now() - interval '2 days'),
  ('PG',    143.56, -1.61, now() - interval '2 days'),
  ('COF',   187.93,  0.49, now() - interval '2 days'),
  ('SFD',   25.83,  -2.16, now() - interval '2 days'),
  ('DASH',  159.29,  1.65, now() - interval '2 days')
ON CONFLICT (symbol) DO NOTHING;