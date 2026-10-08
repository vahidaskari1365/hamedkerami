#!/usr/bin/env python3
"""Build contact sheets of portfolio images with filename labels for classification."""
from PIL import Image, ImageDraw, ImageFont
import os

SRC = "/home/z/my-project/scripts/portfolio_unique"
files = sorted(os.listdir(SRC))

THUMB_W, THUMB_H = 270, 480
COLS = 4
PER_SHEET = 16

try:
    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 18)
except Exception:
    font = ImageFont.load_default()

for sheet_i in range(0, len(files), PER_SHEET):
    batch = files[sheet_i:sheet_i + PER_SHEET]
    rows = (len(batch) + COLS - 1) // COLS
    sheet = Image.new("RGB", (COLS * THUMB_W, rows * (THUMB_H + 34)), "#111")
    d = ImageDraw.Draw(sheet)
    for i, f in enumerate(batch):
        im = Image.open(os.path.join(SRC, f)).convert("RGB")
        im.thumbnail((THUMB_W, THUMB_H))
        x = (i % COLS) * THUMB_W
        y = (i // COLS) * (THUMB_H + 34)
        sheet.paste(im, (x + (THUMB_W - im.width) // 2, y))
        d.text((x + 8, y + THUMB_H + 6), f[:34], fill="#ffd54a", font=font)
    out = f"/home/z/my-project/scripts/portfolio_sheet_{sheet_i // PER_SHEET + 1}.png"
    sheet.save(out, optimize=True)
    print("saved", out, sheet.size)
