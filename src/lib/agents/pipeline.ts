/* ============================================================
   pipeline — ارکستراتور بلاگ روزانه (روزی ۲ مقاله، ۰۷:۰۰ تهران)
   ۵ ایجنت خلاق در creative.ts، انتشار QC در publish.ts.
   حالت‌های اجرا:
   ۱) زمان‌بند درون‌پردازشی سرور (scheduler.ts) — پشتیبان
   ۲) تریگر گیت‌هاب → POST /api/agents/daily (پس‌زمینه ۲۰۲)
   ۳) تولید در رانر GitHub Actions → POST /api/agents/publish
      (وقتی خروجی شبکه هاست به API هوش مصنوعی بسته باشد، مسیر ۳
       مسیر اصلی است — scripts/blog-agent/generate.mjs)
   قفل روزانه + قفل درون‌پردازشی = هیچ روزی دوباره‌کاری نمی‌شود.
   ============================================================ */

import ZAI from "z-ai-web-dev-sdk";
import { db } from "@/lib/db";
import {
  strategistAgent,
  writerAgent,
  seoAgent,
  imageAgentBase64,
} from "@/lib/agents/creative";
import { publishSubmittedArticle, type PublishResult } from "@/lib/agents/publish";
import { nextTopic, type Topic } from "@/lib/agents/topics";

/* روزی ۲ مقاله — طبق درخواست کاربر (۰۷:۰۰ تهران، به ترتیب صف) */
export const ARTICLES_PER_DAY = 2;

/** قفل درون‌پردازشی — تیک زمان‌بند و تریگر API هرگز هم‌زمان اجرا نمی‌شوند */
let runningNow = false;
export function isBusy(): boolean {
  return runningNow;
}

/** اجرای کامل ۵ ایجنت برای یک موضوع — ایزوله؛ خطایش به بقیه روز آسیب نمی‌زند */
async function publishOneTopic(zai: Awaited<ReturnType<typeof ZAI.create>>, topic: Topic): Promise<PublishResult> {
  /* ۱) استراتژیست — با fallback امن */
  let outline: string[];
  let paaQuestions: string[];
  let internalLinks: { anchor: string; href: string }[];
  try {
    const brief = await strategistAgent(zai, topic);
    outline = brief.outline;
    paaQuestions = brief.paaQuestions;
    internalLinks = brief.internalLinks;
    console.log(`${LOG_PREFIX} ✓ استراتژیست — ${outline.length} بخش`);
  } catch (e) {
    console.error(`${LOG_PREFIX} ✗ استراتژیست — fallback:`, (e as Error).message);
    outline = [topic.title, "مزایا و کاربردها", "پرسش های پرتکرار"];
    paaQuestions = [`"${topic.keyword}" چیست و برای چه کسانی مناسب است؟`, "هزینه آن چقدر است؟", "عوارض آن چیست؟", "دوره ریکاوری چقدر است؟"];
    internalLinks = [{ anchor: "خدمات دکتر کرمانی", href: topic.landing }];
  }
  const brief = { angle: topic.brief, outline, paaQuestions, internalLinks, stats: ["بیش از ۱۲۰۰ جراحی فک و صورت توسط دکتر حامد کرمانی انجام شده است"] };

  /* ۲) نویسنده */
  const body = await writerAgent(zai, topic, brief);
  console.log(`${LOG_PREFIX} ✓ نویسنده — ${body.length} کاراکتر`);

  /* ۳) سئوکار */
  const optimized = await seoAgent(zai, topic, { title: topic.title, body });
  console.log(`${LOG_PREFIX} ✓ سئوکار — عنوان: ${optimized.title}`);

  /* اسلاگ یکتا */
  const existing = await db.blogPost.findMany({ select: { title: true, slug: true } });
  let slug = topic.slug;
  if (existing.some((p) => p.slug === slug)) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

  /* ۴) تصویرساز ۳D */
  const coverBase64 = await imageAgentBase64(topic);
  console.log(`${LOG_PREFIX} ✓ تصویرساز — ${coverBase64 ? Math.round(coverBase64.length / 1024) + "KB" : "fallback"}`);

  /* ۵) سردبیر و انتشار */
  const result = await publishSubmittedArticle(
    { slug, title: optimized.title, excerpt: optimized.excerpt || topic.brief.slice(0, 150), body: optimized.body, keyword: topic.keyword },
    { coverBase64 },
  );
  console.log(`${LOG_PREFIX} ${result.ok ? "✓ منتشر شد" : "✗ رد شد"} — ${result.reason}`);
  return result;
}

const LOG_PREFIX = "[agents/daily]";

export async function runDailyBlog(force = false): Promise<PublishResult[] | { skipped: string }> {
  /* قفل درون‌پردازشی — هم‌پوشانی تیک زمان‌بند و تریگر API را می‌بندد */
  if (runningNow) return { skipped: "اجرای قبلی هنوز در جریان است" };
  runningNow = true;
  /* هر خطای توقف‌دهنده در دیتابیس ثبت می‌شود تا از طریق
     GET /api/agents/daily قابل مشاهده باشد — وگرنه خطا فقط در
     stderr.log سرور گم می‌شود و آخرین اجرا همیشه null می‌ماند */
  try {
    return await runDailyBlogInner(force);
  } catch (e) {
    const msg = ((e as Error).message || String(e)).slice(0, 500);
    try {
      await db.setting.upsert({
        where: { key: "agents_last_error" },
        create: { key: "agents_last_error", value: JSON.stringify({ at: new Date().toISOString(), error: msg }) },
        update: { value: JSON.stringify({ at: new Date().toISOString(), error: msg }) },
      });
    } catch { /* دیتابیس هم در دسترس نیست — چیزی برای ثبت نداریم */ }
    throw e;
  } finally {
    runningNow = false;
  }
}

async function runDailyBlogInner(force = false): Promise<PublishResult[] | { skipped: string }> {
  /* قفل روزانه — مگر force (اجرای دستی) */
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tehran" }).format(new Date());
  if (!force) {
    const lastRun = await db.setting.findUnique({ where: { key: "agents_last_run_date" } });
    if (lastRun?.value === today) return { skipped: "امروز قبلا اجرا شده است" };
  }

  /* قفل «قبل از شروع» ثبت می‌شود تا اجرای هم‌زمانِ زمان‌بند + تریگر
     گیت‌هاب هرگز دوباره‌کاری (مقاله تکراری) نسازد؛ اگر هیچ مقاله‌ای
     منتشر نشد، قفل آزاد می‌شود تا تیک بعدی همان روز دوباره تلاش کند */
  await db.setting.upsert({
    where: { key: "agents_last_run_date" },
    create: { key: "agents_last_run_date", value: today },
    update: { value: today },
  });

  const existing = await db.blogPost.findMany({ select: { title: true, slug: true } });
  const zai = await ZAI.create();

  const results: PublishResult[] = [];
  const publishedTitles = existing.map((p) => p.title);
  const publishedSlugs = existing.map((p) => p.slug);

  for (let i = 0; i < ARTICLES_PER_DAY; i++) {
    /* موضوع بعدی — عناوین و اسلاگ‌های همین اجرا هم جزو «منتشرشده» حساب می‌شوند */
    const topic = nextTopic(publishedTitles, publishedSlugs);
    if (!topic) {
      console.log(`${LOG_PREFIX} صف موضوعات خالی است`);
      break;
    }
    console.log(`${LOG_PREFIX} مقاله ${i + 1}/${ARTICLES_PER_DAY}: ${topic.title}`);
    try {
      const r = await publishOneTopic(zai, topic);
      results.push(r);
      if (r.ok) {
        publishedTitles.push(r.title);
        publishedSlugs.push(r.slug);
      }
    } catch (e) {
      console.error(`${LOG_PREFIX} ✗ موضوع «${topic.title}» ناموفق:`, (e as Error).message);
      results.push({ ok: false, reason: `خطا: ${((e as Error).message || "").slice(0, 200)}`, slug: topic.slug, title: topic.title });
    }
  }

  /* اگر هر دو شکست خوردند → قفل روز آزاد شود تا تیک بعدی (تا ۰۹:۵۹) دوباره تلاش کند */
  if (results.length > 0 && results.every((r) => !r.ok)) {
    await db.setting.upsert({
      where: { key: "agents_last_run_date" },
      create: { key: "agents_last_run_date", value: "" },
      update: { value: "" },
    });
  }

  await db.setting.upsert({
    where: { key: "agents_last_result" },
    create: { key: "agents_last_result", value: JSON.stringify({ date: today, count: results.length, results }) },
    update: { value: JSON.stringify({ date: today, count: results.length, results }) },
  });

  return results;
}
