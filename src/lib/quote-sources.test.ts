import { describe, expect, it } from "vitest";
import { MAX_MOVE, mergeQuotes, type CacheRow, type ExternalClose } from "@/lib/quote-sources";

// Tue 2026-11-10 19:05 UTC: the last completed session is Mon 2026-11-09.
const now = new Date("2026-11-10T19:05:00Z");
const symbols = ["AMZN", "MSFT"];
const cache: CacheRow[] = [
  { symbol: "AMZN", price: 260, change_pct: 1, fetched_at: "2026-11-10T15:44:00Z" },
  { symbol: "MSFT", price: 530, change_pct: -0.5, fetched_at: "2026-11-10T15:44:00Z" },
];
const ext = (
  symbol: string,
  price: number,
  prev: number | null,
  session = "2026-11-09",
): ExternalClose => ({
  symbol,
  source: "zacks",
  session_date: session,
  price,
  prev_close: prev,
});
const merge = (external: ExternalClose[], cacheSession: string | null = "2026-11-06") =>
  mergeQuotes({ cache, cacheSession, external, symbols, now });

describe("mergeQuotes", () => {
  it("uses a newer external session and computes the day change from prev_close", () => {
    const r = merge([ext("AMZN", 266.93, 260), ext("MSFT", 545.18, 530.61)]);
    expect(r.source).toBe("zacks");
    expect(r.sessionDate).toBe("2026-11-09");
    expect(r.rows.find((x) => x.symbol === "AMZN")?.price).toBe(266.93);
    expect(r.rows.find((x) => x.symbol === "MSFT")?.change_pct).toBeCloseTo(
      (545.18 / 530.61 - 1) * 100,
      8,
    );
  });

  it("keeps the cache when external is the same session or older (Polygon takes over)", () => {
    for (const session of ["2026-11-06", "2026-11-05"]) {
      const r = merge([ext("AMZN", 266, 260, session), ext("MSFT", 540, 530, session)]);
      expect(r.source).toBe("polygon");
      expect(r.rows).toBe(cache);
      expect(r.skipped).toMatch(/newer/);
    }
  });

  it("ignores a session that has not closed yet", () => {
    const r = merge([ext("AMZN", 266, 260, "2026-11-10"), ext("MSFT", 540, 530, "2026-11-10")]);
    expect(r.source).toBe("polygon");
  });

  it("ignores a partial set rather than mixing two sessions in one book", () => {
    const r = merge([ext("AMZN", 266.93, 260)]);
    expect(r.source).toBe("polygon");
    expect(r.skipped).toMatch(/MSFT/);
  });

  it("ignores rows without a usable previous close or price", () => {
    expect(merge([ext("AMZN", 266, null), ext("MSFT", 540, 530)]).source).toBe("polygon");
    expect(merge([ext("AMZN", 0, 260), ext("MSFT", 540, 530)]).source).toBe("polygon");
    expect(merge([ext("AMZN", NaN, 260), ext("MSFT", 540, 530)]).source).toBe("polygon");
  });

  it("rejects the whole set when one price looks like a split or unit error", () => {
    const bad = 260 * (1 + MAX_MOVE) * 1.01;
    const r = merge([ext("AMZN", bad, 260), ext("MSFT", 540, 530)]);
    expect(r.source).toBe("polygon");
    expect(r.skipped).toMatch(/AMZN/);
    // a real but large move inside the limit is accepted
    expect(merge([ext("AMZN", 260 * 1.3, 260), ext("MSFT", 540, 530)]).source).toBe("zacks");
  });

  it("uses an external set when the cache is empty", () => {
    const r = mergeQuotes({
      cache: [],
      cacheSession: null,
      external: [ext("AMZN", 266, 260), ext("MSFT", 540, 530)],
      symbols,
      now,
    });
    expect(r.source).toBe("zacks");
  });

  it("returns the cache untouched when there is no external data", () => {
    const r = merge([]);
    expect(r.rows).toBe(cache);
    expect(r.source).toBe("polygon");
    expect(r.sessionDate).toBe("2026-11-06");
  });

  it("ignores sources it does not know", () => {
    const r = merge([
      { ...ext("AMZN", 266, 260), source: "mystery" },
      { ...ext("MSFT", 540, 530), source: "mystery" },
    ]);
    expect(r.source).toBe("polygon");
  });
});
