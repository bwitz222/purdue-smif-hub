import { createFileRoute, redirect } from "@tanstack/react-router";

// /publications is the legacy URL. The canonical route is /research.
// Redirect at route-load time so deep links and inbound search results
// transparently land on the new page.
export const Route = createFileRoute("/publications")({
  beforeLoad: () => {
    // 301 so search engines transfer the old URL's equity and drop it
    // from the index (the default 307 is treated as temporary).
    throw redirect({ to: "/research", replace: true, statusCode: 301 });
  },
  component: () => null,
});
