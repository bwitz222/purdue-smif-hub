// Shared React Query refetch policy for every quote-derived value on the site
// (holdings prices/value/return/day-change, portfolio + weighted-beta KPIs,
// live AUM, and the sector allocation on /holdings and /sectors).
//
// The single source of truth is quote_cache, which the pg_cron job refreshes
// once daily after the US market close (with a visitor self-heal when it's
// >6h stale). Every page reads that same cache, so to keep /holdings,
// /sectors, and / on the SAME update logic they share this policy: refetch on
// mount, on window focus, on reconnect, and poll every 30 minutes while the
// tab is foregrounded so a long-open page still picks up the daily refresh.
export const LIVE_REFETCH_MS = 30 * 60 * 1000;

export const liveQueryOptions = {
  staleTime: LIVE_REFETCH_MS,
  refetchInterval: LIVE_REFETCH_MS,
  refetchIntervalInBackground: false,
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
} as const;
