-- Quote-refresh cron for the production hook (project mxjrtmratusuxhpxtwmg).
-- Run in the Supabase SQL Editor. This is the source-of-truth runbook for the
-- pg_cron job that keeps quote_cache / benchmark_monthly fresh on the live site.
--
-- Requires the pg_cron and pg_net extensions:
--   CREATE EXTENSION IF NOT EXISTS pg_cron;
--   CREATE EXTENSION IF NOT EXISTS pg_net;
--
-- The `x-refresh-secret` header MUST equal the REFRESH_HOOK_SECRET set in
-- Vercel's env — that is the value the refresh-quotes hook checks. A mismatch
-- returns 401 and prices never refresh, regardless of the Polygon/Alpha Vantage
-- keys. Do NOT use the publishable/anon key here: it is public and would let
-- anyone trigger the hook. The hook itself writes with SUPABASE_SERVICE_ROLE_KEY
-- (also set in Vercel).

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

-- 3) Schedule two runs on the morning after each session (Tuesday to Saturday).
--    '0 12,16 * * 2-6' = 12:00 and 16:00 UTC.
--    Why the morning and not the evening: Polygon has a session's grouped
--    bar out by the NEXT morning, but not on the night of the close. Production showed it:
--    a 01:00-01:30 UTC run (8-9 PM ET) never had the session that had just
--    closed, so price_history trailed by two trading days, while a visitor
--    refresh at 15:44 UTC the next day already returned that close. 12:00 UTC is
--    7-8 AM ET; 16:00 UTC is the retry in case the bar is not out yet. Both runs
--    are idempotent.
--    Holidays are harmless: the hook walks back to the most recent authorized
--    trading session (see the 403-skip in fetchTwoDaysGroupedBars).
--    >>> Replace <VERCEL_REFRESH_HOOK_SECRET> with the exact value from
--        Vercel → Settings → Environment Variables → REFRESH_HOOK_SECRET.
select cron.schedule(
  'refresh-quotes',
  '0 12,16 * * 2-6',
  $job$
  select net.http_post(
    url     := 'https://www.purduesmif.org/api/public/hooks/refresh-quotes',
    headers := jsonb_build_object(
                 'Content-Type', 'application/json',
                 'x-refresh-secret', '<VERCEL_REFRESH_HOOK_SECRET>'
               ),
    body    := '{}'::jsonb,
    timeout_milliseconds := 120000 -- pg_net's default is 5s; the hook keeps working after that, but the logged response would read as a timeout
  );
  $job$
);

-- 4) Verify it registered and, after the next run, that it succeeded:
--    SELECT jobid, jobname, schedule, active FROM cron.job ORDER BY jobid;
--    SELECT jobid, status, return_message, start_time
--    FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
