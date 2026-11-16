import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CONTENT_ROUTES } from "./content-routes";
import { TOP_LEVEL_CRUMBS, trailFor } from "./breadcrumbs";
import { memberDirectory } from "@/data/team";

const ROUTES_DIR = new URL("../routes/", import.meta.url);

describe("visible breadcrumbs", () => {
  it("covers every top-level page and names it the way its structured data does", () => {
    const declared = new Map<string, string>();
    for (const f of readdirSync(ROUTES_DIR)) {
      if (!f.endsWith(".tsx")) continue;
      const src = readFileSync(new URL(f, ROUTES_DIR), "utf8");
      for (const m of src.matchAll(/breadcrumbLd\(\s*"([^"]+)",\s*"([^"]+)"\s*\)/g)) {
        declared.set(m[2], m[1]);
      }
    }
    // Every page that emits a BreadcrumbList has the same name in the visible trail.
    for (const [path, name] of declared) {
      expect(TOP_LEVEL_CRUMBS[path], `visible crumb for ${path}`).toBe(name);
    }
    // And every visible crumb has a matching structured-data trail.
    for (const path of Object.keys(TOP_LEVEL_CRUMBS)) {
      expect(declared.has(path), `structured data for ${path}`).toBe(true);
    }
  });

  it("returns no trail for the home page, unknown pages, and pages that draw their own", () => {
    expect(trailFor("/")).toBeNull();
    expect(trailFor("/nope")).toBeNull();
    expect(trailFor("/team/does-not-exist")).toBeNull();
    for (const r of CONTENT_ROUTES) expect(trailFor(r.path)).toBeNull();
  });

  it("builds Home > Team > name for every member and ignores a trailing slash", () => {
    for (const { slug, member } of memberDirectory) {
      expect(trailFor(`/team/${slug}`)).toEqual([
        { name: "Team", to: "/team" },
        { name: member.name },
      ]);
    }
    expect(trailFor("/about/")).toEqual([{ name: "About" }]);
  });
});
