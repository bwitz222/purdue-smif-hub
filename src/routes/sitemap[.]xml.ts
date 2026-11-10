import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { hasIndexableProfile, memberDirectory } from "@/data/team";
import { LAST_CONTENT_UPDATE, buildSitemapXml, type SitemapEntry } from "@/lib/seo";

const isoDay = (v: string | null | undefined): string | null => {
  if (!v) return null;
  const day = v.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(day) && !Number.isNaN(Date.parse(day)) ? day : null;
};

/**
 * Dates of the two data-driven pages, read from the tables that feed them. Each
 * read is independent and falls back to LAST_CONTENT_UPDATE, so a Supabase
 * outage (or a local run with no credentials) still yields a valid sitemap.
 *   /holdings     the trading session the prices belong to (quote_meta), else the
 *                 latest risk-metrics as_of
 *   /performance  the newest write to the monthly history table
 */
async function dataDates(): Promise<{ holdings: string; performance: string }> {
  const fallback = LAST_CONTENT_UPDATE;
  let holdings: string | null = null;
  let performance: string | null = null;
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [session, risk, history] = await Promise.all([
      supabaseAdmin.from("quote_meta").select("value_ts").eq("key", "quotes_session").maybeSingle(),
      supabaseAdmin
        .from("portfolio_risk_metrics")
        .select("as_of")
        .order("as_of", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabaseAdmin
        .from("fund_monthly_history")
        .select("updated_at")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);
    holdings = isoDay(session.data?.value_ts) ?? isoDay(risk.data?.as_of);
    performance = isoDay(history.data?.updated_at);
  } catch (e) {
    console.error("[sitemap] data dates unavailable, using content date:", e);
  }
  return { holdings: holdings ?? fallback, performance: performance ?? fallback };
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        // lastmod is a real date for every URL, never the request time: stamping
        // each URL with "now" teaches crawlers to distrust the field. Static
        // pages share LAST_CONTENT_UPDATE (bumped by hand when copy changes); the
        // two data pages use the date of their data. changefreq and priority are
        // omitted because Google ignores both.
        const { holdings, performance } = await dataDates();
        const staticPaths = [
          "/",
          "/about",
          "/team",
          "/sectors",
          "/research",
          "/recruiting",
          "/learn",
          "/apply",
          "/contact",
          "/finance-clubs-at-purdue",
        ];
        const entries: SitemapEntry[] = [
          ...staticPaths.map((path) => ({ path, lastmod: LAST_CONTENT_UPDATE })),
          { path: "/holdings", lastmod: holdings },
          { path: "/performance", lastmod: performance },
        ];

        // One entry per member profile: the pages a recruiter searching an
        // analyst's name can land on. Bio-less profiles are excluded rather
        // than submitted and then ignored: they carry a noindex, so listing
        // them would ask crawlers to fetch pages already marked do-not-index.
        // The predicate is shared with the route so the two cannot disagree.
        for (const { slug, member } of memberDirectory) {
          if (!hasIndexableProfile(member)) continue;
          entries.push({ path: `/team/${slug}`, lastmod: LAST_CONTENT_UPDATE });
        }

        return new Response(buildSitemapXml(entries), {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
