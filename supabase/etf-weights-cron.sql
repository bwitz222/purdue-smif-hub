-- Daily scrape of State Street's published SPY sector breakdown (project
-- mxjrtmratusuxhpxtwmg). Source-of-truth runbook, like repoint-refresh-quotes-cron.sql.
-- Needs migration 20261020170000_add_etf_sector_weights.sql and the pg_cron /
-- pg_net extensions. The `x-refresh-secret` header must equal Vercel's
-- REFRESH_HOOK_SECRET (the same value the other hooks check).

-- Remove any existing job so we end with exactly one.
do $$
declare j record;
begin
  for j in select jobid from cron.job where command ilike '%refresh-etf-weights%'
  loop
    perform cron.unschedule(j.jobid);
  end loop;
end $$;

-- 01:15 UTC daily, after refresh-quotes (01:00) and before compute-risk (01:30).
-- State Street publishes the previous close's weights each trading day; weekends
-- re-write the same as-of row, which is harmless.
--   >>> Replace <VERCEL_REFRESH_HOOK_SECRET> with the REFRESH_HOOK_SECRET value.
select cron.schedule(
  'refresh-etf-weights',
  '15 1 * * *',
  $job$
  select net.http_post(
    url     := 'https://www.purduesmif.org/api/public/hooks/refresh-etf-weights',
    headers := jsonb_build_object(
                 'Content-Type', 'application/json',
                 'x-refresh-secret', '<VERCEL_REFRESH_HOOK_SECRET>'
               ),
    body    := '{}'::jsonb
  );
  $job$
);
