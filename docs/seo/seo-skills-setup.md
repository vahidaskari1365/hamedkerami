# نصب و اجرای سه اسکیل سئو روی dr-kermani.com

سه مخزن درخواستی کاربر در `tools/seo/` نصب شده‌اند و خروجی‌هایشان روی سایت پیاده شده است.
این سند وضعیت اجرا و ادامه مسیر هر یک را ثبت می‌کند.

## ۱) geo-optimizer-skill (Auriti-Labs) — ✅ اجرا شد، خروجی پیاده شد

ابزار ممیزی GEO (قابلیت استناد در پاسخ‌های AI: ChatGPT/Perplexity/Claude/Gemini).

```bash
cd tools/seo/geo-optimizer-skill
uv run geo audit --url https://dr-kermani.com
```

**نتیجه ممیزی ۲۰۲۶-۱۰-۲۳: امتیاز ۷۷/۱۰۰ (GOOD)** — فهرست اقدامات و وضعیت پیاده‌سازی:

| پیشنهاد ممیزی | وضعیت |
|---|---|
| robots.txt — ربات‌های tier جستجو | ✅ از قبل مجاز؛ حالا به‌صورت صریح هم لیست شدند (Claude-SearchBot، Perplexity-User، xAI-Bot، …) |
| llms.txt | ✅ از قبل داینامیک |
| JSON-LD (Physician/WebSite/FAQ/ItemList) | ✅ از قبل موجود |
| RSS/Atom feed + لینک در head | ✅ `/feed.xml` ساخته شد؛ لینک head ابتدا با `alternates.types` بود که صفحاتی که `alternates` خودشان را تعریف می‌کردند حذفش می‌کردند (ممیزی ۰۲۴-۱۰-۲۴ این را گرفت) — حالا مستقیم در layout رندر و توسط React 19 به head منتقل می‌شود |
| `/.well-known/ai.txt` | ✅ ساخته شد (public/.well-known/ai.txt) |
| `/ai/summary.json` | ✅ ساخته شد (داینامیک از دیتابیس) |
| `/ai/faq.json` | ✅ ساخته شد (داینامیک از دیتابیس) |
| `/ai/service.json` | ✅ ساخته شد (داینامیک از دیتابیس) |
| SearchAction در WebSite schema | ✅ اضافه شد |
| contactPoint در schema | ✅ اضافه شد |
| تاریخ انتشار (G-DATES) | ⏸ طبق درخواست کاربر «تاریخ نزن» — تاریخ روی مقالات نمایش داده نمی‌شود؛ فقط متادیتای invisible (schema/lastmod) |
| عناصر مخفی (۴۹ مورد) | 🔍 ناشی از الگوهای دسترسی‌پذیری (sr-only/aria-hidden/marquee) — کلوکینگ نیست؛ در بازطراحی‌های بعدی کم می‌شود |

## ۲) mcp-gsc (AminForou) — ✅ نصب شد؛ یک مرحله لاگین با شما

سرور MCP برای گوگل سرچ‌کنسول (تحلیل کلمات، پایش ایندکس، مقایسه دوره‌ها) با هر کلاینت MCP.

- کانفیگ پروژه: `.mcp.json` (ریپو روت) — پراپرتی `sc-domain:dr-kermani.com`
- اجرا: `uvx mcp-search-console` (اولین بار مرورگر برای لاگین گوگل باز می‌شود؛ یا Service Account)
- بعد از لاگین، با کلاینت MCP (Claude Desktop / Cursor / …) سوال‌هایی مثل
  «۲۰ کلمه برتر سه ماه اخیر dr-kermani.com» را مستقیم از GSC می‌پرسید.
- نکته: برای این که این ایجنت بتواند مستقل اجرا شود، یک بار روی ماشین خودتان
  `uvx mcp-search-console` را اجرا و لاگین کنید تا توکن در `GSC_DATA_STATE` ذخیره شود.

## ۳) open-seo (every-app) — ✅ نصب شد؛ تحقیق کلمه کلیدی (نیاز به کلید DataForSEO)

جایگزین متن‌باز Semrush — پژوهش کلمه، رتبه، بک‌لینک، ممیزی سایت.

- کد کامل در `tools/seo/open-seo/` (Next.js + Drizzle)
- اجرای محلی: `cd tools/seo/open-seo && pnpm install && pnpm dev`
- نیاز به کلید [DataForSEO](https://dataforseo.com) (پرداخت‌به‌مصرف) در env
- کاربرد در چرخه محتوای ما: پیش از هر مقاله، حجم/رقابت کلمه کلیدی صرفه‌جویی‌شده
  در `docs/seo/keyword-plan.md` به‌روزرسانی شود.

## اتصال به ایجنت محتوایی سایت

ایجنت‌های بلاگ (`src/lib/agents/`) قواعد نوشتاری SEO/AEO/GEO را از همین چارچوب‌ها
گرفته‌اند (پاسخ مستقیم ۴۰-۶۰ کلمه، FAQ ۴+، آمار درون جمله، لینک به صفحه BOFU،
اسکیمای Article+FAQ+Breadcrumb، llms.txt داینامیک). ممیزی GEO پس از هر ۱۰ مقاله
تکرار شود و امتیاز در همین فایل ثبت گردد:

- ۲۰۲۶-۱۰-۲۳: **۷۷/۱۰۰** (بعد از پیاده‌سازی endpoint های AI → انتظار ۸۵+)
- ۲۰۲۶-۱۰-۲۴: **۸۱/۱۰۰** — ChatGPT ۶۳، Perplexity ۵۰، Google AI ۸۹. اقدام امروز: لینک RSS hoisted در head + قرارداد کیفیت `docs/standards.md` + نصب ۵ اسکیل طراحی در `agent-skills/`. یافته‌های باز (پذیرفته‌شده): تاریخ نامرئی (تصمیم کاربر)، نیم‌فاصله = false positive فارسی، ۴۹ عنصر sr-only (الگوی a11y)، نبود لینک Knowledge Graph خارجی (ویکی‌پدیا/لینکدین وجود ندارد)
- ۲۰۲۶-۱۰-۲۴ (بعدازظهر): **۸۷/۱۰۰** ✅ هدف ۸۵+ محقق شد — ChatGPT ۷۳، Perplexity ۶۰، Google AI ۸۹، Instruction-following ۹۰ (aria-live ✅). رفع‌ها: فیلدهای سطح اول `name/description` در summary.json و `name/capabilities` در service.json (استاندارد geo-checklist.dev)، اسکیمای `MedicalOrganization#clinic` کنار `Physician` (تشخیص Organization + تماس + سازگاری برند)، ناحیه aria-live سراسری. یافته‌های باقی‌مانده (پذیرفته‌شده/برای بعد از ۱۰ مقاله): «برند ناسازگار» = پسوند متفاوت title/H1 (ریشه برند یکسان — تصمیم طراحی)، KG خارجی ندارد (واقعیت موجود)، ۴۹ عنصر opacity:0 = state اولیه انیمیشن اسکرول (false positive، کلوکینگ نیست)، نیم‌فاصله = الزام تایپوگرافی فارسی، RAG-chunk ۳۵ = مخصوص صفحه اصلی (سطح RAG مقالات است)

## ۴) claude-seo (AgriciDaniel) — ✅ نصب شد؛ ممیزی پنج‌استانداره و دروازه کیفیت

پلاگین کامل ممیزی سئو (۲۶ زیر-اسکیل + ۱۹ ایجنت) — Technical/Content(E-E-A-T)/Schema/GEO/Local/E-commerce.

- کد کامل در `tools/seo/claude-seo/` (بدون .git، بدون screenshots/assets)
- مرجع قواعد کلیدی: `tools/seo/claude-seo/skills/seo/references/quality-gates.md`
  (بلاگ ≥۱۵۰۰ کلمه) و `eeat-framework.md` (Who/How/Why + سیگنال تجربه اول‌شخص)

### پیاده‌سازی روی سایت (۲۰۲۶-۱۰-۲۴):

| قاعده claude-seo | وضعیت |
|---|---|
| بلاگ ≥۱۵۰۰ کلمه | ✅ ممیزی ۲۷ مقاله لایو: ۲۵ منطبق + ۲ مقاله (۱۴۷۸/۱۴۵۸ کلمه) با بخش تکمیلی محتوایی اصلاح شدند (SYNC_VERSION v2 در instrumentation) |
| دروازه انتشار | ✅ کف publish gate از ۷۰۰ به ۱۴۰۰ کلمه ارتقا یافت (`publish.ts`) |
| E-E-A-T تجربه اول‌شخص | ✅ قاعدهٔ صحنه بالینی ملموس به پرامپت نویسنده اضافه شد؛ باکس نویسنده از قبل موجود |
| ضد-الگوی AI | ✅ ممنوعیت عبارات تیپی («در دنیای امروز»، «شایان ذکر است»…) در پرامپت نویسنده |
| ممیزی دوره‌ای | ✅ `node scripts/audit-articles.mjs` — ممیزی پنج‌استانداره زنده (SEO/AEO/GEO/SXO/AIO) |

### ادغام در جریان کار

پیش از هر انتشار: دروازه publish.ts (کف ۱۴۰۰ + FAQ≥۴ + لینک داخلی≥۴ + پاسخ‌کوتاه + یکتایی)
→ پس از انتشار: IndexNow/Bing ping خودکار → هر دور: audit-articles.mjs + geo audit
