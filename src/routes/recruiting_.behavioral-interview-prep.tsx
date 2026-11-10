import { createFileRoute, Link } from "@tanstack/react-router";
import { socialMeta, canonical, OG_RECRUITING } from "@/lib/seo";
import { articleLd, breadcrumbTrailLd } from "@/lib/content-ld";
import { contentRoute } from "@/lib/content-routes";
import { BEHAVIORAL_CARDS } from "@/data/prep-guide";
import { PrepGuide } from "@/components/PrepGuide";
import { PROSE_LINK } from "@/components/ContentPage";

const ROUTE = contentRoute("/recruiting/behavioral-interview-prep");

// The trailing underscore on the file name keeps this route out of /recruiting's
// layout: it is its own page at /recruiting/behavioral-interview-prep.
export const Route = createFileRoute("/recruiting_/behavioral-interview-prep")({
  component: Page,
  head: () => ({
    meta: [
      { title: ROUTE.title },
      { name: "description", content: ROUTE.description },
      ...socialMeta({
        title: ROUTE.title,
        description: ROUTE.description,
        url: canonical(ROUTE.path),
        type: "article",
        image: OG_RECRUITING,
      }),
    ],
    links: [{ rel: "canonical", href: canonical(ROUTE.path) }],
    scripts: [
      articleLd(ROUTE, OG_RECRUITING),
      breadcrumbTrailLd([
        { name: "Recruiting", path: "/recruiting" },
        { name: ROUTE.name, path: ROUTE.path },
      ]),
    ],
  }),
});

function Page() {
  return (
    <PrepGuide
      route={ROUTE}
      h1="Behavioral interview prep for Purdue SMIF"
      lead="We want to understand who you are, why you're interested in markets, and how you work with others. Be specific, be honest, and have stories ready."
      cardsTitle="What to prepare for the behavioral interview"
      intro={
        <p>
          Be ready to explain why you want to join, and to back it with real experiences. Use the
          four areas below to prepare. Before you walk in, read about{" "}
          <Link to="/about" className={PROSE_LINK}>
            how the fund is run
          </Link>{" "}
          and look at the{" "}
          <Link to="/holdings" className={PROSE_LINK}>
            current holdings
          </Link>
          , so your questions reflect the work.
        </p>
      }
      cards={BEHAVIORAL_CARDS}
      links={
        <>
          <li>
            <Link to="/recruiting/technical-interview-prep" className={PROSE_LINK}>
              Technical interview prep
            </Link>
            : fundamentals, valuation, and market awareness.
          </li>
          <li>
            <Link to="/sectors" className={PROSE_LINK}>
              Sector teams
            </Link>
            : see who covers which part of the market and what each team owns.
          </li>
          <li>
            <Link to="/finance-clubs-at-purdue" className={PROSE_LINK}>
              Finance clubs at Purdue
            </Link>
            : how SMIF compares if you are deciding where to apply.
          </li>
        </>
      }
    />
  );
}
