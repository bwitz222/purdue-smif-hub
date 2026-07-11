// Site-wide SEO constants and helpers for TanStack Start head() blocks.
// Keep canonical/og:url builders here so leaf routes never hardcode the host.

export const SITE_URL = "https://www.purduesmif.org";
export const OG_IMAGE = `${SITE_URL}/og-share.jpg`;
export const OG_HOLDINGS = `${SITE_URL}/og-holdings.jpg`;
export const OG_TEAM = `${SITE_URL}/og-team.jpg`;
export const OG_ABOUT = `${SITE_URL}/og-about.jpg`;
export const OG_RECRUITING = `${SITE_URL}/og-recruiting.jpg`;
export const OG_PERFORMANCE = `${SITE_URL}/og-performance.jpg`;
export const OG_RESEARCH = `${SITE_URL}/og-research.jpg`;
export const OG_LEARN = `${SITE_URL}/og-learn.jpg`;
export const OG_SECTORS = `${SITE_URL}/og-sectors.jpg`;
export const OG_APPLY = `${SITE_URL}/og-apply.jpg`;
export const OG_CONTACT = `${SITE_URL}/og-contact.jpg`;
export const OG_IMAGE_WIDTH = "1216";
export const OG_IMAGE_HEIGHT = "640";
export const OG_IMAGE_ALT = "Purdue SMIF | Student Managed Investment Fund";

export const canonical = (path: string) => `${SITE_URL}${path}`;

/**
 * Build a complete social-card meta block for a leaf route.
 * Always emits Open Graph + Twitter title/description/image so previews
 * are correct on every platform regardless of which tags they prefer.
 */
export function socialMeta({
  title,
  description,
  url,
  type = "website",
  image = OG_IMAGE,
}: {
  title: string;
  description: string;
  url: string;
  type?: "website" | "article" | "profile";
  image?: string;
}) {
  return [
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:type", content: type },
    { property: "og:image", content: image },
    { property: "og:image:width", content: OG_IMAGE_WIDTH },
    { property: "og:image:height", content: OG_IMAGE_HEIGHT },
    { property: "og:image:alt", content: OG_IMAGE_ALT },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
    { name: "twitter:image:alt", content: OG_IMAGE_ALT },
  ];
}
