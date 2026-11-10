// Plain-English definitions of the valuation and portfolio terms Purdue SMIF
// analysts train on. Used by /learn (a short list that links here) and by
// /learn/glossary, which carries the full definitions and the DefinedTermSet.

export const GLOSSARY = [
  {
    term: "Intrinsic Value",
    def: "What a business is actually worth based on the cash it will generate, independent of its market price.",
  },
  {
    term: "DCF",
    def: "Discounted cash flow. Project future free cash flows and discount them to today at the cost of capital.",
  },
  {
    term: "WACC",
    def: "Weighted average cost of capital. The blended required return on a firm's debt and equity; the discount rate in a DCF.",
  },
  {
    term: "Free Cash Flow",
    def: "Cash left after operating costs and capital expenditures; what's actually available to investors.",
  },
  {
    term: "Terminal Value",
    def: "The value of a business beyond the explicit forecast, often the largest piece of a DCF.",
  },
  {
    term: "EV / EBITDA",
    def: "Enterprise value over EBITDA. A capital-structure-neutral valuation multiple.",
  },
  {
    term: "Margin of Safety",
    def: "Buying well below intrinsic value so analytical errors don't become permanent losses.",
  },
  {
    term: "Economic Moat",
    def: "A durable competitive advantage that protects a company's returns from competitors.",
  },
  { term: "Catalyst", def: "A specific event expected to close the gap between price and value." },
  { term: "Alpha", def: "Return earned above what the benchmark would predict." },
  { term: "Beta", def: "A stock's volatility relative to the broader market." },
  { term: "Sharpe Ratio", def: "Excess return per unit of risk; risk-adjusted performance." },
];

/** Stable fragment id for a glossary term, e.g. "EV / EBITDA" -> "ev-ebitda". */
export const termSlug = (term: string) =>
  term
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
