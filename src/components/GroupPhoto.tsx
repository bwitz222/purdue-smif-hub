// Group photos for the /team page. Files live in src/assets/groups as
// <slug>-800.webp and <slug>-1600.webp (see scripts/make-group-photos.py).
// Whatever exists is picked up here, so adding a photo needs no code change,
// and a group without one simply renders nothing.
const urls = import.meta.glob("@/assets/groups/*.webp", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const bySlug = new Map<string, { w800?: string; w1600?: string }>();
for (const [path, url] of Object.entries(urls)) {
  const m = path.match(/\/([a-z0-9-]+)-(800|1600)\.webp$/);
  if (!m) continue;
  const entry = bySlug.get(m[1]) ?? {};
  entry[m[2] === "800" ? "w800" : "w1600"] = url;
  bySlug.set(m[1], entry);
}

export function GroupPhoto({
  slug,
  alt,
  className = "",
}: {
  slug: string;
  alt: string;
  className?: string;
}) {
  const p = bySlug.get(slug);
  const src = p?.w800 ?? p?.w1600;
  if (!src) return null;
  return (
    <figure className={className}>
      <img
        src={src}
        srcSet={p?.w800 && p?.w1600 ? `${p.w800} 800w, ${p.w1600} 1600w` : undefined}
        sizes="(min-width: 1152px) 1088px, calc(100vw - 2rem)"
        alt={alt}
        width={1600}
        height={1066}
        loading="lazy"
        decoding="async"
        className="aspect-[3/2] w-full rounded-sm object-cover shadow-sm"
      />
    </figure>
  );
}
