// Chart colors, read from the same CSS custom properties as the rest of the
// page rather than duplicated as literals inside a route.
//
// recharts takes colors as props, not classes, so it cannot consume a CSS
// variable directly — something has to resolve them. Reading them once from
// the computed root style keeps a single source of truth in src/styles.css.
//
// SSR has no computed style, so every token has a fallback equal to its value
// in :root. That means the server render and the first client render agree,
// and the tokens only ever have to be edited in one place.

export type ChartColors = {
  smif: string;
  bench: string;
  grid: string;
  axis: string;
  /** Direction colors, for the out/under-performance band and drawdown. */
  up: string;
  down: string;
};

const FALLBACK: ChartColors = {
  smif: "#CEB888",
  bench: "#6B6860",
  grid: "#E0DDD5",
  axis: "#6B6860",
  up: "#2A7049",
  down: "#B94040",
};

const TOKEN: Record<keyof ChartColors, string> = {
  smif: "--chart-smif",
  bench: "--chart-bench",
  grid: "--chart-grid",
  axis: "--chart-axis",
  up: "--gain",
  down: "--loss",
};

export function chartColors(): ChartColors {
  if (typeof window === "undefined" || typeof getComputedStyle !== "function") {
    return FALLBACK;
  }
  const style = getComputedStyle(document.documentElement);
  const read = (k: keyof ChartColors) => style.getPropertyValue(TOKEN[k]).trim() || FALLBACK[k];
  return {
    smif: read("smif"),
    bench: read("bench"),
    grid: read("grid"),
    axis: read("axis"),
    up: read("up"),
    down: read("down"),
  };
}
