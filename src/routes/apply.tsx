import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

const DEADLINE = new Date("2026-09-04T23:59:00-04:00").getTime();

function useCountdown() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  if (now === null) return null;
  const diff = Math.max(0, DEADLINE - now);
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);
  return { days, hours, minutes, seconds, expired: diff === 0 };
}

function CountdownUnit({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="flex flex-col items-center border border-gold/30 bg-ink/40 px-4 py-3 min-w-[72px]">
      <span className="font-display text-3xl font-bold text-gold tabular-nums md:text-4xl">{value}</span>
      <span className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-background/60">{label}</span>
    </div>
  );
}

function Countdown() {
  const c = useCountdown();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    <div className="mt-10 border border-gold/30 bg-ink p-6 text-background md:p-8">
      <div className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">
        {c?.expired ? "Applications Closed" : "Deadline Countdown"}
      </div>
      <div className="mt-1 text-sm text-background/60">September 4th, 2026 · 11:59pm EST</div>
      <div className="mt-5 flex flex-wrap gap-3">
        <CountdownUnit value={c ? c.days : "—"} label="Days" />
        <CountdownUnit value={c ? pad(c.hours) : "—"} label="Hours" />
        <CountdownUnit value={c ? pad(c.minutes) : "—"} label="Minutes" />
        <CountdownUnit value={c ? pad(c.seconds) : "—"} label="Seconds" />
      </div>
    </div>
  );
}

const APPLICATION_URL = "https://purdue.ca1.qualtrics.com/jfe/form/SV_1G5FfwJUc1cGJ2m";

export const Route = createFileRoute("/apply")({
  component: Apply,
  head: () => ({
    meta: [
      { title: "Apply — Purdue SMIF" },
      { name: "description", content: "Application timeline, recruiting events, and how to join the Purdue Student Managed Investment Fund." },
      { property: "og:title", content: "Apply to Join Purdue SMIF" },
      { property: "og:description", content: "Deadline, recruiting events, and the application process for joining the Purdue Student Managed Investment Fund." },
      { property: "og:url", content: "https://purduesmif.org/apply" },
    ],
    links: [{ rel: "canonical", href: "https://purduesmif.org/apply" }],
  }),
});

function Apply() {
  return (
    <>
      <section className="border-b border-border bg-ink text-background">
        <div className="container-prose py-24">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">Apply</span>
          <h1 className="mt-4 font-display text-5xl font-bold md:text-6xl max-w-3xl">
            We can't wait to meet you.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-background/70">
            Please find our application timeline and recruiting events below.
          </p>
        </div>
      </section>

      {/* Status banner */}
      <section className="container-prose py-16">
        <div className="flex flex-wrap items-center justify-between gap-4 border border-gold/40 bg-gold/10 p-6">
          <div className="flex items-start gap-4">
            <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-gold-deep mt-0.5" />
            <div>
              <div className="font-display text-xl font-bold">Our application is open!</div>
              <div className="mt-1 text-muted-foreground">Deadline: 9/4/26</div>
            </div>
          </div>
          <a
            href={APPLICATION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-ink px-6 py-3 text-sm font-semibold text-background transition hover:bg-ink/90"
          >
            Apply Now <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <Countdown />

        <div className="mt-10 border-t border-border pt-10 text-muted-foreground max-w-3xl">
          We want to get to know you and give you the opportunity to get to know us.
          To that end, we offer numerous events and event types throughout the recruiting process.
        </div>

        {/* Email lists */}
        <div className="mt-12">
          <h2 className="font-display text-2xl font-bold">Email Lists</h2>
          <p className="mt-3 text-muted-foreground">
            Subscribe to our general interest mailing list by emailing{" "}
            <a href="mailto:smif26@purdue.edu" className="text-gold-deep underline underline-offset-4 hover:text-gold">
              smif26@purdue.edu
            </a>
            .
          </p>
        </div>

        {/* Timeline */}
        <div className="mt-12">
          <h2 className="font-display text-2xl font-bold">Recruiting Timeline</h2>
          <ul className="mt-4 space-y-2 text-muted-foreground">
            <li>
              <span className="font-semibold text-foreground">Application Opened:</span> May 20th at 5:00pm EST
            </li>
            <li>
              <span className="font-semibold text-foreground">Application Closes:</span> September 4th, 2026 at 11:59pm EST
            </li>
          </ul>
        </div>

        {/* Events */}
        <div className="mt-12">
          <h2 className="font-display text-2xl font-bold">Upcoming Events</h2>
          <div className="mt-6 space-y-8">
            <Event
              title="SMIF Coffee Chats"
              datetime="January 14th – 16th"
              description="Coffee chats with current SMIF members and leadership."
              signup="Coffee Chat sign-ups open closer to the date."
            />
            <Event
              title="SMIF Information Session"
              datetime="Monday, January 12th, 8:00 pm – 9:00 pm, Location TBD"
              description="Brief presentation on the organization, followed by a panel of current SMIF members and open Q&A. Attendees are strongly encouraged to arrive on time."
              signup="No need to sign up."
            />
            <Event
              title="Women's Panel"
              datetime="Thursday, January 15th, 7:00 pm – 8:00 pm, MSB 150"
              description="Female members within SMIF will be sharing personal experiences of their time. The panel will be followed by an opportunity for attendees to get to know and chat with current SMIF members."
              signup="No need to sign up."
            />
            <Event
              title="Diversity Panel"
              datetime="Sunday, January 18th, 12:00 pm – 1:00 pm, MSB 150"
              description="Members within SMIF will be sharing personal experiences of their time in SMIF. The panel will be followed by an opportunity for attendees to get to know and chat with current SMIF members."
              signup="No need to sign up."
            />
          </div>
        </div>

        {/* Interview Prep */}
        <div className="mt-16 border-t border-border pt-12">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-deep">For Applicants</span>
          <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">Interview Prep & Helpful Tips</h2>
          <p className="mt-3 max-w-3xl text-muted-foreground">
            New to investing or to SMIF? Don't worry — we recruit for curiosity and work ethic first. Use the resources below to walk into your interview prepared and confident.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <PrepCard
              title="Know SMIF"
              items={[
                "Understand our mission: a student-managed equity fund within the Daniels School of Business.",
                "Be familiar with our sector coverage and recent publications on the site.",
                "Have a thoughtful answer for: 'Why SMIF?' and 'Why this sector?'",
              ]}
            />
            <PrepCard
              title="Know the Markets"
              items={[
                "Be able to discuss a recent market headline and its implications.",
                "Know where major indices (S&P 500, Nasdaq, 10Y Treasury) are trading directionally.",
                "Daily reads: WSJ, Bloomberg, FT, or Axios Markets.",
              ]}
            />
            <PrepCard
              title="Pitch a Stock"
              items={[
                "Prepare one long idea: thesis, catalysts, valuation, and key risks in 2–3 minutes.",
                "Pick a name you genuinely understand — not the most complex one you can find.",
                "Be ready for pushback. We want to see how you think, not that you're 'right.'",
              ]}
            />
            <PrepCard
              title="Technical Foundations"
              items={[
                "Review the three financial statements and how they link together.",
                "Understand basic valuation: DCF intuition, P/E, EV/EBITDA — when each is useful.",
                "No finance background? Lean into your analytical strengths and willingness to learn.",
              ]}
            />
            <PrepCard
              title="Behavioral Prep"
              items={[
                "Prepare 2–3 stories using the STAR framework (leadership, teamwork, failure).",
                "Tie your 'why finance' and 'why investing' to specific experiences, not buzzwords.",
                "Have thoughtful questions ready for your interviewers.",
              ]}
            />
            <PrepCard
              title="Day-Of Tips"
              items={[
                "Business professional dress. Arrive 10 minutes early.",
                "Bring a printed resume and a notepad.",
                "Be yourself — we evaluate fit as much as skill.",
              ]}
            />
          </div>

          <div className="mt-10 border border-gold/30 bg-gold/5 p-6">
            <h3 className="font-display text-lg font-bold">Recommended Reading</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>• <span className="font-medium text-foreground">The Intelligent Investor</span> — Benjamin Graham (foundational value investing)</li>
              <li>• <span className="font-medium text-foreground">One Up On Wall Street</span> — Peter Lynch (intuitive intro to stock picking)</li>
              <li>• <span className="font-medium text-foreground">Investment Banking</span> — Rosenbaum & Pearl (valuation reference)</li>
              <li>• <span className="font-medium text-foreground">Damodaran Online</span> — free valuation resources from NYU Stern</li>
              <li>• <span className="font-medium text-foreground">Matt Levine's Money Stuff</span> — daily Bloomberg newsletter, sharp and accessible</li>
            </ul>
          </div>

          <p className="mt-8 text-sm text-muted-foreground">
            Have questions? Reach out at{" "}
            <a href="mailto:smif26@purdue.edu" className="text-gold-deep underline underline-offset-4 hover:text-gold">
              smif26@purdue.edu
            </a>
            .
          </p>
        </div>
      </section>
    </>
  );
}

function PrepCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="border border-border bg-card p-6 transition hover:border-gold/40">
      <h3 className="font-display text-lg font-bold">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-gold-deep" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Event({ title, datetime, description, signup }: { title: string; datetime: string; description: string; signup: string }) {
  return (
    <div className="border-l-2 border-gold pl-5">
      <h3 className="font-display text-lg font-bold">{title}</h3>
      <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
        <li><span className="italic">Date &amp; Time:</span> {datetime}</li>
        <li><span className="italic">Description:</span> {description}</li>
        <li><span className="italic">Sign-up:</span> {signup}</li>
      </ul>
    </div>
  );
}
