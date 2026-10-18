# 🚀 راهنمای دیپلوی روی هاست اشتراکی ایران‌هاست (cPanel)

سیر کار (تماماً خودکار — مثل ورسل):
**هر push به main → گیت‌هاب بیلد می‌کند → پکیج فشرده با cPanel API (HTTPS) آپلود می‌شود →
هوک پروسه فعال را خاموش می‌کند → Passenger بوت‌استرپ را اجرا می‌کند → پکیج اکسترکت و سایت تازه سرو می‌شود → کش صفحه LiteSpeed هم خودکار پاک می‌شود.**

- دیتابیس **SQLite** است (فایل db/custom.db — با هر دیپلوی حفظ می‌شود؛ اولین بار خودکار از init.db ساخته می‌شود)
- آپلودهای ادمین در data/uploads می‌مانند و هرگز با دیپلوی پاک نمی‌شوند
- FTP این هاست کانال دیتایش فایروال است و SSH بسته — پس همه‌چیز از HTTPS پورت 2083 (cPanel API Token) می‌گذرد

---

## بخش ۱ — Secrets گیت‌هاب (یک‌بار برای همیشه — قبلاً انجام شده)

در مخزن: `Settings → Secrets and variables → Actions`

| نام Secret | مقدار |
|---|---|
| `CPANEL_HOST` | `linux502.centraldnserver.com` |
| `CPANEL_USER` | `drkerman` |
| `CPANEL_API_TOKEN` | توکن API سی‌پنل (cPanel → Manage API Tokens) |

Secretهای قدیمی FTP_*/SSH_* دیگر استفاده نمی‌شوند (می‌توانند حذف شوند).

---

## بخش ۲ — توپولوژی هاست (مهم — دست کاری نکنید)

- سرور cPanel واقعی: `linux502.centraldnserver.com` = **213.176.126.132**
- IP عمومی سایت: **213.176.126.162** (همان سرور است؛ IP اختصاصی vhost — DNS دامنه درست است، تغییرش ندهید)
- وب‌سرور: **LiteSpeed** + CloudLinux Passenger (کانفیگ در `public_html/.htaccess`: PassengerAppRoot=kermani-app، startup=server.js، Node 24)
- اپ Node.js در Setup Node.js App: فقط یک اپ ثبت‌شده = `kermani-app`

---

## بخش ۳ — سازوکار دیپلوی (برای درک/عیب‌یابی)

هر اجرای workflow این مراحل است:

1. **بیلد**: bun install → prisma generate → next build (standalone) → پکیج: `.next/standalone` + `server.js` + `prisma/` + `db/init.db`
2. **آپلود**: tar.gz (حدود ۶۹MB) با `Fileman::upload_files` به `/home/drkerman/kermani-app/deploy-package.tar.gz`
3. **بوت‌استرپ**: `Fileman::save_file_content` نسخه بوت‌استرپی server.js را می‌نویسد — در شروع، اگر پکیج تازه موجود باشد آن را با `tar` اکسترکت می‌کند، بعد standalone را اجرا می‌کند
4. **ری‌استارت تضمینی**: `POST /api/deploy-hook` — چون Next standalone بعد از استارت `process.chdir` به `.next/standalone` می‌زند و فایل کلید-کشنده `deploy-package.tar.gz` (محتوای تزئینی) همیشه در همان پوشه هست، هوک **همیشه** `ok:true` برمی‌گرداند و پروسه فعال exit می‌کند → Passenger بوت‌استرپ را با پکیج تازه اجرا می‌کند. (این فایل را حذف نکنید!)
5. **تأیید**: workflow با UAPI چک می‌کند پکیج مصرف شده و سایت 200 می‌دهد (اگر خود listing شکست بخورد، «مصرف‌نشده» فرض می‌شود — نه موفقیت کاذب)
6. **پاک‌سازی کش صفحه**: `GET /__cache-purge` → middleware با هدر `X-LiteSpeed-Purge: *` کل کش صفحات LiteSpeed را خالی می‌کند

### چرا force-dynamic؟

صفحه اصلی `export const dynamic = "force-dynamic"` دارد چون:
- محتوا از پنل ادمین و روی SQLite مدیریت می‌شود؛ نسخه استاتیک/ISR تغییرات ادمین را با تأخیر نشان می‌داد
- فایل‌های کش ISR قدیمی روی دیسک با اکسترکت پاک نمی‌شدند (tar فقط overwrite می‌کند) و هر پروسه تازه شل کهنه را HIT می‌کرد
- middleware برای HTML پاسخ `Cache-Control: no-cache` می‌فرستد (فایل‌های immutable مثل `/_next/static` و `/uploads` مستثنا هستند)

### عیب‌یابی سریع

| علامت | معنی | کار |
|---|---|---|
| deploy-hook پاسخ نداد | اپ پایین است | `~/kermani-app/stderr.log` (با copy_file به data/uploads + نام png از `/uploads/` قابل خواندن است) |
| دیپلوی شد ولی تغییری نمی‌بینید | کش مرورگر | رفرش سخت (Ctrl+Shift+R) |
| ران گیت‌هاب قرمز در آپلود | انقضای توکن cPanel | توکن جدید بسازید و Secret را آپدیت کنید |
| ورک‌فلوی `debug-server.yml` | ابزار تشخیصی فقط-خواندنی/cleanup | دستی از تب Actions با workflow_dispatch اجرا کنید |

### نکات امنیتی

- توکن cPanel = دسترسی کامل اکانت. اگر لازم شد: cPanel → Manage API Tokens → توکن جدید بسازید و Secret گیت‌هاب را عوض کنید (و توکن قبلی را Revoke).
- endpoint ‏`/__cache-purge` فقط کش می‌خواهد (پاک می‌کند) — خطر ندارد؛ اما در صورت تمایل می‌توان به آن یک هدر مخفی اضافه کرد.
