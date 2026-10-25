# Worklog — dr-kermani.com

---
Task ID: geo-audit-1
Agent: main (Z.ai CLI)
Task: ممیزی GEO سایت dr-kermani.com با geo-optimizer-skill و برطرف کردن یافته‌ها

Work Log:
- ممیزی کامل `geo audit` روی https://dr-kermani.com اجرا شد → **87/100 (EXCELLENT)**، خروجی JSON در `.geo-audit-before.json` و متن کامل در `.geo-audit-20261025-0558.txt`
- شکاف امتیاز به تفکیک (breakdown): brand_entity 6/12، signals 4/6، ai_discovery 2/3، google_ai 19/20 (G-DATES)، schema 12/14، negative_penalty −1 (missing author)
- **یافته کلیدی ۱ — «Hidden text: 49 عنصر»**: framer-motion حالت اولیه `opacity:0` را به‌صورت استایل اینلاین داخل HTML سروری می‌نوشت (الگوی cloaking برای خزنده‌های AI). عناصر: template ریشه سایت، navbar، contact-dock، pwa-tabbar، hero صفحه اصلی و ~40 کامپوننت Reveal
- **یافته کلیدی ۲ — G-DATES/freshness**: هیچ dateModified در اسکیما و هیچ `<time datetime>` قابل‌مشاهده وجود نداشت (Perplexity 60/100)
- **یافته کلیدی ۳ — brand inconsistency**: name در schema با جداکننده «|» بود و نام Physician به‌خاطر فیلتر نوع، در مقایسه برند شمرده نمی‌شد → «نام برند ناسازگار»
- **یافته کلیدی ۴ — negative penalty −1**: هیچ سیگنال author (Person/author property) در صفحه نبود
- **یافته کلیدی ۵ — has_geo_schema=false**: چکر به areaServed یا نوع literal Organization/LocalBusiness نیاز دارد (MedicalOrganization + geo کافی نبود)
- **یافته کلیدی ۶ — markdown negotiation**: درخواست `/` با Accept: text/markdown باید پاسخ text/markdown بدهد

فیکس‌های پیاده‌سازی‌شده:
- `src/app/globals.css`: ۸ کی‌فریم ورود (geo-enter*) — انیمیشن بدون استایل اینلاین + prefers-reduced-motion
- `src/app/template.tsx`: حذف motion wrapper (روی display:contents انیمیشن بی‌اثر بود ولی HTML را آلوده می‌کرد)
- `src/components/cinematic.tsx`: `Reveal` با گیت hydration (`useSyncExternalStore`) — SSR کاملاً visible، بعد از mount انیمیشن whileInView
- `navbar.tsx`, `contact-dock.tsx`, `pwa-tabbar.tsx`, `en-chrome.tsx`: ورود با CSS keyframes به‌جای initial opacity:0
- `home.tsx` (۹ ورود), `about.tsx` (۳), `services.tsx` (۱): تبدیل به geo-enter*
- `layout.tsx`: name اسکیماهای MedicalOrganization و WebSite → «دکتر حامد کرمانی» محض (فرم بلند به alternateName)؛ افزودن `areaServed: City تهران`، `author` و `dateModified` (از DB) به WebSite
- `site-content.ts` + `content-context.tsx`: فیلد `lastUpdated` (max updatedAt/createdAt مقالات منتشرشده)
- `site-chrome.tsx` + `footer.tsx`: مُهر سروری «آخرین به‌روزرسانی محتوا» با `<time datetime>` در فوتر همه صفحات
- `middleware.ts` + `src/lib/ai-home-md.ts` (جدید): مذاکره محتوا — `/` با Accept: text/markdown → نسخه Markdown صفحه اصلی با Content-Type: text/markdown
- `home.tsx`: بخش جدید «جراحی فک و صورت چیست؟» (~۱۲۰ کلمه، جمله تعریفی) — بهبود RAG-chunk readiness و پاسخ مستقیم AEO

اعتبارسنجی محلی (next start + ممیزی روی IP عمومی شبکه):
- استایل اینلاین opacity:0: **۴۹ → ۰**
- brand_consistent=True، has_geo_schema=True، has_author_signal=True، has_freshness=True، has_markdown=True، G-DATES=pass 2/2، negative_penalty=0
- **امتیاز محلی: 92/100** (زنده پس از دیپلوی دوباره سنجیده می‌شود؛ Kg-pillar فقط با LinkedIn/Wikipedia واقعی قابل امتیاز است — URL معتبر به دکتر کرمانی اطلاع داده شود)
- tsc و eslint روی همه فایل‌های تغییر‌یافته تمیز؛ `npm run build` موفق

Stage Summary:
- ممیزی GEO تکرارپذیر شد: قبل `.geo-audit-before.json` / محلی `.geo-audit-local.json`
- کلاس‌های `geo-enter-*` الگوی رسمی انیمیشن ورود سایت شدند — از این به بعد هر ورود جدید با این کلاس‌ها، نه initial opacity:0
- دو مورد منتظر ورودی کاربر: (۱) پروفایل LinkedIn/ویکی‌پدیا برای sameAs (+تا ۴ امتیاز) (۲) هشدار invisible-unicode مربوط به نیم‌فاصله فارسی است — false positive و بدون تأثیر امتیاز

 followup (همان Task ID: geo-audit-1):
- دیپلوی GitHub Actions موفق (98f0e4b) → ممیزی زنده نهایی: **94/100 EXCELLENT** (+7)
- Perplexity citation 60→75، Google AI citation 89→93، Trust C→B، Hidden text 49→0
- سند نهایی: docs/seo/geo-audit-status.md · خروجی خام: .geo-audit-after.json

---
Task ID: aeo-sxo-1
Agent: main (Z.ai CLI)
Task: ممیزی AEO/SXO صفحات مقالات + پیکربندی claude-seo برای خط تولید محتوا

Work Log:
- اسکریپت ممیزی جدید `scripts/audit-aeo-sxo.mjs` (node خالص): منبع sitemap زنده، تحلیل JSON-LD چند-گراف، امتیاز AEO و SXO هر روی ۱۰۰، گزارش جدولی + JSON خام
- ممیزی پایه ۲۷ مقاله زنده: **AEO ۶۵ / SXO ۹۰** — یافته‌ها: FAQ بدون h3 مرئی (summary)، title ۶۷–۸۸ کاراکتر، desc تا ۱۹۱، strong=۰، یک مقاله بدون FAQ
- فیکس‌های قالبی: سوال‌های FAQ حالا h3 واقعی داخل summary (تطابق FAQPage↔متن مرئی + تیتر پرسشی برای موتور پاسخ)؛ `serpTitle` با بودجه برند ≤۶۰ کاراکتر (title absolute) و `serpDescription` ≤۱۶۰ با برش کلمه‌ای — H1 و og:title کامل ماند
- فیکس اسکیما: FAQPage سراسری layout (۶ سوال سایت) حذف شد — نقض دستورالعمل گوگل بود (سوال مرئی نیست در مقاله‌ها)؛ به صفحه اصلی منتقل شد با همان منبع داده آکاردئون (getSiteContent) — هر صفحه فقط FAQPage سوال‌های مرئی خودش
- پیکربندی claude-seo در خط تولید: گیت‌های سخت AEO/SXO در `publish.ts` (پاسخ ۲۵–۹۰ کلمه، تیتر پرسشی ≥۲، آمار ≥۳، لینک BOFU ≥۱، توپر `**` ≥۲) + قواعد نویسنده/پولیش در `creative.ts` + چک ۱۰ هشداری در `qa-articles.ts` + سند مرجع `docs/seo/content-pipeline.md` + standards.md به‌روز
- ابزار فیکس مقاله زنده: `scripts/fix-article-faq.mjs` + workflow_dispatch `article-fix.yml` (AGENT_SECRET از Actions؛ publish از همان مسیر ایجنت) — publish API اجازه upsert همان slug را داد (گارد عنوان تکراری فقط برای مقاله دیگر)
- مقاله jaw-surgery-cost-1405 (فقط در دیتابیس زنده، بدون FAQ/لینک/توپر): بخش «پرسش های پرتکرار» با ۴ سوال + ۴ لینک داخلی (BOFU/pillar/articles) + ۳ توپر منتشر شد — همه گیت‌های سردبیر پاس
- دیباگ‌های مسیر: ۵۰۳ گذرای دیپلوی (ریران موفق)، رد گیت «لینک <۴» (لینک چهارم اضافه شد)، رندر لفظی پاسخ FAQ (فیکس Markdown در FaqAccordion)، و باگ پارسر: پاسخِ در همان گروهِ هدینگ دور ریخته می‌شد (`article-extras.ts` — حالا هر دو فرمت «### سوال\nپاسخ» و «### سوال\n\nپاسخ» پاسخ می‌دهد)

Stage Summary:
- نتیجه نهایی ممیزی زنده: **AEO ۱۰۰/۱۰۰ · SXO ۹۰/۱۰۰** (از ۶۵/۹۰) — گزارش: docs/seo/article-audit/aeo-sxo-2026-10-25.md
- تک‌یافته باز: «خوانایی» بدنه ۲۳ مقاله قدیمی (strong=۰/پاراگراف بلند) — پذیرفته‌شده؛ غنی‌سازی فقط از مسیر بازنویسی ایجنت، گیت برای مقاله تازه سخت است
- الگوی رسمی FAQ از این به بعد: سوال با «###» و «؟»، پاسخ با حداقل یک لینک داخلی در صورت لزوم؛ اسکیمای FAQPage فقط در صفحه‌ای که سوال‌هایش مرئی است
- ابزارهای تکرارشدنی: `node scripts/audit-aeo-sxo.mjs` (هر ۱۰ مقاله) + workflow_dispatch article-fix.yml (اسلاگ پارامتر) برای مقاله‌های قدیمی‌تر از گیت

---
Task ID: content-remove-rostamkhani
Agent: main (Z.ai)
Task: حذف کامل نام «دکتر رستم خانی» از کل سایت — حتی بخش رزرو نوبت (درخواست کاربر: «توی کل سایت اسم دکتر رستمخانی رو بردار حتی توی قسمت رزرو»)

Work Log:
- جستجوی کل مخزن با الگوهای «رستم خانی / رستم‌خانی / Rostamkhani» → سه فایل: src/lib/data.ts، src/lib/en-content.ts، db/init.sql
- data.ts: حذف عضو تیم، حذف از APPOINTMENT_DOCTORS (شنبه/دوشنبه بدون پزشک نام‌دار → نوبت‌دهی آنلاین فقط یکشنبه/سه‌شنبه/چهارشنبه دکتر کرمانی)، HOURS شنبه/دوشنبه با doctor خالی، بازنویسی پاسخ FAQ ساعات کاری
- en-content.ts: حذف Dr. Fatemeh Rostamkhani از EN_DOCTORS و ساعت کاری EN (EN_DOCTORS[0] = Kermani دست‌نخورده — بدون وابستگی ایندکسی)
- site-content.ts: لایه scrub جدید — ردیف‌های قدیمی دیتابیس پروداکشن (TeamMember/Hour/Faq) که نام را دارند، هنگام خواندن پاک می‌شوند: فیلتر تیم با /رستم[\s\u200c]+خانی/، حذف جمله «و روزهای شنبه و دوشنبه دکتر رستم خانی حاضر هستند» از FAQ، خالی‌کردن doctor ساعات کاری. false-positive کلمه «بفرستم» هم تست شد و امن است
- init.sql: حذف INSERT TeamMember، خالی‌کردن دو ردیف Hour، بازنویسی FAQ + رفع باگ قدیمی dump (BEGIN TRANSACTION و COMMIT تکراری که مسیر بازیابی sqlite3 CLI را می‌شکست)
- scripts/rebuild-init-db.py: بازسازی db/init.db از init.sql با اعتبارسنجی خودکار (TeamMember=3، Hour=6، Faq=6، صفر ردیف حاوی نام) — با git add -f به‌خاطر .gitignore /scripts/
- حذف public/images/team-rostamkhani.jpg (git rm)
- تست regex scrub با متن واقعی FAQ و ردیف Hour → خروجی فارسی تمیز («...دکتر کرمانی. برای رزرو...»)
- npm run build ✓ (26 صفحه)، eslint سه فایل ✓، بررسی .next/standalone → صفر مورد نام
- کامیت 3ae0248 و push → دیپلوی خودکار فعال شد

Stage Summary:
- نام پزشک از تمام لایه‌ها حذف شد: استاتیک (data/en)، seed (init.sql + init.db بازسازی‌شده)، باندل پروداکشن، و دیتابیس پروداکشن سرور (با scrub در site-content — چون custom.db سرور با دیپلوی عوض نمی‌شود)
- تغییر رفتاری: نوبت‌دهی آنلاین از این به بعد فقط روزهای یکشنبه، سه‌شنبه و چهارشنبه (روزهای دکتر کرمانی)؛ شنبه/دوشنبه در جدول ساعات کاری باز نمایش داده می‌شود ولی نوبت آنلاین ندارد — در FAQ توضیح داده شد
- برای بازگشت روزهای شنبه/دوشنبه به نوبت‌دهی با برچسب عمومی، کافی است یک entry generic به APPOINTMENT_DOCTORS در data.ts اضافه شود

---
Task ID: content-remove-rostamkhani (follow-up)
Agent: main (Z.ai)
Task: رفع جرئه گرامری scrub FAQ روی ردیف قدیمی دیتابیس پروداکشن

Work Log:
- تست زنده /api/content نشان داد الگوی اول scrub عبارت «حاضر هستند» را هم می‌بلعید («دکتر کرمانی.» ناقص)
- regex اصلاح شد: فقط «و روزهای شنبه و دوشنبه دکتر رستم خانی» حذف می‌شود و «حاضر هستند» می‌ماند
- rebuild + eslint ✓، کامیت 27b94d7 → دیپلوی success
- تأیید نهایی زنده: FAQ سالم، نام در کل /api/content صفر مورد، تیم ۳ نفره

Stage Summary:
- سایت زنده کاملاً پاک است؛ نوبت‌دهی آنلاین فقط یکشنبه/سه‌شنبه/چهارشنبه

---
Task ID: booking-kermani-fullweek
Agent: main (Z.ai)
Task: درخواست کاربر — «برای خود دکتر کرمانی باشه و بزار باز بمونه شنبه و دوشنبه»

Work Log:
- data.ts: HOURS شنبه/دوشنبه → «دکتر کرمانی»؛ APPOINTMENT_DOCTORS days=[6,0,1,2,3]؛ FAQ ساعات کاری بازنویسی هفتگی
- en-content.ts: EN hours Sat–Wed → Dr. Kermani؛ EN_DOCTORS days=[6,0,1,2,3] + daysEn جدید
- site-content.ts: scrub ردیف‌های قدیمی DB پروداکشن اکنون نام حذف‌شده را به «دکتر کرمانی» نگاشت می‌کند (به‌جای خالی) و FAQ ساعات کاری حاوی نام را با متن جدید کامل جایگزین می‌کند؛ scrubFa بلااستفاده حذف شد
- init.sql: ردیف‌های Hour شنبه/دوشنبه → «دکتر کرمانی» + FAQ جدید؛ init.db با scripts/rebuild-init-db.py بازسازی و اعتبارسنجی شد (صفر مورد نام)
- build ✓ eslint ✓ کامیت 1729a11 → دیپلوی success
- تأیید زنده: تقویم نوبت‌دهی شنبه 2026-10-31 open=True با دکتر حامد کرمانی؛ دوشنبه open=True؛ فقط پنجشنبه/جمعه بسته؛ hours کامل با نام دکتر کرمانی؛ نام قدیمی صفر مورد

Stage Summary:
- نوبت‌دهی آنلاین شنبه تا چهارشنبه (۵ روز) فعال؛ پنجشنبه/جمعه تعطیل
- ردیف‌های قدیمی DB سرور بدون دست‌کاری مستقیم، سمت کد به دکتر کرمانی نگاشت می‌شوند
