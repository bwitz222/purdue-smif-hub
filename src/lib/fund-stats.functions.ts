import { createServerFn } from "@tanstack/react-start";

export type FundStats = {
  aum_display: string;
  active_members: string;
  founded_year: number;
  sector_teams: number;
  cash_holdings: number;
};

export const getFundStats = createServerFn({ method: "GET" }).handler(
  async (): Promise<FundStats | null> => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data, error } = await supabaseAdmin
        .from("fund_stats")
        .select("aum_display, active_members, founded_year, sector_teams, cash_holdings")
        .eq("id", true)
        .maybeSingle();
      if (error || !data) return null;
      return {
        aum_display: data.aum_display,
        active_members: data.active_members,
        founded_year: Number(data.founded_year),
        sector_teams: Number(data.sector_teams),
        cash_holdings: Number(data.cash_holdings),
      };
    } catch (e) {
      console.error("[fund-stats] fetch failed:", e);
      return null;
    }
  },
);
