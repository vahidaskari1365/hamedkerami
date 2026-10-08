#!/usr/bin/env python3
"""Crop bottom 22% of each unique cover (watermark zone) into verification strips."""
from PIL import Image, ImageDraw, ImageFont
import os

SRC = "/home/z/my-project/scripts/portfolio_unique"
OUT = "/home/z/my-project/scripts/wm_check"
os.makedirs(OUT, exist_ok=True)

font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 16)
files = sorted(os.listdir(SRC))

THUMB_W, THUMB_H = 360, 200
COLS = 5
PER_SHEET = 20

for sheet_i in range(0, len(files), PER_SHEET):
    batch = files[sheet_i:sheet_i + PER_SHEET]
    rows = (len(batch) + COLS - 1) // COLS
    sheet = Image.new("RGB", (COLS * THUMB_W, rows * (THUMB_H + 26)), "#111")
    d = ImageDraw.Draw(sheet)
    for i, f in enumerate(batch):
        im = Image.open(os.path.join(SRC, f)).convert("RGB")
        w, h = im.size
        crop = im.crop((0, int(h * 0.78), w, h))  # bottom 22%
        crop.thumbnail((THUMB_W - 4, THUMB_H - 4))
        x = (i % COLS) * THUMB_W
        y = (i // COLS) * (THUMB_H + 26)
        sheet.paste(crop, (x + (THUMB_W - crop.width) // 2, y))
        d.text((x + 6, y + THUMB_H + 2), f[:34], fill="#7dd3fc", font=font)
    out = f"{OUT}/wm_{sheet_i // PER_SHEET + 1}.png"
    sheet.save(out, optimize=True)
    print("saved", out)
