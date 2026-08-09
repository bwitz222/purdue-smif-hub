import { createServerFn } from "@tanstack/react-start";
import { holdings as baseHoldings } from "@/data/holdings";
// Shared with the client so the hero stat and the offline fallback format
// identically. See src/lib/portfolio.ts.
import { formatAumK } from "@/lib/portfolio";

export type FundStats = {
  aum_display: string;
  active_members: string;
  founded_year: number;
  sector_teams: number;
  cash_holdings: number;
};

/**
 * Last successful read, held in module scope.
 *
 * When Supabase is briefly unreachable this serves the genuinely last known
 * figures instead of dropping the caller to the static baseline. It is
 * per-instance and in-memory: a cold serverless instance starts empty, so it
 * is a cushion over transient failures, NOT a durable store. The durable
 * store is the fund_stats table; the committed baseline in
 * src/data/holdings.ts is the final floor.
 */
let lastKnown: FundStats | null = null;

export const getFundStats = createServerFn({ method: "GET" }).handler(
  async (): Promise<FundStats | null> => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const [statsRes, quotesRes] = await Promise.all([
        supabaseAdmin
          .from("fund_stats")
          .select("aum_display, active_members, founded_year, sector_teams, cash_holdings")
          .eq("id", true)
          .maybeSingle(),
        supabaseAdmin
          .from("quote_cache")
          .select("symbol, price"),
      ]);
      const data = statsRes.data;
      // Row unreadable or missing: fall back to the last figures this instance
      // served rather than to nothing, so a blip does not reset the hero to the
      // static baseline for every visitor hitting a warm instance.
      if (statsRes.error || !data) return lastKnown;

      const cash = Number(data.cash_holdings) || 0;
      const quotes = new Map<string, number>();
      for (const q of quotesRes.data ?? []) {
        const p = Number(q.price);
        if (isFinite(p)) quotes.set(q.symbol, p);
      }
      let invested = 0;
      let allPriced = true;
      for (const h of baseHoldings) {
        const p = quotes.get(h.symbol);
        if (p !== undefined) invested += p * h.shares;
        else {
          allPriced = false;
          invested += h.price * h.shares;
        }
      }
      const computedAum = invested + cash;
      // Only override the hand-entered aum_display when we have a real
      // computed total AND at least the majority of positions are priced.
      const aumDisplay = computedAum > 0 && (allPriced || quotes.size >= baseHoldings.length * 0.5)
        ? formatAumK(computedAum)
        : data.aum_display;

      const stats: FundStats = {
        aum_display: aumDisplay,
        active_members: data.active_members,
        founded_year: Number(data.founded_year),
        sector_teams: Number(data.sector_teams),
        cash_holdings: cash,
      };
      lastKnown = stats;
      return stats;
    } catch (e) {
      console.error("[fund-stats] fetch failed:", e);
      return lastKnown;
    }
  },
);
