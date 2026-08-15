/**
 * Scroll to an in-page section AND move keyboard focus there.
 *
 * The second half is the part that matters and the part the site was missing.
 * Every existing jump — the /team scope chips, the /recruiting "Jump to Prep
 * Guide" link — moved the viewport and left focus where it was, which serves a
 * mouse user and strands a keyboard user: the page visibly moves, their next
 * Tab continues from the control they just left, and a screen reader announces
 * nothing about where they landed.
 *
 * Browsers only reliably focus a fragment target when that target is focusable,
 * and section elements are not. Setting tabindex="-1" makes the element
 * programmatically focusable without adding it to the tab order, which is the
 * standard fix. It is left in place afterwards rather than cleaned up on blur:
 * it has no effect on sequential navigation, and removing it would break a
 * second jump to the same section.
 */

type JumpOptions = {
  /** From framer-motion's useReducedMotion(). Honors prefers-reduced-motion. */
  reduce?: boolean | null;
  /** Keep the URL fragment in sync so the position stays shareable. */
  updateHash?: boolean;
};

export function jumpToSection(
  id: string,
  { reduce = false, updateHash = true }: JumpOptions = {},
): boolean {
  if (typeof document === "undefined") return false;
  const el = document.getElementById(id);
  // Return false rather than throwing so callers can fall back to native
  // anchor behavior when a target is conditionally rendered — /team filters
  // its sections out of the DOM, so this genuinely happens.
  if (!el) return false;

  if (updateHash) {
    // replaceState, not pushState: a jump within a page shouldn't consume a
    // back-button step, but the hash should still be copyable from the URL bar.
    window.history.replaceState(null, "", `#${id}`);
  }

  el.setAttribute("tabindex", "-1");
  // preventScroll so focus() doesn't perform its own instant jump and fight
  // the smooth scroll below.
  el.focus({ preventScroll: true });
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  return true;
}
