// JSON-LD builders for the content pages. Kept out of seo.ts, which another track
// owns. Everything refers to the one Organization entity minted in __root.tsx.
import { SITE_URL, canonical } from "@/lib/seo";
import type { ContentRoute } from "@/lib/content-routes";

const ORG = { "@id": `${SITE_URL}/#organization` };

/** Article for an explanatory page. Dates are real: published and last changed. */
export function articleLd(route: ContentRoute, image: string) {
  return {
    type: "application/ld+json",
    children: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      "@id": `${canonical(route.path)}#article`,
      headline: route.title.replace(/ \| Purdue SMIF$/, ""),
      description: route.description,
      url: canonical(route.path),
      mainEntityOfPage: { "@type": "WebPage", "@id": canonical(route.path) },
      datePublished: route.published,
      dateModified: route.lastmod,
      image: [image],
      author: ORG,
      publisher: ORG,
    }),
  };
}

/** BreadcrumbList for a page of any depth. The last item is the current page. */
export function breadcrumbTrailLd(trail: readonly { name: string; path: string }[]) {
  return {
    type: "application/ld+json",
    children: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [{ name: "Home", path: "/" }, ...trail].map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: item.name,
        item: canonical(item.path),
      })),
    }),
  };
}

export type Faq = { q: string; a: string };

export function faqLd(faq: readonly Faq[]) {
  return {
    type: "application/ld+json",
    children: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    }),
  };
}
