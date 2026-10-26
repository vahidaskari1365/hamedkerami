import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { ARTICLE_KEYWORDS } from "../src/lib/seo-keywords";
import { BLOG_ARTICLES } from "../src/lib/blog-articles";

/* ============================================================
   apply-kw-fixes — تزریق کلمه کانونی در ۵ جایگاه رتبه‌بندی
   (عنوان / چکیده / پاراگراف اول / H2 / بدنه) روی نسخه زنده
   پروداکشن یعنی فایل‌های content-fixes/*.md
   - appendToFirstPara: جمله یکتای جدید در انتهای پاراگراف اول
   - h2: تغییر نام یک H2 برای پوشش دقیق کلمه کانونی
   - title/excerpt: فرانت‌متر اختیاری برای publish-upgrades
   jaw-asymmetry در content-fixes نبود → بدنه سید + فرانت‌متر
   اجرا: npx tsx scripts/apply-kw-fixes.ts
   ============================================================ */

type Fix = {
  appendToFirstPara?: string;
  h2?: [string, string];
  title?: string;
  excerpt?: string;
};

const FIXES: Record<string, Fix> = {
  "facial-contouring": {
    appendToFirstPara:
      "در این راهنمای، همه کاربردهای جراحی زیبایی فک و صورت از زاویه فک تا چانه و گونه یک جا مرور می شود.",
  },
  "v-line-jaw-reduction": {
    appendToFirstPara:
      "کوچک کردن زاویه فک با هر دو روش ممکن است؛ تفاوت اصلی در دائمی بودن نتیجه و مرز انتخاب کاندید است.",
    h2: [
      "## مقایسه دوام، هزینه چندساله و نتیجه",
      "## مقایسه دو روش برای کوچک کردن زاویه فک؛ دوام و هزینه چندساله",
    ],
  },
  "jaw-botox-masseter": {
    appendToFirstPara:
      "بوتاکس فک زمانی جواب می دهد که علت چهارگوش بودن صورت، عضله ماستر پرکار باشد و همین مرز را در ادامه روشن می کنیم.",
  },
  "genioplasty-cost": {
    appendToFirstPara:
      "هزینه جنیوپلاستی در ادامه با اقلام واقعی فاکتور، متغیرهای قیمت و نقش بیمه شفاف شده است.",
  },
  "tmj-pain-treatment": {
    appendToFirstPara:
      "درد مفصل فک الگوهای متفاوتی دارد و تشخیص درست الگو، اولین پله درمان پله ای است.",
    h2: ["## آناتومی مفصل فک؛ استخوان، دیسک و عضله", "## آناتومی درد مفصل فک؛ استخوان، دیسک و عضله"],
  },
  "jaw-surgery-age": {
    appendToFirstPara:
      "سن مناسب جراحی فک را نمی توان با یک عدد خلاصه کرد؛ مرز واقعی، پایان رشد استخوان فک است.",
    h2: ["## بازه طلایی ۱۸ تا ۳۵ سال", "## بازه طلایی سن مناسب جراحی فک؛ ۱۸ تا ۳۵ سال"],
  },
  "maxillofacial-vs-plastic-surgeon": {
    h2: [
      "## جدول مقایسه؛ جراح فک و صورت یا جراح پلاستیک؟",
      "## جدول تفاوت جراح فک و صورت با جراح پلاستیک کدام است؟",
    ],
  },
  "jaw-surgery-orthodontics": {
    h2: ["## جدول فازهای درمان ترکیبی", "## جدول فازهای درمان ترکیبی جراحی فک و ارتودنسی"],
  },
  "sleep-apnea-mma-surgery": {
    appendToFirstPara:
      "جراحی آپنه خواب با روش MMA بزرگ ترین افزایش ممکن راه هوایی را در یک عمل فراهم می کند.",
  },
  "jaw-fracture-surgery": {
    appendToFirstPara:
      "شکستگی فک اگر زود تشخیص داده شود، با یک عمل پلاک گذاری تیتانیوم به گاز گرفتن اصلی برمی گردد.",
  },
  "jaw-surgery-before-after": {
    appendToFirstPara:
      "نمونه های جراحی فک قبل و بعد وقتی با معیار درست تفسیر شوند، بهترین ابزار شکل دادن به انتظار واقع بینانه شماست.",
    h2: [
      "## چگونه عکس های قبل و بعد را درست بخوانیم؟",
      "## چگونه عکس های جراحی فک قبل و بعد را درست بخوانیم؟",
    ],
    excerpt:
      "جراحی فک قبل و بعد چقدر تفاوت ایجاد می کند؟ بررسی تصویری تغییرات پروفایل، تناسب سه قسم صورت و نتایج واقعی بیماران جراحی ارتوگناتیک به همراه زمان لازم برای دیدن نتیجه نهایی.",
  },
  "jaw-surgery-complications": {
    appendToFirstPara:
      "عوارض جراحی فک در سه دسته گذرا، کم شایع و نادر مدیریت می شوند و هر دسته پیشگیری مخصوص خود را دارد.",
    h2: ["## جدول نرخ تقریبی عوارض", "## جدول نرخ تقریبی عوارض جراحی فک"],
  },
  "jaw-surgery-recovery-care": {
    appendToFirstPara:
      "مراقبت بعد از جراحی فک را بهتر است از همین امروز، چند هفته پیش از عمل، برنامه ریزی کنید.",
    h2: [
      "## مقایسه نقاهت جراحی فک با سایر جراحی های دهان و فک",
      "## مراقبت بعد از جراحی فک در مقایسه با سایر جراحی های دهان و فک",
    ],
    excerpt:
      "راهنمای کامل مراقبت بعد از جراحی فک: رژیم غذایی مرحله ای، نحوه خوابیدن، بهداشت دهان، تمرینات باز کردن دهان و علائم هشدار؛ تقویم هفته به هفته از روز جراحی تا بازگشت کامل.",
  },
  "best-jaw-surgeon-tehran": {
    appendToFirstPara:
      "بهترین جراح فک و صورت در تهران کسی نیست که بیشترین تبلیغ را دارد؛ کسی است که بیشترین جراحی مشابه با پرونده شما را انجام داده باشد.",
    h2: [
      "## چک لیست مشاوره جراحی فک؛ این سوالات را بپرسید",
      "## چک لیست مشاوره برای انتخاب بهترین جراح فک و صورت در تهران",
    ],
    excerpt:
      "چگونه بهترین جراح فک و صورت در تهران را انتخاب کنیم؟ معیارهای واقعی: بورد تخصصی، تعداد جراحی مشابه، برنامه ریزی دیجیتال، نمونه کار قبل و بعد و سوالاتی که باید در مشاوره بپرسید.",
  },
  "jaw-asymmetry": {
    title: "فک کج (نامتقارنی فک) چیست و چگونه اصلاح می شود؟",
  },
};

/* ---------- ابزار نرمال‌سازی و بررسی ---------- */
function norm(s: string): string {
  return s
    .replace(/[\u064B-\u0652\u0670]/g, "")
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/\u200c/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function splitFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: raw };
  const meta: Record<string, string> = {};
  for (const line of m[1].split(/\r?\n/)) {
    const km = line.match(/^(title|excerpt|cover):\s*(.*)$/);
    if (km) meta[km[1]] = km[2].trim();
  }
  return { meta, body: m[2] };
}

/* ---------- اعمال ---------- */
let okCount = 0;
const problems: string[] = [];

for (const [slug, fix] of Object.entries(FIXES)) {
  const path = `content-fixes/${slug}.md`;
  let meta: Record<string, string> = {};
  let body: string;

  if (existsSync(path)) {
    const raw = readFileSync(path, "utf-8");
    const parsed = splitFrontmatter(raw);
    meta = parsed.meta;
    body = parsed.body;
  } else {
    /* فقط jaw-asymmetry — بدنه سید + فرانت‌متر جدید */
    const seed = BLOG_ARTICLES.find((a) => a.slug === slug);
    if (!seed) {
      problems.push(`${slug}: نه در content-fixes نه در سید`);
      continue;
    }
    body = seed.body;
  }

  /* ۱ — جمله افزوده به انتهای «همان» پاراگراف اول (غیر بلاک‌کوت) */
  if (fix.appendToFirstPara) {
    const paras = body.split(/\n{2,}/);
    let done = false;
    for (let i = 0; i < paras.length; i++) {
      const p = paras[i].trim();
      if (!p || p.startsWith(">") || p.startsWith("#")) continue;
      if (p.includes(fix.appendToFirstPara)) {
        done = true; /* از قبل در همین پاراگراف ادغام شده — idempotent */
        break;
      }
      /* اجرای قبلی: جمله به‌صورت پاراگراف جدا افتاده → ادغام */
      if (paras[i + 1] && paras[i + 1].trim() === fix.appendToFirstPara) {
        paras[i] = `${paras[i]} ${fix.appendToFirstPara}`;
        paras.splice(i + 1, 1);
        done = true;
        break;
      }
      paras[i] = `${paras[i]} ${fix.appendToFirstPara}`;
      done = true;
      break;
    }
    if (!done) problems.push(`${slug}: پاراگراف اول برای افزودن پیدا نشد`);
    body = paras.join("\n\n");
  }

  /* ۲ — تغییر نام H2 */
  if (fix.h2) {
    const [from, to] = fix.h2;
    if (body.includes(to)) {
      /* از قبل اعمال شده */
    } else if (body.includes(from)) {
      body = body.replace(from, to);
    } else {
      problems.push(`${slug}: H2 مبدأ پیدا نشد: «${from}»`);
    }
  }

  /* ۳ — فرانت‌متر عنوان/چکیده */
  if (fix.title) meta.title = fix.title;
  if (fix.excerpt) meta.excerpt = fix.excerpt;

  /* ۴ — راستی‌آزمایی ۵ جایگاه */
  const kwStr = ARTICLE_KEYWORDS[slug];
  const seed = BLOG_ARTICLES.find((a) => a.slug === slug);
  const focus = kwStr ? norm(kwStr.split(",")[0].trim()) : "";
  const title = norm(meta.title ?? seed?.title ?? "");
  const excerpt = norm(meta.excerpt ?? seed?.excerpt ?? "");
  const firstPara = norm(
    body.split(/\n{2,}/).map((p) => p.trim()).filter((p) => p && !p.startsWith(">"))[0] ?? "",
  );
  const h2s = [...body.matchAll(/^##\s+(.+)$/gm)].map((m) => norm(m[1]));
  const nb = norm(body);
  const positions = {
    title: title.includes(focus),
    excerpt: excerpt.includes(focus),
    firstPara: firstPara.includes(focus),
    h2: h2s.some((h) => h.includes(focus)),
    body: nb.includes(focus),
  };
  const missing = Object.entries(positions).filter(([, v]) => !v).map(([k]) => k);

  /* ۵ — نوشتن بازگشتی */
  const fmLines = [
    meta.title ? `title: ${meta.title}` : null,
    meta.excerpt ? `excerpt: ${meta.excerpt}` : null,
    meta.cover ? `cover: ${meta.cover}` : null,
  ].filter(Boolean);
  const out = fmLines.length ? `---\n${fmLines.join("\n")}\n---\n\n${body}` : body;
  writeFileSync(path, out.endsWith("\n") ? out : `${out}\n`);

  if (missing.length === 0) {
    okCount++;
    console.log(`✔ ${slug} — هر ۵ جایگاه پوشش داده شد${fmLines.length ? " + فرانت‌متر" : ""}`);
  } else {
    console.log(`△ ${slug} — باقی مانده: ${missing.join("، ")}`);
  }
}

console.log(`\nنتیجه: ${okCount}/${Object.keys(FIXES).length} مقاله کامل شد`);
if (problems.length) {
  console.log("مشکلات:");
  for (const p of problems) console.log(`  ⚠ ${p}`);
  process.exit(1);
}
