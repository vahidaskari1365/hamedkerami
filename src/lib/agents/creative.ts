/* ============================================================
   creative — ۴ ایجنت خلاق (بدون وابستگی به دیتابیس/سرور)
   استراتژیست → نویسنده → سئوکار (GEO/AEO) → تصویرساز ۳D
   هم روی سرور (pipeline.ts) و هم در رانر GitHub Actions
   (scripts/blog-agent) استفاده می‌شود.
   قوانین ثابت (docs/seo/keyword-plan.md + geo-optimizer-skill):
   پاسخ مستقیم ۴۰-۶۰ کلمه در ابتدا، اعداد داخل جمله، FAQ با ۴+ سوال،
   CTA بعد از پاسخ و انتهای مقاله، لینک داخلی به صفحه BOFU، نام
   دکتر کرمانی و فلوشیپ کرانیوفاسیال در ۳ جای مقاله، بدون تاریخ نمایشی.
   ============================================================ */

import ZAI from "z-ai-web-dev-sdk";
import type { Topic } from "@/lib/agents/topics";

export const PHONE = "۰۹۳۸-۲۰۸۰۲۷۰";

export type Brief = {
  angle: string;
  outline: string[];
  paaQuestions: string[];
  internalLinks: { anchor: string; href: string }[];
  stats: string[];
};

export type Draft = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  keyword: string;
};

export async function chat(zai: Awaited<ReturnType<typeof ZAI.create>>, system: string, user: string): Promise<string> {
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
export function parseJsonLoose<T>(raw: string): T {
  let s = raw.trim();
  s = s.replace(/^```(?:json)?\s*/m, "").replace(/```\s*$/m, "").trim();
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("JSON یافت نشد");
  return JSON.parse(s.slice(start, end + 1)) as T;
}

/* ---------------- ۱) ایجنت استراتژیست ---------------- */
export async function strategistAgent(zai: Awaited<ReturnType<typeof ZAI.create>>, topic: Topic): Promise<Brief> {
  const raw = await chat(
    zai,
    "استراتژیست محتوای سئو برای سایت دکتر حامد کرمانی (جراح فک و صورت، فلوشیپ کرانیوفاسیال) هستی. فقط JSON معتبر بده، بدون هیچ متن اضافه.",
    `برای مقاله با کلمه کلیدی «${topic.keyword}» و موضوع «${topic.title}» یک بریف JSON بساز.
بریف محتوایی اولیه: ${topic.brief}
صفحه فرود هدف: ${topic.landing} (نیت: ${topic.intent} — قیف: ${topic.funnel})
خروجی دقیقا با این شکل JSON:
{"angle":"یک جمله زاویه تخصصی","outline":["H2 اول","H2 دوم",...,"پرسش های پرتکرار"],"paaQuestions":["سوال People Also Ask ۱","۲","۳","۴"],"internalLinks":[{"anchor":"متن لینک","href":"${topic.landing}"}],"stats":["یک آمار واقعی از تجربه دکتر کرمانی مثل ۱۲۰۰ جراحی فک","آمار مطالعات بین المللی مرتبط"]}`,
  );
  return parseJsonLoose<Brief>(raw);
}

/* ---------------- ۲) ایجنت نویسنده ---------------- */
export async function writerAgent(zai: Awaited<ReturnType<typeof ZAI.create>>, topic: Topic, brief: Brief): Promise<string> {
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
- هیچ تاریخ یا سالِ انتشار در متن نیاور (عدد سال فقط اگر بخش طبیعی کلمه کلیدی باشد)
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
export async function seoAgent(
  zai: Awaited<ReturnType<typeof ZAI.create>>,
  topic: Topic,
  draft: { title: string; body: string },
): Promise<{ title: string; excerpt: string; body: string }> {
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
قوانین: ساختار و همه H2/H3 حفظ شود؛ لینک داخلی مارک‌داون به ${topic.landing} در جای طبیعی بیفزا؛ اگر شماره ${PHONE} در متن نیست اضافه کن؛ آمار و اعداد داخل جمله‌ها حفظ شود؛ طول را حفظ یا کمی بیشتر کن؛ پاسخ کوتاه ابتدایی (بلاک‌کوت >) حفظ شود؛ بخش پرسش های پرتکرار با حداقل ۴ سوال ### حفظ/تکمیل شود؛ نام دکتر کرمانی یا فلوشیپ کرانیوفاسیال حداقل ۳ بار؛ هیچ تاریخ انتشار اضافه نکن.`,
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

/* ---------------- ۴) ایجنت تصویرساز ۳D — خروجی base64 ---------------- */
export async function imageAgentBase64(topic: Topic): Promise<string> {
  const prompt = `Professional 3D medical illustration, ${topic.keyword}, human jaw and facial skeleton anatomy, isometric 3D render style, soft studio lighting, dark lacquer background with warm gold accents, premium medical website cover, clean composition, high quality, detailed, no text, no watermark`;
  const zai = await ZAI.create();
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await zai.images.generations.create({ prompt, size: "1344x768" });
      const b64 = res?.data?.[0]?.base64;
      if (!b64) throw new Error("تصویری از API نرسید");
      return b64;
    } catch (e) {
      console.error(`[agents/image] attempt ${attempt} failed:`, (e as Error).message);
    }
  }
  return "";
}
