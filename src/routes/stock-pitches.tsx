import { createFileRoute, Link } from "@tanstack/react-router";
import { socialMeta, canonical, OG_RESEARCH } from "@/lib/seo";
import { articleLd, breadcrumbTrailLd, faqLd, type Faq } from "@/lib/content-ld";
import { contentRoute } from "@/lib/content-routes";
import { PROCESS } from "@/data/fund-facts";
import {
  ContentBody,
  ContentHero,
  FaqSection,
  NextSteps,
  PROSE_LINK,
  ProseSection,
} from "@/components/ContentPage";

const ROUTE = contentRoute("/stock-pitches");

// Facts here come from the About process, the Apply FAQ, the Learn curriculum and
// example thesis, the Research series description, and the recruiting prep guide.
// The site does not describe a public stock pitch competition, so this page does
// not either; [confirm with the fund whether any Purdue-wide pitch event should be
// linked from here].
const FAQ: Faq[] = [
  {
    q: "What is a stock pitch at Purdue SMIF?",
    a: "A stock pitch is an analyst's case for owning, or not owning, a company: the thesis, the catalysts, the valuation, and the risks. Analysts defend it live before the full investment committee, and the members vote on it.",
  },
  {
    q: "Does Purdue SMIF run a stock pitch competition?",
    a: "This site does not list a public stock pitch competition. The pitch described here is the one SMIF analysts give to their own fund as part of the research process.",
  },
  {
    q: "What happens to a pitch that is accepted?",
    a: "Accepted ideas enter the real portfolio and are then reviewed quarterly against their original thesis.",
  },
  {
    q: "What happens to a pitch that is rejected?",
    a: "Rejected ideas come with feedback that sharpens the next pitch.",
  },
  {
    q: "Do I need to prepare a stock pitch to apply?",
    a: "The technical interview covers markets and fundamentals, and the recruiting prep guide suggests preparing one long idea: a thesis, two or three catalysts, a valuation, and the key risks. You do not need to have pitched before. SMIF trains every analyst on the pitch template during onboarding.",
  },
];

export const Route = createFileRoute("/stock-pitches")({
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
        image: OG_RESEARCH,
      }),
    ],
    links: [{ rel: "canonical", href: canonical(ROUTE.path) }],
    scripts: [
      articleLd(ROUTE, OG_RESEARCH),
      faqLd(FAQ),
      breadcrumbTrailLd([{ name: ROUTE.name, path: ROUTE.path }]),
    ],
  }),
});

function Page() {
  return (
    <>
      <ContentHero
        h1="How Purdue SMIF stock pitches work"
        lead="Every position in the Purdue Student Managed Investment Fund starts as a stock pitch: a thesis, a valuation, and a defense in front of the full fund."
        crumbs={[{ name: ROUTE.name }]}
      />
      <ContentBody updated={ROUTE.lastmod}>
        <ProseSection id="what" title="What a stock pitch is">
          <p>
            A stock pitch is an analyst's case for owning a company. At Purdue SMIF it is built from
            a thesis, variant perception, risks, and catalysts, assembled into the SMIF pitch format
            that analysts learn during onboarding. It is not an exercise: the pitch is defended live
            before the full investment committee, pushback is expected, and the members vote.
            Accepted ideas enter the real portfolio.
          </p>
          <p>
            If you searched for a stock pitch competition: this page describes the pitch SMIF
            analysts give to their own fund. This site does not list a public pitch competition.
          </p>
        </ProseSection>

        <ProseSection id="process" title="From idea to position">
          <ol className="space-y-3">
            {PROCESS.map((step, i) => (
              <li key={step.t} className="flex gap-3">
                <span className="font-bold text-ink">{i + 1}.</span>
                <span>
                  <strong className="text-ink">{step.t}.</strong> {step.d}
                </span>
              </li>
            ))}
          </ol>
          <p>
            Nothing enters the portfolio without a written thesis, a valuation, and a majority vote
            of the investment committee. The{" "}
            <Link to="/about" hash="process" className={PROSE_LINK}>
              process section of the About page
            </Link>{" "}
            shows the same four steps in the context of the investment policy statement.
          </p>
        </ProseSection>

        <ProseSection id="structure" title="What goes in a pitch">
          <p>
            The pitch format SMIF teaches is the same one the recruiting prep guide asks applicants
            to practice. A strong pitch states:
          </p>
          <ul className="list-disc space-y-3 pl-5 marker:text-gold-deep">
            <li>
              <strong className="text-ink">The thesis.</strong> Why the stock is mispriced or why
              the business is changing in a way the market has not priced.
            </li>
            <li>
              <strong className="text-ink">Catalysts.</strong> The specific events expected to close
              the gap between price and value. The prep guide suggests two or three.
            </li>
            <li>
              <strong className="text-ink">Valuation.</strong> What the business is worth and how
              you got there, using the discounted cash flow and comparable-company methods analysts
              are trained on.
            </li>
            <li>
              <strong className="text-ink">Risks.</strong> What would make the thesis wrong, stated
              plainly.
            </li>
          </ul>
          <p>
            For definitions of the terms above, including catalyst, intrinsic value, and margin of
            safety, see the{" "}
            <Link to="/learn/glossary" className={PROSE_LINK}>
              investing glossary
            </Link>
            .
          </p>
        </ProseSection>

        <ProseSection id="examples" title="Where to see examples">
          <p>
            The{" "}
            <Link to="/learn" hash="models" className={PROSE_LINK}>
              Learn page
            </Link>{" "}
            offers a one-page investment thesis on Amazon (AMZN) in the format SMIF pitches in fund
            meetings, with the discounted cash flow model and the comparable company analysis behind
            it, all free to download. Stock pitch decks written by the sector teams publish in the
            Pitch Decks series on the{" "}
            <Link to="/research" search={{ series: "pitch" }} className={PROSE_LINK}>
              research page
            </Link>{" "}
            after each research cycle. To see which pitches became positions, the{" "}
            <Link to="/holdings" className={PROSE_LINK}>
              Holdings page
            </Link>{" "}
            lists everything the fund owns, and each team's holdings are on the{" "}
            <Link to="/sectors" className={PROSE_LINK}>
              sector teams page
            </Link>
            .
          </p>
        </ProseSection>

        <ProseSection id="join" title="Learning to pitch">
          <p>
            Analyst onboarding includes a one-week bootcamp on accounting, valuation, and the pitch
            template, and each new analyst is paired with a senior mentor and joins a sector team.
            The technical interview round does not require a polished pitch, but preparing one long
            idea is the best way to show how you think. The guides below cover the round in detail.
          </p>
        </ProseSection>

        <FaqSection faq={FAQ} />

        <NextSteps>
          <li>
            <Link to="/recruiting/technical-interview-prep" className={PROSE_LINK}>
              Technical interview prep
            </Link>
            : accounting, valuation, market awareness, and the stock pitch.
          </li>
          <li>
            <Link to="/recruiting/behavioral-interview-prep" className={PROSE_LINK}>
              Behavioral interview prep
            </Link>
            .
          </li>
          <li>
            <Link to="/apply" className={PROSE_LINK}>
              How to join Purdue SMIF
            </Link>
            .
          </li>
          <li>
            <Link to="/student-managed-investment-funds" className={PROSE_LINK}>
              How student managed investment funds work
            </Link>
            .
          </li>
        </NextSteps>
      </ContentBody>
    </>
  );
}
