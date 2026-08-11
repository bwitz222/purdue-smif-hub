import { motion, useReducedMotion } from "framer-motion";

/**
 * Proportional allocation blocks.
 *
 * A stacked bar list makes the reader compare lengths across rows to answer
 * "what dominates this book". Area answers it in one look — and with SPY at
 * 41.5% the answer is worth seeing immediately.
 *
 * Not a true squarified treemap: cells are flex items whose grow factor is the
 * weight, with a basis and a cap derived from the same number. That keeps the
 * areas honest at every width without a layout pass in JavaScript, and the cap
 * is what stops the final flex row from stretching three small positions across
 * the full width.
 */

export type TreemapCell = {
  /** Short label — a ticker, or a sector name. */
  key: string;
  label: string;
  /** Percent of the whole. Drives area, and is rendered. */
  pct: number;
  /** Optional second line, e.g. a dollar amount. */
  sub?: string;
  /** Renders with a hatched fill instead of a solid one — used for cash. */
  hatched?: boolean;
  href?: string;
  onClick?: () => void;
};

/** Gold at an opacity proportional to weight, floored so small cells stay legible. */
function fill(pct: number, max: number, hatched?: boolean): string {
  if (hatched) {
    return "repeating-linear-gradient(45deg, var(--secondary), var(--secondary) 6px, var(--muted) 6px, var(--muted) 12px)";
  }
  const t = max > 0 ? pct / max : 0;
  const mix = Math.round(6 + t * 49); // 6%–55% gold over the paper ground
  return `color-mix(in srgb, var(--gold) ${mix}%, var(--secondary))`;
}

export function Treemap({
  cells,
  minHeight = 240,
  emptyLabel = "No allocation to show.",
}: {
  cells: TreemapCell[];
  minHeight?: number;
  emptyLabel?: string;
}) {
  const reduce = useReducedMotion();
  const shown = cells.filter((c) => c.pct > 0);

  if (shown.length === 0) {
    return <p className="p-8 text-center text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  const max = Math.max(...shown.map((c) => c.pct));

  return (
    <ul
      className="flex list-none flex-wrap gap-0.5 p-0"
      style={{ minHeight }}
      aria-label="Allocation by weight"
    >
      {shown.map((c, i) => {
        // Basis and cap both scale with weight. The cap is what prevents a
        // trailing row of small cells from expanding to fill the line.
        const basis = Math.max(5, Math.min(40, c.pct * 0.95));
        const cap = Math.max(10, Math.min(46, c.pct * 2.2));
        const big = c.pct >= max * 0.35;
        const Tag = c.href ? "a" : c.onClick ? "button" : "div";

        return (
          <motion.li
            key={c.key}
            className="relative flex"
            style={{ flex: `${c.pct} 1 ${basis}%`, maxWidth: `${cap}%` }}
            initial={reduce ? false : { opacity: 0 }}
            whileInView={reduce ? undefined : { opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45, delay: Math.min(0.4, i * 0.02), ease: [0.22, 1, 0.36, 1] }}
          >
            <Tag
              {...(c.href ? { href: c.href } : {})}
              {...(c.onClick && !c.href ? { onClick: c.onClick, type: "button" as const } : {})}
              className={`hover-raise flex w-full flex-col justify-end overflow-hidden border border-border p-2.5 text-left transition-[filter] duration-150 hover:brightness-[0.97] ${
                big ? "min-h-[9rem]" : "min-h-[5.5rem]"
              } ${c.href || c.onClick ? "cursor-pointer" : ""}`}
              style={{ background: fill(c.pct, max, c.hatched) }}
            >
              <span className="font-mono text-[13px] font-semibold tracking-[0.04em] text-ink">
                {c.label}
              </span>
              <span className="font-mono text-[11px] text-ink/70">
                {c.pct.toFixed(c.pct < 1 ? 2 : 1)}%{c.sub ? ` · ${c.sub}` : ""}
              </span>
            </Tag>
          </motion.li>
        );
      })}
    </ul>
  );
}
