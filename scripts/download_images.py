#!/usr/bin/env python3
"""Download key images from dromfs.com."""
import subprocess
import os
from urllib.parse import quote

OUT = '/home/z/my-project/scripts/dromfs_images'
os.makedirs(OUT, exist_ok=True)

images = {
    'logo.png': 'https://dromfs.com/wp-content/uploads/2023/08/dr-hamed-kermani-logo.png',
    'dr-kermani-xl.png': 'https://dromfs.com/wp-content/uploads/2022/04/dr-kermani-omfs-xl.png',
    'dr-photo.png': 'https://dromfs.com/wp-content/uploads/2022/11/photo-of-dr-hamed-kermani.png',
    'dr-surgon.png': 'https://dromfs.com/wp-content/uploads/2022/11/dr-hamed-kermani-omfs-surgon.png',
    'hero-clinic.jpg': 'https://dromfs.com/wp-content/uploads/2021/07/DSC_0476-scaled.jpg',
    'bimax-before.jpg': 'https://dromfs.com/wp-content/uploads/2021/11/dr-hamed-kermani-bimax-surgery-1.jpg',
    'bimax-after.jpg': 'https://dromfs.com/wp-content/uploads/2021/11/dr-hamed-kermani-omfs-bimax-surgery-2-1.jpg',
    'blepharo-1.jpg': 'https://dromfs.com/wp-content/uploads/2021/11/dr-hamed-kermani-omfs-%D8%A8%D9%84%D9%81%D8%A7%D8%B1%D9%88%D9%BE%D9%84%D8%A7%D8%B3%D8%AA%DB%8C-%DB%B1.jpg',
    'blepharo-2.jpg': 'https://dromfs.com/wp-content/uploads/2021/11/dr-hamed-kermani-omfs-%D8%A8%D9%84%D9%81%D8%A7%D8%B1%D9%88%D9%BE%D9%84%D8%A7%D8%B3%D8%AA%DB%8C-%DB%B2.jpg',
    'case-1.jpg': 'https://dromfs.com/wp-content/uploads/2021/10/axsa508.jpg',
    'case-2.jpg': 'https://dromfs.com/wp-content/uploads/2021/10/dr.hamedkermani.omfs_.jpg',
    'case-3.jpg': 'https://dromfs.com/wp-content/uploads/2021/10/dr.hamedkermani.omfs_20211003_11.jpg',
    'case-4.jpg': 'https://dromfs.com/wp-content/uploads/2021/10/dr.hamedkermani.omfs_20211003_37.jpg',
    'case-5.jpg': 'https://dromfs.com/wp-content/uploads/2021/10/dr.hamedkermani.omfs_20211003_39.jpg',
    'case-6.jpg': 'https://dromfs.com/wp-content/uploads/2021/10/dr.hamedkermani.omfs_20211003_5.jpg',
    'case-7.jpg': 'https://dromfs.com/wp-content/uploads/2021/11/hgjhgjhg508.jpg',
    'case-8.jpg': 'https://dromfs.com/wp-content/uploads/2021/11/%D8%A8%D8%A7%D8%B2%D8%B3%D8%A7%D8%B2%DB%8C-%DA%A9%D8%A7%D9%85%D9%84-%D9%81%DA%A9-%D8%A8%D8%A7%D9%84%D8%A7-%D8%A8%D8%A7-%D8%A7%DB%8C%D9%85%D9%BE%D9%84%D9%86%D8%AA.jpg',
    'case-9.jpg': 'https://dromfs.com/wp-content/uploads/2021/11/%D9%81%D9%88%D9%84-%D8%A7%DB%8C%D9%85%D9%BE%D9%84%D9%86%D8%AA.jpg',
    'case-10.jpg': 'https://dromfs.com/wp-content/uploads/2021/11/%DA%A9%D8%A7%D8%B4%D8%AA-%D8%AF%D9%86%D8%AF%D8%A7%D9%86-%D8%A8%D8%AF%D9%88%D9%86-%D8%A8%D8%B1%D8%B4-%D8%AC%D8%B1%D8%A7%D8%AD%DB%8C.jpg',
    'case-11.jpg': 'https://dromfs.com/wp-content/uploads/2021/11/%DA%A9%D8%A7%D8%B4%D8%AA-%D8%AF%D9%86%D8%AF%D8%A7%D9%86-%D8%AF%D8%B1-%D8%A8%D9%87%D8%AA%D8%B1%DB%8C%D9%86-%D9%85%D8%B7%D8%A8-%D8%AA%D9%87%D8%B1%D8%A7%D9%86.jpg',
    'case-12.jpg': 'https://dromfs.com/wp-content/uploads/2021/11/%DA%A9%D8%A7%D8%B4%D8%AA-%D8%AF%D9%86%D8%AF%D8%A7%D9%86-%D9%87%D8%A7%DB%8C-%D8%AC%D9%84%D9%88.jpg',
    'before-after-main.jpg': 'https://dromfs.com/wp-content/uploads/2022/01/%D8%AC%D8%B1%D8%A7%D8%AD%DB%8C-%D9%81%DA%A9-%D9%88-%D8%B5%D9%88%D8%B1%D8%AA-%D9%82%D8%A8%D9%84-%D9%88-%D8%A8%D8%B9%D8%AF.jpg',
    'clinic-2.jpg': 'https://dromfs.com/wp-content/uploads/2022/01/DSC_0149-Recovered-scaled.jpg',
    'dr-profile.jpg': 'https://dromfs.com/wp-content/uploads/2021/11/dr-hamed-kermani-.jpg',
    'implant-cost.jpg': 'https://dromfs.com/wp-content/uploads/2021/11/%D9%87%D8%B2%DB%8C%D9%86%D9%87-%DA%A9%D8%A7%D8%B4%D8%AA-%D8%AF%D9%86%D8%AF%D8%A7%D9%86.jpg',
    'team-rostamkhani.jpg': 'https://dromfs.com/wp-content/uploads/2022/08/JHNAJAFZADEH.jpg',
    'favicon-192.jpg': 'https://dromfs.com/wp-content/uploads/2021/05/cropped-dr-hamed-kermani-logo-192x192.jpg',
    'favicon-512.jpg': 'https://dromfs.com/wp-content/uploads/2021/05/cropped-dr-hamed-kermani-logo-270x270.jpg',
}

ok, fail = [], []
import re
for name, url in images.items():
    dest = os.path.join(OUT, name)
    # strip protocol for wsrv proxy
    clean = re.sub(r'^https?://', '', url)
    proxied = f"https://wsrv.nl/?url={clean}&w=1600&q=85&output=jpg"
    try:
        r = subprocess.run(
            ['curl', '-sL', '--max-time', '45', '-o', dest, proxied],
            capture_output=True, text=True, timeout=60
        )
    except subprocess.TimeoutExpired:
        fail.append(f"{name} TIMEOUT")
        continue
    size = os.path.getsize(dest) if os.path.exists(dest) else 0
    if size > 5000:
        ok.append(f"{name} ({size//1024}KB)")
    else:
        fail.append(f"{name} ({size}B)")

print("OK:")
for x in ok: print(" ", x)
print("FAILED:")
for x in fail: print(" ", x)
