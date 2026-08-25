import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Standalone test config — intentionally does NOT extend vite.config.ts so the
// app's build plugins (TanStack Start, Cloudflare, Tailwind) don't load for
// unit tests.
//
// The "@/" alias is mapped here so tests can import the real data and route
// modules rather than regex-parsing their source. Parsing source made the
// roster/calendar guards depend on formatting: a Prettier pass that reflowed
// the CALENDAR entries onto multiple lines broke them instantly.
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
