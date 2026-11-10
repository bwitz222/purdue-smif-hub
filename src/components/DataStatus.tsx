import { RefreshCw } from "lucide-react";
import { asOfText, type Freshness } from "@/lib/market-calendar";
import type { LiveStatus } from "@/lib/use-live-book";

function levelText(f: Freshness): string {
  switch (f.level) {
    case "current":
      return "Current";
    case "latest":
      return f.behind === 1
        ? "Latest release, 1 session behind"
        : `Latest release, ${f.behind} sessions behind`;
    case "stale":
      return `${f.behind} sessions behind`;
    default:
      return "";
  }
}

function Row({ label, f, note }: { label: string; f: Freshness; note?: React.ReactNode }) {
  return (
    <div className="border-t border-ink pt-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-display text-lg text-ink">{asOfText(f)}</dd>
      <dd
        className={`text-xs ${f.level === "stale" ? "font-bold text-ink" : "text-muted-foreground"}`}
      >
        {levelText(f)}
      </dd>
      {note && <dd className="text-xs text-muted-foreground">{note}</dd>}
    </div>
  );
}

/**
 * Which close each part of the page is showing, and when the page last checked
 * for something newer. Every figure on /holdings comes from the same snapshot,
 * so the dates here are the dates of everything below.
 */
export function DataStatus({ status }: { status: LiveStatus }) {
  const checked = status.checkedAt
    ? new Date(status.checkedAt).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "short",
      })
    : null;
  const stale = [status.quotes, status.risk, status.weights].some((f) => f.level === "stale");
  return (
    <section aria-labelledby="data-status-h" className="mt-8 max-w-4xl">
      <h2 id="data-status-h" className="sr-only">
        Data freshness
      </h2>
      <dl className="grid grid-cols-2 gap-x-8 gap-y-5 md:grid-cols-4">
        <Row
          label="Prices and day change"
          f={status.quotes}
          note={
            status.priceSource === "zacks" ? (
              <>
                Source:{" "}
                <a
                  href="https://www.zacks.com/?utm_source=smif_site"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline font-bold text-gold-deep"
                >
                  Zacks Investment Research
                </a>
              </>
            ) : status.priceSource === "polygon" ? (
              "Source: Polygon.io"
            ) : undefined
          }
        />
        <Row label="Risk metrics" f={status.risk} />
        <Row label="Sector weights (SPY)" f={status.weights} />
        <div className="border-t border-ink pt-3">
          <dt className="text-xs text-muted-foreground">Last checked</dt>
          <dd className="mt-1 font-display text-lg text-ink" aria-live="polite">
            {status.isFetching ? "Checking…" : (checked ?? "n/a")}
          </dd>
          <dd>
            <button
              type="button"
              onClick={() => void status.refetchAll()}
              disabled={status.isFetching}
              className="press inline-flex min-h-6 items-center gap-1.5 text-xs font-bold text-gold-deep underline underline-offset-4 disabled:opacity-60 cursor-pointer"
            >
              <RefreshCw
                className={`h-3 w-3 ${status.isFetching ? "animate-spin" : ""}`}
                aria-hidden="true"
              />
              Check for new data
            </button>
          </dd>
        </div>
      </dl>
      <p className="mt-4 max-w-2xl text-xs leading-relaxed">
        Prices are end-of-day closes. A close reaches this page once the data provider releases it,
        so the newest date available can trail the market by a session or two. The page checks for
        new data every 5 minutes and whenever you return to this tab; the day-change figures,
        movers, sector allocation, and risk metrics below all come from the same snapshot.
      </p>
      {stale && (
        <p role="status" className="mt-3 border-l-4 border-gold pl-3 text-sm text-ink">
          Some data is three or more sessions behind. The nightly update may have failed; figures
          below show the last close that was recorded.
        </p>
      )}
    </section>
  );
}
