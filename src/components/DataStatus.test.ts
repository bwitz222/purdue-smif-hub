import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DataStatus } from "@/components/DataStatus";
import { freshnessOf } from "@/lib/market-calendar";
import type { LiveStatus } from "@/lib/use-live-book";

const now = new Date("2026-11-10T19:05:00Z"); // last completed session: Mon 2026-11-09
const status = (
  quotes: string | null,
  risk: string | null,
  weights: string | null,
): LiveStatus => ({
  quotes: freshnessOf(quotes, now),
  risk: freshnessOf(risk, now),
  weights: freshnessOf(weights, now),
  checkedAt: Date.parse("2026-11-10T19:00:00Z"),
  isFetching: false,
  error: null,
  refetchAll: async () => undefined,
});
const html = (s: LiveStatus) => renderToStaticMarkup(createElement(DataStatus, { status: s }));

describe("DataStatus", () => {
  it("shows each data set's own close and how far behind it is", () => {
    const out = html(status("2026-11-06", "2026-11-06", "2026-11-05"));
    expect(out).toContain("Fri, Nov 6 close");
    expect(out).toContain("Thu, Nov 5 close");
    expect(out).toContain("Latest release, 1 session behind");
    expect(out).toContain("Latest release, 2 sessions behind");
    expect(out).not.toContain("three or more sessions behind");
  });

  it("calls a data set current when it holds the latest completed close", () => {
    expect(html(status("2026-11-09", "2026-11-09", "2026-11-09"))).toContain("Current");
  });

  it("warns when anything is three or more sessions behind", () => {
    const out = html(status("2026-11-06", "2026-11-03", "2026-11-06"));
    expect(out).toContain("4 sessions behind");
    expect(out).toContain("three or more sessions behind");
  });

  it("renders n/a rather than throwing before data loads", () => {
    const out = html(status(null, null, null));
    expect(out).toContain("n/a");
    expect(out).not.toContain("behind");
  });

  it("exposes a way to check for new data", () => {
    expect(html(status("2026-11-06", "2026-11-06", "2026-11-06"))).toContain("Check for new data");
  });
});
