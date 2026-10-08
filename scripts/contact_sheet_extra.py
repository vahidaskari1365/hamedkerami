#!/usr/bin/env python3
"""Contact sheet for dromfs_extra images."""
from PIL import Image, ImageDraw, ImageFont
import os

SRC = "/home/z/my-project/scripts/dromfs_extra"
files = sorted(os.listdir(SRC))
THUMB_W, THUMB_H = 330, 248
COLS = 4
PER_SHEET = 16

font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 15)

for sheet_i in range(0, len(files), PER_SHEET):
    batch = files[sheet_i:sheet_i + PER_SHEET]
    rows = (len(batch) + COLS - 1) // COLS
    sheet = Image.new("RGB", (COLS * THUMB_W, rows * (THUMB_H + 26)), "#111")
    d = ImageDraw.Draw(sheet)
    for i, f in enumerate(batch):
        im = Image.open(os.path.join(SRC, f)).convert("RGB")
        im.thumbnail((THUMB_W - 4, THUMB_H - 4))
        x = (i % COLS) * THUMB_W
        y = (i // COLS) * (THUMB_H + 26)
        sheet.paste(im, (x + (THUMB_W - im.width) // 2, y))
        d.text((x + 6, y + THUMB_H + 2), f[:40], fill="#7dd3fc", font=font)
    out = f"/home/z/my-project/scripts/extra_sheet_{sheet_i // PER_SHEET + 1}.png"
    sheet.save(out, optimize=True)
    print("saved", out, sheet.size)
