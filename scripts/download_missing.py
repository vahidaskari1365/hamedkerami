#!/usr/bin/env python3
"""Download missing dromfs.com images via wsrv.nl proxy (site is geo-blocked)."""
import os, subprocess, urllib.parse

BASE = "https://dromfs.com/wp-content/uploads/"
OUT = "/home/z/my-project/scripts/dromfs_extra"
os.makedirs(OUT, exist_ok=True)

missing = [
    "2021/07/DSC_0476.jpg",
    "2021/10/axsa508.jpg",
    "2021/10/dr.hamedkermani.omfs_20211003_11.jpg",
    "2021/10/dr.hamedkermani.omfs_20211003_37.jpg",
    "2021/10/dr.hamedkermani.omfs_20211003_39.jpg",
    "2021/10/dr.hamedkermani.omfs_20211003_5.jpg",
    "2021/11/IMG_6500.jpg",
    "2021/11/IMG_6501.jpg",
    "2021/11/IMG_6503.jpg",
    "2021/11/IMG_6504.jpg",
    "2021/11/IMG_6505.jpg",
    "2021/11/IMG_6507.jpg",
    "2021/11/IMG_6508.jpg",
    "2021/11/IMG_6510.jpg",
    "2021/11/IMG_6513.jpg",
    "2021/11/IMG_6518.jpg",
    "2021/11/IMG_6519.jpg",
    "2021/11/dr-hamed-kermani-.jpg",
    "2021/11/hgjhgjhg508.jpg",
    "2021/11/jjkhDSC_0171-1.jpg",
    "2022/01/DSC_0149-Recovered.jpg",
    "2022/08/JHNAJAFZADEH.jpg",
    "2022/09/ghjDSC_0416.jpg",
]

ok, fail = 0, 0
for rel in missing:
    name = rel.split("/")[-1].replace("%", "_")
    dest = os.path.join(OUT, name)
    if os.path.exists(dest) and os.path.getsize(dest) > 10000:
        ok += 1
        continue
    url = "https://wsrv.nl/?url=" + urllib.parse.quote(BASE + rel, safe="") + "&w=1400&output=jpg&q=88"
    r = subprocess.run(["curl", "-sL", "--max-time", "60", "-o", dest, url], capture_output=True)
    size = os.path.getsize(dest) if os.path.exists(dest) else 0
    if r.returncode == 0 and size > 10000:
        ok += 1
        print(f"OK  {name}  {size//1024}KB")
    else:
        fail += 1
        print(f"FAIL {name} ({size}B)")
print(f"\ndone: {ok} ok, {fail} failed")
