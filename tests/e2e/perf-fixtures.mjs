// Synthetic data for the /performance tests. The suite runs without Supabase, so
// the page has no real figures; these fixtures are fed to the browser through
// request interception to exercise the charts. They exist only in the test
// browser and are never shipped, which is the point: the site itself holds no
// invented returns to fall back on.
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

// seroval is the wire format of TanStack server functions. It is a transitive
// dependency, so look for it next to the packages that depend on it.
function loadSeroval() {
  for (const owner of [
    "@tanstack/start-server-core",
    "@tanstack/react-start",
    "@tanstack/router-core",
  ]) {
    try {
      const fromOwner = require("node:module").createRequire(
        require.resolve(`${owner}/package.json`),
      );
      return fromOwner("seroval");
    } catch {
      /* try the next one */
    }
  }
  return require("seroval");
}

const { toCrossJSONAsync } = loadSeroval();

const serialize = async (value) =>
  JSON.stringify(
    await toCrossJSONAsync({ result: value, error: undefined, context: {} }, { refs: new Map() }),
  );

function monthlyHistory() {
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const series = [];
  let g = 1;
  let b = 1;
  let gPeak = 1;
  let bPeak = 1;
  for (let i = 0; i < 157; i++) {
    const month = new Date(Date.UTC(2013, 9 + i, 1)).toISOString().slice(0, 10);
    const s = (rnd() - 0.42) * 7;
    const bn = (rnd() - 0.4) * 6;
    g *= 1 + s / 100;
    b *= 1 + bn / 100;
    gPeak = Math.max(gPeak, g);
    bPeak = Math.max(bPeak, b);
    series.push({
      month,
      smif_return_pct: s,
      bench_return_pct: bn,
      smif_growth: +g.toFixed(4),
      bench_growth: +b.toFixed(4),
      smif_drawdown_pct: +(((g - gPeak) / gPeak) * 100).toFixed(3),
      bench_drawdown_pct: +(((b - bPeak) / bPeak) * 100).toFixed(3),
      is_transition: false,
    });
  }
  return {
    series,
    inceptionMonth: series[0].month,
    lastMonth: series.at(-1).month,
    benchSymbol: "SPY",
    analytics: {
      cumulative_return_pct: 1,
      annualized_return_pct: 1,
      annualized_vol_pct: 1,
      sharpe: 1,
      sortino: 1,
      beta: 1,
      annualized_alpha_pct: 1,
      tracking_error_pct: 1,
      information_ratio: 1,
      correlation: 1,
      best_month_pct: 1,
      worst_month_pct: 1,
      positive_months_pct: 1,
      observations: series.length,
    },
    kpis: {
      one_year_pct: 8.2,
      five_year_annualized_pct: 9.1,
      inception_annualized_pct: 9.6,
      bench_inception_annualized_pct: 10,
      max_drawdown_pct: -20,
    },
  };
}

const performance = () => ({
  rows: [2025, 2024, 2023, 2022, 2021, 2020, 2019].map((year, i) => ({
    year,
    smif_return: [9.1, 21.3, 24.8, -17.2, 27.9, 15.4, 28.8][i],
    bench_return: [10.2, 24.9, 26.2, -18.1, 28.7, 18.4, 31.5][i],
    is_audited: true,
  })),
  kpis: { one_year: 8.2, five_year_annualized: 9.1, inception_annualized: 9.6 },
  allAudited: true,
});

/** Serialized server-function bodies, keyed by the exported function name. */
export async function performanceFixtures() {
  return {
    getFundMonthlyHistory: await serialize(monthlyHistory()),
    getFundPerformance: await serialize(performance()),
  };
}

/**
 * The exported function name behind a /_serverFn/<id> URL. Dev-server ids are
 * base64 JSON like {"file": "...", "export": "getFundPerformance_createServerFn_handler"}.
 */
export function serverFnName(url) {
  try {
    const id = new URL(url).pathname.split("/").pop();
    const name = JSON.parse(Buffer.from(id, "base64url").toString("utf8")).export ?? "";
    return name.replace(/_createServerFn_handler$/, "");
  } catch {
    return "";
  }
}
