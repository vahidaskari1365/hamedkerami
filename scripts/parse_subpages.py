#!/usr/bin/env python3
"""Convert fetched JSON pages into readable text files."""
import json
import re
from html import unescape


def html_to_text(html):
    # Remove scripts/styles
    html = re.sub(r'<script[^>]*>.*?</script>', ' ', html, flags=re.S | re.I)
    html = re.sub(r'<style[^>]*>.*?</style>', ' ', html, flags=re.S | re.I)
    # Block tags -> newline
    html = re.sub(r'</(p|div|h[1-6]|li|tr|section|article|blockquote)>', '\n', html, flags=re.I)
    html = re.sub(r'<br\s*/?>', '\n', html, flags=re.I)
    # Strip tags
    html = re.sub(r'<[^>]+>', ' ', html)
    # Entities
    html = unescape(html)
    # Collapse whitespace per line
    lines = []
    for line in html.split('\n'):
        line = ' '.join(line.split())
        if line:
            lines.append(line)
    # Deduplicate consecutive identical lines
    out = []
    for line in lines:
        if not out or out[-1] != line:
            out.append(line)
    return '\n'.join(out)


for name in ['about', 'services', 'gallery', 'contact', 'blog']:
    try:
        with open(f'/home/z/my-project/scripts/dromfs_{name}.json', encoding='utf-8') as f:
            data = json.load(f)
        d = data.get('data', {})
        title = d.get('title', '')
        html = d.get('html', '')
        text = html_to_text(html)
        with open(f'/home/z/my-project/scripts/dromfs_{name}_text.txt', 'w', encoding='utf-8') as f:
            f.write(f"TITLE: {title}\n\n{text}")
        print(f"=== {name} === title: {title} | text length: {len(text)}")
    except Exception as e:
        print(f"{name}: ERROR {e}")
