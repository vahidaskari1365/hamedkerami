#!/usr/bin/env node
/* ============================================================
   خروجی بدنه مقالات ثابت → content-fixes/<slug>.md
   برای انتشار در مسیر /api/agents/publish (متای og صفحه زنده
   حفظ می‌شود — فقط بدنه به‌روز می‌شود).
   اجرا: bun scripts/export-static-bodies.mjs
   ============================================================ */
import { BLOG_ARTICLES } from "../src/lib/blog-articles.ts";
import { writeFileSync, mkdirSync } from "node:fs";

/* ۱۶ مقاله‌ای که در موج ارتقا (Task 2-b) برجسته‌سازی/ZWNJ گرفتند */
const WANT = new Set([
  "facial-contouring", "v-line-jaw-reduction", "jaw-botox-masseter",
  "genioplasty-cost", "tmj-pain-treatment", "jaw-surgery-age",
  "maxillofacial-vs-plastic-surgeon", "jaw-surgery-orthodontics",
  "jaw-filler-vs-surgery", "cleft-lip-palate-surgery",
  "sleep-apnea-mma-surgery", "jaw-fracture-surgery",
  "jaw-surgery-before-after", "jaw-surgery-recovery-care",
  "best-jaw-surgeon-tehran", "gummy-smile-treatment",
]);

mkdirSync("content-fixes", { recursive: true });
let n = 0;
for (const a of BLOG_ARTICLES) {
  if (!WANT.has(a.slug)) continue;
  writeFileSync(`content-fixes/${a.slug}.md`, a.body.trim() + "\n", "utf-8");
  n++;
}
console.log(`exported ${n}/${WANT.size} static bodies → content-fixes/`);
if (n !== WANT.size) {
  console.error("بعضی اسلاگ‌ها در BLOG_ARTICLES پیدا نشدند");
  process.exit(1);
}
