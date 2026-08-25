/**
 * Render a date-only ISO string ("2013-10-01") as "Oct 2013".
 *
 * Parsed by splitting the string, deliberately NOT via `new Date(iso)`. A
 * date-only ISO string parses as UTC midnight, and `toLocaleDateString` then
 * renders it in the viewer's local zone — so anywhere west of UTC it lands on
 * the previous day, and for a first-of-month value, the previous *month*. The
 * homepage sparkline did exactly that and captioned the fund's inception
 * "Sep 2013" while /performance, which already split the string, said
 * "Oct 2013". Two pages, one field, different answers.
 */
const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function formatMonth(iso: string): string {
  const [y, m] = iso.split("-");
  return `${MONTH_NAMES[Number(m) - 1]} ${y}`;
}
