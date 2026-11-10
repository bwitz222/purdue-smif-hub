import { createFileRoute, Link } from "@tanstack/react-router";
import { socialMeta, canonical, OG_LEARN } from "@/lib/seo";
import { articleLd, breadcrumbTrailLd } from "@/lib/content-ld";
import { contentRoute } from "@/lib/content-routes";
import { GLOSSARY, termSlug } from "@/data/glossary";
import {
  ContentBody,
  ContentHero,
  NextSteps,
  PROSE_LINK,
  ProseSection,
} from "@/components/ContentPage";

const ROUTE = contentRoute("/learn/glossary");

// The trailing underscore on the file name keeps this route out of /learn's
// layout: it is its own page at /learn/glossary.
export const Route = createFileRoute("/learn_/glossary")({
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
        image: OG_LEARN,
      }),
    ],
    links: [{ rel: "canonical", href: canonical(ROUTE.path) }],
    scripts: [
      articleLd(ROUTE, OG_LEARN),
      // The most quotable thing on the site: each term with a one-sentence
      // definition. DefinedTermSet lets an answer engine lift one definition and
      // attribute it. Generated from GLOSSARY so the markup cannot drift from the
      // copy. Moved here from /learn, which now links to this page.
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "DefinedTermSet",
          "@id": `${canonical(ROUTE.path)}#glossary`,
          name: "Purdue SMIF Investing Glossary",
          description:
            "Plain-English definitions of the valuation and portfolio terms Purdue SMIF analysts train on.",
          url: canonical(ROUTE.path),
          publisher: { "@id": "https://www.purduesmif.org/#organization" },
          hasDefinedTerm: GLOSSARY.map(({ term, def }) => ({
            "@type": "DefinedTerm",
            "@id": `${canonical(ROUTE.path)}#${termSlug(term)}`,
            name: term,
            description: def,
            url: `${canonical(ROUTE.path)}#${termSlug(term)}`,
            inDefinedTermSet: `${canonical(ROUTE.path)}#glossary`,
          })),
        }),
      },
      breadcrumbTrailLd([
        { name: "Learn", path: "/learn" },
        { name: ROUTE.name, path: ROUTE.path },
      ]),
    ],
  }),
});

function Page() {
  return (
    <>
      <ContentHero
        h1="Investing glossary: plain-English definitions"
        lead="The valuation and portfolio terms Purdue SMIF analysts train on, each defined in a sentence."
        crumbs={[{ name: "Learn", to: "/learn" }, { name: ROUTE.name }]}
      />
      <ContentBody updated={ROUTE.lastmod}>
        <ProseSection id="terms" title={`${GLOSSARY.length} key terms`}>
          <p>
            These are the terms behind the{" "}
            <Link to="/learn" className={PROSE_LINK}>
              analyst training curriculum
            </Link>{" "}
            and the models in the stock pitches SMIF analysts defend. Each definition is
            deliberately short; the Learn page links to the reading list and worked examples that go
            deeper.
          </p>
          <div className="divide-y divide-border border-y border-border">
            {GLOSSARY.map((g) => (
              <div key={g.term} className="py-5">
                <h3 id={termSlug(g.term)} className="section-anchor text-xl text-ink">
                  {g.term}
                </h3>
                <p className="mt-2">{g.def}</p>
              </div>
            ))}
          </div>
        </ProseSection>

        <NextSteps>
          <li>
            <Link to="/learn" className={PROSE_LINK}>
              Learn
            </Link>
            : the analyst curriculum, reading list, and worked models.
          </li>
          <li>
            <Link to="/stock-pitches" className={PROSE_LINK}>
              How SMIF stock pitches work
            </Link>
            : where these terms are used.
          </li>
          <li>
            <Link to="/recruiting/technical-interview-prep" className={PROSE_LINK}>
              Technical interview prep
            </Link>
            : which fundamentals to know before you interview.
          </li>
        </NextSteps>
      </ContentBody>
    </>
  );
}
