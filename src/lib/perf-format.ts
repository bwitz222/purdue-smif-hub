// Formatting and view-mode types shared by the performance page and its charts.
// Kept apart from the charting library so the page can load without it.

export type Mode = "cumulative" | "annual";
export type Series = "both" | "smif" | "bench";
export type IncMode = "growth" | "drawdown" | "rolling";

export const fmtPct = (v: number) => `${v > 0 ? "+" : ""}${v.toFixed(1)}%`;
export const fmtMult = (v: number) => `${v.toFixed(2)}×`;
