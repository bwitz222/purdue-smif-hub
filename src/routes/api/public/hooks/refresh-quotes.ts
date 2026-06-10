import { createFileRoute } from "@tanstack/react-router";
import { holdings as baseHoldings } from "@/data/holdings";

type PolygonBar = { T: string; c: number; o: number };
type PolygonGroupedResponse = { results?: PolygonBar[]; status?: string };

function toYmd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// Walk back up to 10 days to find the TWO most recent trading days
// (skipping weekends/holidays/not-yet-published days).
async function fetchTwoDaysGroupedBars(
  apiKey: string,
): Promise<{ latest: Map<string, PolygonBar> | null; prior: Map<string, PolygonBar> | null }> {
  const found: Array<Map<string, PolygonBar>> = [];
  const today = new Date();
  for (let back = 1; back <= 10 && found.length < 2; back++) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - back);
    const url = `https://api.polygon.io/v2/aggs/grouped/locale/us/market/stocks/${toYmd(
      d,
    )}?adjusted=true&apiKey=${apiKey}`;
    try {
      const res = await fetch(url);
      if (res.status === 429 || res.status === 401 || res.status === 403) break;
      if (!res.ok) continue;
      const json = (await res.json()) as PolygonGroupedResponse;
      if (json.results && json.results.length > 0) {
        const m = new Map<string, PolygonBar>();
        for (const b of json.results) m.set(b.T, b);
        found.push(m);
      }
    } catch {
      // try previous day
    }
  }
  return { latest: found[0] ?? null, prior: found[1] ?? null };
}

export const Route = createFileRoute("/api/public/hooks/refresh-quotes")({
  server: {
    handlers: {
      POST: async () => {
        const apiKey = process.env.POLYGON_API_KEY?.trim();
        if (!apiKey) {
          return new Response(
            JSON.stringify({ ok: false, error: "POLYGON_API_KEY not configured" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }

        const { latest, prior } = await fetchTwoDaysGroupedBars(apiKey);
        if (!latest || latest.size === 0) {
          return new Response(
            JSON.stringify({ ok: false, error: "No bars returned from provider" }),
            { status: 502, headers: { "Content-Type": "application/json" } },
          );
        }

        const symbols = baseHoldings.map((h) => h.symbol);
        const fetchedAt = new Date().toISOString();
        const upserts: Array<{
          symbol: string;
          price: number;
          change_pct: number;
          fetched_at: string;
        }> = [];
        for (const symbol of symbols) {
          const bar = latest.get(symbol);
          if (!bar || !isFinite(bar.c)) continue;
          const priorBar = prior?.get(symbol);
          let changePct = 0;
          if (priorBar && isFinite(priorBar.c) && priorBar.c > 0) {
            changePct = ((bar.c - priorBar.c) / priorBar.c) * 100;
          } else if (bar.o > 0) {
            changePct = ((bar.c - bar.o) / bar.o) * 100;
          }
          upserts.push({
            symbol,
            price: bar.c,
            change_pct: isFinite(changePct) ? changePct : 0,
            fetched_at: fetchedAt,
          });
        }

        if (upserts.length === 0) {
          return new Response(
            JSON.stringify({ ok: true, updated: 0, fetchedAt }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { error } = await supabaseAdmin
          .from("quote_cache")
          .upsert(upserts, { onConflict: "symbol" });
        if (error) {
          return new Response(
            JSON.stringify({ ok: false, error: error.message }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }

        return new Response(
          JSON.stringify({ ok: true, updated: upserts.length, fetchedAt }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      },
    },
  },
});
