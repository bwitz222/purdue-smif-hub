import { createFileRoute, Link } from "@tanstack/react-router";
import { socialMeta, canonical, OG_RECRUITING } from "@/lib/seo";
import { articleLd, breadcrumbTrailLd } from "@/lib/content-ld";
import { contentRoute } from "@/lib/content-routes";
import { TECHNICAL_CARDS } from "@/data/prep-guide";
import { PrepGuide } from "@/components/PrepGuide";
import { PROSE_LINK } from "@/components/ContentPage";

const ROUTE = contentRoute("/recruiting/technical-interview-prep");

// The trailing underscore on the file name keeps this route out of /recruiting's
// layout: it is its own page at /recruiting/technical-interview-prep, not a child
// rendered inside the calendar page.
export const Route = createFileRoute("/recruiting_/technical-interview-prep")({
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
      h1="Technical interview prep for Purdue SMIF"
      lead="You don't need to be an investment banking analyst already. We test fundamentals, market awareness, and your ability to defend an investment thesis."
      cardsTitle="What to prepare for the technical interview"
      intro={
        <p>
          The technical interview is the third step of the application, after the application form
          and a coffee chat with current members. It covers a markets question, your fundamentals,
          and fit. Use the four areas below to walk in prepared, and read the{" "}
          <Link to="/learn/glossary" className={PROSE_LINK}>
            investing glossary
          </Link>{" "}
          for any term you want to firm up.
        </p>
      }
      cards={TECHNICAL_CARDS}
      links={
        <>
          <li>
            <Link to="/stock-pitches" className={PROSE_LINK}>
              How SMIF stock pitches work
            </Link>
            : the format behind the stock pitch card above.
          </li>
          <li>
            <Link to="/learn" className={PROSE_LINK}>
              Learn
            </Link>
            : the reading list and worked valuation models.
          </li>
          <li>
            <Link to="/recruiting/behavioral-interview-prep" className={PROSE_LINK}>
              Behavioral interview prep
            </Link>
            : the other half of the process.
          </li>
        </>
      }
    />
  );
}
