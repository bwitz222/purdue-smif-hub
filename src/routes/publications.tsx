import { createFileRoute, redirect } from "@tanstack/react-router";

// /publications is the legacy URL. The canonical route is /research.
// Redirect at route-load time so deep links and inbound search results
// transparently land on the new page.
export const Route = createFileRoute("/publications")({
  beforeLoad: () => {
    throw redirect({ to: "/research", replace: true });
  },
  component: () => null,
});
