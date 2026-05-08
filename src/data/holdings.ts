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
  { company: "State Street SPDR S&P 500 ETF", symbol: "SPY", industry: "ETF", price: 731.58, beta: 1.0, shares: 350, value: 256053.0, costBasis: 147797.75, dayGain: -787.5, dayChange: -0.31, totalReturn: 108255.25, returnPct: 73.25, allocation: 41.69 },
  { company: "Monster Beverage", symbol: "MNST", industry: "Consumer Defensive", price: 75.97, beta: 0.5, shares: 372, value: 28260.84, costBasis: 25712.75, dayGain: -457.56, dayChange: -1.59, totalReturn: 2548.09, returnPct: 9.91, allocation: 4.6 },
  { company: "U.S. Bancorp", symbol: "USB", industry: "Financials", price: 55.31, beta: 1.01, shares: 503, value: 27820.93, costBasis: 23482.56, dayGain: -427.55, dayChange: -1.51, totalReturn: 4338.37, returnPct: 18.47, allocation: 4.53 },
  { company: "Berkshire Hathaway", symbol: "BRK.B", industry: "Financials", price: 475.08, beta: 0.62, shares: 58, value: 27554.64, costBasis: 23962.46, dayGain: 304.5, dayChange: 1.12, totalReturn: 3592.18, returnPct: 14.99, allocation: 4.49 },
  { company: "Meta Platforms", symbol: "META", industry: "Communication Services", price: 616.81, beta: 1.24, shares: 36, value: 22205.16, costBasis: 22961.26, dayGain: 141.48, dayChange: 0.64, totalReturn: -756.1, returnPct: -3.29, allocation: 3.62 },
  { company: "Amazon.com", symbol: "AMZN", industry: "Consumer Cyclical", price: 271.17, beta: 1.47, shares: 92, value: 24947.64, costBasis: 23257.37, dayGain: -351.44, dayChange: -1.39, totalReturn: 1690.27, returnPct: 7.27, allocation: 4.06 },
  { company: "Microsoft Corp.", symbol: "MSFT", industry: "Technology", price: 420.77, beta: 1.09, shares: 50, value: 21038.5, costBasis: 25712.75, dayGain: 340.5, dayChange: 1.65, totalReturn: -4674.25, returnPct: -18.18, allocation: 3.43 },
  { company: "Cummins Inc.", symbol: "CMI", industry: "Industrials", price: 682.88, beta: 1.27, shares: 25, value: 17072.0, costBasis: 12947.85, dayGain: -822.0, dayChange: -4.59, totalReturn: 4124.15, returnPct: 31.85, allocation: 2.78 },
  { company: "Cipher Digital", symbol: "CIFR", industry: "Technology", price: 20.69, beta: 3.16, shares: 880, value: 18202.8, costBasis: 11998.8, dayGain: -1078.0, dayChange: -5.59, totalReturn: 6204.0, returnPct: 51.71, allocation: 2.96 },
  { company: "Ally Financial", symbol: "ALLY", industry: "Financials", price: 43.79, beta: 1.11, shares: 364, value: 15939.56, costBasis: 12441.52, dayGain: -185.64, dayChange: -1.15, totalReturn: 3498.04, returnPct: 28.12, allocation: 2.6 },
  { company: "Constellation Energy", symbol: "CEG", industry: "Energy", price: 311.28, beta: 1.15, shares: 51, value: 15875.28, costBasis: 18927.63, dayGain: -586.5, dayChange: -3.56, totalReturn: -3052.35, returnPct: -16.13, allocation: 2.59 },
  { company: "Eli Lilly and Co.", symbol: "LLY", industry: "Healthcare", price: 974.96, beta: 0.49, shares: 16, value: 15599.36, costBasis: 16735.52, dayGain: -193.44, dayChange: -1.22, totalReturn: -1136.16, returnPct: -6.79, allocation: 2.54 },
  { company: "Palo Alto Networks", symbol: "PANW", industry: "Technology", price: 196.53, beta: 0.77, shares: 72, value: 14150.16, costBasis: 14088.96, dayGain: 925.2, dayChange: 7.0, totalReturn: 61.2, returnPct: 0.43, allocation: 2.3 },
  { company: "Orion Group", symbol: "ORN", industry: "Industrials", price: 14.75, beta: 1.4, shares: 1070, value: 15782.5, costBasis: 12347.59, dayGain: -353.1, dayChange: -2.19, totalReturn: 3434.91, returnPct: 27.82, allocation: 2.57 },
  { company: "Steel Dynamics", symbol: "STLD", industry: "Materials", price: 232.92, beta: 1.5, shares: 55, value: 12810.6, costBasis: 9751.78, dayGain: -491.15, dayChange: -3.69, totalReturn: 3058.82, returnPct: 31.37, allocation: 2.09 },
  { company: "Occidental Petroleum", symbol: "OXY", industry: "Energy", price: 53.94, beta: 0.16, shares: 194, value: 10464.36, costBasis: 8149.97, dayGain: -228.92, dayChange: -2.14, totalReturn: 2314.39, returnPct: 28.4, allocation: 1.7 },
  { company: "Ralph Lauren", symbol: "RL", industry: "Consumer Cyclical", price: 353.55, beta: 1.38, shares: 30, value: 10606.5, costBasis: 10134.0, dayGain: -558.0, dayChange: -5.0, totalReturn: 472.5, returnPct: 4.66, allocation: 1.73 },
  { company: "Verizon Communications", symbol: "VZ", industry: "Communication Services", price: 47.09, beta: 0.22, shares: 213, value: 10030.17, costBasis: 8788.38, dayGain: -74.55, dayChange: -0.74, totalReturn: 1241.79, returnPct: 14.13, allocation: 1.63 },
  { company: "Deere & Company", symbol: "DE", industry: "Industrials", price: 580.54, beta: 0.97, shares: 17, value: 9869.18, costBasis: 6114.73, dayGain: -188.7, dayChange: -1.88, totalReturn: 3754.45, returnPct: 61.4, allocation: 1.61 },
  { company: "Procter & Gamble", symbol: "PG", industry: "Consumer Defensive", price: 146.06, beta: 0.4, shares: 55, value: 8033.3, costBasis: 7895.79, dayGain: -101.2, dayChange: -1.24, totalReturn: 137.51, returnPct: 1.74, allocation: 1.31 },
  { company: "Capital One Financial", symbol: "COF", industry: "Financials", price: 192.59, beta: 1.05, shares: 31, value: 5970.29, costBasis: 6292.23, dayGain: -25.11, dayChange: -0.42, totalReturn: -321.94, returnPct: -5.12, allocation: 0.97 },
  { company: "Smithfield Foods", symbol: "SFD", industry: "Consumer Defensive", price: 26.08, beta: 0.39, shares: 200, value: 5216.0, costBasis: 4974.94, dayGain: -18.0, dayChange: -0.34, totalReturn: 241.06, returnPct: 4.85, allocation: 0.85 },
  { company: "DoorDash", symbol: "DASH", industry: "Consumer Cyclical", price: 171.35, beta: 1.87, shares: 30, value: 5140.5, costBasis: 4886.4, dayGain: 101.4, dayChange: 2.01, totalReturn: 254.1, returnPct: 5.2, allocation: 0.84 },
];

export const portfolioSummary = {
  investedCapital: 598643.27,
  cashHoldings: 15484.0,
  portfolioValue: 614127.27,
  totalDayGain: -5115.28,
  totalDayChange: -0.83,
  totalReturn: 139280.28,
  totalReturnPct: 22.68,
  weightedBeta: 1.02,
};
