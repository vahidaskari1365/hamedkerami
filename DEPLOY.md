# 🚀 راهنمای دیپلوی روی هاست اشتراکی ایران‌هاست (cPanel)

سیر کار (تماماً خودکار — مثل ورسل):
**هر push به main → گیت‌هاب بیلد می‌کند → پکیج فشرده با cPanel API (HTTPS) آپلود می‌شود →
server.js بوت‌استرپی پکیج را اکسترکت و اپ را ری‌استارت می‌کند → سایت با نسخه تازه بالا می‌آید.**

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
| `CPANEL_API_TOKEN` | توکن API سی‌پنل (Settings → Manage API Tokens) |

Secretهای قدیمی FTP_*/SSH_* دیگر استفاده نمی‌شوند (می‌توانند حذف شوند).

---

## بخش ۲ — آنچه روی هاست یک‌بار انجام شد

1. **Setup Node.js App**: Application root = `kermani-app` ، startup file = `server.js` (انجام شد)
2. دامنه **dr-kermani.com** روی این اکانت است و DNS به سرور اشاره می‌کند (انجام شده)
3. AutoSSL فعال است (https کار می‌کند)

> نکته: دیگر نیازی به اجرای دستی setup.sh یا Restart نیست — server.js بوت‌استرپی هر دیپلوی را خودش نصب و ری‌استارت می‌کند.

---

## بخش ۳ — سازوکار دیپلوی (برای درک/عیب‌یابی)

هر اجرای workflow این مراحل است:

1. **بیلد**: bun install → prisma generate → next build (standalone) → پکیج: `.next/standalone` + `server.js` + `prisma/` + `db/init.db`
2. **آپلود**: tar.gz (حدود ۶۶MB) با `Fileman::upload_files` به `/home/drkerman/kermani-app/deploy-package.tar.gz`
3. **بوت‌استرپ**: `Fileman::save_file_content` نسخه بوت‌استرپی server.js را می‌نویسد — در شروع، اگر پکیج تازه موجود باشد آن را با `tar` اکسترکت می‌کند، بعد standalone را اجرا می‌کند
4. **ری‌استارت**: `POST /api/deploy-hook` روی پروسه فعال → اگر پکیج در انتظار باشد پروسه exit می‌کند → Passenger پروسه تازه می‌سازد → بوت‌استرپ اجرا می‌شود
5. **تأیید**: workflow با UAPI چک می‌کند پکیج مصرف شده و سایت 200 می‌دهد

### عیب‌یابی سریع

| علامت | معنی | کار |
|---|---|---|
| مرحله Wake/verify با هشدار پاس شد | پروسه فعال route هوک را ندارد (فقط بار اول) | cPanel → Setup Node.js App → دکمه **Restart** یک‌بار |
| سایت 500/پایین | خطای اجرای اپ | فایل `~/kermani-app/stderr.log` را ببینید |
| دیپلوی انجام شد ولی تغییری نمی‌بینید | کش مرورگر | رفرش سخت (Ctrl+Shift+R) |
| ران گیت‌هاب قرمز در آپلود | انقضای توکن cPanel | توکن جدید بسازید و Secret را آپدیت کنید |

### نکات امنیتی

- توکن cPanel = دسترسی کامل اکانت. اگر لازم شد: cPanel → Manage API Tokens → توکن جدید بسازید و Secret گیت‌هاب را عوض کنید (و توکن قبلی را Revoke).
- اکانت FTP مخصوص CI (`cideploy@dr-kermani.com`) ساخته شده ولی فعلاً بلااستفاده است (کانال دیتای FTP فایروال است).
