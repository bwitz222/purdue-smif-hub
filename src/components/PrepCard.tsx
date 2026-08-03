/**
 * Shared interview-prep card used on /recruiting (and historically /apply).
 * Extracted so both surfaces stay visually identical without duplicate JSX.
 */
export function PrepCard({
  title,
  items,
  background = "background",
  headingLevel = "h3",
}: {
  title: string;
  items: string[];
  /** Surface this card sits on; controls its own bg so contrast stays right. */
  background?: "background" | "card";
  /**
   * Heading tag for the card title. Callers pick the level that keeps the
   * document outline sequential — /recruiting nests these under an h3, so it
   * passes "h4".
   */
  headingLevel?: "h3" | "h4";
}) {
  const bg = background === "card" ? "bg-card" : "bg-background";
  const Heading = headingLevel;
  return (
    <div className={`group h-full border border-border ${bg} p-6 hover-lift-sm hover:border-gold/50`}>
      <Heading className="font-display text-lg font-bold">{title}</Heading>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-gold-deep transition-transform duration-200 group-hover:scale-150 motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
