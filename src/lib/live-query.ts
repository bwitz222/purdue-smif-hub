// Shared React Query refetch policy for every quote-derived value on the site
// (holdings prices/value/return/day-change, portfolio + weighted-beta KPIs,
// risk metrics, live AUM, and the sector allocation on /holdings and /sectors).
//
// The source of truth is the Supabase tables the nightly jobs fill (quote_cache,
// portfolio_risk_metrics, etf_sector_weights). The server also self-heals the
// quote cache when it is stale or behind the latest completed session. Every
// page reads the same tables under this one policy: refetch on mount, on window
// focus, on reconnect, and every 5 minutes while the tab is in the foreground,
// so a long-open page picks up a new close within minutes of it being written.
const LIVE_REFETCH_MS = 5 * 60 * 1000;

export const liveQueryOptions = {
  staleTime: 2 * 60 * 1000,
  refetchInterval: LIVE_REFETCH_MS,
  refetchIntervalInBackground: false,
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
} as const;
