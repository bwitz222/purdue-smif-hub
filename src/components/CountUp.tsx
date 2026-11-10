interface CountUpProps {
  to: number;
  /** Accepted for call-site compatibility; there is no animation. */
  from?: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  /** Format the numeric value. Receives the number, returns a string. */
  format?: (n: number) => string;
  className?: string;
}

/**
 * Renders a number in its final, formatted state.
 *
 * This used to count up from zero when scrolled into view. Figures on a fund's
 * site are reference data, and a number that spends 1.5 seconds being wrong is
 * a worse reading experience than one that is simply right. The component
 * remains so every call site keeps one formatting path.
 */
export function CountUp({
  to,
  decimals = 0,
  prefix = "",
  suffix = "",
  format,
  className,
}: CountUpProps) {
  const formatted = format
    ? format(to)
    : `${prefix}${to.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}${suffix}`;

  return <span className={className}>{formatted}</span>;
}
