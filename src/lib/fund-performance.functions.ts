import { createServerFn } from "@tanstack/react-start";

export type PerfRow = {
  year: number;
  smif_return: number;
  bench_return: number;
  is_audited: boolean;
};

export type PerfKpis = {
  one_year: number;
  five_year_annualized: number;
  inception_annualized: number;
};

export type FundPerformance = {
  rows: PerfRow[];
  kpis: PerfKpis | null;
  allAudited: boolean;
};

export const getFundPerformance = createServerFn({ method: "GET" }).handler(
  async (): Promise<FundPerformance | null> => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const [{ data: rows, error: rowsErr }, { data: kpis, error: kpisErr }] = await Promise.all([
        supabaseAdmin
          .from("fund_performance")
          .select("year, smif_return, bench_return, is_audited")
          .order("year", { ascending: false }),
        supabaseAdmin
          .from("fund_performance_kpis")
          .select("one_year, five_year_annualized, inception_annualized")
          .eq("id", true)
          .maybeSingle(),
      ]);
      if (rowsErr || kpisErr) return null;
      const mapped: PerfRow[] = (rows ?? []).map((r) => ({
        year: Number(r.year),
        smif_return: Number(r.smif_return),
        bench_return: Number(r.bench_return),
        is_audited: Boolean(r.is_audited),
      }));
      const allAudited = mapped.length > 0 && mapped.every((r) => r.is_audited);
      return {
        rows: mapped,
        kpis: kpis
          ? {
              one_year: Number(kpis.one_year),
              five_year_annualized: Number(kpis.five_year_annualized),
              inception_annualized: Number(kpis.inception_annualized),
            }
          : null,
        allAudited,
      };
    } catch (e) {
      console.error("[fund-performance] fetch failed:", e);
      return null;
    }
  },
);
