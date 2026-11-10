import { createFileRoute, Link } from "@tanstack/react-router";
import { socialMeta, canonical, OG_ABOUT } from "@/lib/seo";
import { articleLd, breadcrumbTrailLd, faqLd, type Faq } from "@/lib/content-ld";
import { contentRoute } from "@/lib/content-routes";
import { IPS, PLACEMENT_FIRMS, PROCESS } from "@/data/fund-facts";
import {
  ContentBody,
  ContentHero,
  FaqSection,
  NextSteps,
  PROSE_LINK,
  ProseSection,
} from "@/components/ContentPage";

const ROUTE = contentRoute("/student-managed-investment-funds");

// Each answer restates a fact already published on /about, /apply, /sectors or
// /learn, or states what a student managed investment fund is in general terms.
// None introduces a number or a claim about another school.
const FAQ: Faq[] = [
  {
    q: "What is a student managed investment fund?",
    a: "A portfolio of real money in which students do the research and make the investment decisions, under a written investment policy and with faculty advisors overseeing the work. The purpose is education: students learn what it is to be responsible for an investment by being responsible for one.",
  },
  {
    q: "Is the Purdue Student Managed Investment Fund real money?",
    a: "Yes. SMIF manages real capital on behalf of Purdue University rather than a simulated portfolio. Every position is researched, debated, and voted on before it is entered, and the complete holdings list is published on the Holdings page.",
  },
  {
    q: "How does a student managed investment fund decide what to buy?",
    a: "At Purdue SMIF, analysts screen their sector for mispricing or structural change, build and stress-test a financial model, defend the thesis live before the full investment committee, and then the members vote. Nothing enters the portfolio without a written thesis, a valuation, and a majority vote.",
  },
  {
    q: "Do I need a finance background to join?",
    a: "No. SMIF trains every analyst from scratch on financial statement analysis, valuation, and pitch construction, and about a third of its analysts come from non-business majors.",
  },
  {
    q: "How is the fund's performance measured?",
    a: "Against the S&P 500 Total Return Index, using the Modified Dietz method, which adjusts for the timing of cash flows. Performance is reported quarterly and published on the Performance page.",
  },
];

export const Route = createFileRoute("/student-managed-investment-funds")({
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
        image: OG_ABOUT,
      }),
    ],
    links: [{ rel: "canonical", href: canonical(ROUTE.path) }],
    scripts: [
      articleLd(ROUTE, OG_ABOUT),
      faqLd(FAQ),
      breadcrumbTrailLd([{ name: ROUTE.name, path: ROUTE.path }]),
    ],
  }),
});

function Page() {
  return (
    <>
      <ContentHero
        h1="Student managed investment funds: what they are and how they work"
        lead="A student managed investment fund puts real money in the hands of students. Here is how these funds are built, what to compare when choosing one, and how the Purdue Student Managed Investment Fund runs."
        crumbs={[{ name: ROUTE.name }]}
      />
      <ContentBody updated={ROUTE.lastmod}>
        <ProseSection id="what-is" title="What is a student managed investment fund?">
          <p>
            A student managed investment fund is a portfolio of real money in which students, not
            professional managers, do the research and make the investment decisions. Faculty
            advisors oversee the work, and a written policy sets what the fund may own. The point is
            education: the only way to learn what it is to be responsible for an investment is to be
            responsible for one.
          </p>
          <p>
            The label covers a range. Some funds are run as courses, some as student organizations,
            and some as both. They differ in how much money they manage, which assets they are
            allowed to hold, who funds them, and how much of the decision-making is the students'
            own. Two features separate a genuine student managed investment fund from a simulated
            stock game: the money is real, and the students' decisions actually move it, with the
            results on the record.
          </p>
          <p>
            That second feature is what changes behavior. When a position can lose real money, an
            analyst reads the filings more carefully, tests the assumptions harder, and expects the
            committee to push back. Students who join one are not practicing for the job of
            investing. They are doing a version of it.
          </p>
        </ProseSection>

        <ProseSection
          id="structure"
          title="How student managed investment funds are usually structured"
        >
          <p>
            Funds that take the work seriously tend to share the same few parts, because those parts
            are what make a group of students behave like an investment team.
          </p>
          <ul className="list-disc space-y-3 pl-5 marker:text-gold-deep">
            <li>
              <strong className="text-ink">Sector teams.</strong> The investable universe is divided
              so that each analyst becomes expert in a slice of the market rather than skimming all
              of it.
            </li>
            <li>
              <strong className="text-ink">A pitch and a committee.</strong> An analyst builds a
              thesis and defends it in front of the rest of the fund. The defense is the point:
              ideas that cannot survive questions should not become positions.
            </li>
            <li>
              <strong className="text-ink">An investment policy statement.</strong> A written
              document that sets the objective, the assets the fund may hold, how much of any one
              name or sector is allowed, and how risk is monitored.
            </li>
            <li>
              <strong className="text-ink">A path upward.</strong> Analysts become senior analysts,
              then portfolio managers, then part of the executive board, so responsibility grows
              with demonstrated work.
            </li>
            <li>
              <strong className="text-ink">Reporting against a benchmark.</strong> Results are
              measured against an index and reported on a schedule, so the fund can be held to a
              standard rather than described only in anecdotes.
            </li>
            <li>
              <strong className="text-ink">Faculty oversight.</strong> Advisors review the book and
              the process. They are there to keep the exercise honest, not to make the decisions.
            </li>
          </ul>
        </ProseSection>

        <ProseSection id="smif" title="How the Purdue Student Managed Investment Fund works">
          <p>
            The Purdue Student Managed Investment Fund (SMIF) was founded in 1995 at Purdue
            University's Daniels School of Business. It is a registered student organization, listed
            in{" "}
            <a
              href="https://boilerlink.purdue.edu/organization/smif"
              target="_blank"
              rel="noopener noreferrer"
              className={PROSE_LINK}
            >
              BoilerLink
            </a>
            , Purdue's official student organization directory. The fund manages real capital on
            behalf of the university, and it holds primarily U.S.-listed equities and fixed income.
          </p>
          <h3 className="pt-2 text-xl text-ink">Teams</h3>
          <p>
            Eight equity sector teams cover the investable universe from the bottom up. A Fixed
            Income &amp; Macro group frames the rate and credit backdrop, and Portfolio + Risk
            Management oversees allocation, trading, and performance. Each team is led by a student
            portfolio manager. The{" "}
            <Link to="/sectors" className={PROSE_LINK}>
              sector teams page
            </Link>{" "}
            shows what each team owns today.
          </p>
          <h3 className="pt-2 text-xl text-ink">How a position is decided</h3>
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
            For students weighing the stock pitch itself, see{" "}
            <Link to="/stock-pitches" className={PROSE_LINK}>
              how SMIF stock pitches work
            </Link>
            .
          </p>
          <h3 className="pt-2 text-xl text-ink">The rules the fund works under</h3>
          <p>Every position is governed by a written investment policy statement. In brief:</p>
          <dl className="space-y-3">
            {IPS.map((rule) => (
              <div key={rule.t}>
                <dt className="inline font-bold text-ink">{rule.t}. </dt>
                <dd className="inline">{rule.d}</dd>
              </div>
            ))}
          </dl>
          <h3 className="pt-2 text-xl text-ink">Governance and reporting</h3>
          <p>
            An executive board of seven students, elected each spring, runs strategy, research,
            risk, recruiting, education, and operations, inside faculty oversight. Returns are
            benchmarked against the S&amp;P 500 Total Return Index and reported quarterly. Every
            holding is published on the{" "}
            <Link to="/holdings" className={PROSE_LINK}>
              Holdings page
            </Link>
            , and the full record is on the{" "}
            <Link to="/performance" className={PROSE_LINK}>
              Performance page
            </Link>
            . Research written by analysts, including the Macro Brief and stock pitch decks, is
            collected under{" "}
            <Link to="/research" className={PROSE_LINK}>
              Research
            </Link>
            .
          </p>
        </ProseSection>

        <ProseSection id="compare" title="What to compare when choosing a student investment fund">
          <p>
            If you are deciding between student investment organizations, these questions separate
            the ones that run money from the ones that discuss it.
          </p>
          <ol className="list-decimal space-y-3 pl-5 marker:font-bold marker:text-ink">
            <li>Is the money real, or is the portfolio simulated?</li>
            <li>Are the holdings and the results public, or only described?</li>
            <li>Who actually decides what is bought: students, or an adviser?</li>
            <li>Is there a written policy that limits what the fund can do?</li>
            <li>How is performance measured, against what, and how often is it reported?</li>
            <li>What training does a new member get before they are asked to pitch?</li>
          </ol>
          <p>
            SMIF answers each of these in public: the money is real, the holdings and results are
            published, students vote, the policy is written, performance is benchmarked and reported
            quarterly, and new analysts are trained from scratch. If you want to compare SMIF with
            Purdue's other student finance and investment organizations side by side, the guide to{" "}
            <Link to="/finance-clubs-at-purdue" className={PROSE_LINK}>
              finance clubs at Purdue
            </Link>{" "}
            does that.
          </p>
        </ProseSection>

        <ProseSection id="who" title="Who a student managed investment fund suits">
          <p>
            It suits students who want to do the work rather than watch it done: reading filings,
            building models, and defending a view to people who will push back. It does not require
            a finance background. SMIF recruits from engineering, computer science, agriculture,
            science, and the liberal arts as well as business, and about a third of its analysts
            come from non-business majors. Freshmen, sophomores, and juniors are all welcome to
            apply.
          </p>
          <p>
            Plan on about six hours a week: one full fund meeting, one sector team meeting, and
            independent research. Sector leads and portfolio managers invest more. Most analysts are
            also in other clubs, and the schedule is built with that in mind. When you are ready,
            read{" "}
            <Link to="/apply" className={PROSE_LINK}>
              how to join Purdue SMIF
            </Link>{" "}
            and check the{" "}
            <Link to="/recruiting" className={PROSE_LINK}>
              recruiting calendar
            </Link>
            .
          </p>
        </ProseSection>

        <ProseSection id="learn" title="What members learn, and where they go">
          <p>
            Analyst training is a six-module curriculum covering financial statements, valuation,
            competitive analysis, pitch construction, portfolio and risk, and macro and fixed
            income. The material is free to read on the{" "}
            <Link to="/learn" className={PROSE_LINK}>
              Learn page
            </Link>
            , along with a{" "}
            <Link to="/learn/glossary" className={PROSE_LINK}>
              glossary of investing terms
            </Link>
            .
          </p>
          <p>Members go on to work at firms including {PLACEMENT_FIRMS.join(", ")}.</p>
        </ProseSection>

        <FaqSection faq={FAQ} />

        <NextSteps>
          <li>
            <Link to="/about" className={PROSE_LINK}>
              About Purdue SMIF
            </Link>
            : history, governance, and the investment policy in full.
          </li>
          <li>
            <Link to="/holdings" className={PROSE_LINK}>
              Current holdings
            </Link>
            : what the fund owns today.
          </li>
          <li>
            <Link to="/finance-clubs-at-purdue" className={PROSE_LINK}>
              Compare finance clubs at Purdue
            </Link>
            .
          </li>
          <li>
            <Link to="/apply" className={PROSE_LINK}>
              How to join Purdue SMIF
            </Link>
            .
          </li>
        </NextSteps>
      </ContentBody>
    </>
  );
}
