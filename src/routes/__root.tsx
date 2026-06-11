import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter, useLocation, HeadContent, Scripts } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import appCss from "../styles.css?url";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Toaster } from "@/components/ui/sonner";
import smifLogo from "@/assets/smif-logo-mark.png";

function NotFoundComponent() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-ink px-4 py-16">
      <div className="max-w-md text-center text-background">
        <span className="mx-auto mb-8 grid h-16 w-16 place-items-center bg-background p-2">
          <img src={smifLogo} alt="Purdue SMIF" width={64} height={64} decoding="async" className="h-full w-full object-contain" />
        </span>
        <div className="font-display text-[8rem] font-bold text-gold/20 leading-none select-none">404</div>
        <h1 className="font-display text-3xl font-bold text-background mt-4">Page not found</h1>
        <p className="mt-3 text-sm text-on-dark-secondary">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8">
          <Link to="/" className="inline-flex items-center justify-center bg-gold px-6 py-3 text-sm font-semibold text-ink hover:bg-gold-mid transition-colors duration-200">
            Go home
          </Link>
        </div>
        <div className="mt-10 border-t border-white/10 pt-6">
          <div className="text-xs font-mono uppercase tracking-[0.22em] text-on-dark-dim mb-3">
            Or visit
          </div>
          <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm">
            <li><Link to="/about" className="text-on-dark-secondary hover:text-gold">About</Link></li>
            <li><Link to="/team" className="text-on-dark-secondary hover:text-gold">Team</Link></li>
            <li><Link to="/holdings" className="text-on-dark-secondary hover:text-gold">Holdings</Link></li>
            <li><Link to="/recruiting" className="text-on-dark-secondary hover:text-gold">Recruiting</Link></li>
          </ul>
        </div>
      </div>
    </div>
  );
}


function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (<div className="flex min-h-dvh items-center justify-center bg-ink px-4"><div className="max-w-md text-center text-background"><span className="rule-gold block mb-5 mx-auto" /><h1 className="font-display text-2xl font-bold text-background">This page didn't load</h1><p className="mt-3 text-sm text-on-dark-secondary">Something went wrong on our end. Try refreshing or head back home.</p><div className="mt-8 flex flex-wrap justify-center gap-3"><button onClick={() => { router.invalidate(); reset(); }} className="inline-flex items-center justify-center bg-gold px-6 py-3 text-sm font-semibold text-ink hover:bg-gold-mid transition-colors duration-200">Try again</button><a href="/" className="inline-flex items-center justify-center border border-background/25 px-6 py-3 text-sm font-semibold text-background hover:border-gold hover:text-gold transition-colors duration-200">Go home</a></div></div></div>);
}


export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Purdue Student Managed Investment Fund" },
      { name: "description", content: "Purdue SMIF — the Purdue Student Managed Investment Fund. Purdue's premier investment club and finance club at the Mitch Daniels School of Business, managing real university capital since 2009." },
      { name: "keywords", content: "Purdue SMIF, Purdue Student Managed Investment Fund, Purdue Investment Fund, Purdue Investment Club, Purdue Finance Club, Purdue investing club, Purdue finance organization, Daniels School of Business, student investment fund" },
      { name: "author", content: "Purdue SMIF" },
      { name: "theme-color", content: "#0E0E0E" },
      { property: "og:site_name", content: "Purdue SMIF" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "en_US" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@PurdueSMIF" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "dns-prefetch", href: "https://gnmwcihxtytlaesuvuqg.supabase.co" },
      // Body font — must render fast
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500&display=swap" },
      // Display + mono — decorative, can wait for the real face
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=IBM+Plex+Mono:wght@400&display=optional" },
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
              alternateName: [
                "Purdue SMIF",
                "Purdue Investment Fund",
                "Purdue Investment Club",
                "Purdue Finance Club",
              ],
              url: "https://purduesmif.org",
              email: "smif26@purdue.edu",
              foundingDate: "2009",
              slogan: "Real capital. Real research. Real outcomes.",
              description: "Purdue's premier student investment club and finance club — a student-run investment fund at the Mitch Daniels School of Business, Purdue University, managing real capital across global markets since 2009.",
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
              sameAs: [
                "https://www.linkedin.com/company/purdue-smif/",
                "https://www.instagram.com/smif_purdue/",
                "https://purduesmif.substack.com/",
              ],
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

/** Short crossfade between routes — keeps transitions feeling deliberate, not jumpy. */
function RouteTransition({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const location = useLocation();
  if (reduce) return <>{children}</>;
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:bg-gold focus:text-ink focus:px-4 focus:py-2 focus:text-sm focus:font-semibold"
      >
        Skip to main content
      </a>
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main id="main-content" className="flex-1">
          <RouteTransition>
            <Outlet />
          </RouteTransition>
        </main>
        {/* Footer spacing lives on the layout, not on SiteFooter — keeps short pages
            from carrying an enormous gap when they don't need one. */}
        <div className="mt-24">
          <SiteFooter />
        </div>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}
