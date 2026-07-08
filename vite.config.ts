import { defineConfig, loadEnv, mergeConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";

// Self-hosted replacement for @lovable.dev/vite-tanstack-config.
// Reproduces only the parts that affect the production build; the Lovable
// package's dev-server/sandbox extras (asset proxy, error-overlay piping,
// componentTagger, HMR gate, sandbox port detection) are intentionally dropped
// since the app no longer runs inside Lovable.
export default defineConfig(({ command, mode }) => {
  // VITE_-prefixed env injected into import.meta.env for both client and SSR,
  // matching the previous config's behavior.
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const envDefine = Object.fromEntries(
    Object.entries(env).map(([k, v]) => [`import.meta.env.${k}`, JSON.stringify(v)]),
  );

  const plugins = [
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({
      // Redirect TanStack Start's server entry to src/server.ts (SSR error wrapper).
      server: { entry: "server" },
      importProtection: {
        behavior: "error",
        client: { files: ["**/server/**"], specifiers: ["server-only"] },
      },
    }),
  ];

  // Nitro emits the Vercel Build Output (.vercel/output, Build Output API v3).
  // Only needed at build time. Must run after tanstackStart, before react.
  if (command === "build") {
    plugins.push(nitro({ preset: "vercel" }));
  }

  plugins.push(viteReact());

  return mergeConfig(
    { server: { host: "::", port: 8080 } },
    {
      define: envDefine,
      // Keep dev CSS parity with the Lightning CSS build pipeline (Tailwind v4).
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
      },
      plugins,
    },
  );
});
