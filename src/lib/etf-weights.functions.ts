import { createServerFn } from "@tanstack/react-start";
import { isPlausibleWeights } from "@/lib/etf-sectors";

// Latest scraped ETF sector weights (see refresh-etf-weights hook). Returns null
// on any failure or implausible row so callers fall back to the static snapshot
// in src/lib/portfolio.ts. Never throws: it runs next to the route loaders.
export type EtfWeightsPayload = {
  weights: Record<string, Record<string, number>>;
  asOf: string | null;
};

export const getEtfSectorWeights = createServerFn({ method: "GET" }).handler(
  async (): Promise<EtfWeightsPayload | null> => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data, error } = await supabaseAdmin
        .from("etf_sector_weights")
        .select("symbol, weights, as_of");
      if (error || !data) return null;
      const weights: Record<string, Record<string, number>> = {};
      let asOf: string | null = null;
      for (const row of data) {
        if (!isPlausibleWeights(row.weights)) continue;
        weights[row.symbol] = row.weights;
        if (!asOf || row.as_of > asOf) asOf = row.as_of;
      }
      return Object.keys(weights).length > 0 ? { weights, asOf } : null;
    } catch (e) {
      console.error("[etf-weights] fetch failed:", e);
      return null;
    }
  },
);
