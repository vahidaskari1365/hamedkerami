# GEO Audit & Fixes — dr-kermani.com

> ابزار: [geo-optimizer-skill](https://github.com/Auriti-Labs/geo-optimizer-skill) — `uv run --active geo audit --url https://dr-kermani.com`
> اجرای قبلی: **87/100 (EXCELLENT)** · اجرای محلی پس از فیکس‌ها: **92/100** · اجرای زنده پس از دیپلوی باید ≥92 باشد.

## ۱. شکاف‌های ممیزی 87/100 (قبل)

| دسته | امتیاز | علت |
|---|---|---|
| brand_entity | 6/12 | name اسکیما با «\|» جدا می‌شد؛ نام Physician در مقایسه برند شمرده نمی‌شد؛ KG-pillar صفر؛ areaServed نبود |
| signals | 4/6 | هیچ dateModified / تاریخ قابل‌مشاهده‌ای نبود (freshness=false) |
| ai_discovery | 2/3 | مذاکره `Accept: text/markdown` پاسخ نمی‌داد |
| google_ai | 19/20 | G-DATES warn — نه تاریخ اسکیما، نه `<time>` قابل‌مشاهده |
| negative_penalty | −1 | هیچ سیگنال author (Person/property author) در صفحه نبود |
| schema | 12/14 | schema_article روی صفحه اصلی — عمداً خالی (اسکیمای Article فقط برای مقالات است) |
| blockers | — | «Hidden text: 49 عنصر» — الگوی cloaking برای خزنده‌های AI |

## ۲. ریشه مشکل Hidden Text

framer-motion حالت `initial={{ opacity: 0 }}` را به‌صورت **استایل اینلاین** در HTML سروری می‌نویسد. خزنده‌های AI (GPTBot، ClaudeBot، PerplexityBot) JS اجرا نمی‌کنند و ۴۹ عنصر «متن پنهان» می‌بینند — همان الگویی که ممیزی به‌عنوان cloaking پرچم می‌زند.

**راه‌حل‌ها:**
1. ورودهای on-load (نوبار، داک‌ها، هیرو) → کی‌فریم CSS (`geo-enter-*` در globals.css) — همان ظاهر، صفر استایل اینلاین، حتی بدون JS هم کار می‌کند.
2. ورودهای scroll (`Reveal`) → گیت hydration با `useSyncExternalStore`: تا قبل از hydration یک div ساده visible رندر می‌شود؛ بعد از mount انیمیشن whileInView اجرا می‌شود.
3. `template.tsx` → wrapper ساده (انیمیشن قبلی روی `display:contents` اصلاً دیده نمی‌شد).

**قانون پروژه از این به بعد:** هر انیمیشن ورود جدید با کلاس‌های `geo-enter / geo-enter-x / geo-enter-fade / geo-enter-nav / geo-enter-dock / geo-enter-tabbar / geo-enter-photo` — از `initial={{ opacity: 0 }}` اینلاین در کامپوننت‌های SSR استفاده نکنید.

## ۳. فیکس‌های اسکیما و freshness (layout.tsx)

- `MedicalOrganization.name` و `WebSite.name` → «دکتر حامد کرمانی» محض (فرم بلند → `alternateName`) → brand-consistency pass
- `areaServed: { @type: City, name: تهران }` → has_geo_schema pass
- `WebSite.author: { @id: #physician }` + `dateModified` (تازه‌ترین updatedAt مقالات از DB) → author signal + freshness + G-DATES
- فوتر همه صفحات: «آخرین به‌روزرسانی محتوا: <time datetime=…>» — مُهر سروری بدون hydration mismatch

## ۴. مذاکره Markdown (ai_discovery)

`middleware.ts`: درخواست `/` با هدر `Accept: text/markdown` → پاسخ `text/markdown; charset=utf-8` از `src/lib/ai-home-md.ts` (نسخه Markdown صفحه اصلی — تعریف‌محور + جدول آمار + FAQ). **با تغییر محتوای صفحه اصلی، این فایل را هم به‌روز کنید.**

## ۵. محتوای تعریف‌محور (RAG/AEO)

بخش «جراحی فک و صورت چیست؟» (~۱۲۰ کلمه با جمله تعریفی) بعد از آمار در صفحه اصلی — قطعه ۱۰۰–۱۵۰ کلمه‌ای استاندارد استناد AI.

## ۶. آنچه باقی مانده (نیازمند ورودی کاربر)

| مورد | امتیاز بالقوه | اقدام |
|---|---|---|
| KG-pillar (sameAs) | تا +4 | اگر پروفایل LinkedIn/ویکی‌پدیا/ویکی‌داده دکتر کرمانی موجود است، URL را بدهید تا به sameAs دو اسکیما اضافه شود |
| schema_article روی صفحه اصلی | +2 | اعمال نشد — اسکیمای Article فقط برای صفحات مقاله معنا دارد؛ هوم‌پیج با ItemList مقالات پوشش داده شده |
| هشدار Invisible Unicode | 0 | نیم‌فاصله (U+200C) املای استاندارد فارسی است — false positive، بدون تأثیر امتیاز |

## ۷. روش اجرای مجدد ممیزی

```bash
cd tools/seo/geo-optimizer-skill
uv run --active geo audit --url https://dr-kermani.com              # متن کامل
uv run --active geo audit --url https://dr-kermani.com --format json > .geo-audit-after.json
```

خروجی‌های مقایسه: `.geo-audit-before.json` (87) · `.geo-audit-local.json` (92 محلی)
