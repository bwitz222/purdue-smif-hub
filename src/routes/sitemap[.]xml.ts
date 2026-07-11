import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://www.purduesmif.org";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        // No lastmod: stamping every URL with the request date trains crawlers
        // to distrust it. changefreq/priority carry the freshness hints instead.
        const entries: SitemapEntry[] = [
          { path: "/",             changefreq: "weekly",  priority: "1.0" },
          { path: "/about",        changefreq: "monthly", priority: "0.8" },
          { path: "/team",         changefreq: "monthly", priority: "0.8" },
          { path: "/sectors",      changefreq: "monthly", priority: "0.6" },
          { path: "/holdings",     changefreq: "daily",   priority: "0.8" },
          { path: "/performance",  changefreq: "monthly", priority: "0.6" },
          { path: "/research",     changefreq: "weekly",  priority: "0.7" },
          { path: "/recruiting",   changefreq: "monthly", priority: "0.7" },
          { path: "/learn",        changefreq: "monthly", priority: "0.6" },
          { path: "/apply",        changefreq: "monthly", priority: "0.7" },
          { path: "/contact",      changefreq: "yearly",  priority: "0.5" },
        ];

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
