#!/usr/bin/env node
/* ============================================================
   افزودن لینک‌های زمینه‌ای به فایل‌های seed مقالات ثابت
   (src/lib/articles/*.ts) — چون instrumentation.ts در هر استارت
   سرور، این مقاله‌ها را از کد upsert می‌کند و «منبع حقیقت = کد»،
   لینک‌هایی که فقط با API منتشر شده بودند در دیپلوی ۶۴ab128
   پاک شدند. این اسکریپت همان ۹ جفت لینک را داخل template literal
   بدنه درج می‌کند تا با دیپلوی بعدی authoritatively اعمال شود.
   Idempotent: اگر لینک مقصد در بدنه موجود باشد، جفت رد می‌شود.
   ============================================================ */
import { readFileSync, writeFileSync } from "node:fs";

const PAIRS = [
  { file: "jaw-surgery-orthodontics.ts", orphan: "skeletal-class-2-3", anchor: "کلاس ۲ و ۳ اسکلتال" },
  { file: "jaw-surgery-orthodontics.ts", orphan: "jaw-surgery-without-orthodontics", anchor: "امکان جراحی فک بدون ارتودنسی" },
  { file: "facial-contouring.ts", orphan: "international-patients-faq", anchor: "راهنمای بیماران بین‌المللی جراحی فک" },
  { file: "facial-contouring.ts", orphan: "cheek-implant-cost", anchor: "پروتز گونه" },
  { file: "genioplasty-cost.ts", orphan: "cheek-implant-cost", anchor: "هزینه پروتز گونه" },
  { file: "tmj-pain-treatment.ts", orphan: "wisdom-tooth-surgery-cost-1405", anchor: "درد بعد از جراحی دندان عقل" },
  { file: "jaw-surgery-recovery-care.ts", orphan: "jaw-surgery-brushing-hygiene", anchor: "مسواک بعد از جراحی فک" },
  { file: "jaw-surgery-before-after.ts", orphan: "jaw-surgery-statistics", anchor: "آمار جراحی فک" },
  { file: "jaw-surgery-age.ts", orphan: "jaw-surgery-statistics", anchor: "نرخ موفقیت جراحی فک" },
];

/* ---- استخراج template literal بدنه (با احتساب ${...} تو در تو) ---- */
function extractBody(src) {
  const start = src.indexOf("body: `");
  if (start < 0) throw new Error("body: ` یافت نشد");
  let i = start + "body: `".length;
  let depth = 0, end = -1;
  while (i < src.length) {
    const ch = src[i];
    if (ch === "\\") { i += 2; continue; }
    if (ch === "$" && src[i + 1] === "{") { depth++; i += 2; continue; }
    if (ch === "}" && depth > 0) { depth--; i++; continue; }
    if (ch === "`" && depth === 0) { end = i; break; }
    i++;
  }
  if (end < 0) throw new Error("بستن template literal یافت نشد");
  return { content: src.slice(start + 7, end), start: start + 7, end };
}

/* ---- همان الگوریتم جایگذاری fix-internal-links ---- */
const STOP = new Set(["از","به","با","برای","در","که","و","یا","تا","هم","می","را","است","شده","پس","اگر","این","آن","هر","بین","روی","بعد","قبل","بدون","چیست","چگونه","چقدر","چند","کی","کجا","چرا","چه","بود","شو","های"]);
const toks = (s) => s.replace(/[،؛:|«»()؟?._\-\/]/g, " ").split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w));
const isNoiseLine = (l) =>
  /^#{1,6}\s/.test(l) || /^>/.test(l) || /^\|/.test(l) || /^[-*]\s/.test(l) ||
  /^\d+[.)]\s/.test(l) || /^!?\[/.test(l) || /^</.test(l) || !l.trim();
const isFaqHeading = (l) => /سؤال|سوال|متداول|پرسش|faq|منابع|مرتبط/i.test(l);

function pickPlacement(bodyText, orphanTitle, anchor, used = []) {
  const overlaps = (p) => used.some((u) => p.start >= u.start && p.start <= u.end);
  const lines = bodyText.split("\n");
  const want = new Set([...toks(orphanTitle), ...toks(anchor)]);
  let bestHead = null, bestScore = 0, bestHeadIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (/^#{1,6}\s/.test(l)) {
      if (isFaqHeading(l)) break;
      const score = toks(l).reduce((a, t) => a + (want.has(t) ? t.length : 0), 0);
      if (score > bestScore) { bestScore = score; bestHead = l.trim(); bestHeadIdx = i; }
    }
  }
  const paras = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (/^#{1,6}\s/.test(l) && isFaqHeading(l)) break;
    if (isNoiseLine(l)) continue;
    let j = i;
    while (j + 1 < lines.length && !isNoiseLine(lines[j + 1]) && !/^#{1,6}\s/.test(lines[j + 1])) j++;
    const block = lines.slice(i, j + 1);
    if (block.join(" ").length >= 60) paras.push({ start: i, end: j });
    i = j;
  }
  const free = paras.filter((p) => !overlaps(p));
  if (!free.length) return null;
  let target = null;
  if (bestHeadIdx >= 0) target = free.find((p) => p.start > bestHeadIdx) || null;
  if (!target) target = free[Math.floor((free.length - 1) * 0.3)];
  return { heading: bestHead || "(بدون تطبیق تیتر)", start: target.start, end: target.end };
}

const files = new Map();
for (const p of PAIRS) {
  if (!files.has(p.file)) files.set(p.file, []);
  files.get(p.file).push(p);
}

let ok = 0, skipped = 0, failed = 0;
for (const [file, list] of files) {
  const path = `src/lib/articles/${file}`;
  const src = readFileSync(path, "utf-8");
  const { content, start, end } = extractBody(src);
  let body = content;
  const usedRanges = [];
  for (const p of list) {
    if (body.includes(`/blog/${p.orphan})`)) {
      console.log(`↺ ${file} → ${p.orphan} — قبلاً لینک دارد`);
      skipped++;
      continue;
    }
    const place = pickPlacement(body, p.orphan, p.anchor, usedRanges);
    if (!place) { console.error(`✗ ${file} → ${p.orphan} — جای مناسب نیست`); failed++; continue; }
    usedRanges.push({ start: place.start, end: place.end });
    const lines = body.split("\n");
    lines[place.end] = `${lines[place.end]} راهنمای کامل [${p.anchor}](/blog/${p.orphan}) نیز می‌تواند راهگشا باشد.`;
    body = lines.join("\n");
    console.log(`✓ ${file} → ${p.orphan} [${p.anchor}] | ${place.heading} @L${place.start}`);
    ok++;
  }
  if (body !== content) {
    writeFileSync(path, src.slice(0, start) + body + src.slice(end));
  }
}
console.log(`\nجمع: ${ok} درج | ${skipped} از قبل | ${failed} ناموفق`);
if (failed) process.exit(2);
