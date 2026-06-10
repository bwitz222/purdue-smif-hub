// Central source of the Qualtrics apply URL. Every CTA must append UTM
// parameters via applyUrl(placement) so the team can attribute signups
// by placement in Qualtrics' source data.

export const APPLY_BASE_URL =
  "https://purdue.ca1.qualtrics.com/jfe/form/SV_1G5FfwJUc1cGJ2m";

export type ApplyPlacement =
  | "header-apply"
  | "mobile-menu"
  | "home-hero"
  | "home-cta"
  | "about-cta"
  | "recruiting-hero"
  | "apply-page-primary";

export function applyUrl(placement: ApplyPlacement): string {
  const params = new URLSearchParams({
    utm_source: "smif-site",
    utm_medium: "cta",
    utm_campaign: "apply",
    utm_content: placement,
  });
  return `${APPLY_BASE_URL}?${params.toString()}`;
}
