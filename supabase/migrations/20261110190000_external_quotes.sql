-- Closing prices supplied by a second source (currently Zacks, fetched through
-- the Zacks MCP by a scheduled job), kept apart from quote_cache on purpose.
--
-- quote_cache is the Polygon end-of-day cache and Polygon releases each close
-- about two days late. A producer writes the newest close it can get for each
-- position here; the site merges the two at read time (src/lib/quote-sources.ts)
-- and only uses a row when its session is NEWER than the cache's, so Polygon
-- takes over again as soon as it catches up. One row per (symbol, source): each
-- run replaces the last.
--
-- prev_close is the close of the session before session_date, so the day change
-- can be computed without a second source.
create table if not exists public.external_quotes (
  symbol text not null,
  source text not null,
  session_date date not null,
  price numeric not null check (price > 0),
  prev_close numeric check (prev_close is null or prev_close > 0),
  fetched_at timestamptz not null default now(),
  primary key (symbol, source)
);

grant all on public.external_quotes to service_role;

alter table public.external_quotes enable row level security;
-- No anon/authenticated policy: RLS default-denies all client access.
