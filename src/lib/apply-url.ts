// Central source of the Qualtrics apply URL. Every CTA must append UTM
// parameters via applyUrl(placement) so the team can attribute signups
// by placement in Qualtrics' source data.

const APPLY_BASE_URL = "https://purdue.ca1.qualtrics.com/jfe/form/SV_1G5FfwJUc1cGJ2m";

/**
 * Whether the Qualtrics application form is accepting responses.
 *
 * FLIP THIS BY HAND when a recruiting window opens or closes (and update
 * APPLY_BASE_URL if the new cycle gets a new survey). Qualtrics serves an
 * expired survey with HTTP 200, so the site cannot detect it. While this is
 * false, every Apply button links to /apply, which explains the windows,
 * instead of sending an applicant to a "survey expired" page: in November 2026
 * the header button on every page was doing exactly that.
 */
export const APPLICATIONS_OPEN = false;

/** The cycle the form above belongs to, for the closed-state message. */
export const APPLICATION_CYCLE = "Fall 2026";

export type ApplyPlacement =
  | "header-apply"
  | "mobile-menu"
  | "home-hero"
  | "home-cta"
  | "about-cta"
  | "recruiting-hero"
  | "learn-cta"
  | "apply-page-primary"
  | "finance-clubs-guide";

export function applyUrl(placement: ApplyPlacement): string {
  const params = new URLSearchParams({
    utm_source: "smif-site",
    utm_medium: "cta",
    utm_campaign: "apply",
    utm_content: placement,
  });
  return `${APPLY_BASE_URL}?${params.toString()}`;
}
