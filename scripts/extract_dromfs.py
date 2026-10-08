#!/usr/bin/env python3
"""Extract text, links, images from dromfs.com homepage HTML."""
import json
import re
from html.parser import HTMLParser
from html import unescape


class ContentExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.texts = []
        self.links = []
        self.images = []
        self.headings = []
        self.current_tag = None
        self.current_text = []
        self.skip = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag in ('script', 'style', 'noscript'):
            self.skip = True
            return
        if tag == 'a':
            href = attrs.get('href', '')
            self.links.append({'href': href, 'text': ''})
        if tag == 'img':
            src = attrs.get('src', '') or attrs.get('data-src', '') or attrs.get('data-lazy-src', '')
            alt = attrs.get('alt', '')
            if src:
                self.images.append({'src': src, 'alt': alt})
        if tag in ('h1', 'h2', 'h3', 'h4', 'h5', 'h6'):
            self.current_tag = tag
            self.current_text = []

    def handle_endtag(self, tag):
        if tag in ('script', 'style', 'noscript'):
            self.skip = False
            return
        if tag in ('h1', 'h2', 'h3', 'h4', 'h5', 'h6') and self.current_tag == tag:
            text = ' '.join(''.join(self.current_text).split())
            if text:
                self.headings.append({'tag': tag, 'text': text})
            self.current_tag = None
            self.current_text = []

    def handle_data(self, data):
        if self.skip:
            return
        text = data.strip()
        if text:
            self.texts.append(text)
        if self.current_tag:
            self.current_text.append(data)


with open('/home/z/my-project/scripts/dromfs_home.html', encoding='utf-8') as f:
    html = f.read()

parser = ContentExtractor()
parser.feed(html)

# Extract meta info
meta_desc = re.search(r'<meta\s+name=["\']description["\']\s+content=["\']([^"\']+)["\']', html, re.I)
og_title = re.search(r'property=["\']og:title["\']\s+content=["\']([^"\']+)["\']', html, re.I)
og_desc = re.search(r'property=["\']og:description["\']\s+content=["\']([^"\']+)["\']', html, re.I)
title_tag = re.search(r'<title>([^<]+)</title>', html, re.I)

result = {
    'title_tag': unescape(title_tag.group(1)) if title_tag else '',
    'meta_description': unescape(meta_desc.group(1)) if meta_desc else '',
    'og_title': unescape(og_title.group(1)) if og_title else '',
    'og_description': unescape(og_desc.group(1)) if og_desc else '',
    'headings': parser.headings,
    'links': parser.links,
    'images': parser.images,
}

# Full body text joined
full_text = '\n'.join(parser.texts)
with open('/home/z/my-project/scripts/dromfs_home_text.txt', 'w', encoding='utf-8') as f:
    f.write(full_text)

with open('/home/z/my-project/scripts/dromfs_structure.json', 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

print('=== TITLE ===')
print(result['title_tag'])
print('=== META DESC ===')
print(result['meta_description'])
print('=== HEADINGS (%d) ===' % len(parser.headings))
for h in parser.headings[:60]:
    print(f"[{h['tag']}] {h['text'][:100]}")
print('=== IMAGES (%d) ===' % len(parser.images))
for img in parser.images[:50]:
    print(f"  {img['src'][:120]} | alt: {img['alt'][:60]}")
print('=== LINKS (%d) ===' % len(parser.links))
seen = set()
for l in parser.links:
    href = l['href']
    if href and href not in seen and not href.startswith('#'):
        seen.add(href)
        print(f"  {href[:100]}")
print('=== TEXT LENGTH ===', len(full_text))
