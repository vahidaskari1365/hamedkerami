#!/usr/bin/env node
/* ============================================================
   استخراج بدنه/عنوان/چکیده از فایل‌های مخزن (src/lib/articles/*.ts —
   منبع حقیقت پس از QA) → content-fixes/<slug>.md + keyword-boost.json
   برای انتشار زنده با scripts/keyword-boost-publish.mjs در Actions.
   اجرا: node scripts/extract-article-bodies.mjs <slug1> <slug2> ...
   ============================================================ */
import { readFileSync, writeFileSync } from "node:fs";

const SLUGS = process.argv.slice(2);
if (!SLUGS.length) {
  console.error("اسلاگ‌ها را به عنوان آرگومان بدهید");
  process.exit(1);
}

function extractField(src, name) {
  const re = new RegExp(`${name}:\\s*\`([\\s\\S]*?)\`,\\n`);
  const m = src.match(re);
  if (m) return m[1];
  const m2 = src.match(new RegExp(`${name}:\\s*"([\\s\\S]*?)",\\n`));
  if (!m2) throw new Error(`${name} یافت نشد`);
  return m2[1].replace(/\\"/g, '"');
}

const manifest = {};
for (const slug of SLUGS) {
  const file = `src/lib/articles/${slug}.ts`;
  const src = readFileSync(file, "utf-8");
  const body = extractField(src, "body").trim();
  const title = extractField(src, "title").trim();
  const excerpt = extractField(src, "excerpt").trim();
  if (body.length < 500) throw new Error(`${slug}: بدنه کوتاه است`);
  if (!body.startsWith(">")) throw new Error(`${slug}: پاسخ مستقیم نیست`);
  writeFileSync(`content-fixes/${slug}.md`, body + "\n", "utf-8");
  manifest[slug] = { title, excerpt, bodyFile: `content-fixes/${slug}.md` };
  console.log(`✓ ${slug} — ${body.split(/\s+/).length} کلمه، عنوان: ${title.slice(0, 50)}…`);
}

writeFileSync("content-fixes/keyword-boost.json", JSON.stringify(manifest, null, 2), "utf-8");
console.log(`\nمانیفست: content-fixes/keyword-boost.json (${Object.keys(manifest).length} مقاله)`);
