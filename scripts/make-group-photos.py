"""Build the responsive webp variants for the /team group photos.

Usage (from the repo root):
    python3 scripts/make-group-photos.py <dir-with-jpgs>

Each input file must already be named for the group it shows, e.g. board.jpg,
energy-real-estate.jpg. Valid names: board, fixed-income-macro, portfolio-risk-management,
or the sector slug (lowercase, non-alphanumerics to "-": information-technology,
consumer-discretionary, financials, consumer-staples, industrials,
healthcare-utilities, communications, energy-real-estate).

Writes src/assets/groups/<name>-800.webp and <name>-1600.webp. /team picks up
whatever exists there via import.meta.glob, so no code change is needed to add a photo.
"""
import sys
from pathlib import Path
from PIL import Image, ImageOps

OUT = Path("src/assets/groups")
WIDTHS = (800, 1600)
QUALITY = 74

OUT.mkdir(parents=True, exist_ok=True)
for src in sorted(Path(sys.argv[1]).glob("*.jp*g")):
    im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    for w in WIDTHS:
        out = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS) if im.width > w else im
        dest = OUT / f"{src.stem}-{w}.webp"
        out.save(dest, "WEBP", quality=QUALITY, method=6)
        print(f"{dest}  {out.width}x{out.height}  {dest.stat().st_size // 1024} KB")
