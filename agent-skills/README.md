# اسکیل‌های ایجنت سایت dr-kermani.com

هر تغییری که ایجنت‌ها (انسان + هوش مصنوعی) روی این سایت انجام می‌دهند باید از
اسکیل‌های این پوشه و `tools/seo/` استفاده کند. این پوشه **tracked در گیت** است و
روی هر ماشین/رانری که ریپو را کلون کند موجود است.

## طراحی و فرانت‌اند (این پوشه — `agent-skills/`)

| اسکیل | منبع | کاربرد در این پروژه |
|---|---|---|
| **taste-skill** (design-taste-frontend) | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) v2 | ضد «ظاهر AI‌ساخت». هر صفحه/سکشن جدید (لندینگ، هیرو، صفحه خدمت) قبل از کدنویسی باید از `library/directions.json` جهت هنری کشیده شود؛ بعد از پیاده‌سازی حلقه «نگاه‌کن و درست کن» با اسکرین‌شات. مرجع کامل: `taste-skill/SKILL.md` |
| **web-design-guidelines** | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | ممیزی کد UI قبل از هر merge: دسترسی‌پذیری، فوکوس، فرم‌ها، انیمیشن، تاچ، دارک‌مود. قوانین کش‌شده آفلاین: `web-design-guidelines/guidelines.md` (به‌روزرسانی دوره‌ای از [منبع](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md)) |
| **image-to-code** | [Leonxlnx/imagegen-skills](https://github.com/Leonxlnx/imagegen-skills) | برای بازطراحی‌های مهم: اول تصویر مرجع هر سکشن تولید می‌شود، تحلیل می‌شود، بعد کد مثل همان پیاده می‌شود (رویکرد image-first). `image-to-code/SKILL.md` |
| **awesome-design-md** | [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md) | ۸۴ طراحی مرجع از سایت‌های معروف. زیرمجموعه منتخب برای زبان بصری ما (تیره + طلایی + پرمیوم): `design-md/apple`, `stripe`, `linear.app`, `vercel`, `oura` (سلامت), `mercury`, `claude`, `superhuman`, `raycast`, `elevenlabs`. برای هر بازطراحی، ۲ مرجع مرتبط انتخاب و خوانده شود. لیست کامل ۸۴ مورد در ریپوی اصلی |
| **playwright-cli** | [microsoft/playwright-cli](https://github.com/microsoft/playwright-cli) | بازبینی بصری واقعی سایت (اسکرین‌شات دسکتاپ/موبایل، کنسول، snapshot). نصب: `npm i -g @playwright/cli@latest` + `playwright-cli install-browser chrome-for-testing`. شروع سریع: `playwright-cli open https://dr-kermani.com --browser=chromium` — راهنمای کامل: `playwright-cli/SKILL.md` |

## سئو (`tools/seo/`)

| اسکیل | منبع | وضعیت پیاده‌سازی |
|---|---|---|
| **geo-optimizer-skill** | [Auriti-Labs](https://github.com/Auriti-Labs/geo-optimizer-skill) | ✅ ممیزی GEO دوره‌ای — آخرین امتیاز و اقدامات: `docs/seo/seo-skills-setup.md` |
| **mcp-gsc** | [AminForou](https://github.com/AminForou/mcp-gsc) | ✅ کانفیگ `.mcp.json` — داده سرچ‌کنسول برای ایجنت‌های MCP |
| **open-seo** | [every-app](https://github.com/every-app/open-seo) | ✅ تحقیق کلمه کلیدی (نیاز به کلید DataForSEO) — خروجی در `docs/seo/keyword-plan.md` |

## قاعده اجرا (الزامی)

1. **قبل از هر تغییر UI**: مرجع طراحی انتخاب کن (taste-skill direction یا یکی از design-md) و استانداردهای `docs/standards.md` را بخوان.
2. **بعد از هر تغییر UI**: ممیزی با `web-design-guidelines/guidelines.md` + اسکرین‌شات playwright-cli (دسکتاپ ۱۴۴۰ + موبایل ۳۹۰) + صفر بودن خطای کنسول.
3. **قبل از انتشار هر محتوا**: چک‌لیست SEO/AEO/GEO/AIO/SXO در `docs/standards.md` + اسکریپت `bun scripts/qa-articles.ts`.
4. **هر ۱۰ مقاله**: ممیزی GEO مجدد و ثبت امتیاز در `docs/seo/seo-skills-setup.md`.
