-- Monster Beverage (MNST) completed a 2-for-1 stock split effective 2026-08-11.
--
-- The 2026-06-03 migration seeded quote_cache with the pre-split price of
-- 88.08. That seed is only ever read on a first deploy, before the Polygon
-- refresh job has run — but on such a deploy it would be paired with the
-- post-split share count in src/data/holdings.ts and would overstate the
-- position by 2x. Bring the seeded row onto post-split terms.
--
-- Note: this fixes the SEED only. Rows already written to public.price_history
-- before 2026-08-11 still hold pre-split closes, which puts a phantom -50%
-- single-day return in the risk lookback window. Clearing that requires one
-- manual run of the backfill hook, which re-fetches with adjusted=true and
-- overwrites the stale rows:
--
--   POST /api/public/hooks/compute-risk?mode=backfill
--   header: x-refresh-secret: <REFRESH_HOOK_SECRET>

UPDATE public.quote_cache
SET price = 47.81,
    change_pct = -1.89
WHERE symbol = 'MNST';

-- ---------------------------------------------------------------------------
-- Founding year correction: the fund dates to 1995, not 2009.
--
-- 2009 was seeded in 20260610004127 and propagated into every "Est." line and
-- the schema.org foundingDate. Note this widens the gap between the founding
-- date and the start of auditable monthly records (October 2013, the custodian
-- migration) from 4 years to 18 — the site copy now states the two separately
-- rather than letting the older date imply a 31-year audited track record.
UPDATE public.fund_stats
SET founded_year = 1995
WHERE id = true;
