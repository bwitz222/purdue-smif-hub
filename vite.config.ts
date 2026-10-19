// Self-hosted build config. This replaces @lovable.dev/vite-tanstack-config,
// keeping only what the production build needs: Tailwind, the @ path alias,
// TanStack Start (SSR + server functions), Nitro's Vercel preset, and React.
// The Lovable-only pieces (sandbox bridge, HMR gate, component tagger, asset
// proxy, dev error overlays) are gone.
import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import viteReact from "@vitejs/plugin-react";

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
      command === "build" && nitro({ preset: "vercel" }),
      viteReact(),
    ],
  };
});
