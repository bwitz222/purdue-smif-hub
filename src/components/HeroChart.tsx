import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";

/**
 * Animated hero visualization: a stylized SMIF vs S&P 500 cumulative return
 * curve drawn as SVG. Replaces the static campus photo with something
 * editorially closer to what the fund actually does — without claiming
 * the data is live (deterministic synthetic series, clearly labeled "illustrative").
 */
export function HeroChart() {
  const reduce = useReducedMotion();

  // Deterministic synthetic monthly cumulative returns over ~5 years.
  // SMIF outperforms SPY in aggregate (matches the portfolio's reported track record).
  const { smifPath, spyPath, smifArea, ticks, smifEnd, spyEnd } = useMemo(() => {
    const months = 60;
    const w = 800;
    const h = 360;
    const padL = 40;
    const padR = 16;
    const padT = 24;
    const padB = 36;

    // PRNG so series is stable across renders/SSR.
    const rand = (seed: number) => {
      let s = seed;
      return () => {
        s = (s * 9301 + 49297) % 233280;
        return s / 233280;
      };
    };
    const rs = rand(7);
    const rb = rand(19);

    const smif: number[] = [0];
    const spy: number[] = [0];
    for (let i = 1; i <= months; i++) {
      // monthly return with positive drift; SMIF slightly higher drift and vol
      const s = (rs() - 0.42) * 5.5 + 0.95;
      const b = (rb() - 0.46) * 4.2 + 0.7;
      smif.push(smif[i - 1] + s);
      spy.push(spy[i - 1] + b);
    }

    const minY = Math.min(...smif, ...spy, 0);
    const maxY = Math.max(...smif, ...spy);
    const range = maxY - minY || 1;

    const x = (i: number) => padL + (i / months) * (w - padL - padR);
    const y = (v: number) => padT + (1 - (v - minY) / range) * (h - padT - padB);

    const toPath = (arr: number[]) =>
      arr.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(2)},${y(v).toFixed(2)}`).join(" ");

    const smifPath = toPath(smif);
    const spyPath = toPath(spy);

    const area =
      `M${x(0)},${y(0)} ` +
      smif.map((v, i) => `L${x(i).toFixed(2)},${y(v).toFixed(2)}`).join(" ") +
      ` L${x(months).toFixed(2)},${y(minY).toFixed(2)} L${x(0).toFixed(2)},${y(minY).toFixed(2)} Z`;

    // Y-axis ticks (4 evenly spaced gridlines)
    const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => {
      const v = minY + range * (1 - t);
      return { y: padT + t * (h - padT - padB), v };
    });

    return {
      smifPath,
      spyPath,
      smifArea: area,
      ticks,
      smifEnd: smif[months],
      spyEnd: spy[months],
    };
  }, []);

  return (
    <div className="relative w-full">
      {/* Frame */}
      <div className="relative border border-white/10 bg-ink/40 backdrop-blur-sm">
        {/* Header bar — mimics a terminal panel */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
          <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.22em] text-background/60">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              SMIF
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-background/40" />
              S&amp;P 500
            </span>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-background/40">
            Illustrative · 5Y
          </div>
        </div>

        {/* Chart */}
        <svg
          viewBox="0 0 800 360"
          className="block h-auto w-full"
          aria-label="Illustrative cumulative return: SMIF vs S&P 500"
          role="img"
        >
          <defs>
            <linearGradient id="hero-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#CFB991" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#CFB991" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Gridlines */}
          {ticks.map((t, i) => (
            <g key={i}>
              <line
                x1={40}
                x2={784}
                y1={t.y}
                y2={t.y}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={1}
              />
              <text
                x={32}
                y={t.y + 3}
                textAnchor="end"
                className="fill-background/30 font-mono"
                style={{ fontSize: 9 }}
              >
                {t.v >= 0 ? "+" : ""}
                {t.v.toFixed(0)}%
              </text>
            </g>
          ))}

          {/* SPY line (muted) */}
          <motion.path
            d={spyPath}
            fill="none"
            stroke="rgba(250,250,246,0.45)"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={reduce ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
          />

          {/* SMIF area fill */}
          <motion.path
            d={smifArea}
            fill="url(#hero-area)"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 1.4 }}
          />

          {/* SMIF line (gold, prominent) */}
          <motion.path
            d={smifPath}
            fill="none"
            stroke="#CFB991"
            strokeWidth={2.25}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={reduce ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
          />
        </svg>

        {/* Footer stat strip */}
        <div className="grid grid-cols-2 border-t border-white/10 font-mono text-[11px] uppercase tracking-[0.18em]">
          <div className="border-r border-white/10 px-4 py-3">
            <div className="text-background/40">SMIF 5Y</div>
            <div className="mt-0.5 text-base font-semibold text-gold">
              +{smifEnd.toFixed(1)}%
            </div>
          </div>
          <div className="px-4 py-3">
            <div className="text-background/40">S&amp;P 500 5Y</div>
            <div className="mt-0.5 text-base font-semibold text-background/70">
              +{spyEnd.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
