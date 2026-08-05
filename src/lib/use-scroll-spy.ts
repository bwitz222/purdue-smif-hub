import { useEffect, useState } from "react";

/**
 * Tracks which of a set of element ids is currently the one being read, for
 * marking the active entry in a contents rail.
 *
 * This is a state readout, not motion: it tells you where you are in a long
 * document, which is exactly the kind of relationship the motion system says
 * an effect has to clarify in order to earn its place. There is no animation
 * here at all — the rail just changes which row is emphasised.
 *
 * Uses a single IntersectionObserver with a top-weighted root margin so the
 * "active" module is the one at the top of the viewport rather than whichever
 * happens to be largest.
 *
 * SSR-safe: returns null until it has observed something, so the server and
 * the first client render agree and no entry is pre-emphasised.
 */
export function useScrollSpy(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined" || ids.length === 0) return;

    const seen = new Map<string, boolean>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) seen.set(e.target.id, e.isIntersecting);
        // First id in document order that is currently on screen.
        const current = ids.find((id) => seen.get(id));
        if (current) setActive(current);
      },
      // Bias toward the top of the viewport: a module counts as "current" from
      // the moment it reaches the upper third and stops when it leaves it.
      { rootMargin: "-10% 0px -70% 0px", threshold: 0 },
    );

    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids]);

  return active;
}
