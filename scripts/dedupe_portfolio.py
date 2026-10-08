#!/usr/bin/env python3
"""Dedupe portfolio images by md5, copy uniques to portfolio_unique."""
import hashlib, os, shutil

SRC = "/home/z/my-project/scripts/portfolio_raw"
DST = "/home/z/my-project/scripts/portfolio_unique"
os.makedirs(DST, exist_ok=True)

seen = set()
kept = []
for f in sorted(os.listdir(SRC)):
    if not f.lower().endswith((".jpg", ".jpeg", ".png")):
        continue
    p = os.path.join(SRC, f)
    h = hashlib.md5(open(p, "rb").read()).hexdigest()
    if h in seen:
        continue
    seen.add(h)
    # safe name
    name = f.strip().replace(" ", "_").replace("(", "").replace(")", "").lower()
    if not name.endswith(".jpg"):
        name += ".jpg"
    shutil.copy2(p, os.path.join(DST, name))
    kept.append(name)

print(f"kept {len(kept)} unique images:")
for k in kept:
    print(" -", k)
