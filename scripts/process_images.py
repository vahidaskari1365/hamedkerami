#!/usr/bin/env python3
"""Process all new images for the site: covers, certificates, clinic photos, extra cases."""
from PIL import Image
import os

PU = "/home/z/my-project/scripts/portfolio_unique"
EX = "/home/z/my-project/scripts/dromfs_extra"
PUB = "/home/z/my-project/public/images"

KERMANI_COVERS = [
    "1cover.jpg", "1cover_1.jpg", "2cover_3.jpg", "2cover_4.jpg", "2cover_5.jpg",
    "3cover_4.jpg", "4cover_2.jpg", "4cover_3.jpg", "5cover_2.jpg", "5cover_3.jpg",
    "6cover_3.jpg", "6cover_4.jpg", "6cover_5.jpg", "7cover_2.jpg", "cover-dr-hamed.jpg",
]
CERTS = ["IMG_6500", "IMG_6501", "IMG_6503", "IMG_6504", "IMG_6505", "IMG_6507",
         "IMG_6508", "IMG_6510", "IMG_6513", "IMG_6518", "IMG_6519"]

def save(im, dest, max_w, quality=82):
    im = im.convert("RGB")
    if im.width > max_w:
        im = im.resize((max_w, int(im.height * max_w / im.width)), Image.LANCZOS)
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    im.save(dest, "JPEG", quality=quality, optimize=True, progressive=True)
    print(f"{dest}  {os.path.getsize(dest)//1024}KB  {im.size}")

# 1) Portfolio covers (9:16) — 810px wide
os.makedirs(f"{PUB}/covers", exist_ok=True)
for old in os.listdir(f"{PUB}/covers"):
    os.remove(f"{PUB}/covers/{old}")
for i, f in enumerate(KERMANI_COVERS, 1):
    save(Image.open(os.path.join(PU, f)), f"{PUB}/covers/cover-{i:02d}.jpg", 810, 80)

# 2) Certificates — 1100px wide
os.makedirs(f"{PUB}/certificates", exist_ok=True)
for old in os.listdir(f"{PUB}/certificates"):
    os.remove(f"{PUB}/certificates/{old}")
for i, f in enumerate(CERTS, 1):
    save(Image.open(os.path.join(EX, f + ".jpg")), f"{PUB}/certificates/cert-{i:02d}.jpg", 1100, 85)

# 3) Clinic / surgery photos
save(Image.open(os.path.join(EX, "DSC_0476.jpg")), f"{PUB}/clinic/surgery-1.jpg", 1400, 82)
save(Image.open(os.path.join(EX, "ghjDSC_0416.jpg")), f"{PUB}/clinic/surgery-2.jpg", 1400, 82)
save(Image.open(os.path.join(EX, "DSC_0149-Recovered.jpg")), f"{PUB}/clinic/dr-portrait.jpg", 900, 85)
save(Image.open(os.path.join(EX, "jjkhDSC_0171-1.jpg")), f"{PUB}/clinic/dr-formal.jpg", 900, 85)

# 4) Extra educational case posts (all Kermani)
os.makedirs(f"{PUB}/cases", exist_ok=True)
for old in os.listdir(f"{PUB}/cases"):
    os.remove(f"{PUB}/cases/{old}")
extras = [
    ("axsa508.jpg", "case-bimax.jpg"),
    ("dr.hamedkermani.omfs_20211003_11.jpg", "case-profile.jpg"),
    ("dr.hamedkermani.omfs_20211003_37.jpg", "case-nerve-anatomy.jpg"),
    ("dr.hamedkermani.omfs_20211003_39.jpg", "case-mandible.jpg"),
    ("dr.hamedkermani.omfs_20211003_5.jpg", "case-bimax-2.jpg"),
    ("hgjhgjhg508.jpg", "case-sinus-lift.jpg"),
]
for src, dest in extras:
    save(Image.open(os.path.join(EX, src)), f"{PUB}/cases/{dest}", 810, 80)

print("\nDONE")
