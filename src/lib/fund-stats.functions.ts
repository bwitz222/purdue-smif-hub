import { createServerFn } from "@tanstack/react-start";
import { holdings as baseHoldings } from "@/data/holdings";

export type FundStats = {
  aum_display: string;
  active_members: string;
  founded_year: number;
  sector_teams: number;
  cash_holdings: number;
};

// Round to nearest $1K and format as e.g. "$449K" so the hero stat matches
// the live /holdings portfolio value (single source of truth).
function formatAumK(value: number): string {
  const k = Math.round(value / 1000);
  return `$${k.toLocaleString("en-US")}K`;
}

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
      if (statsRes.error || !data) return null;

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

      return {
        aum_display: aumDisplay,
        active_members: data.active_members,
        founded_year: Number(data.founded_year),
        sector_teams: Number(data.sector_teams),
        cash_holdings: cash,
      };
    } catch (e) {
      console.error("[fund-stats] fetch failed:", e);
      return null;
    }
  },
);
