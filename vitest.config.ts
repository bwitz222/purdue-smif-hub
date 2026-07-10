import { defineConfig } from "vitest/config";

// Standalone test config — intentionally does NOT extend vite.config.ts so the
// app's build plugins (TanStack Start, Cloudflare, Tailwind) don't load for
// unit tests. The calculation modules under test are pure TS with no app
// imports, so a plain node environment is all they need.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
