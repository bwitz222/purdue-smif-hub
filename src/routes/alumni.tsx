import { createFileRoute, redirect } from "@tanstack/react-router";

// /alumni existed on the pre-redesign site and may still be indexed or
// bookmarked. The alumni content now lives under the team page, so redirect
// at route-load time the same way /publications -> /research does.
export const Route = createFileRoute("/alumni")({
  beforeLoad: () => {
    throw redirect({ to: "/team", replace: true });
  },
  component: () => null,
});
