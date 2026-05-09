import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, ArrowRight } from "lucide-react";

const APPLICATION_URL = "https://purdue.ca1.qualtrics.com/jfe/form/SV_1G5FfwJUc1cGJ2m";

export const Route = createFileRoute("/apply")({
  component: Apply,
  head: () => ({
    meta: [
      { title: "Apply — Purdue SMIF" },
      { name: "description", content: "Application timeline, recruiting events, and how to join the Purdue Student Managed Investment Fund." },
      { property: "og:title", content: "Apply — Purdue SMIF" },
      { property: "og:description", content: "Application timeline, recruiting events, and how to join the Purdue Student Managed Investment Fund." },
    ],
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
      </section>
    </>
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
