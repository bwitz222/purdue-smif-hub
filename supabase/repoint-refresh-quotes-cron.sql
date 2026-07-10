-- Quote-refresh cron for the production hook (project mxjrtmratusuxhpxtwmg).
-- Run in the Supabase SQL Editor. This is the source-of-truth runbook for the
-- pg_cron job that keeps quote_cache / benchmark_monthly fresh on the live site.
--
-- Requires the pg_cron and pg_net extensions:
--   CREATE EXTENSION IF NOT EXISTS pg_cron;
--   CREATE EXTENSION IF NOT EXISTS pg_net;
--
-- The `apikey` header MUST equal the SUPABASE_PUBLISHABLE_KEY set in Vercel's
-- env — that is the value the refresh-quotes hook checks. A mismatch returns
-- 401 and prices never refresh, regardless of the Polygon/Alpha Vantage keys.
-- The hook itself writes with SUPABASE_SERVICE_ROLE_KEY (also set in Vercel).

-- 1) Inspect the current job(s) first (optional, for your records):
--    SELECT jobid, jobname, schedule, command FROM cron.job ORDER BY jobid;

-- 2) Remove any existing refresh-quotes job so we end with exactly one.
do $$
declare j record;
begin
  for j in
    select jobid from cron.job
    where command ilike '%refresh-quotes%'
       or jobname ilike '%refresh%quote%'
  loop
    perform cron.unschedule(j.jobid);
  end loop;
end $$;

-- 3) Schedule ONE daily run, after the US market close.
--    '0 1 * * *' = 01:00 UTC daily ≈ 8-9 PM ET, a few hours after the 4 PM ET
--    close, once the day's end-of-day grouped bar has settled. Weekends and
--    holidays are harmless: the hook walks back to the most recent authorized
--    trading session (see the 403-skip in fetchTwoDaysGroupedBars) and the
--    upsert is idempotent.
--    Note: on the current Polygon plan the *current* day's bar is 403 until it
--    settles, so the freshest data available is the latest completed session.
--    >>> Replace <VERCEL_SUPABASE_PUBLISHABLE_KEY> with the exact value from
--        Vercel → Settings → Environment Variables → SUPABASE_PUBLISHABLE_KEY.
select cron.schedule(
  'refresh-quotes',
  '0 1 * * *',
  $job$
  select net.http_post(
    url     := 'https://www.purduesmif.org/api/public/hooks/refresh-quotes',
    headers := jsonb_build_object(
                 'Content-Type', 'application/json',
                 'apikey', '<VERCEL_SUPABASE_PUBLISHABLE_KEY>'
               ),
    body    := '{}'::jsonb
  );
  $job$
);

-- 4) Verify it registered and, after the next run, that it succeeded:
--    SELECT jobid, jobname, schedule, active FROM cron.job ORDER BY jobid;
--    SELECT jobid, status, return_message, start_time
--    FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
