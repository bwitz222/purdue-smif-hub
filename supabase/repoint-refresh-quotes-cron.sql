-- Repoint the quote-refresh cron job off Lovable and onto Vercel.
-- Run in the Supabase SQL Editor (project gnmwcihxtytlaesuvuqg).
--
-- Requires the pg_cron and pg_net extensions (already in use by the old job).
-- The `apikey` header MUST equal the SUPABASE_PUBLISHABLE_KEY set in Vercel's
-- env — that is the value the refresh-quotes hook checks. A mismatch returns
-- 401 and prices never refresh, regardless of the Polygon/Alpha Vantage keys.

-- 1) Inspect the current job(s) first (optional, for your records):
--    SELECT jobid, jobname, schedule, command FROM cron.job ORDER BY jobid;

-- 2) Remove any existing refresh-quotes job (old one points at *.lovable.app).
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

-- 3) Schedule the new job -> Vercel, every 6 hours.
--    >>> Replace <VERCEL_SUPABASE_PUBLISHABLE_KEY> with the exact value from
--        Vercel → Settings → Environment Variables → SUPABASE_PUBLISHABLE_KEY.
select cron.schedule(
  'refresh-quotes',
  '0 */6 * * *',
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
--    SELECT jobid, jobname, schedule, command FROM cron.job ORDER BY jobid;
--    SELECT jobid, status, return_message, start_time
--    FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
