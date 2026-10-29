#!/usr/bin/env node
/* نمایش کیوردهای کانونی و ثانویه اسلاگ‌های داده‌شده */
import { readFileSync } from "node:fs";

function parseKeywordMaps(ts) {
  const maps = {};
  for (const name of ["ARTICLE_KEYWORDS", "POOL_ARTICLE_KEYWORDS"]) {
    const block = ts.match(new RegExp(`export const ${name}[^=]*= \\{([\\s\\S]*?)\\n\\};`));
    if (!block) { maps[name] = {}; continue; }
    const entries = {};
    const re = /"([a-z0-9-]+)":\s*\[([\s\S]*?)\]\s*\.join\(", "\)/g;
    let m;
    while ((m = re.exec(block[1]))) {
      const kws = [...m[2].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
      if (kws.length) entries[m[1]] = kws;
    }
    maps[name] = entries;
  }
  return maps;
}

const { ARTICLE_KEYWORDS, POOL_ARTICLE_KEYWORDS } = parseKeywordMaps(readFileSync("src/lib/seo-keywords.ts", "utf-8"));
const slugs = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(ARTICLE_KEYWORDS);
for (const s of slugs) {
  const k = ARTICLE_KEYWORDS[s] || POOL_ARTICLE_KEYWORDS[s] || [];
  console.log(`══ ${s}`);
  console.log(`   focus: ${k[0] || "?"}`);
  console.log(`   secondary: ${k.slice(1).join(" | ") || "—"}`);
}
