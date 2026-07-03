import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink, BookOpen, Users, TrendingUp } from "lucide-react";
import { socialMeta, canonical, OG_APPLY } from "@/lib/seo";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

import { applyUrl } from "@/lib/apply-url";

const APPLICATION_URL = applyUrl("apply-page-primary");

export const Route = createFileRoute("/apply")({
  component: Apply,
  head: () => ({
    meta: [
      { title: "Apply | Purdue SMIF" },
      { name: "description", content: "Apply to join the Purdue Student Managed Investment Fund: application portal, what we look for, timeline, and FAQ." },
      ...socialMeta({
        title: "Apply to Join Purdue SMIF",
        description: "Application portal, what we look for, timeline, and FAQ for joining the Purdue Student Managed Investment Fund.",
        url: canonical("/apply"),
        image: OG_APPLY,
      }),
    ],
    links: [{ rel: "canonical", href: canonical("/apply") }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
});

const LOOKING_FOR = [
  {
    Icon: BookOpen,
    title: "Intellectual curiosity",
    body: "We want students who read 10-Ks for fun and can defend a thesis under pressure. Major doesn't matter: engineering, finance, ag econ, CS, liberal arts.",
  },
  {
    Icon: Users,
    title: "Collaborative rigor",
    body: "Pitches are defended live before the committee. The best analysts come prepared, listen well, and update their views when the evidence demands it.",
  },
  {
    Icon: TrendingUp,
    title: "Long-term commitment",
    body: "We invest in analysts who plan to stick around. Promotion paths to sector lead, portfolio manager, and co-president are real.",
  },
];

const TIMELINE = [
  { n: "01", title: "Submit application", body: "Qualtrics form, ~10 minutes." },
  { n: "02", title: "Coffee chat", body: "Informal conversation with current members." },
  { n: "03", title: "Technical interview", body: "Markets question, behavioral, fit." },
  { n: "04", title: "Decision", body: "Offers extended within two weeks of interview close." },
];

const FAQ = [
  {
    q: "Do I need finance experience to apply?",
    a: "No. We train every analyst from scratch on financial statement analysis, valuation, and pitch construction. About a third of our analysts come from non-business majors.",
  },
  {
    q: "What's the time commitment?",
    a: "Plan on ~6 hours per week: one full fund meeting, one sector team meeting, plus independent research. Sector leads and PMs invest more.",
  },
  {
    q: "Is SMIF only for finance majors?",
    a: "No. We actively recruit from engineering, CS, agriculture, science, and liberal arts. Diversity of thought makes the portfolio better.",
  },
  {
    q: "How competitive is the application?",
    a: "We typically receive 100-150 applications per recruiting cycle and accept 15-25 analysts. Pre-recruiting events matter; attendance signals fit.",
  },
  {
    q: "Can freshmen apply?",
    a: "Yes. Freshmen, sophomores, and juniors are all welcome. Seniors should reach out directly if interested.",
  },
  {
    q: "What happens after I'm accepted?",
    a: "Analyst onboarding includes a one-week bootcamp on accounting, valuation, and the pitch template. You're paired with a senior mentor and join a sector team in week two.",
  },
];

function Apply() {
  return (
    <>
      {/* Hero */}
      <section className="bg-ink text-background">
        <div className="container-prose py-28 max-w-3xl">
          <Reveal>
            <span className="rule-gold mb-6" />
            <h1
              className="font-display text-5xl font-bold md:text-6xl"
              style={{ lineHeight: "1.02" }}
            >
              We can't wait<br />to meet you.
            </h1>
            <p className="mt-6 text-lg text-on-dark-secondary">
              Applications are open. Submit through the official portal, then explore what we look for, how the process works, and answers to the questions we hear most often.
            </p>
          </Reveal>
        </div>
      </section>

      {/* What we look for */}
      <section className="bg-background border-t border-border py-28">
        <div className="container-prose">
          <Reveal className="max-w-2xl mb-14">
            <span className="rule-gold mb-5 block" />
            <span className="text-xs font-semibold uppercase tracking-[0.32em] text-gold-deep block mb-4">
              What we look for
            </span>
            <h2 className="font-display font-bold text-ink" style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>
              The bar is high.<br />The path is open.
            </h2>
          </Reveal>
          <RevealGroup className="grid md:grid-cols-3 border-t border-border" stagger={0.1}>
            {LOOKING_FOR.map(({ Icon, title, body }) => (
              <RevealItem
                key={title}
                className="border-b md:border-b-0 md:border-r border-border last:border-r-0 p-8 lg:p-10"
              >
                <Icon className="h-6 w-6 text-gold-deep mb-6" />
                <h3 className="font-display text-2xl font-semibold text-ink mb-3">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{body}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-secondary/40 border-t border-border py-28">
        <div className="container-prose">
          <Reveal className="max-w-2xl mb-14">
            <h2 className="font-display font-bold text-ink" style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>
              Four steps,<br />about three weeks.
            </h2>
          </Reveal>
          <RevealGroup className="grid md:grid-cols-4 gap-px bg-border border border-border" stagger={0.08}>
            {TIMELINE.map((step) => (
              <RevealItem key={step.n} className="bg-background p-8 lg:p-10">
                <div className="font-mono text-xs uppercase tracking-[0.22em] text-gold-deep mb-4">
                  Step {step.n}
                </div>
                <h3 className="font-display text-xl font-semibold text-ink mb-3">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.body}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-background border-t border-border py-28">
        <div className="container-prose max-w-3xl">
          <Reveal className="mb-12">
            <span className="rule-gold mb-5 block" />
            <h2 className="font-display font-bold text-ink" style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>
              Questions, answered.
            </h2>
          </Reveal>
          <Reveal>
            <Accordion type="single" collapsible className="border-t border-border">
              {FAQ.map((item, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="border-border">
                  <AccordionTrigger className="font-display text-lg font-semibold text-ink py-5 hover:no-underline">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed text-base">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-ink text-background py-32">
        <Reveal className="container-prose max-w-3xl text-center">
          <span className="rule-gold block mb-6 mx-auto" />
          <h2 className="font-display font-bold text-background" style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)" }}>
            Ready when you are.
          </h2>
          <p className="mt-6 text-on-dark-secondary max-w-xl mx-auto">
            Submit the official application, or head to recruiting for the full event calendar and interview prep guide.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={APPLICATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 bg-gold px-9 py-4 text-sm font-semibold text-ink hover:bg-gold-mid transition-colors duration-200"
            >
              Open Application Portal
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">(opens application form in new tab)</span>
            </a>
            <Link
              to="/recruiting"
              className="inline-flex items-center justify-center gap-2 border border-background/30 px-9 py-4 text-sm font-semibold text-background hover:border-gold hover:text-gold transition-colors duration-200"
            >
              Recruiting calendar & prep guide
            </Link>
          </div>
        </Reveal>
      </section>

      {/* Quiet footer line */}
      <section className="bg-ink border-t border-white/10">
        <div className="container-prose py-8 text-center">
          <p className="text-sm text-on-dark-muted">
            Questions? Email{" "}
            <a
              href="mailto:smif26@purdue.edu"
              className="text-gold underline underline-offset-4 hover:text-gold-mid"
            >
              smif26@purdue.edu
            </a>
            .
          </p>
        </div>
      </section>
    </>
  );
}
