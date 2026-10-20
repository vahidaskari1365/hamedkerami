/* ============================================================
   qa-articles.ts — کنترل کیفیت مقالات طبق قوانین کاربر و
   استانداردهای SEO/GEO/AEO/AIO/SXO
   اجرا: bun scripts/qa-articles.ts
   چک ها:
   1) طول ≥ ۱۵۰۰ کلمه (دستور کاربر)
   2) پاسخ مستقیم (blockquote) ابتدای مقاله — AEO
   3) FAQ ≥ ۴ سوال — AEO
   4) CTA شماره تماس + لینک داخلی — SXO
   5) پوشش ۱۲ کلمه کلیدی اولویت ۱ — SEO
   6) یکتایی جملات بین مقالات (بدون تکرار) — قاعده کاربر
   7) نام دکتر کرمانی + فلوشیپ کرانیوفاسیال — E-E-A-T / GEO
   خروج غیر صفر اگر خطای سخت باشد (برای CI)
   ============================================================ */

import { BLOG_ARTICLES } from "../src/lib/blog-articles";

const PRIORITY_KEYWORDS = [
  "جراحی فک قبل و بعد",
  "نامتقارنی فک",
  "عوارض جراحی فک",
  "مراقبت بعد از جراحی فک",
  "جراحی زیبایی فک و صورت",
  "بوتاکس فک",
  "لبخند لثه",
  "بهترین جراح فک و صورت در تهران",
  "هزینه جنیوپلاستی",
  "مشاوره جراحی فک",
  "درد مفصل فک",
  "کوچک کردن زاویه فک",
];

const wordCount = (t: string) =>
  t.replace(/[#>*`\-|]/g, " ").split(/\s+/).filter(Boolean).length;

const sentences = (t: string) =>
  t
    .replace(/[#>*`|]/g, " ")
    .split(/[.!؟?\n؛]/)
    .map((s) => s.trim())
    .filter((s) => s.split(/\s+/).length >= 8);

let hardErrors = 0;
const warnings: string[] = [];

console.log("═".repeat(64));
console.log("QA مقالات — قوانین کاربر + SEO/GEO/AEO/AIO/SXO");
console.log("═".repeat(64));

/* --- یکتایی بین مقالات --- */
const seen = new Map<string, string>();
const dupes: string[] = [];
for (const a of BLOG_ARTICLES) {
  for (const s of sentences(a.body)) {
    const key = s.slice(0, 80);
    if (seen.has(key) && seen.get(key) !== a.slug) dupes.push(`«${key}…» → ${seen.get(key)} + ${a.slug}`);
    else seen.set(key, a.slug);
  }
}

for (const a of BLOG_ARTICLES) {
  const wc = wordCount(a.body);
  const hasAnswer = a.body.trimStart().startsWith(">");
  const faqCount = (a.body.match(/^### /gm) || []).length; // سوال‌های FAQ
  const hasPhone = a.body.includes("۰۲۱-۶۶۹۲۱۵۰۰");
  const hasInternalLink = /\[.*\]\(\/(services|costs|about|contact|blog)/.test(a.body);
  const hasDrName = a.body.includes("کرمانی");
  const hasFellowship = a.body.includes("کرانیوفاسیال");
  const faqSection = a.body.includes("پرسش های پرتکرار") || a.body.includes("پرسش های پرتکرار");

  const errs: string[] = [];
  if (wc < 1500) errs.push(`طول ${wc} < ۱۵۰۰ کلمه`);
  if (!hasAnswer) errs.push("پاسخ مستقیم (blockquote) ندارد — AEO");
  if (faqCount < 4) errs.push(`فقط ${faqCount} سوال FAQ — حداقل ۴ (AEO)`);
  if (!faqSection) errs.push("بخش پرسش های پرتکرار ندارد");
  if (!hasPhone) errs.push("CTA شماره تماس ندارد — SXO");
  if (!hasInternalLink) errs.push("لینک داخلی ندارد — SXO");
  if (!hasDrName || !hasFellowship) errs.push("نام دکتر/فلوشیپ کرانیوفاسیال نیست — E-E-A-T");

  console.log(`\n📄 ${a.slug}`);
  console.log(`   تاریخ: ${a.date} | کلمات: ${wc} | FAQ: ${faqCount}`);
  if (errs.length) {
    hardErrors += errs.length;
    errs.forEach((e) => console.log(`   ❌ ${e}`));
  } else {
    console.log("   ✅ همه چک های ساختاری پاس");
  }
}

/* --- ماتریس کلمات کلیدی --- */
console.log("\n" + "─".repeat(64));
console.log("پوشش کلمات کلیدی اولویت ۱ (کدام کلمه در کدام مقاله):");
const allText = BLOG_ARTICLES.map((a) => `${a.title}\n${a.excerpt}\n${a.body}`).join("\n");
for (const kw of PRIORITY_KEYWORDS) {
  const hits = BLOG_ARTICLES.filter((a) =>
    `${a.title}\n${a.excerpt}\n${a.body}`.includes(kw)
  ).map((a) => a.slug);
  const inAll = allText.includes(kw);
  if (inAll) {
    console.log(`  ✅ ${kw} → ${hits.join(", ")}`);
  } else {
    warnings.push(`کلمه کلیدی «${kw}» در هیچ مقاله ای نیست`);
    console.log(`  ❌ ${kw} → هیچ جا`);
  }
}

/* --- یکتایی --- */
console.log("\n" + "─".repeat(64));
if (dupes.length) {
  console.log(`تکرار جملات بین مقالات: ${dupes.length}`);
  dupes.forEach((d) => console.log(`  ⚠️  ${d}`));
  warnings.push("جملات تکراری بین مقالات پیدا شد");
} else {
  console.log("✅ یکتایی جملات بین ۶ مقاله — بدون تکرار");
}

console.log("\n" + "═".repeat(64));
if (hardErrors || warnings.length) {
  console.log(`نتیجه: ${hardErrors} خطای سخت، ${warnings.length} هشدار`);
  warnings.forEach((w) => console.log(`⚠️  ${w}`));
  if (hardErrors) process.exit(1);
} else {
  console.log("نتیجه: همه چک ها پاس ✅");
}
