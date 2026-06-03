## What's broken

The live-quotes server function (`src/lib/quotes.functions.ts`) hits Alpha Vantage's free tier, which allows ~25 requests/day. The holdings page asks for 23 symbols sequentially per cold cache, so the daily quota is exhausted almost immediately. After that:

1. `fetchQuote` returns `null` for every symbol.
2. `fetchAll` returns `{}`.
3. The current cache guard `if (Object.keys(quotes).length > 0)` refuses to cache empty results — so every subsequent page load **re-hammers** the rate-limited API and keeps getting `{}`.
4. `holdings.tsx` falls back to the static seed values in `src/data/holdings.ts` (last hand-edited prices). That's why the page looks "not updating."

Network capture confirms it: the most recent `_serverFn` response payload contains `quotes: {}`.

## Fix (no new API keys, no provider swap)

Two-layer cache that keeps the page showing real recent prices even when Alpha Vantage is throttling us:

### 1. Persistent last-good cache in the database

New table `public.quote_cache`:

```text
symbol       text primary key
price        numeric
change_pct   numeric
fetched_at   timestamptz
```

GRANTs: `select` to `anon`/`authenticated`, `all` to `service_role`. RLS on; public read policy (prices are not sensitive). Writes only from server fn using `supabaseAdmin`.

### 2. Rewrite `src/lib/quotes.functions.ts`

- On request: read existing rows from `quote_cache` first — that's the immediate response baseline.
- If the newest `fetched_at` is older than 12h, try to refresh **in the background** (don't block the response): fetch symbols one at a time, upsert each into `quote_cache` as it succeeds. Partial success is fine — even one new quote gets persisted.
- Negative-cache rate-limit responses: if Alpha Vantage returns the "Note"/"Information" rate-limit payload (no `Global Quote`), mark a short in-memory `cooldownUntil = now + 15min` and skip new fetches until then. This stops the hammering loop.
- Keep the in-memory `inflight` dedupe so concurrent requests don't double-fetch.
- Always return whatever is in `quote_cache` (possibly stale, but real), plus `cachedAt` and a new `stale: boolean` flag.

### 3. `src/routes/holdings.tsx` — small UX tweak

- If `stale: true` (most recent quote >24h old), show the existing "as of" line with a subtle "delayed" note. No layout change.
- No other logic changes — the merge with `holdings` seed continues to work; whatever symbols are in `quote_cache` override seed prices, the rest fall back to seed.

### 4. One-time seed of `quote_cache`

The migration will insert the current `holdings.ts` price/change rows so the table is never empty on first deploy. From that point on, the server fn keeps it warm.

## Files touched

- **new migration** — create `quote_cache` table + GRANTs + RLS + seed rows
- **edit** `src/lib/quotes.functions.ts` — DB-backed cache, negative cooldown, background refresh, stale flag
- **edit** `src/routes/holdings.tsx` — surface `stale` in the existing "as of" line (≤5 lines of JSX)

No other files change. No new dependencies. No new secrets.

## Why not switch providers right now

Switching to Finnhub/Twelve Data is the right long-term move (their free tiers easily cover 23 symbols), but it requires a new API key from you and a rewrite of `fetchQuote`. The fix above makes the page reliable today with what's already configured. Once it's stable, swapping the actual fetch call to a different provider is a ~20-line follow-up — the cache layer stays identical.

## Technical notes

- `supabaseAdmin` is used inside the server fn for upserts (bypasses RLS, safe because it's server-only).
- Background refresh uses `ctx.waitUntil`-style fire-and-forget (`refresh().catch(console.error)` without `await`) so the response returns instantly with cached data.
- The 15-min cooldown is in-memory per worker — that's fine; worst case one extra wasted fetch after a cold start.
- `stale` threshold: 24h (data refreshes daily after market close, so >24h means we missed a cycle).