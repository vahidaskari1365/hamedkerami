/* ============================================================
   QA مقالات — کنترل خودکار قوانین کاربر و استانداردهای SEO/AEO
   اجرا: bun scripts/qa-articles.ts
   چک‌ها:
   ۱) حجم: ۱۵۰۰+ کلمه هر مقاله
   ۲) پاسخ کوتاه (بلاک‌کوت اول) بین ۲۵ تا ۹۰ کلمه
   ۳) FAQ: حداقل ۴ سوال + عنوان بخش حاوی «پرسش/سوال»
   ۴) لینک داخلی: حداقل ۵؛ مقصد فقط پیلارها یا ۱۸ slug معتبر
   ۵) یکتایی: جمله تکراری (۶+ کلمه) داخل مقاله، بین مقالات و
      در برابر نسخه قبلی (if snapshots exist)
   ۶) فرمت پارسر: بدون بک‌تیک/${ داخل بدنه، بدون لینک http،
      بدون عکس مارک‌داون، بدون HTML tag
   ۷) کاور: فایل 3d مربوطه روی دیسک موجود باشد
   ۸) کلمه کانونی (اولین keyword در seo-keywords) در بدنه هست
   ۹) برند: «دکتر حامد کرمانی» حداقل ۲ بار + CTA تلفن
   ============================================================ */

import { BLOG_ARTICLES } from "../src/lib/blog-articles";
import { ARTICLE_KEYWORDS } from "../src/lib/seo-keywords";
import { parseArticle } from "../src/lib/article-extras";
import fs from "fs";
import path from "path";

const ROOT = path.resolve(import.meta.dir, "..");

const PILLARS = [
  "/jaw-surgery", "/chin-surgery", "/dental-implant", "/implant-pasdaran",
  "/costs", "/gallery", "/services", "/about", "/contact", "/blog",
];
const VALID_LINK_TARGETS = new Set<string>([
  ...PILLARS,
  ...BLOG_ARTICLES.map((a) => `/blog/${a.slug}`),
]);

type Issue = { slug: string; msg: string };
const issues: Issue[] = [];
const warn: Issue[] = [];

/* ---------- استخراج جمله‌ها برای یکتایی ---------- */
function sentences(body: string): string[] {
  return body
    .replace(/[#>*`|]/g, " ")
    .replace(/\s+/g, " ")
    .split(/[.!?؟…]\s*/)
    .map((s) => s.trim())
    .filter((s) => s.split(" ").length >= 6);
}
function norm(s: string): string {
  return s
    .replace(/[\u200c\u064b-\u0652\u0670]/g, "")
    .replace(/[«»"'()،؛:،\-–]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/* ---------- چک هر مقاله ---------- */
const allSentences = new Map<string, string>(); // norm → slug اولین
let totalWords = 0;

for (const a of BLOG_ARTICLES) {
  const { slug, body, cover, title, excerpt } = a;

  /* ۱ — حجم */
  const wc = body.replace(/[#>*`\-|]/g, " ").split(/\s+/).filter(Boolean).length;
  totalWords += wc;
  if (wc < 1500) issues.push({ slug, msg: `حجم ${wc} < ۱۵۰۰ کلمه` });

  /* ۲ — پاسخ کوتاه */
  const first = body.split(/\n\s*\n/).map((g) => g.trim()).find(Boolean) ?? "";
  if (!first.startsWith(">")) issues.push({ slug, msg: "پاسخ کوتاه (بلاک‌کوت اول) نیست" });
  else {
    const aw = first.replace(/^>\s?/, "").split(/\s+/).filter(Boolean).length;
    if (aw < 25 || aw > 90) warn.push({ slug, msg: `پاسخ کوتاه ${aw} کلمه (خارج از بازه ۲۵-۹۰)` });
  }

  /* ۳ — FAQ */
  const extras = parseArticle(body);
  if (extras.faq.length < 4) issues.push({ slug, msg: `FAQ فقط ${extras.faq.length} سوال` });
  if (!/پرسش|سوال/.test(body)) issues.push({ slug, msg: "بخش پرسش های پرتکرار نیست" });

  /* ۴ — لینک داخلی */
  const links = [...body.matchAll(/\]\((\/[^)]*)\)/g)].map((m) => m[1]);
  const uniq = new Set(links);
  if (links.length < 5) issues.push({ slug, msg: `فقط ${links.length} لینک داخلی` });
  for (const l of uniq) {
    if (!VALID_LINK_TARGETS.has(l))
      issues.push({ slug, msg: `لینک نامعتبر: ${l}` });
  }
  if (uniq.has(`/blog/${slug}`)) issues.push({ slug, msg: "لینک به خود مقاله" });

  /* ۵ — یکتایی درون مقاله + سراسری */
  const seenLocal = new Set<string>();
  for (const s of sentences(body)) {
    const n = norm(s);
    if (seenLocal.has(n)) issues.push({ slug, msg: `جمله تکراری داخل مقاله: «${s.slice(0, 50)}…»` });
    seenLocal.add(n);
    const owner = allSentences.get(n);
    if (owner && owner !== slug)
      issues.push({ slug, msg: `جمله تکراری با مقاله ${owner}: «${s.slice(0, 50)}…»` });
    else allSentences.set(n, slug);
  }

  /* ۶ — فرمت پارسر */
  if (body.includes("`")) issues.push({ slug, msg: "بک‌تیک داخل بدنه" });
  if (body.includes("${")) issues.push({ slug, msg: "${ داخل بدنه" });
  if (/!\[[^\]]*\]\(/.test(body)) issues.push({ slug, msg: "عکس مارک‌داون داخل بدنه" });
  if (/<[a-z][a-z0-9]*[\s>]/i.test(body)) issues.push({ slug, msg: "تگ HTML داخل بدنه" });
  if (/https?:\/\//.test(body)) warn.push({ slug, msg: "لینک http در بدنه" });
  if (/[\u200c]/.test(body)) warn.push({ slug, msg: "نیم‌فاصله (ZWNJ) در بدنه" });

  /* ۷ — کاور روی دیسک */
  if (cover && !fs.existsSync(path.join(ROOT, "public", cover)))
    issues.push({ slug, msg: `فایل کاور موجود نیست: ${cover}` });

  /* ۸ — کلمه کانونی */
  const kw = ARTICLE_KEYWORDS[slug]?.split(", ")[0];
  if (kw && !body.includes(kw) && !title.includes(kw))
    issues.push({ slug, msg: `کلمه کانونی «${kw}» نه در بدنه نه در عنوان` });

  /* ۹ — برند و CTA */
  const brand = (body.match(/دکتر حامد کرمانی|دکتر کرمانی/g) ?? []).length;
  if (brand < 2) issues.push({ slug, msg: `نام دکتر فقط ${brand} بار` });
  /* تلفن مطب ۰۹۳۸-۲۰۸۰۲۷۰ — نرمال‌سازی ارقام فارسی و جداکننده‌ها
     (شماره قدیمی ۰۲۱-۶۶۹۲۱۵۰۰ هم برای اطمینان پذیرفته می‌شود) */
  const digits = body
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[^0-9]/g, "");
  if (!digits.includes("09382080270") && !digits.includes("66921500"))
    issues.push({ slug, msg: "CTA تلفن مطب نیست" });
  if (!title || title.length < 20) issues.push({ slug, msg: "عنوان کوتاه" });
  if (!excerpt || excerpt.length < 40) issues.push({ slug, msg: "excerpt کوتاه" });

  /* ۱۰ — AEO/SXO (claude-seo quality gates — هشدار برای مقالات موجود،
     گیت سخت‌گیر فقط برای مقاله‌های تازه در publish.ts اعمال می‌شود) */
  const qH2 = (body.match(/^#{2,3} .+؟/gm) || []).length;
  if (qH2 < 2) warn.push({ slug, msg: `تیتر پرسشی فقط ${qH2} مورد (هدف ≥۲ — AEO)` });
  const bolds = (body.match(/\*\*[^*]+\*\*/g) || []).length;
  if (bolds < 2) warn.push({ slug, msg: `برجسته‌سازی ** فقط ${bolds} مورد (هدف ≥۲ — SXO)` });
  const nums = (body.match(/[۰-۹0-9]+/g) || []).length;
  if (nums < 3) warn.push({ slug, msg: `عدد/آمار فقط ${nums} مورد (هدف ≥۳ — GEO)` });
  const BOFU = /^\/(costs|appointment|contact|jaw-surgery|chin-surgery|dental-implant|implant-pasdaran|gallery)/;
  const bofu = new Set(
    [...body.matchAll(/\]\((\/[^)]*)\)/g)].map((m) => m[1]).filter((l) => BOFU.test(l)),
  );
  if (!bofu.size) warn.push({ slug, msg: "لینک داخلی BOFU ندارد (SXO)" });
}

/* ---------- گزارش ---------- */
console.log(`\n=== QA ${BLOG_ARTICLES.length} مقاله — مجموع ${totalWords.toLocaleString("fa-IR")} کلمه ===\n`);
if (issues.length) {
  console.log(`❌ ${issues.length} خطا:`);
  for (const i of issues) console.log(`   [${i.slug}] ${i.msg}`);
} else {
  console.log("✅ صفر خطا");
}
if (warn.length) {
  console.log(`\n⚠ ${warn.length} هشدار:`);
  for (const i of warn) console.log(`   [${i.slug}] ${i.msg}`);
}

/* پوشش slug ↔ keywords */
const missingKw = BLOG_ARTICLES.filter((a) => !ARTICLE_KEYWORDS[a.slug]).map((a) => a.slug);
if (missingKw.length) console.log(`\n⚠ بدون کلیدواژه اختصاصی (fallback عمومی): ${missingKw.join(", ")}`);

process.exit(issues.length ? 1 : 0);
