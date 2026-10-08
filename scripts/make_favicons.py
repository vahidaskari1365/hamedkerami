#!/usr/bin/env python3
"""Generate favicon PNG set from the old site's logo."""
from PIL import Image

src = Image.open("/home/z/my-project/public/images/logo.png").convert("RGBA")
# center-crop to square (already square 1024) and round corners not needed — browser masks
sizes = {
    "favicon-32.png": 32,
    "favicon-48.png": 48,
    "apple-touch-icon.png": 180,
    "favicon-192.png": 192,
    "favicon-512.png": 512,
}
for name, s in sizes.items():
    im = src.resize((s, s), Image.LANCZOS)
    im.save(f"/home/z/my-project/public/{name}", "PNG", optimize=True)
    print(name, s)
print("done")
