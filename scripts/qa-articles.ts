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
  "/surgery-care", "/costs", "/gallery", "/services", "/about", "/contact", "/blog", "/appointment",
];
/* اسلاگ‌های منتشرشده در دیتابیس پروداکشن (خارج از ۱۸ مقاله ثابت)
   — تأییدشده با sitemap زنده ۲۰۲۶-۱۰-۲۶. بعد از هر موج انتشار انبوه
   (کرن روزانه) اسلاگ‌های تازه را به این فهرست اضافه کن. */
const DB_PUBLISHED_SLUGS: string[] = [
  "all-on-4-implants-guide", "best-implant-brands", "bimax-surgery-cost-1405",
  "blepharoplasty-cost-1405", "bruxism-night-guard", "bsso-lower-jaw-surgery",
  "chin-genderization", "dental-implant-complications", "dental-implant-cost-1405",
  "implant-vs-bridge", "jaw-locking", "jaw-surgery-consultation-checklist",
  "jaw-surgery-cost-1405", "jaw-surgery-insurance", "jaw-surgery-nutrition",
  "jaw-surgery-pain", "jaw-surgery-signs", "jaw-surgery-sleeping",
  "jaw-surgery-statistics", "jaw-surgery-without-orthodontics",
  "lefort-osteotomy-guide", "mouth-protrusion", "wisdom-tooth-surgery-cost-1405",
  "zygomatic-implant-guide",
];
const VALID_LINK_TARGETS = new Set<string>([
  ...PILLARS,
  ...BLOG_ARTICLES.map((a) => `/blog/${a.slug}`),
  ...DB_PUBLISHED_SLUGS.map((s) => `/blog/${s}`),
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

/* ============================================================
   گیت استاندارد ۵ گانه (SEO/AEO/GEO/AIO/SXO) — مخزن مقالات آماده
   پیش از ورود به خط انتشار باید این گیت‌های سخت را پاس کند؛
   وگرنه این اسکریپت (که گیت CI ایجنت روزانه است) با خطا متوقف
   می‌شود و مقاله ناسالم هرگز منتشر نمی‌شود.
   ابعاد «تیتر پرسشی/توپر/جدول-لیست» برای مقاله‌های قدیمی مخزن
   هشدار هستند (در پروژه ارتقای مقالات به‌تدریج رفع می‌شود) و
   برای فایل‌های staging (مقاله‌های جدید) سخت‌گیرانه اعمال می‌شود.
   ============================================================ */

/* جملات مقالات منتشرشده — مرجع یکتایی مخزن (هر فایل pool/staging نباید
   جمله‌ای ۶+ کلمه‌ای مشابه مقاله زنده داشته باشد) */
const publishedSentences = new Set(allSentences.keys());

const POOL_DIRS = ["content-queue/pool", "content-queue/staging"];
const poolIssues: { slug: string; msg: string }[] = [];
const poolWarn: { slug: string; msg: string }[] = [];
const poolSentences = new Map<string, string>();

function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string } | null {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return null;
  const meta: Record<string, string> = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { meta, body: m[2].trim() };
}

/* اهداف لینک معتبر برای مخزن: صفحات زنده + مقالات منتشرشده + خود اسلاگ‌های
   pool/staging (مقاله‌ها به هم لینک می‌دهند و همه در صف انتشار هستند) */
const poolSlugs = new Set<string>();
for (const dir of POOL_DIRS) {
  try {
    for (const f of fs.readdirSync(path.join(ROOT, dir))) {
      if (f.endsWith(".md")) poolSlugs.add(f.replace(/\.md$/, ""));
    }
  } catch { /* dir نیست — بی‌خیال */ }
}
const POOL_VALID_TARGETS = new Set<string>([
  ...PILLARS,
  ...BLOG_ARTICLES.map((a) => `/blog/${a.slug}`),
  ...[...poolSlugs].map((s) => `/blog/${s}`),
]);

for (const dir of POOL_DIRS) {
  const abs = path.join(ROOT, dir);
  let files: string[] = [];
  try {
    files = fs.readdirSync(abs).filter((f) => f.endsWith(".md"));
  } catch {
    continue;
  }
  const isStaging = dir.includes("staging");
  for (const f of files) {
    const slug = f.replace(/\.md$/, "");
    const label = `${dir}/${slug}`;
    const parsed = parseFrontmatter(fs.readFileSync(path.join(abs, f), "utf8"));
    if (!parsed) {
      poolIssues.push({ slug: label, msg: "فرانت‌متر title/excerpt/cover ندارد" });
      continue;
    }
    const { meta, body } = parsed;
    const w = body.replace(/[#>*`\-|]/g, " ").split(/\s+/).filter(Boolean).length;
    if (w < 1500) poolIssues.push({ slug: label, msg: `حجم ${w} < ۱۵۰۰ کلمه` });

    const firstBlock = body.split(/\n\s*\n/).map((g) => g.trim()).find(Boolean) ?? "";
    if (!firstBlock.startsWith(">")) {
      poolIssues.push({ slug: label, msg: "پاسخ کوتاه (بلاک‌کوت اول) ندارد" });
    } else {
      const aw = firstBlock.replace(/^>\s?/, "").replace(/\*\*/g, "").split(/\s+/).filter(Boolean).length;
      if (aw < 25 || aw > 90) poolIssues.push({ slug: label, msg: `پاسخ کوتاه ${aw} کلمه (خارج از ۲۵-۹۰)` });
    }

    const faqN = (body.match(/^### .+/gm) || []).length;
    if (faqN < 4) poolIssues.push({ slug: label, msg: `FAQ فقط ${faqN} سوال` });

    const links = [...body.matchAll(/\]\((\/[^)]*)\)/g)].map((m) => m[1]);
    if (links.length < 5) poolIssues.push({ slug: label, msg: `فقط ${links.length} لینک داخلی` });
    for (const l of new Set(links)) {
      if (!POOL_VALID_TARGETS.has(l))
        poolIssues.push({ slug: label, msg: `لینک نامعتبر: ${l}` });
    }
    if (new Set(links).has(`/blog/${slug}`))
      poolIssues.push({ slug: label, msg: "لینک به خود مقاله" });

    const numsN = (body.match(/[۰-۹0-9]+/g) || []).length;
    if (numsN < 3) poolIssues.push({ slug: label, msg: `عدد/آمار فقط ${numsN} (GEO)` });

    const brandN = (body.match(/دکتر حامد کرمانی|دکتر کرمانی/g) ?? []).length;
    if (brandN < 2) poolIssues.push({ slug: label, msg: `نام دکتر فقط ${brandN} بار` });

    const digitsN = body
      .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
      .replace(/[^0-9]/g, "");
    if (!digitsN.includes("09382080270")) poolIssues.push({ slug: label, msg: "CTA تلفن مطب نیست" });

    if (/`|\$\{|!\[|<[a-z][a-z0-9]*[\s>]/i.test(body))
      poolIssues.push({ slug: label, msg: "الگوی ممنوعه پارسر (بک‌تیک/${/عکس/HTML)" });
    if (/https?:\/\//.test(body)) poolIssues.push({ slug: label, msg: "لینک http خارجی" });

    const cover = meta.cover || "";
    if (!cover || !fs.existsSync(path.join(ROOT, "public", cover)))
      poolIssues.push({ slug: label, msg: `کاور موجود نیست: ${cover || "—"}` });

    /* ابعاد ارتقایی — سخت برای مقاله جدید (staging)، هشدار برای مخزن موجود */
    const qN = (body.match(/^## .+؟/gm) || []).length;
    const boldN = (body.match(/\*\*[^*]+\*\*/g) || []).length;
    const tableN = (body.match(/^\|.+\|/gm) || []).length;
    const listN = (body.match(/^- /gm) || []).length;
    const tier = isStaging ? poolIssues : poolWarn;
    if (qN < 2) tier.push({ slug: label, msg: `تیتر پرسشی ${qN} < ۲ (AEO)` });
    if (boldN < 2) tier.push({ slug: label, msg: `برجسته‌سازی ${boldN} < ۲ (SXO)` });
    if (tableN === 0 && listN < 3) tier.push({ slug: label, msg: "جدول/لیست ندارد (AEO/GEO)" });

    /* یکتایی سراسری بین فایل‌های مخزن + مقالات منتشرشده */
    for (const s of sentences(body)) {
      const n = norm(s);
      const owner = poolSentences.get(n);
      if (owner && owner !== label)
        poolIssues.push({ slug: label, msg: `جمله تکراری با ${owner}: «${s.slice(0, 50)}…»` });
      else poolSentences.set(n, label);
      if (publishedSentences.has(n))
        poolIssues.push({ slug: label, msg: `جمله تکراری با مقاله منتشرشده: «${s.slice(0, 50)}…»` });
    }
  }
}

/* مقاله‌های تکراری بین pool و staging هم خطا هستند */
const stagingNames = new Set(
  (() => {
    try { return fs.readdirSync(path.join(ROOT, "content-queue/staging")).filter((f) => f.endsWith(".md")); } catch { return []; }
  })(),
);
const poolNames = new Set(
  (() => {
    try { return fs.readdirSync(path.join(ROOT, "content-queue/pool")).filter((f) => f.endsWith(".md")); } catch { return []; }
  })(),
);
for (const f of stagingNames)
  if (poolNames.has(f))
    poolIssues.push({ slug: `content-queue/${f}`, msg: "هم در pool هم در staging — یکی را حذف کنید" });

console.log(`\n=== گیت استاندارد ۵ گانه — مخزن مقالات (${[...poolNames, ...stagingNames].length} فایل) ===`);
if (poolIssues.length) {
  console.log(`❌ ${poolIssues.length} خطا:`);
  for (const i of poolIssues) console.log(`   [${i.slug}] ${i.msg}`);
} else {
  console.log("✅ همه فایل‌ها از گیت استاندارد ۵ گانه عبور کردند");
}
if (poolWarn.length) {
  console.log(`\n⚠ ${poolWarn.length} هشدار ارتقا (بعداً رفع می‌شود):`);
  for (const i of poolWarn) console.log(`   [${i.slug}] ${i.msg}`);
}

/* پوشش slug ↔ keywords */
const missingKw = BLOG_ARTICLES.filter((a) => !ARTICLE_KEYWORDS[a.slug]).map((a) => a.slug);
if (missingKw.length) console.log(`\n⚠ بدون کلیدواژه اختصاصی (fallback عمومی): ${missingKw.join(", ")}`);

process.exit(issues.length || poolIssues.length ? 1 : 0);
