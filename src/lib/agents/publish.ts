/* ============================================================
   publish — سردبیر QC + انتشار مقاله (مشترک سرور و تریگر گیت‌هاب)
   ۱) کنترل کیفیت (طول، پاسخ مستقیم، FAQ، CTA، نام برند، لینک داخلی،
      الگوهای ممنوعه پارسر — قرارداد docs/standards.md)
   ۲) چک یکتایی جملات با مقالات موجود (uniqueness.ts)
   ۳) ذخیره کاور و upsert در دیتابیس → سایت‌مپ/llms.txt خودکار
   ============================================================ */

import { db } from "@/lib/db";
import { uploadsDir } from "@/lib/uploads-dir";
import { countWords, repeatedSentences } from "@/lib/agents/uniqueness";
import { PHONE } from "@/lib/agents/creative";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";

export type PublishResult = {
  ok: boolean;
  reason: string;
  slug: string;
  title: string;
};

export type SubmittedArticle = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  keyword: string;
};

export type CoverInput = {
  /** مسیر کاور از قبل موجود (مثلاً /images/agent/xxx.png از مخزن مقالات آماده) */
  coverPath?: string;
  /** یا تصویر base64 تولیدشده توسط ایجنت تصویرساز */
  coverBase64?: string;
};

async function saveCover(slug: string, cover: CoverInput): Promise<string> {
  if (cover.coverPath && cover.coverPath.startsWith("/")) return cover.coverPath;
  if (cover.coverBase64 && cover.coverBase64.length > 1000) {
    try {
      const dir = uploadsDir();
      await mkdir(dir, { recursive: true });
      const name = `a${createHash("md5").update(slug).digest("hex").slice(0, 24)}.png`;
      await writeFile(path.join(dir, name), Buffer.from(cover.coverBase64 as string, "base64"));
      return `/uploads/${name}`;
    } catch (e) {
      console.error("[agents/publish] ذخیره کاور ناموفق:", (e as Error).message);
    }
  }
  /* fallback — کاورهای موجود سایت */
  const pool = [
    "/images/blog/bimax-surgery.jpg",
    "/images/blog/monomax-surgery.jpg",
    "/images/blog/jaw-contouring.jpg",
    "/images/blog/gummy-smile.jpg",
  ];
  return pool[slug.length % pool.length];
}

/** تاریخ شمسی امروز — فقط متادیتای داخلی (نمایش داده نمی‌شود) */
function todayJalali(): string {
  return new Intl.DateTimeFormat("fa-IR", { timeZone: "Asia/Tehran", year: "numeric", month: "long", day: "numeric" }).format(new Date());
}

export async function publishSubmittedArticle(draft: SubmittedArticle, cover: CoverInput = {}): Promise<PublishResult> {
  const words = countWords(draft.body);
  const hasAnswer = draft.body.trimStart().startsWith(">");
  const faqCount = (draft.body.match(/^### .+/gm) || []).length;
  const hasCta = draft.body.includes(PHONE);
  const nameMention = /کرمانی|کرانیوفاسیال/.test(draft.body);
  /* لینک داخلی — قرارداد standards: حداقل ۴ لینک به صفحات سایت */
  const internalLinks = (draft.body.match(/\]\((\/[^)]*)\)/g) || []).length;
  /* الگوهای ممنوعه — پارسر بدنه تحمل نمی‌کند: بک‌تیک، ${}، تگ HTML،
     عکس مارک‌داون و لینک http خارجی (docs/standards.md بند ۳) */
  const hasForbidden = /`|\$\{|!\[|\]\(https?:|<\/?[a-zA-Z][^>]*>/.test(draft.body);

  /* مقاله موجود در حال به‌روزرسانی است؟ (فیکس محتوایی مقاله‌های قدیمی)
     گیت‌های سقف کلمه و آمار فقط برای مقاله تازه سخت است — مقاله‌های
     جامع قدیمی نباید برای به‌روزرسانی خوانایی تکه‌ شوند. بقیه گیت‌ها
     (پاسخ/FAQ/لینک/توپر/CTA/یکتایی) برای به‌روزرسانی هم برقرار است. */
  const existingPost = await db.blogPost
    .findUnique({ where: { slug: draft.slug }, select: { slug: true } })
    .catch(() => null);
  const isUpdate = Boolean(existingPost);

  /* ---- گیت‌های AEO/SXO — claude-seo quality gates (docs/seo/content-pipeline.md) ---- */
  /* AEO-۱: پاسخ مستقیم باید ۲۵–۹۰ کلمه باشد (نه صرفاً وجودش) */
  const answerLine = draft.body.split("\n").find((l) => l.trimStart().startsWith(">")) ?? "";
  const answerWords = countWords(answerLine.replace(/^>\s?/, ""));
  /* AEO-۲: تیتر پرسشی — H2/H3 با «؟» (FAQ چهار سوال پایانی خودش این را پر می‌کند) */
  const qHeadings = (draft.body.match(/^#{2,3} .+؟/gm) || []).length;
  /* GEO/AEO-۳: آمار قابل‌استناد — حداقل ۳ عدد داخل جمله */
  const numbers = (draft.body.match(/[۰-۹0-9]+/g) || []).length;
  /* SXO-۴: لینک BOFU — حداقل یک لینک داخلی به صفحه تبدیل */
  const bofuLinks = (draft.body.match(/\]\((\/(costs|appointment|contact|jaw-surgery|chin-surgery|dental-implant|implant-pasdaran|gallery)[^)]*)\)/g) || []).length;
  /* SXO-۵: برجسته‌سازی — حداقل ۲ توپر (اسکن‌پذیری) */
  const bolds = (draft.body.match(/\*\*[^*]+\*\*/g) || []).length;

  const checks: [string, boolean][] = [
    ["طول مقاله زیر ۱۴۰۰ کلمه است (سقف کیفیت claude-seo: ۱۵۰۰)", !isUpdate && words >= 1400],
    ["پاسخ مستقیم ابتدای مقاله ندارد", !hasAnswer],
    ["پاسخ مستقیم خارج از بازه ۲۵–۹۰ کلمه است (AEO)", hasAnswer && (answerWords < 25 || answerWords > 90)],
    ["FAQ کمتر از ۴ سوال دارد", faqCount < 4],
    ["تیتر پرسشی کمتر از ۲ مورد — H2/H3 با «؟» (AEO)", qHeadings < 2],
    ["کمتر از ۳ عدد/آمار داخل جمله دارد (GEO)", !isUpdate && numbers < 3],
    ["لینک BOFU ندارد (SXO)", bofuLinks < 1],
    ["برجسته‌سازی ** کمتر از ۲ مورد (SXO خوانایی)", bolds < 2],
    ["CTA تماس ندارد", !hasCta],
    ["نام دکتر/فلوشیپ در متن نیست", !nameMention],
    ["عنوان کوتاه یا خالی است", draft.title.trim().length <= 10],
    ["کمتر از ۴ لینک داخلی دارد", internalLinks < 4],
    ["الگوی ممنوعه پارسر دارد (بک‌تیک/${/تگ HTML/لینک http/عکس مارک‌داون)", hasForbidden],
  ];

  /* چک یکتایی — جملات مقاله نباید با مقالات موجود مشترک باشد */
  try {
    const existingBodies = (
      await db.blogPost.findMany({ where: { slug: { not: draft.slug } }, select: { body: true } })
    ).map((p) => p.body);
    const dups = repeatedSentences(draft.body, existingBodies);
    if (dups.length) {
      checks.push([`جملات تکراری با محتوای موجود: «${dups.slice(0, 2).join("» و «")}»`, true]);
    }
  } catch {
    /* دیتابیس در دسترس نیست — چک یکتایی رد می‌شود */
  }

  const failed = checks.filter(([, bad]) => bad);
  if (failed.length) {
    return { ok: false, reason: `سردبیر رد کرد: ${failed.map(([r]) => r).join(" | ")}`, slug: draft.slug, title: draft.title };
  }

  const coverResolved = await saveCover(draft.slug, cover);
  await db.blogPost.upsert({
    where: { slug: draft.slug },
    create: { slug: draft.slug, title: draft.title, excerpt: draft.excerpt, body: draft.body, cover: coverResolved, date: todayJalali(), published: true },
    update: { title: draft.title, excerpt: draft.excerpt, body: draft.body, cover: coverResolved, published: true },
  });
  return { ok: true, reason: `منتشر شد (${words} کلمه، ${faqCount} سوال FAQ)`, slug: draft.slug, title: draft.title };
}
