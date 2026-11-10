"""Generate the responsive variants of the home-page hero images.

Run from the repo root:  python3 scripts/make-hero-images.py

The sources in src/assets are kept as the largest size. The skyline sits under an
85% Black overlay, so it can be encoded at low quality without any visible change;
the team photo is the page's real subject and keeps higher quality.
"""
from pathlib import Path
from PIL import Image

ASSETS = Path("src/assets")

JOBS = [
    # (source, output suffix width, webp quality)
    ("nyc-skyline.webp", 640, 50),
    ("nyc-skyline.webp", 1024, 50),
    ("team-photo.webp", 480, 72),
    ("team-photo.webp", 800, 72),
]

for name, width, quality in JOBS:
    src = Image.open(ASSETS / name)
    ratio = width / src.width
    out = src.resize((width, round(src.height * ratio)), Image.LANCZOS)
    stem = name.rsplit(".", 1)[0]
    dest = ASSETS / f"{stem}-{width}.webp"
    out.save(dest, "WEBP", quality=quality, method=6)
    print(f"{dest}  {out.size[0]}x{out.size[1]}  {dest.stat().st_size // 1024} KB")
