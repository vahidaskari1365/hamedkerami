#!/usr/bin/env python3
"""Fetch all dromfs.com subpages and extract text."""
import json
import subprocess
import time

pages = {
    'about': 'https://dromfs.com/about/',
    'services': 'https://dromfs.com/services/',
    'gallery': 'https://dromfs.com/gallery/',
    'contact': 'https://dromfs.com/contact/',
    'blog': 'https://dromfs.com/blog/',
}

for name, url in pages.items():
    outfile = f'/home/z/my-project/scripts/dromfs_{name}.json'
    cmd = ['z-ai', 'function', '-n', 'page_reader', '-a', json.dumps({'url': url}), '-o', outfile]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    ok = 'File saved' in r.stdout
    print(f"{name}: {'OK' if ok else 'FAIL'} ({url})")
    time.sleep(1)
