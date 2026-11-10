// Structured data for an event must describe something that is actually
// scheduled. Google treats a placeholder ("TBD") start time or venue as invalid
// and can drop the markup for the whole page, so an event is emitted only once its
// time and its location are both confirmed. Unconfirmed items stay in the visible
// calendar, where "TBD" is honest and useful to a student.
//
// Another track may add an equivalent `isEmittableEvent` to src/lib/seo.ts; if so,
// the two should be unified onto that one.

const PLACEHOLDER = /\b(TBD|TBA|to be (determined|announced))\b/i;

export function isConfirmedEvent(event: { time: string; location: string }): boolean {
  const time = event.time.trim();
  const location = event.location.trim();
  if (!time || !location) return false;
  return !PLACEHOLDER.test(time) && !PLACEHOLDER.test(location);
}
