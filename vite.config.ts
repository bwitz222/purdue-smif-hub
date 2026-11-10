// Self-hosted build config. This replaces @lovable.dev/vite-tanstack-config,
// keeping only what the production build needs: Tailwind, the @ path alias,
// TanStack Start (SSR + server functions), Nitro's Vercel preset, and React.
// The Lovable-only pieces (sandbox bridge, HMR gate, component tagger, asset
// proxy, dev error overlays) are gone.
import { readdirSync } from "node:fs";
import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import viteReact from "@vitejs/plugin-react";
// Imported by relative path: the config runs before the "@" alias exists. The file
// has no imports of its own, so it is safe to load here.
import { CONTENT_ROUTES } from "./src/lib/content-routes";

// Edge caching and security headers. The HTML is public and identical for every
// visitor (no cookies, no user-specific data; live figures such as prices and
// risk metrics are fetched by client queries after hydration), so it can be
// cached at the edge and revalidated in the background. Pages built on live data
// get the shorter window.
const SECURITY_HEADERS = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=()",
  "x-frame-options": "SAMEORIGIN",
};
const cache = (sMaxAge: number, swr: number) => ({
  "cache-control": `public, s-maxage=${sMaxAge}, stale-while-revalidate=${swr}`,
});
const LIVE_PAGES = ["/", "/holdings", "/performance", "/research", "/sectors"];
const STATIC_PAGES = [
  "/about",
  "/learn",
  "/apply",
  "/contact",
  "/finance-clubs-at-purdue",
  "/recruiting",
  "/team",
  // Every content page (pillar, pitches, interview prep, glossary) is cached the
  // same way, taken from the list the sitemap uses so a new page cannot be missed.
  ...CONTENT_ROUTES.map((r) => r.path),
];
// Public files keep their names across deploys, so they get a day, then a week of
// stale-while-revalidate.
const PUBLIC_FILE_CACHE = {
  "cache-control": "public, max-age=86400, stale-while-revalidate=604800",
};

// One rule per social card: route-rule globs only expand "/**", not "og-*.jpg".
const OG_IMAGES = readdirSync("public").filter((f) => /^og-.+\.jpg$/.test(f));

const routeRules: Record<string, Record<string, unknown>> = {
  "/**": { headers: SECURITY_HEADERS },
  ...Object.fromEntries(LIVE_PAGES.map((p) => [p, { headers: cache(300, 3600) }])),
  ...Object.fromEntries(STATIC_PAGES.map((p) => [p, { headers: cache(600, 86400) }])),
  "/team/**": { headers: cache(600, 86400) },
  ...Object.fromEntries(OG_IMAGES.map((f) => [`/${f}`, { headers: PUBLIC_FILE_CACHE }])),
  "/favicon.ico": { headers: PUBLIC_FILE_CACHE },
  "/apple-touch-icon.png": { headers: PUBLIC_FILE_CACHE },
  "/smif-logo.png": { headers: PUBLIC_FILE_CACHE },
  // No trailing-slash redirect rules here. Vercel matches route sources without
  // regard to a trailing slash, so a rule for "/about/" also matched "/about" and
  // redirected it to itself (an endless 308 loop on the preview). The router's own
  // 307 from /about/ to /about stays.
};

export default defineConfig(({ command, mode }) => {
  // Inline VITE_* vars as literals so they survive into SSR bundles too.
  const envDefine = Object.fromEntries(
    Object.entries(loadEnv(mode, process.cwd(), "VITE_")).map(([k, v]) => [
      `import.meta.env.${k}`,
      JSON.stringify(v),
    ]),
  );

  return {
    define: envDefine,
    // Lightning CSS in dev as well as build, so the dev preview renders the
    // same CSS the production build ships.
    css: { transformer: "lightningcss" },
    resolve: {
      alias: { "@": `${process.cwd()}/src` },
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tanstack/react-query",
        "@tanstack/query-core",
      ],
    },
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-dom/client",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
      ],
      ignoreOutdatedRequests: true,
    },
    server: { host: "::", port: 8080 },
    plugins: [
      tailwindcss(),
      tsConfigPaths({ projects: ["./tsconfig.json"] }),
      tanstackStart({
        // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
        server: { entry: "server" },
        importProtection: {
          behavior: "error",
          client: { files: ["**/server/**"], specifiers: ["server-only"] },
        },
      }),
      // Build for Vercel (Nitro Vercel preset → .vercel/output, Build Output API v3).
      command === "build" && nitro({ preset: "vercel", routeRules }),
      viteReact(),
    ],
  };
});
