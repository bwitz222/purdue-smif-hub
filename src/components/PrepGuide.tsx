import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { PrepCard } from "@/components/PrepCard";
import {
  ContentBody,
  ContentHero,
  NextSteps,
  PROSE_LINK,
  ProseSection,
} from "@/components/ContentPage";
import { DAY_OF, type PrepCardData } from "@/data/prep-guide";
import type { ContentRoute } from "@/lib/content-routes";

/**
 * One interview-round guide (behavioral or technical). The cards are the guide
 * content moved unchanged from /recruiting; this wraps them with the page chrome,
 * the day-of checklist, and links onward.
 */
export function PrepGuide({
  route,
  h1,
  lead,
  intro,
  cardsTitle,
  cards,
  links,
}: {
  route: ContentRoute;
  h1: string;
  lead: string;
  /** Short paragraph under the cards heading, from the existing recruiting copy. */
  intro: ReactNode;
  cardsTitle: string;
  cards: readonly PrepCardData[];
  /** Round-specific onward links, shown above the shared ones. */
  links: ReactNode;
}) {
  return (
    <>
      <ContentHero
        h1={h1}
        lead={lead}
        crumbs={[{ name: "Recruiting", to: "/recruiting" }, { name: route.name }]}
      />
      <ContentBody updated={route.lastmod}>
        <ProseSection id="round" title={cardsTitle}>
          {intro}
          <div className="grid gap-6 md:grid-cols-2">
            {cards.map((c) => (
              <PrepCard key={c.title} headingLevel="h3" title={c.title} items={c.items} />
            ))}
          </div>
        </ProseSection>

        <ProseSection id="day-of" title="Day-of checklist">
          <ul className="list-disc space-y-2 pl-5 marker:text-gold-deep">
            {DAY_OF.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </ProseSection>

        <p>
          We recruit for curiosity, work ethic, and intellectual honesty, not pedigree. A finance
          background helps, but we've taken students from every major.
        </p>

        <NextSteps>
          {links}
          <li>
            <Link to="/recruiting" className={PROSE_LINK}>
              Recruiting calendar and full prep guide
            </Link>
            : every callout, coffee chat, and interview date this cycle.
          </li>
          <li>
            <Link to="/apply" className={PROSE_LINK}>
              How to join Purdue SMIF
            </Link>
            : the application, what we look for, and the timeline.
          </li>
        </NextSteps>
      </ContentBody>
    </>
  );
}
