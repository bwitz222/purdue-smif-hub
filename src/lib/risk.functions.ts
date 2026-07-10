import { createServerFn } from "@tanstack/react-start";

// Read-only accessor for the latest pre-computed portfolio risk metrics. The
// heavy lifting (Polygon history, risk-free rate, the math) happens in the
// daily job at src/routes/api/public/hooks/compute-risk.ts; the page only reads
// the newest row here.
export type RiskMetrics = {
  asOf: string;
  lookbackDays: number;
  fullYear: boolean;
  sufficient: boolean;
  annualizedReturnPct: number | null;
  annualizedVolPct: number | null;
  sharpe: number | null;
  riskFreeRatePct: number | null;
  rfSource: string | null;
  var95Pct: number | null;
  var95Dollar: number | null;
  var99Pct: number | null;
  var99Dollar: number | null;
  grossExposurePct: number | null;
  netExposurePct: number | null;
  portfolioValue: number | null;
  symbolsPriced: number | null;
  computedAt: string;
};

function numOrNull(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  return isFinite(n) ? n : null;
}

export const getRiskMetrics = createServerFn({ method: "GET" }).handler(
  async (): Promise<RiskMetrics | null> => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data, error } = await supabaseAdmin
        .from("portfolio_risk_metrics")
        .select("*")
        .order("as_of", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error || !data) return null;
      return {
        asOf: data.as_of,
        lookbackDays: Number(data.lookback_days),
        fullYear: Boolean(data.full_year),
        sufficient: Boolean(data.sufficient),
        annualizedReturnPct: numOrNull(data.annualized_return_pct),
        annualizedVolPct: numOrNull(data.annualized_vol_pct),
        sharpe: numOrNull(data.sharpe),
        riskFreeRatePct: numOrNull(data.risk_free_rate_pct),
        rfSource: data.rf_source ?? null,
        var95Pct: numOrNull(data.var95_pct),
        var95Dollar: numOrNull(data.var95_dollar),
        var99Pct: numOrNull(data.var99_pct),
        var99Dollar: numOrNull(data.var99_dollar),
        grossExposurePct: numOrNull(data.gross_exposure_pct),
        netExposurePct: numOrNull(data.net_exposure_pct),
        portfolioValue: numOrNull(data.portfolio_value),
        symbolsPriced: numOrNull(data.symbols_priced),
        computedAt: data.computed_at,
      };
    } catch (e) {
      console.error("[risk-metrics] fetch failed:", e);
      return null;
    }
  },
);
