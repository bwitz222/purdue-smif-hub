/**
 * Shared interview-prep card used on /recruiting (and historically /apply).
 * Extracted so both surfaces stay visually identical without duplicate JSX.
 */
export function PrepCard({
  title,
  items,
  background = "background",
}: {
  title: string;
  items: string[];
  /** Surface this card sits on; controls its own bg so contrast stays right. */
  background?: "background" | "card";
}) {
  const bg = background === "card" ? "bg-card" : "bg-background";
  return (
    <div className={`border border-border ${bg} p-6 transition hover:border-gold/40`}>
      <h3 className="font-display text-lg font-bold">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-gold-deep" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
