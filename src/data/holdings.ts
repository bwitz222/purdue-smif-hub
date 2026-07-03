// Static portfolio scaffold: shares, cost basis, industry, and beta are
// maintained by the fund and should be refreshed each quarter alongside the
// custody statement. Live prices, day-change, value, and returns are
// overwritten at render time by quote_cache (Polygon end-of-day close via
// getLiveQuotes). The numbers hardcoded below are legacy fallbacks used only
// when no quote is available for a symbol.
export interface Holding {
  company: string;
  symbol: string;
  industry: string;
  price: number;
  beta: number;
  shares: number;
  value: number;
  costBasis: number;
  dayGain: number;
  dayChange: number;
  totalReturn: number;
  returnPct: number;
  allocation: number;
}

export const holdings: Holding[] = [
  { company: "State Street SPDR S&P 500 ETF", symbol: "SPY", industry: "ETF", price: 756.48, beta: 1.0, shares: 350, value: 264768.0, costBasis: 147797.75, dayGain: 658.0, dayChange: 0.25, totalReturn: 116970.25, returnPct: 79.14, allocation: 41.53 },
  { company: "Monster Beverage", symbol: "MNST", industry: "Consumer Defensive", price: 88.08, beta: 0.54, shares: 372, value: 32765.76, costBasis: 25712.75, dayGain: 33.48, dayChange: 0.10, totalReturn: 7053.01, returnPct: 27.43, allocation: 5.14 },
  { company: "U.S. Bancorp", symbol: "USB", industry: "Financials", price: 54.85, beta: 0.99, shares: 503, value: 27589.55, costBasis: 23482.56, dayGain: 201.20, dayChange: 0.73, totalReturn: 4106.99, returnPct: 17.49, allocation: 4.33 },
  { company: "Berkshire Hathaway", symbol: "BRK.B", industry: "Financials", price: 474.48, beta: 0.62, shares: 58, value: 27519.84, costBasis: 23962.46, dayGain: -170.52, dayChange: -0.62, totalReturn: 3557.38, returnPct: 14.85, allocation: 4.32 },
  { company: "Meta Platforms", symbol: "META", industry: "Communication Services", price: 632.51, beta: 1.23, shares: 36, value: 22770.36, costBasis: 22961.26, dayGain: -100.08, dayChange: -0.44, totalReturn: -190.90, returnPct: -0.83, allocation: 3.57 },
  { company: "Amazon.com", symbol: "AMZN", industry: "Consumer Cyclical", price: 270.64, beta: 1.45, shares: 92, value: 24898.88, costBasis: 23257.37, dayGain: -309.12, dayChange: -1.23, totalReturn: 1641.51, returnPct: 7.06, allocation: 3.91 },
  { company: "Microsoft Corp.", symbol: "MSFT", industry: "Technology", price: 450.24, beta: 1.09, shares: 50, value: 22512.0, costBasis: 25712.75, dayGain: 1162.50, dayChange: 5.45, totalReturn: -3200.75, returnPct: -12.45, allocation: 3.53 },
  { company: "Cummins Inc.", symbol: "CMI", industry: "Industrials", price: 646.63, beta: 1.25, shares: 25, value: 16165.75, costBasis: 12947.85, dayGain: -551.25, dayChange: -3.30, totalReturn: 3217.90, returnPct: 24.85, allocation: 2.54 },
  { company: "Cipher Digital", symbol: "CIFR", industry: "Technology", price: 23.65, beta: 3.21, shares: 880, value: 20812.0, costBasis: 11998.80, dayGain: -827.20, dayChange: -3.82, totalReturn: 8813.20, returnPct: 73.45, allocation: 3.26 },
  { company: "Ally Financial", symbol: "ALLY", industry: "Financials", price: 42.81, beta: 1.09, shares: 364, value: 15582.84, costBasis: 12441.52, dayGain: 3.64, dayChange: 0.02, totalReturn: 3141.32, returnPct: 25.25, allocation: 2.44 },
  { company: "Constellation Energy", symbol: "CEG", industry: "Energy", price: 287.75, beta: 1.09, shares: 51, value: 14675.25, costBasis: 18927.63, dayGain: 73.44, dayChange: 0.50, totalReturn: -4252.38, returnPct: -22.47, allocation: 2.30 },
  { company: "Eli Lilly and Co.", symbol: "LLY", industry: "Healthcare", price: 1105.00, beta: 0.53, shares: 16, value: 17680.0, costBasis: 16735.52, dayGain: -348.80, dayChange: -1.93, totalReturn: 944.48, returnPct: 5.64, allocation: 2.77 },
  { company: "Palo Alto Networks", symbol: "PANW", industry: "Technology", price: 281.69, beta: 0.89, shares: 72, value: 20281.68, costBasis: 14088.96, dayGain: 1722.24, dayChange: 9.28, totalReturn: 6192.72, returnPct: 43.95, allocation: 3.18 },
  { company: "Orion Group", symbol: "ORN", industry: "Industrials", price: 13.76, beta: 1.39, shares: 1070, value: 14723.20, costBasis: 12347.59, dayGain: -620.60, dayChange: -4.04, totalReturn: 2375.61, returnPct: 19.24, allocation: 2.31 },
  { company: "Steel Dynamics", symbol: "STLD", industry: "Materials", price: 260.15, beta: 1.51, shares: 55, value: 14308.25, costBasis: 9751.78, dayGain: -33.00, dayChange: -0.23, totalReturn: 4556.47, returnPct: 46.72, allocation: 2.24 },
  { company: "Occidental Petroleum", symbol: "OXY", industry: "Energy", price: 56.63, beta: 0.15, shares: 194, value: 10986.22, costBasis: 8149.97, dayGain: -133.86, dayChange: -1.20, totalReturn: 2836.25, returnPct: 34.80, allocation: 1.72 },
  { company: "Ralph Lauren", symbol: "RL", industry: "Consumer Cyclical", price: 363.90, beta: 1.37, shares: 30, value: 10917.0, costBasis: 10134.0, dayGain: -206.10, dayChange: -1.85, totalReturn: 783.0, returnPct: 7.73, allocation: 1.71 },
  { company: "Verizon Communications", symbol: "VZ", industry: "Communication Services", price: 47.81, beta: 0.22, shares: 213, value: 10183.53, costBasis: 8788.38, dayGain: -42.60, dayChange: -0.42, totalReturn: 1395.15, returnPct: 15.87, allocation: 1.60 },
  { company: "Deere & Company", symbol: "DE", industry: "Industrials", price: 542.18, beta: 0.93, shares: 17, value: 9217.06, costBasis: 6114.73, dayGain: 54.06, dayChange: 0.59, totalReturn: 3102.33, returnPct: 50.74, allocation: 1.45 },
  { company: "Procter & Gamble", symbol: "PG", industry: "Consumer Defensive", price: 143.56, beta: 0.39, shares: 55, value: 7895.80, costBasis: 7895.79, dayGain: -129.25, dayChange: -1.61, totalReturn: 0.01, returnPct: 0.00, allocation: 1.24 },
  { company: "Capital One Financial", symbol: "COF", industry: "Financials", price: 187.93, beta: 1.03, shares: 31, value: 5825.83, costBasis: 6292.23, dayGain: 28.21, dayChange: 0.49, totalReturn: -466.40, returnPct: -7.41, allocation: 0.91 },
  { company: "Smithfield Foods", symbol: "SFD", industry: "Consumer Defensive", price: 25.83, beta: 0.38, shares: 200, value: 5166.0, costBasis: 4974.94, dayGain: -114.0, dayChange: -2.16, totalReturn: 191.06, returnPct: 3.84, allocation: 0.81 },
  { company: "DoorDash", symbol: "DASH", industry: "Consumer Cyclical", price: 159.29, beta: 1.82, shares: 30, value: 4778.70, costBasis: 4886.40, dayGain: 77.70, dayChange: 1.65, totalReturn: -107.70, returnPct: -2.20, allocation: 0.75 },
];

export const portfolioSummary = {
  investedCapital: 622023.50,
  cashHoldings: 15484.0,
  portfolioValue: 637507.50,
  totalDayGain: 428.09,
  totalDayChange: 0.07,
  totalReturn: 162660.51,
  totalReturnPct: 25.52,
  weightedBeta: 1.02,
};
