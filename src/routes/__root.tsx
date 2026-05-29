import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter, HeadContent, Scripts } from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

function NotFoundComponent() {
  return (<div className="flex min-h-screen items-center justify-center bg-ink px-4"><div className="max-w-md text-center text-background"><div className="font-display text-[8rem] font-bold text-gold/20 leading-none select-none">404</div><h1 className="font-display text-3xl font-bold text-background mt-4">Page not found</h1><p className="mt-3 text-sm text-background/50">The page you're looking for doesn't exist or has been moved.</p><div className="mt-8"><Link to="/" className="inline-flex items-center justify-center bg-gold px-6 py-3 text-sm font-semibold text-ink hover:bg-gold-mid transition-colors duration-200">Go home</Link></div></div></div>);
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (<div className="flex min-h-screen items-center justify-center bg-background px-4"><div className="max-w-md text-center"><span className="rule-gold block mb-5 mx-auto" /><h1 className="font-display text-2xl font-bold text-ink">This page didn't load</h1><p className="mt-3 text-sm text-muted-foreground">Something went wrong on our end. Try refreshing or head back home.</p><div className="mt-8 flex flex-wrap justify-center gap-3"><button onClick={() => { router.invalidate(); reset(); }} className="inline-flex items-center justify-center bg-ink px-6 py-3 text-sm font-semibold text-background hover:bg-ink/85 transition-colors duration-200">Try again</button><a href="/" className="inline-flex items-center justify-center border border-border px-6 py-3 text-sm font-semibold text-ink hover:bg-secondary transition-colors duration-200">Go home</a></div></div></div>);
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Purdue Student Managed Investment Fund" },
      { name: "description", content: "The Purdue Student Managed Investment Fund — The premier student-run investment fund at the Mitch Daniels School of Business." },
      { name: "author", content: "Purdue SMIF" },
      { property: "og:site_name", content: "Purdue SMIF" },
      { property: "og:title", content: "Purdue Student Managed Investment Fund" },
      { property: "og:description", content: "The Purdue Student Managed Investment Fund — The premier student-run investment fund at the Mitch Daniels School of Business." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Purdue Student Managed Investment Fund" },
      { name: "twitter:description", content: "The Purdue Student Managed Investment Fund — The premier student-run investment fund at the Mitch Daniels School of Business." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/29fe27b3-0701-4701-928e-4cd1494b7707/id-preview-7d8438b1--c32c9d57-3981-4aeb-add5-520f722116c3.lovable.app-1780025500813.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/29fe27b3-0701-4701-928e-4cd1494b7707/id-preview-7d8438b1--c32c9d57-3981-4aeb-add5-520f722116c3.lovable.app-1780025500813.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://purduesmif.lovable.app/#organization",
              name: "Purdue Student Managed Investment Fund",
              alternateName: "Purdue SMIF",
              url: "https://purduesmif.lovable.app",
              email: "smif26@purdue.edu",
              parentOrganization: {
                "@type": "CollegeOrUniversity",
                name: "Daniels School of Business, Purdue University",
              },
              address: {
                "@type": "PostalAddress",
                streetAddress: "403 Mitch Daniels Blvd",
                addressLocality: "West Lafayette",
                addressRegion: "IN",
                postalCode: "47907",
                addressCountry: "US",
              },
              sameAs: ["https://www.linkedin.com/company/purdue-smif/"],
            },
            {
              "@type": "WebSite",
              "@id": "https://purduesmif.lovable.app/#website",
              url: "https://purduesmif.lovable.app",
              name: "Purdue SMIF",
              publisher: { "@id": "https://purduesmif.lovable.app/#organization" },
            },
          ],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><head><HeadContent /></head><body>{children}<Scripts /></body></html>);
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (<QueryClientProvider client={queryClient}><div className="flex min-h-screen flex-col"><SiteHeader /><main className="flex-1"><Outlet /></main><SiteFooter /></div></QueryClientProvider>);
}
