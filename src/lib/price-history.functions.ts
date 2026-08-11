import { createServerFn } from "@tanstack/react-start";

// Trailing closes per symbol, for the sparkline column on /holdings.
//
// price_history is already populated by the daily compute-risk job, so this
// is a read of data the fund is keeping anyway — no new external API calls,
// no new cron. One query covers every symbol.
//
// Like every other server function here, this returns an empty result rather
// than throwing when Supabase is unreachable. The holdings page drops the
// sparkline column entirely when the map comes back empty, so a data outage
// removes a decoration instead of leaving a column of blanks.

/** Calendar days of history to read. ~30 trading days after weekends. */
const WINDOW_DAYS = 45;

/** Points kept per symbol, most recent last. */
const MAX_POINTS = 30;

/** PostgREST caps a select at 1000 rows; 23 symbols × ~30 days needs paging. */
const PAGE = 1000;

export type PriceHistory = Record<string, number[]>;

function ymd(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

export const getPriceHistory = createServerFn({ method: "GET" }).handler(
  async (): Promise<PriceHistory> => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const cutoff = ymd(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000);

      const rows: Array<{ symbol: string; date: string; close: number }> = [];
      for (let offset = 0; ; offset += PAGE) {
        const { data, error } = await supabaseAdmin
          .from("price_history")
          .select("symbol, date, close")
          .gte("date", cutoff)
          .order("date", { ascending: true })
          .range(offset, offset + PAGE - 1);
        if (error || !data || data.length === 0) break;
        rows.push(...data);
        if (data.length < PAGE) break;
      }

      const out: PriceHistory = {};
      for (const r of rows) {
        const close = Number(r.close);
        if (!isFinite(close)) continue;
        (out[r.symbol] ??= []).push(close);
      }
      // Rows arrive date-ascending, so trimming from the front keeps the most
      // recent window. A single point can't draw a line, so drop those.
      for (const symbol of Object.keys(out)) {
        const series = out[symbol];
        if (series.length < 2) delete out[symbol];
        else if (series.length > MAX_POINTS) out[symbol] = series.slice(-MAX_POINTS);
      }
      return out;
    } catch (e) {
      console.error("[price-history] fetch failed:", e);
      return {};
    }
  },
);
