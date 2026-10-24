# AGENTS.md — راهنمای ایجنت‌های کار روی dr-kermani.com

سایت دندانپزشکی/جراحی فک دکتر حامد کرمانی. فارسی، RTL، تم تیره (Laki `#0d0e0b` + طلایی `#c9a13b`).

**قبل از هر کاری این دو را بخوان:**
1. `docs/standards.md` — قرارداد کیفیت SEO/AEO/GEO/AIO/SXO (الزامی برای هر تغییر)
2. `agent-skills/README.md` — نقشه اسکیل‌های طراحی و سئو و نحوه استفاده

## پشته و دیپلوی

- Next.js App Router + TypeScript + Tailwind + Prisma (`db/custom.db` — مقالات اینجا هستند)
- push به `main` → GitHub Actions دیپلوی می‌کند به IranServer → سایت `https://dr-kermani.com`
- **کاناری سitemap**: دیپلوی شکست می‌خورد اگر خروجی `sitemap.xml` کاراکتر `xhtml:` داشته باشد — فرمت سitemap را نشکن
- هاست اشتراکی: خروجی شبکه‌اش به API هوش مصنوعی نامطمئن است؛ تولید محتوا روی رانر گیت‌هاب انجام می‌شود

## خط تولید محتوا (اتوماتیک)

- هر روز **۰۷:۰۰ تهران** (cron `30 3 * * *` UTC) دو مقاله با ۵ ایجنت (`src/lib/agents/`) تولید و منتشر می‌شود — workflow: `.github/workflows/blog-agent.yml`
- قواعد سخت محتوا: **بدون تاریخ** در متن/عنوان، **بدون تکرار** (چک یکتایی)، پاسخ مستقیم ۴۰–۶۰ کلمه، FAQ ۴+، حداقل ۵ لینک داخلی، ۱۵۰۰+ کلمه، کاور ۳D اختصاصی
- QA: `bun scripts/qa-articles.ts` — باید صفر خطا بدهد (در blog-agent.yml هم اجرا می‌شود)
- سitemap و `llms.txt` داینامیک‌اند؛ مقاله جدید خودکار وارد می‌شود

## بازبینی سایت (playwright-cli)

```bash
npm i -g @playwright/cli@latest && playwright-cli install-browser chrome-for-testing
playwright-cli open https://dr-kermani.com --browser=chromium
playwright-cli screenshot --filename=home.png          # دسکتاپ ۱۴۴۰ + موبایل: playwright-cli resize 390 844
playwright-cli console error                           # باید ۰ خطا باشد
playwright-cli close
```

## ممیزی سئو

```bash
bun scripts/qa-articles.ts                                       # QA محتوا
cd tools/seo/geo-optimizer-skill && uv run --active geo audit --url https://dr-kermani.com
```

امتیاز GEO در `docs/seo/seo-skills-setup.md` ثبت می‌شود (آخرین: ۸۱/۱۰۰).

## قواعد طلایی

- هر تغییر UI: اول مرجع طراحی (taste-skill یا design-md)، بعد کد، بعد ممیزی `agent-skills/web-design-guidelines/guidelines.md` + اسکرین‌شات
- هیچ محتوایی بدون پاس شدن `scripts/qa-articles.ts` منتشر نشود
- زبان مخاطب فارسی است؛ اعداد فارسی؛ متن انگلیسی فقط در `/en`
- هر تغییر ساختاری مهم را در `docs/` مستند کن
