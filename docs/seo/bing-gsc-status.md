# وضعیت ایندکس Bing + Google Search Console — ۲۰۲۶-۱۰-۲۴

## خلاصه اجرای امروز

### ۱) علت خطای «URL not allowed» در سرچ‌کنسول — پیدا و بسته شد

گزارش GSC (آخرین خوانش ۱۰/۱۹): سitemap شامل ۱۱ آدرس از دامنهٔ اشتباه
`dromfs.com` بود → خطای «URL not allowed — This url is not allowed for a
Sitemap at this location».

- **ریشه:** دامنهٔ قبلی پروژه در sitemap/robots/metadata/schema مانده بود
- **رفع شده در:** کامیت `baf115e` (۲۰۲۶-۱۰-۱۹ ۰۷:۲۴) — همه به `dr-kermani.com`
- **چرا هنوز در GSC دیده می‌شود؟** GSC نتیجهٔ آخرین خوانشِ خودش را نشان می‌دهد
  (کش). سitemap فعلی ۴۵ URL درست دارد؛ GSC باید دوباره بخواند → گام ۴

### ۲) ممیزی کامل ۴۵ صفحهٔ لایو — صفر خطا

`docs/seo/live-audit/audit-20261024-1313.md` — برای هر URL: HTTP، canonical،
meta robots، تعداد H1، طول title. نتیجه: **۴۵/۴۵ سالم** (همه 200، کانونیکال
درست، بدون noindex، تک‌H1).

### ۳) hreflang متقابل ناقص — اصلاح شد

- `/en/jaw-surgery-in-iran` فقط به خودش اشاره می‌کرد (fa نداشت)
- `/jaw-surgery` اصلاً `languages` نداشت
- **رفع:** هر دو حالا `{fa, en, x-default}` دوسویه کامل دارند
  (کامیت `b5f14a6`) — جفت‌های دیگر (/ و /en و services/about/contact) از قبل
  متقابل بودند.

### ۴) Bing — همهٔ صفحات ارسال شد (IndexNow)

پنل Bing بدون API Key قابل اتوماسیون نیست؛ راه رسمی بدون کلید = پروتکل
**IndexNow** (متعلق به خود مایکروسافت/بینگ):

| مؤلفه | وضعیت |
|---|---|
| کلید | `0ce6e893dd2b8ef48d79fbf2d4d80523` |
| فایل تأیید | `https://dr-kermani.com/0ce6e893dd2b8ef48d79fbf2d4d80523.txt` ✅ 200 |
| ارسال دسته‌ای | `node scripts/indexnow-submit.mjs` → **۴۵ URL / HTTP 202 Accepted** ✅ |
| خودکار مقاله‌های جدید | استپ `--updated` در `blog-agent.yml` (پس از هر انتشار) ✅ |

IndexNow به‌طور خودکار با Bing Webmaster Tools پراپرتی `dr-kermani.com`
سینک می‌شود (پنل شما آن را در بخش IndexNow نشان می‌دهد).

## گام‌های باقی‌مانده — فقط از مرورگر (۲ دقیقه، دست شما)

### گوگل سرچ‌کنسول

1. **Sitemaps** → کادر `sitemap.xml` → دکمهٔ سه‌نقطه → **Resubmit sitemap**
   → ظرف ۱ تا ۳ روز «Discovered pages» از ۱۷ به ۴۵ می‌رسد و خطای
   «URL not allowed» پاک می‌شود
2. (اختیاری، برای سرعت بیشتر) صفحه‌های کلیدی را در **URL Inspection** باز کنید
   → **Request Indexing** — برای ۵ صفحهٔ اصلی کافی است
3. چند روز بعد: **Pages** → بررسی «Crawled – currently not indexed»؛ اگر
   مقاله‌ای ماند، محتوایش را با `tools/gsc-analyzer.mjs` تقویت می‌کنیم

### Bing Webmaster Tools

1. **Sitemaps** → Add sitemap → `https://dr-kermani.com/sitemap.xml`
2. بخش **IndexNow** پنل → کلید بالا باید تأییدشده دیده شود
3. اگر خواستید گزارش خطاها/Site Scan را هم خودکار بگیرم: منوی
   **Settings → API Access → API Key** → کلید را بفرستید (یک بار)

## نگهداری بعدی

- مقاله‌های جدید: خودکار به Bing پینگ می‌شوند (IndexNow) و از طریق sitemap
  به گوگل می‌رسند — اقدام دستی لازم نیست
- ممیزی سلامت: `bash scripts/audit-live-pages.sh` هر زمان که خواستید
- چرخهٔ ۲ماههٔ GSC: طبق `docs/seo/gsc-cycle.md`
