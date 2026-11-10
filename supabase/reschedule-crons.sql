-- Move the three nightly jobs to the morning after each session.
-- Run once in the Supabase SQL Editor (project mxjrtmratusuxhpxtwmg).
--
-- Why: Polygon has a session's grouped bar out by the next morning, but not on the night
-- of the close. The jobs fired at 01:00-01:30 UTC (8-9 PM ET), so they always got
-- the session BEFORE the one that had just closed. price_history, and with it the
-- risk metrics and the cached day-change base, trailed by two trading days while a
-- visitor refresh the next morning already returned the newest close.
--
-- This only changes the schedule: the command (URL, secret header, body) is left
-- exactly as it is, so no secret is touched. Re-running is harmless.
--
--   refresh-quotes        12:00 and 16:00 UTC  (7-8 AM and 11 AM-noon ET)
--   refresh-etf-weights   12:15 and 16:15 UTC
--   compute-risk          12:30 and 16:30 UTC
-- Tuesday to Saturday: the morning after Monday-Friday sessions. The second run is
-- the retry if the bar was not out at the first.
select cron.alter_job(jobid, schedule := '0 12,16 * * 2-6')  from cron.job where jobname = 'refresh-quotes';
select cron.alter_job(jobid, schedule := '15 12,16 * * 2-6') from cron.job where jobname = 'refresh-etf-weights';
select cron.alter_job(jobid, schedule := '30 12,16 * * 2-6') from cron.job where jobname = 'compute-risk';

-- Verify:
--   select jobname, schedule, active from cron.job order by jobname;
-- After the next run, confirm the newest session landed (expect yesterday's date):
--   select max("date") from price_history;
--   select max(as_of) from portfolio_risk_metrics;

-- To revert:
--   select cron.alter_job(jobid, schedule := '0 1 * * *')  from cron.job where jobname = 'refresh-quotes';
--   select cron.alter_job(jobid, schedule := '15 1 * * *') from cron.job where jobname = 'refresh-etf-weights';
--   select cron.alter_job(jobid, schedule := '30 1 * * *') from cron.job where jobname = 'compute-risk';
