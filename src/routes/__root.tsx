import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter, HeadContent, Scripts } from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import smifLogo from "@/assets/smif-logo-mark.png";

function NotFoundComponent() {
  return (<div className="flex min-h-dvh items-center justify-center bg-ink px-4"><div className="max-w-md text-center text-background"><span className="mx-auto mb-8 grid h-16 w-16 place-items-center bg-background p-2"><img src={smifLogo} alt="Purdue SMIF" className="h-full w-full object-contain" /></span><div className="font-display text-[8rem] font-bold text-gold/20 leading-none select-none">404</div><h1 className="font-display text-3xl font-bold text-background mt-4">Page not found</h1><p className="mt-3 text-sm text-background/65">The page you're looking for doesn't exist or has been moved.</p><div className="mt-8"><Link to="/" className="inline-flex items-center justify-center bg-gold px-6 py-3 text-sm font-semibold text-ink hover:bg-gold-mid transition-colors duration-200">Go home</Link></div></div></div>);
}


function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (<div className="flex min-h-dvh items-center justify-center bg-ink px-4"><div className="max-w-md text-center text-background"><span className="rule-gold block mb-5 mx-auto" /><h1 className="font-display text-2xl font-bold text-background">This page didn't load</h1><p className="mt-3 text-sm text-background/65">Something went wrong on our end. Try refreshing or head back home.</p><div className="mt-8 flex flex-wrap justify-center gap-3"><button onClick={() => { router.invalidate(); reset(); }} className="inline-flex items-center justify-center bg-gold px-6 py-3 text-sm font-semibold text-ink hover:bg-gold-mid transition-colors duration-200">Try again</button><a href="/" className="inline-flex items-center justify-center border border-background/25 px-6 py-3 text-sm font-semibold text-background hover:border-gold hover:text-gold transition-colors duration-200">Go home</a></div></div></div>);
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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=IBM+Plex+Sans:wght@400;500&family=IBM+Plex+Mono:wght@400&display=swap" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://purduesmif.org/#organization",
              name: "Purdue Student Managed Investment Fund",
              alternateName: "Purdue SMIF",
              url: "https://purduesmif.org",
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
              "@id": "https://purduesmif.org/#website",
              url: "https://purduesmif.org",
              name: "Purdue SMIF",
              publisher: { "@id": "https://purduesmif.org/#organization" },
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
