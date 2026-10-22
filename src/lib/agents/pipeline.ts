/* ============================================================
   pipeline — ۵ ایجنت تولید بلاگ روزانه (هر روز ساعت ۷ صبح)
   ============================================================
   ۱) استراتژیست (Strategist)     — بریف محتوایی از روی کلمه کلیدی
   ۲) نویسنده (Writer)            — مقاله کامل فارسی ۱۵۰۰-۲۰۰۰ کلمه
   ۳) سئوکار (SEO/GEO/AEO)        — بازنویسی متا + رعایت قوانین
   ۴) تصویرساز ۳D (Visual)        — کاور سه‌بعدی متناسب با موضوع
   ۵) سردبیر (Editor/QC+Publish)  — کنترل کیفیت نهایی و انتشار

   قوانین ثابت (docs/seo/keyword-plan.md):
   پاسخ مستقیم ۴۰-۶۰ کلمه در ابتدا، اعداد داخل جمله، FAQ با ۴+ سوال،
   CTA بعد از پاسخ و انتهای مقاله، لینک داخلی به صفحه BOFU، نام
   دکتر کرمانی و فلوشیپ کرانیوفاسیال در ۳ جای مقاله.
   ============================================================ */

import ZAI from "z-ai-web-dev-sdk";
import { db } from "@/lib/db";
import { uploadsDir } from "@/lib/uploads-dir";
import { SITE } from "@/lib/data";
import { countWords, repeatedSentences } from "@/lib/agents/uniqueness";
import { nextTopic, type Topic } from "@/lib/agents/topics";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";

const PHONE = SITE.phoneDisplay;

type Brief = {
  angle: string;
  outline: string[];
  paaQuestions: string[];
  internalLinks: { anchor: string; href: string }[];
  stats: string[];
};

type Draft = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  keyword: string;
};

/** قفل درون‌پردازشی — تیک زمان‌بند و تریگر API هرگز هم‌زمان اجرا نمی‌شوند */
let runningNow = false;
export function isBusy(): boolean {
  return runningNow;
}

async function chat(zai: Awaited<ReturnType<typeof ZAI.create>>, system: string, user: string): Promise<string> {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const completion = await zai.chat.completions.create({
        messages: [
          { role: "assistant", content: system },
          { role: "user", content: user },
        ],
        thinking: { type: "disabled" },
      });
      const text = completion.choices[0]?.message?.content ?? "";
      if (!text.trim()) throw new Error("پاسخ خالی از مدل زبانی");
      return text;
    } catch (e) {
      if (attempt >= 2) throw e;
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
  throw new Error("unreachable");
}

/** استخراج JSON از خروجی مدل — مقاوم به فنس و متن اضافه */
function parseJsonLoose<T>(raw: string): T {
  let s = raw.trim();
  s = s.replace(/^```(?:json)?\s*/m, "").replace(/```\s*$/m, "").trim();
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("JSON یافت نشد");
  return JSON.parse(s.slice(start, end + 1)) as T;
}

/* ---------------- ۱) ایجنت استراتژیست ---------------- */
async function strategistAgent(zai: Awaited<ReturnType<typeof ZAI.create>>, topic: Topic): Promise<Brief> {
  const raw = await chat(
    zai,
    "استراتژیست محتوای سئو برای سایت دکتر حامد کرمانی (جراح فک و صورت، فلوشیپ کرانیوفاسیال) هستی. فقط JSON معتبر بده، بدون هیچ متن اضافه.",
    `برای مقاله با کلمه کلیدی «${topic.keyword}» و موضوع «${topic.title}» یک بریف JSON بساز.
بریف محتوایی اولیه: ${topic.brief}
صفحه فرود هدف: ${topic.landing} (نیت: ${topic.intent} — قیف: ${topic.funnel})
خروجی دقیقا با این شکل JSON:
{"angle":"یک جمله زاویه تخصصی","outline":["H2 اول","H2 دوم",...,"پرسش های پرتکرار"],"paaQuestions":["سوال People Also Ask ۱","۲","۳","۴"],"internalLinks":[{"anchor":"متن لینک","href":"${topic.landing}"}],"stats":["یک آمار واقعی از تجربه دکتر کرمانی مثل ۱۲۰۰ جراحی فک","آمار مطالعات بین المللی مرتبط"]}`,
  );
  const json = parseJsonLoose<Brief>(raw);
  return json as Brief;
}

/* ---------------- ۲) ایجنت نویسنده ---------------- */
async function writerAgent(zai: Awaited<ReturnType<typeof ZAI.create>>, topic: Topic, brief: Brief): Promise<string> {
  return chat(
    zai,
    `نویسنده ارشد محتوای پزشکی به زبان فارسی برای وبسایت دکتر حامد کرمانی (متخصص جراحی فک و صورت، فلوشیپ کرانیوفاسیال دانشگاه تهران) هستی.
قوانین الزامی:
- خروجی فقط مارک‌داون خام (بدون توضیح اضافه، بدون بلوک کد)
- خط اول حتما بلاک‌کوت «پاسخ مستقیم» ۴۰ تا ۶۰ کلمه‌ای با یک عدد مشخص، با > شروع شود
- حداقل ۱۵۰۰ کلمه؛ پاراگراف‌های ۳-۵ جمله‌ای
- ساختار: بعد از بلاک‌کوت یک پاراگراف مقدمه، بعد H2 ها با ## و زیربخش با ### (دقیقا طبق بریف)
- آمار و اعداد داخل جمله‌ها (نه جدول جدا) — مدل های زبانی اعداد را بهتر نقل می کنند
- نام «دکتر حامد کرمانی» یا «فلوشیپ کرانیوفاسیال» حداقل در ۳ جای متن بیاید
- بعد از پاسخ کوتاه یک CTA کوتاه با شماره ${PHONE} بیاید
- انتهای مقاله: H2 «جمع بندی و گام بعدی» با CTA تماس ${PHONE} و واتسپ
- بخش آخر با H2 «پرسش های پرتکرار» شامل حداقل ۴ سوال (### سوال) و پاسخ ۵۰ کلمه ای — سوالات از بریف
- بدون ادعای قطعی پزشکی؛ تاکید بر مشاوره حضوری
قوانین یکتایی و سبک (غیرقابل گذشت):
- تک‌تک جمله‌ها باید اختصاصی همین سایت نوشته شوند؛ کپی یا ترجمه تحت‌اللفظی از هیچ سایت یا منبعی مطلقا ممنوع
- اگر از دانش منابع عمومی استفاده می کنی، مفهوم را هضم کن و با جمله‌بندی، ترتیب و واژگان کاملا متفاوت بازگو کن که انگار دکتر کرمانی خودش برای بیمارانش نوشته
- هیچ جمله‌ای نباید با الگوهای رایج محتوای کپی‌شده شباهت کلمه‌به‌کلمه داشته باشد (کپی‌رایت صفر)
- مقاله نباید خسته‌کننده باشد: روایت طبیعی، مثال واقعی از مطب (بدون ذکر مشخصات بیمار)، تشبیه ساده برای مفاهیم پیچیده، تنوع طول جمله‌ها، و پرهیز از فهرست‌های خشک پشت سر هم
- لحن صمیمی-محترمانه دوم‌شخص («شما»)؛ هر بخش باید یک نکته عملی یا عدد مشخص داشته باشد`,
    `موضوع: ${topic.title}
کلمه کلیدی کانونی: ${topic.keyword} (در H1، اولین پاراگراف و حداقل دو H2 استفاده شود)
کلمات مرتبط: ${topic.related.join("، ")}
بریف: ${JSON.stringify(brief, null, 1)}`,
  );
}

/* ---------------- ۳) ایجنت سئوکار (GEO/AEO) — دو فراخوانی مقاوم ---------------- */
async function seoAgent(zai: Awaited<ReturnType<typeof ZAI.create>>, topic: Topic, draft: { title: string; body: string }): Promise<{ title: string; excerpt: string; body: string }> {
  /* متا — JSON کوچک و امن */
  let title = draft.title;
  let excerpt = "";
  try {
    const metaRaw = await chat(
      zai,
      "متخصص سئو فارسی هستی. فقط JSON معتبر با دو کلید بده.",
      `برای مقاله با موضوع «${draft.title}» و کلمه کلیدی «${topic.keyword}» این دو را بساز:
{"title":"عنوان سئو ۵۵ تا ۶۵ کاراکتری با کلمه کلیدی در ابتدا","excerpt":"توضیح متا ۱۳۰ تا ۱۵۵ کاراکتری با کلمه کلیدی و یک عدد مشخص"}`,
    );
    const meta = parseJsonLoose<{ title: string; excerpt: string }>(metaRaw);
    if (meta.title?.trim()) title = meta.title.trim();
    if (meta.excerpt?.trim()) excerpt = meta.excerpt.trim();
  } catch (e) {
    console.error("[agents/seo] متا ناموفق — عنوان پیش‌فرض:", (e as Error).message);
  }

  /* بدنه — بازنویسی مارک‌داون خام (بدون JSON — مقاوم) */
  let body = draft.body;
  try {
    body = await chat(
      zai,
      `سردبیر سئو و GEO/AEO فارسی هستی. فقط مارک‌داون خام خروجی بده (بدون توضیح، بدون بلوک کد).
قوانین: ساختار و همه H2/H3 حفظ شود؛ لینک داخلی مارک‌داون به ${topic.landing} در جای طبیعی بیفزا؛ اگر شماره ۰۹۳۸-۲۰۸۰۲۷۰ در متن نیست اضافه کن؛ آمار و اعداد داخل جمله‌ها حفظ شود؛ طول را حفظ یا کمی بیشتر کن؛ پاسخ کوتاه ابتدایی (بلاک‌کوت >) حفظ شود؛ بخش پرسش های پرتکرار با حداقل ۴ سوال ### حفظ/تکمیل شود؛ نام دکتر کرمانی یا فلوشیپ کرانیوفاسیال حداقل ۳ بار.`,
      draft.body,
    );
    body = body.replace(/^```(?:markdown)?\s*/m, "").replace(/```\s*$/m, "").trim();
    if (body.length < 3000) throw new Error("بدنه کوتاه غیرعادی");
  } catch (e) {
    console.error("[agents/seo] بدنه ناموفق — نسخه نویسنده حفظ شد:", (e as Error).message);
    body = draft.body;
  }
  return { title, excerpt, body };
}

/* ---------------- ۴) ایجنت تصویرساز ۳D ---------------- */
async function imageAgent(topic: Topic): Promise<string> {
  const prompt = `Professional 3D medical illustration, ${topic.keyword}, human jaw and facial skeleton anatomy, isometric 3D render style, soft studio lighting, dark lacquer background with warm gold accents, premium medical website cover, clean composition, high quality, detailed, no text, no watermark`;
  const zai = await ZAI.create();
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await zai.images.generations.create({ prompt, size: "1344x768" });
      const b64 = res?.data?.[0]?.base64;
      if (!b64) throw new Error("تصویری از API نرسید");
      const dir = uploadsDir();
      await mkdir(dir, { recursive: true });
      const name = `a${createHash("md5").update(topic.slug).digest("hex").slice(0, 24)}.png`;
      await writeFile(path.join(dir, name), Buffer.from(b64, "base64"));
      return `/uploads/${name}`;
    } catch (e) {
      console.error(`[agents/image] attempt ${attempt} failed:`, (e as Error).message);
    }
  }
  /* fallback — کاورهای موجود سایت */
  const pool = [
    "/images/blog/bimax-surgery.jpg",
    "/images/blog/monomax-surgery.jpg",
    "/images/blog/jaw-contouring.jpg",
    "/images/blog/gummy-smile.jpg",
  ];
  return pool[topic.slug.length % pool.length];
}

/* ---------------- ۵) ایجنت سردبیر (QC + انتشار) ---------------- */
export type PublishResult = {
  ok: boolean;
  reason: string;
  slug: string;
  title: string;
};

async function editorAgent(draft: Draft, cover: string): Promise<PublishResult> {
  const words = countWords(draft.body);
  const hasAnswer = draft.body.trimStart().startsWith(">");
  const faqCount = (draft.body.match(/^### .+/gm) || []).length;
  const hasCta = draft.body.includes(PHONE);
  const nameMention = /کرمانی|کرانیوفاسیال/.test(draft.body);

  const checks: [string, boolean][] = [
    ["طول مقاله زیر ۱۵۰۰ کلمه است", words < 1500],
    ["پاسخ مستقیم ابتدای مقاله ندارد", !hasAnswer],
    ["FAQ کمتر از ۴ سوال دارد", faqCount < 4],
    ["CTA تماس ندارد", !hasCta],
    ["نام دکتر/فلوشیپ در متن نیست", !nameMention],
    ["عنوان کوتاه یا خالی است", draft.title.trim().length <= 10],
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

  const dateFa = new Intl.DateTimeFormat("fa-IR", { year: "numeric", month: "long", day: "numeric" }).format(new Date());
  await db.blogPost.upsert({
    where: { slug: draft.slug },
    create: { slug: draft.slug, title: draft.title, excerpt: draft.excerpt, body: draft.body, cover, date: dateFa, published: true },
    update: { title: draft.title, excerpt: draft.excerpt, body: draft.body, cover, published: true },
  });
  return { ok: true, reason: `منتشر شد (${words} کلمه، ${faqCount} سوال FAQ)`, slug: draft.slug, title: draft.title };
}

/* ---------------- ارکستراتور روزانه ---------------- */
const LOG_PREFIX = "[agents/daily]";

/* روزی ۲ مقاله — طبق درخواست کاربر (۰۷:۰۰ تهران، به ترتیب صف) */
export const ARTICLES_PER_DAY = 2;

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

/** اجرای کامل ۵ ایجنت برای یک موضوع — ایزوله؛ خطایش به بقیه روز آسیب نمی‌زند */
async function publishOneTopic(
  zai: Awaited<ReturnType<typeof ZAI.create>>,
  topic: Topic,
  existingTitles: string[],
): Promise<PublishResult> {
  /* ۱) استراتژیست — با fallback امن */
  let brief: Brief;
  try {
    brief = await strategistAgent(zai, topic);
    console.log(`${LOG_PREFIX} ✓ استراتژیست — ${brief.outline.length} بخش`);
  } catch (e) {
    console.error(`${LOG_PREFIX} ✗ استراتژیست — fallback:`, (e as Error).message);
    brief = {
      angle: topic.brief,
      outline: [topic.title, "مزایا و کاربردها", "پرسش های پرتکرار"],
      paaQuestions: [`"${topic.keyword}" چیست و برای چه کسانی مناسب است؟`, "هزینه آن چقدر است؟", "عوارض آن چیست؟", "دوره ریکاوری چقدر است؟"],
      internalLinks: [{ anchor: "خدمات دکتر کرمانی", href: topic.landing }],
      stats: ["بیش از ۱۲۰۰ جراحی فک و صورت توسط دکتر حامد کرمانی انجام شده است"],
    };
  }

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
  const cover = await imageAgent(topic);
  console.log(`${LOG_PREFIX} ✓ تصویرساز — ${cover}`);

  /* ۵) سردبیر و انتشار */
  const result = await editorAgent(
    { slug, title: optimized.title, excerpt: optimized.excerpt || topic.brief.slice(0, 150), body: optimized.body, keyword: topic.keyword },
    cover,
  );
  console.log(`${LOG_PREFIX} ${result.ok ? "✓ منتشر شد" : "✗ رد شد"} — ${result.reason}`);
  void existingTitles;
  return result;
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

  for (let i = 0; i < ARTICLES_PER_DAY; i++) {
    /* موضوع بعدی — عناوین همین اجرا هم جزو «منتشرشده» حساب می‌شوند */
    const topic = nextTopic(publishedTitles);
    if (!topic) {
      console.log(`${LOG_PREFIX} صف موضوعات خالی است`);
      break;
    }
    console.log(`${LOG_PREFIX} مقاله ${i + 1}/${ARTICLES_PER_DAY}: ${topic.title}`);
    try {
      const r = await publishOneTopic(zai, topic, publishedTitles);
      results.push(r);
      if (r.ok) publishedTitles.push(r.title);
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
