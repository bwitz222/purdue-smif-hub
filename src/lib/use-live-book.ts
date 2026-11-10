import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { holdings as baseHoldings, portfolioSummary as baseSummary } from "@/data/holdings";
import { getLiveQuotes, type QuotePayload } from "@/lib/quotes.functions";
import { getFundStats } from "@/lib/fund-stats.functions";
import { getRiskMetrics } from "@/lib/risk.functions";
import { getEtfSectorWeights } from "@/lib/etf-weights.functions";
import { liveQueryOptions } from "@/lib/live-query";
import { buildPortfolio, sectorPercentBreakdown, topMovers } from "@/lib/portfolio";
import { freshnessOf, type Freshness } from "@/lib/market-calendar";
import type { QuoteSource } from "@/lib/quote-sources";

/** The current instant, re-read every minute on the client; null until mounted. */
function useNow(intervalMs = 60_000): Date | null {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

/**
 * One snapshot of the book for /holdings: quotes, cash, risk metrics, and ETF
 * look-through weights, polled on one clock, with every figure on the page
 * (summary, risk, movers, sector allocation, table) derived from it. Nothing
 * downstream fetches on its own, so the panels cannot disagree about the date.
 */
export function useLiveBook(initialQuotes?: QuotePayload | null) {
  const symbols = useMemo(() => baseHoldings.map((h) => h.symbol), []);
  const fetchQuotes = useServerFn(getLiveQuotes);
  const fetchFundStats = useServerFn(getFundStats);
  const fetchRisk = useServerFn(getRiskMetrics);
  const fetchEtfWeights = useServerFn(getEtfSectorWeights);

  const quotesQuery = useQuery({
    queryKey: ["live-quotes", symbols],
    queryFn: () => fetchQuotes({ data: { symbols } }),
    ...liveQueryOptions,
    // SSR seed from quote_cache; initialDataUpdatedAt anchors staleness to the
    // cache's real age so an old cache still refetches (and self-heals) at once.
    initialData: initialQuotes ?? undefined,
    initialDataUpdatedAt: initialQuotes?.cachedAt,
  });
  const statsQuery = useQuery({
    queryKey: ["fund-stats"],
    queryFn: () => fetchFundStats(),
    ...liveQueryOptions,
  });
  const riskQuery = useQuery({
    queryKey: ["risk-metrics"],
    queryFn: () => fetchRisk(),
    ...liveQueryOptions,
  });
  const etfQuery = useQuery({
    queryKey: ["etf-sector-weights"],
    queryFn: () => fetchEtfWeights(),
    ...liveQueryOptions,
  });

  const quoteData = quotesQuery.data;
  const risk = riskQuery.data ?? null;
  const etfWeights = etfQuery.data ?? null;
  const cashHoldings = statsQuery.data?.cash_holdings ?? baseSummary.cashHoldings;

  const book = useMemo(
    () =>
      buildPortfolio(baseHoldings, quoteData?.quotes ?? {}, cashHoldings, baseSummary.weightedBeta),
    [quoteData, cashHoldings],
  );
  const sectorBreakdown = useMemo(
    () => sectorPercentBreakdown(book.holdings, etfWeights?.weights),
    [book.holdings, etfWeights],
  );
  const movers = useMemo(() => topMovers(book.holdings), [book.holdings]);

  const now = useNow();
  // The quote cache records its own session date; until it has (or while a
  // pre-upgrade cache is being replaced) the risk job's date is the same close.
  const quotesSession = quoteData?.sessionDate ?? risk?.asOf ?? null;
  const status: LiveStatus = {
    quotes: freshnessOf(quotesSession, now),
    priceSource: quoteData?.source ?? null,
    risk: freshnessOf(risk?.asOf ?? null, now),
    weights: freshnessOf(etfWeights?.asOf ?? null, now),
    checkedAt: Math.max(
      quotesQuery.dataUpdatedAt,
      statsQuery.dataUpdatedAt,
      riskQuery.dataUpdatedAt,
      etfQuery.dataUpdatedAt,
    ),
    isFetching:
      quotesQuery.isFetching ||
      statsQuery.isFetching ||
      riskQuery.isFetching ||
      etfQuery.isFetching,
    error: quotesQuery.error,
    refetchAll: () =>
      Promise.all([
        quotesQuery.refetch(),
        statsQuery.refetch(),
        riskQuery.refetch(),
        etfQuery.refetch(),
      ]),
  };

  return {
    holdings: book.holdings,
    summary: book.summary,
    sectorBreakdown,
    movers,
    risk,
    etfWeights,
    quoteData,
    status,
  };
}

export type LiveStatus = {
  quotes: Freshness;
  /** Who supplied the prices on the page, for attribution. */
  priceSource: QuoteSource | null;
  risk: Freshness;
  weights: Freshness;
  /** Epoch ms of the most recent successful fetch of any input. */
  checkedAt: number;
  isFetching: boolean;
  error: Error | null;
  refetchAll: () => Promise<unknown>;
};
