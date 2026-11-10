import { createFileRoute } from "@tanstack/react-router";
import { holdings as baseHoldings } from "@/data/holdings";

export const Route = createFileRoute("/api/public/hooks/refresh-quotes")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Auth gate: a dedicated server-only secret (NOT the Supabase publishable
        // key, which is shipped to the browser and therefore public). The caller
        // (pg_cron) must send this exact value in the `x-refresh-secret` header.
        const expectedSecret = process.env.REFRESH_HOOK_SECRET?.trim();
        const provided = request.headers.get("x-refresh-secret")?.trim();
        if (!expectedSecret || !provided || provided !== expectedSecret) {
          return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }
        const apiKey = process.env.POLYGON_API_KEY?.trim();
        if (!apiKey) {
          return new Response(
            JSON.stringify({ ok: false, error: "POLYGON_API_KEY not configured" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { refreshQuoteCache } = await import("@/lib/quote-refresh.server");
        const symbols = baseHoldings.map((h) => h.symbol);
        const outcome = await refreshQuoteCache(supabaseAdmin, symbols, apiKey);
        if (outcome.status === "db-error") {
          return new Response(JSON.stringify({ ok: false, error: outcome.error }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
        if (outcome.status !== "ok") {
          return new Response(
            JSON.stringify({
              ok: false,
              error: `No bars returned from provider (${outcome.status})`,
            }),
            { status: 502, headers: { "Content-Type": "application/json" } },
          );
        }
        const { fetchedAt, updated, sessionDate } = outcome;

        // Refresh SPY total-return benchmark (monthly) from Alpha Vantage.
        let benchUpdated = 0;
        const avKey = process.env.ALPHA_VANTAGE_API_KEY?.trim();
        if (avKey) {
          try {
            const avRes = await fetch(
              `https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY_ADJUSTED&symbol=SPY&apikey=${encodeURIComponent(avKey)}`,
            );
            if (avRes.ok) {
              const avJson = (await avRes.json()) as {
                "Monthly Adjusted Time Series"?: Record<string, { "5. adjusted close"?: string }>;
              };
              const series = avJson["Monthly Adjusted Time Series"] ?? {};
              const sorted = Object.entries(series)
                .map(([date, v]) => ({ date, close: parseFloat(v["5. adjusted close"] ?? "0") }))
                .filter((r) => isFinite(r.close) && r.close > 0)
                .sort((a, b) => (a.date < b.date ? -1 : 1));
              // Upsert the last 2 months so a brand-new month gets seeded with its return_pct.
              const tail = sorted.slice(-2);
              if (tail.length > 0) {
                const upsertsBench = tail.map((row, idx) => {
                  const [y, m] = row.date.split("-");
                  const monthFirst = `${y}-${m}-01`;
                  const prev = idx === 0 ? sorted[sorted.length - tail.length - 1] : tail[idx - 1];
                  const ret =
                    prev && prev.close > 0
                      ? Number((((row.close - prev.close) / prev.close) * 100).toFixed(4))
                      : null;
                  return {
                    month: monthFirst,
                    symbol: "SPY",
                    close: Number(row.close.toFixed(4)),
                    return_pct: ret,
                    fetched_at: fetchedAt,
                  };
                });
                const { error: benchErr } = await supabaseAdmin
                  .from("benchmark_monthly")
                  .upsert(upsertsBench, { onConflict: "month,symbol" });
                if (!benchErr) benchUpdated = upsertsBench.length;
              }
            }
          } catch (e) {
            console.error("[refresh-quotes] SPY benchmark refresh failed:", e);
          }
        }

        return new Response(
          JSON.stringify({ ok: true, updated, sessionDate, benchUpdated, fetchedAt }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      },
    },
  },
});
