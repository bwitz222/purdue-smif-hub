-- Daily portfolio risk job cron (project mxjrtmratusuxhpxtwmg).
-- Run in the Supabase SQL Editor AFTER the branch is deployed and
-- REFRESH_HOOK_SECRET is set in Vercel. Keeps public.portfolio_risk_metrics
-- fresh (Volatility, Sharpe, 1-day Historical VaR, Gross/Net Exposure) for the
-- /holdings page.
--
-- Requires pg_cron + pg_net (already enabled for the refresh-quotes job).
--
-- The `x-refresh-secret` header MUST equal the REFRESH_HOOK_SECRET set in
-- Vercel (the same secret the refresh-quotes hook uses). A mismatch returns 401
-- and metrics stop refreshing. The default (no ?mode=) does the cheap daily
-- append (~1 Polygon call) + recompute; it finishes in a couple seconds.
--
-- One-time backfill (seed ~1yr of daily closes into price_history) is a SLOW
-- (~5 min, throttled under Polygon's 5-req/min free tier) manual call:
--   curl -X POST 'https://www.purduesmif.org/api/public/hooks/compute-risk?mode=backfill' \
--        -H 'x-refresh-secret: <REFRESH_HOOK_SECRET>'
-- (Already run once against the prod DB during development; only re-run to
-- repair a large gap in price_history.)

-- 1) Remove any existing compute-risk job so we end with exactly one.
do $$
declare j record;
begin
  for j in
    select jobid from cron.job
    where command ilike '%compute-risk%' or jobname ilike '%risk%metric%'
  loop
    perform cron.unschedule(j.jobid);
  end loop;
end $$;

-- 2) Schedule ONE daily run at 01:30 UTC — 30 min after the refresh-quotes job
--    (01:00 UTC) so the latest close is already available.
--    >>> Replace <VERCEL_REFRESH_HOOK_SECRET> with Vercel → Settings →
--        Environment Variables → REFRESH_HOOK_SECRET.
select cron.schedule(
  'compute-risk',
  '30 1 * * *',
  $job$
  select net.http_post(
    url     := 'https://www.purduesmif.org/api/public/hooks/compute-risk',
    headers := jsonb_build_object(
                 'Content-Type', 'application/json',
                 'x-refresh-secret', '<VERCEL_REFRESH_HOOK_SECRET>'
               ),
    body    := '{}'::jsonb
  );
  $job$
);

-- 3) Verify:
--    SELECT jobid, jobname, schedule, active FROM cron.job ORDER BY jobid;
--    SELECT status, return_message, start_time
--    FROM cron.job_run_details ORDER BY start_time DESC LIMIT 5;
