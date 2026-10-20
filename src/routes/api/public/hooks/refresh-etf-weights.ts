import { createFileRoute } from "@tanstack/react-router";
import { parseSsgaSectorBreakdown } from "@/lib/etf-sectors";

// Scrapes State Street's SPY fund page for the published "Fund Sector
// Breakdown" and upserts it into public.etf_sector_weights, which drives the
// look-through sector and team allocation. Invoked daily by pg_cron
// (supabase/etf-weights-cron.sql). A page that no longer parses, or whose
// weights fail validation, is rejected with a 502 and the previous row stays.
//
// Auth: same server-only REFRESH_HOOK_SECRET `x-refresh-secret` header as the
// other hooks.

const SOURCES: Array<{ symbol: string; url: string }> = [
  {
    symbol: "SPY",
    url: "https://www.ssga.com/us/en/intermediary/etfs/state-street-spdr-sp-500-etf-trust-spy",
  },
];

const UA = "Mozilla/5.0 (compatible; PurdueSMIFHub/1.0; +https://www.purduesmif.org)";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const Route = createFileRoute("/api/public/hooks/refresh-etf-weights")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expectedSecret = process.env.REFRESH_HOOK_SECRET?.trim();
        const provided = request.headers.get("x-refresh-secret")?.trim();
        if (!expectedSecret || !provided || provided !== expectedSecret) {
          return json({ ok: false, error: "Unauthorized" }, 401);
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const results: Array<Record<string, unknown>> = [];
        let failed = false;

        for (const src of SOURCES) {
          try {
            const res = await fetch(src.url, {
              headers: { "User-Agent": UA, Accept: "text/html" },
              redirect: "follow",
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const snap = parseSsgaSectorBreakdown(await res.text());
            const { error } = await supabaseAdmin.from("etf_sector_weights").upsert(
              {
                symbol: src.symbol,
                weights: snap.weights,
                as_of: snap.asOf,
                source: src.url,
                fetched_at: new Date().toISOString(),
              },
              { onConflict: "symbol" },
            );
            if (error) throw new Error(error.message);
            results.push({ symbol: src.symbol, ok: true, asOf: snap.asOf, weights: snap.weights });
          } catch (e) {
            failed = true;
            results.push({
              symbol: src.symbol,
              ok: false,
              error: e instanceof Error ? e.message : String(e),
            });
          }
        }
        return json({ ok: !failed, results }, failed ? 502 : 200);
      },
    },
  },
});
