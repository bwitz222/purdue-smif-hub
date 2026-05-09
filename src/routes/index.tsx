import { createFileRoute, Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero-campus.jpg";
import tradingImg from "@/assets/nyc-skyline.jpg";
import { ArrowRight, TrendingUp, Users, Award, BarChart3 } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Purdue SMIF — Student Managed Investment Fund" },
      { name: "description", content: "Founded to develop the next generation of investors. The Purdue Student Managed Investment Fund manages real capital across global markets." },
    ],
  }),
});

function Index() {
  return (
    <>
      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <img
          src={heroImg}
          alt="Purdue University campus"
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="relative container-prose flex min-h-[88vh] flex-col justify-center py-24 text-background">
          <div className="max-w-3xl">
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.3em] text-gold">
              Daniels School of Business · Est. 2009
            </span>
            <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] md:text-7xl">
              Purdue Student Managed <span className="text-gold">Investment Fund</span>
            </h1>
            <p className="mt-8 max-w-2xl text-lg text-background/80 md:text-xl">
              A premier student-run investment fund managing real capital, delivering rigorous research, and developing the next generation of investment professionals.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/about"
                className="group inline-flex items-center gap-2 bg-gold px-7 py-3.5 text-sm font-semibold text-ink transition hover:bg-gold/90"
              >
                Our Story <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
              <Link
                to="/team"
                className="inline-flex items-center gap-2 border border-background/30 px-7 py-3.5 text-sm font-semibold text-background backdrop-blur-sm transition hover:bg-background/10"
              >
                Meet the Team
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-border bg-secondary/40">
        <div className="container-prose grid grid-cols-2 gap-8 py-16 md:grid-cols-4">
          {[
            { v: "$600K", l: "Assets Under Management" },
            { v: "50+", l: "Active Members" },
            { v: "20+", l: "Years of Performance" },
            { v: "10", l: "Coverage Teams" },
          ].map((s) => (
            <div key={s.l} className="text-center md:text-left">
              <div className="font-display text-4xl font-bold text-ink md:text-5xl">{s.v}</div>
              <div className="mt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* MISSION */}
      <section className="container-prose py-28">
        <div className="grid gap-16 md:grid-cols-2 md:items-center">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-deep">Our Mission</span>
            <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">
              Real capital. Real research. Real outcomes.
            </h2>
            <p className="mt-6 text-lg text-muted-foreground">
              SMIF gives Purdue students the rare opportunity to manage actual investment capital under faculty mentorship. Our analysts apply institutional-grade frameworks to fundamental equity research, building skills that translate directly to careers in asset management, investment banking, and equity research.
            </p>
            <Link to="/about" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-foreground border-b-2 border-gold pb-1 hover:text-gold-deep">
              Learn more about our process <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="relative">
            <img
              src={tradingImg}
              alt="New York City skyline"
              loading="lazy"
              width={1600}
              height={1216}
              className="aspect-[4/3] w-full object-cover shadow-elegant"
            />
            <div className="absolute -bottom-6 -left-6 hidden bg-gold p-6 shadow-gold md:block">
              <div className="font-display text-3xl font-bold text-ink">20Y+</div>
              <div className="text-xs uppercase tracking-wider text-ink/70">Track record</div>
            </div>
          </div>
        </div>
      </section>

      {/* PILLARS */}
      <section className="bg-ink text-background py-28">
        <div className="container-prose">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">What We Do</span>
            <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">Three pillars of the fund</h2>
          </div>
          <div className="mt-16 grid gap-px bg-background/10 md:grid-cols-3">
            {[
              { Icon: BarChart3, t: "Investment Research", d: "Bottom-up fundamental analysis across our equity sector teams. Pitches defended before the full investment committee." },
              { Icon: Users, t: "Mentorship & Recruiting", d: "Direct access to alumni at top investment banks, hedge funds, and asset managers — and the prep to land those seats." },
              { Icon: Award, t: "Real Portfolio", d: "Students vote on every position. Performance is benchmarked against the S&P 500 and reported quarterly." },
            ].map(({ Icon, t, d }) => (
              <div key={t} className="bg-ink p-10">
                <Icon className="h-8 w-8 text-gold" />
                <h3 className="mt-6 font-display text-xl font-bold">{t}</h3>
                <p className="mt-3 text-sm text-background/70 leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-prose py-28 text-center">
        <TrendingUp className="mx-auto h-10 w-10 text-gold-deep" />
        <h2 className="mt-6 font-display text-4xl font-bold md:text-5xl">Ready to invest in your future?</h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
          Applications open each fall and spring semester. We're looking for curious, rigorous students from every college at Purdue.
        </p>
        <a
          href="https://purdue.ca1.qualtrics.com/jfe/form/SV_1G5FfwJUc1cGJ2m"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-10 inline-flex items-center gap-2 bg-ink px-8 py-4 text-sm font-semibold text-background transition hover:bg-ink/90"
        >
          Apply to Join <ArrowRight className="h-4 w-4" />
        </a>
      </section>
    </>
  );
}
