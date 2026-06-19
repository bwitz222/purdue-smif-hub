## Goal

Add a "Since Inception (Monthly)" growth chart to the Performance page driven by the uploaded balance history (Oct 2013 → present), with SPY total-return as a live S&P 500 benchmark refreshed daily by the existing 4 PM EST cron. Keep the existing annual chart and table.

## Data sources

**SMIF monthly history (static, seeded once from your spreadsheet):**
- New table `fund_monthly_history(month date PK, beginning_balance, market_change, dividends, interest, deposits, withdrawals, net_advisory_fees, ending_balance)` — RLS on, public SELECT (page is public).
- Seeded via migration with all 152 valid rows from `Portfolio History`.
- **Monthly return formula:** `(market_change + dividends + interest − net_advisory_fees) / beginning_balance`, with Modified Dietz adjustment for any month with deposits/withdrawals: `(ending − beginning − net_flows) / (beginning + 0.5·net_flows)`.
- **Account transition handling:** Nov 2024 ends at $0 and Mar 2025 starts at $0 (custodian transfer, not a market loss). These two months are flagged `is_transition=true` and excluded from the return series — the cumulative line bridges them (return = 0% for both).

**SPY total-return benchmark (live, monthly):**
- New table `benchmark_monthly(month date PK, symbol text, close numeric, return_pct numeric)`.
- Seeded for Oct 2013 → last completed month via Polygon `/v2/aggs/ticker/SPY/range/1/month/...` (adjusted=true → includes splits + reinvested dividends → true TR).
- Daily refresh: extend the existing `refresh-quotes` server route to also upsert the current month's SPY close at the same 21:05 UTC cron call. No new cron job, no new secret — reuses `POLYGON_API_KEY` and the current `apikey` auth.

## Server function

New `getFundMonthlyHistory` in `src/lib/fund-performance.functions.ts` that joins both tables and returns:
```ts
{ months: [{ month, smif_return_pct, bench_return_pct, is_transition }], inceptionMonth, lastMonth }
```
Computes growth-of-$1 series on the server so the client just renders.

## UI changes — `src/routes/performance.tsx`

1. **New section above the existing chart**, inside the Reveal pattern already used:
   - Header: "Since Inception" with subtitle showing the inception date and last update.
   - Mode toggle: **Growth of $1** (default) / **Drawdown** / **Rolling 1Y return**.
   - Series toggle: Both / SMIF / SPY (matching current chart's styling).
   - Recharts `AreaChart` for growth-of-$1, `LineChart` for the other modes. Reuses `SMIF_COLOR` / `BENCH_COLOR`.
   - Hover tooltip shows month, both values, and spread.
   - Mobile-safe x-axis: tick only Jan of each year.
2. **KPI cards rebuilt from real data**: 1Y return, 5Y annualized, since-inception annualized (computed from monthly series), plus a fourth card for **Max Drawdown**. Values are now genuine, so the "illustrative" banner and footnotes are removed (`allAudited` logic stays for the annual rows you may still want to flag).
3. Existing annual chart + table untouched.

## Cron refresh wiring

`src/routes/api/public/hooks/refresh-quotes.ts` gets a small addition after the holdings refresh:
```ts
// Upsert current-month SPY close from latest cached SPY price
await supabaseAdmin.from('benchmark_monthly').upsert({ month, symbol: 'SPY', close, return_pct }, { onConflict: 'month,symbol' });
```
On the 1st trading day of each new month, it inserts the new row; otherwise it updates the running month's value. Backfill from Oct 2013 runs once in the seeding migration via a one-shot Polygon fetch executed server-side (a separate one-time admin server function you trigger after deploy).

## Files touched

- **New migration:** `fund_monthly_history` + `benchmark_monthly` tables, GRANTs, RLS, public SELECT policies, seed of all 152 SMIF monthly rows.
- **New server fn:** `getFundMonthlyHistory` in `src/lib/fund-performance.functions.ts`.
- **New server fn (one-shot, admin only):** `backfillSpyBenchmark` to populate `benchmark_monthly` from Polygon for Oct 2013 → present. Invoked once after deploy.
- **Edit:** `src/routes/api/public/hooks/refresh-quotes.ts` — append SPY monthly upsert.
- **Edit:** `src/routes/performance.tsx` — new chart + KPI rewrite, remove illustrative banner.

## Out of scope

- Changing the annual table source (stays on `fund_performance` table).
- Daily-granularity chart (monthly is sufficient given the source data is monthly).
- Storing daily SPY history.