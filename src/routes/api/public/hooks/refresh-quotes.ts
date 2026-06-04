import { createFileRoute } from "@tanstack/react-router";
import { holdings as baseHoldings } from "@/data/holdings";

type PolygonBar = { T: string; c: number; o: number };
type PolygonGroupedResponse = { results?: PolygonBar[]; status?: string };

function toYmd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

async function fetchGroupedBars(apiKey: string): Promise<Map<string, PolygonBar>> {
  const bars = new Map<string, PolygonBar>();
  const today = new Date();
  for (let back = 1; back <= 7; back++) {
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
        for (const b of json.results) bars.set(b.T, b);
        return bars;
      }
    } catch {
      // try previous day
    }
  }
  return bars;
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

        const bars = await fetchGroupedBars(apiKey);
        if (bars.size === 0) {
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
          const bar = bars.get(symbol);
          if (!bar || !isFinite(bar.c)) continue;
          const changePct = bar.o > 0 ? ((bar.c - bar.o) / bar.o) * 100 : 0;
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
