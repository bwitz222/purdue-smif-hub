import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Standalone test config — intentionally does NOT extend vite.config.ts so the
// app's build plugins (TanStack Start, Cloudflare, Tailwind) don't load for
// unit tests. The modules under test are pure TS, so a plain node environment
// is all they need.
//
// The "@" alias is mirrored from tsconfig because some of those pure modules
// (src/lib/portfolio.ts) import committed data via "@/data/...". Declaring the
// path alias does not pull in any build plugin, so the isolation above holds.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
