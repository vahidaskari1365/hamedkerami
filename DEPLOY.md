# 🚀 راهنمای دیپلوی روی هاست اشتراکی ایران‌هاست (cPanel)

سیر کار: **گیت‌هاب بیلد می‌کند → خروجی آماده با FTP روی هاست می‌رود → Passenger آن را سرو می‌کند.**
دیتابیس **SQLite** است (خودش SQL است؛ یک فایل، بدون نیاز به MySQL) و آپلودها با هر بیلد از بین نمی‌روند.

---

## بخش ۱ — یک‌بار برای همیشه (تنظیمات گیت‌هاب)

### ۱. Secrets را بسازید
در مخزن گیت‌هاب: `Settings → Secrets and variables → Actions → New repository secret`

| نام Secret | مقدار | از کجا؟ |
|---|---|---|
| `FTP_SERVER` | آدرس FTP هاست (مثل `ftp.yourdomain.ir` یا IP سرور) | ایمیل فعال‌سازی هاست یا cPanel → FTP Accounts |
| `FTP_USERNAME` | یوزرنیم cPanel (مثل `username` — نه ایمیل) | همان ایمیل |
| `FTP_PASSWORD` | رمز FTP/cPanel | — |
| `FTP_SERVER_DIR` | `kermani-app` (بدون اسلش؛ پوشه‌ی اپ روی هاست) | دلخواه — همین را در بخش ۲ هم بزنید |

### ۲. دیپلوی خودکار
از این به بعد **هر `git push` به شاخه‌ی main** یعنی: بیلد + آپلود خودکار.
(اجرای دستی: تب Actions → Build & Deploy → Run workflow)

---

## بخش ۲ — یک‌بار روی هاست (cPanel ایران‌هاست)

### ۱. ساخت اپ Node.js
cPanel → **Setup Node.js App** → Create Application:

| فیلد | مقدار |
|---|---|
| Node.js version | **20 یا بالاتر** |
| Application mode | Production |
| Application root | `kermani-app` |
| Application URL | دامنه‌ی اصلی سایت |
| Application startup file | `server.js` |

Create را بزنید. (npm install لازم نیست — همه‌ی وابستگی‌ها داخل بیلد گیت‌هاب هست.)

### ۲. SSL رایگان
cPanel → **SSL/TLS Status** → Run AutoSSL (https فعال می‌شود).

### ۳. دیپلوی اول
1. push به main کنید و صبر کنید Actions سبز شود (اولین بار ۱۰ تا ۳۰ دقیقه چون همه‌ی فایل‌ها آپلود می‌شوند؛ دفعات بعد فقط فایل‌های تغییر کرده — چند دقیقه).
2. cPanel → **Terminal** و فقط این دو خط:

```bash
cd ~/kermani-app
bash setup.sh
```

این اسکریپت: دیتابیس را از `db/init.db` می‌سازد، آپلودها را وصل می‌کند و اپ را ری‌استارت می‌کند.

3. دامنه را باز کنید — سایت بالاست 🎉
4. ورود پنل: `دامنه/#/admin` — کاربر `admin` و همان رمز فعلی.

### ۴. دیپلوی‌های بعدی
فقط push کنید. اگر Actions تمام شد و سایت به‌روز نشد، همان دو خط ترمینال بالا را دوباره بزنید
(یا اگر SSH دارید، در فایل workflow بخش SSH را از کامنت خارج کنید تا کاملاً خودکار شود).

---

## بخش ۳ — دیتابیس (SQL)

- دیتابیس سایت یک فایل SQL است: `~/kermani-app/db/custom.db` (SQLite — بدون سرور، بدون یوزر/پسورد).
- محتوای اولیه از `db/init.db` در مخزن می‌آید؛ بعد از آن **همه‌ی تغییرات پنل ادمین مستقیم در همین فایل ذخیره می‌شود**.
- نسخه‌ی متنی کامل: `db/init.sql` در مخزن (اسکیما + تمام محتوا).

**بکاپ:** cPanel → File Manager → `~/kermani-app/db/custom.db` را دانلود کنید (کل دیتابیس همین یک فایل است). آپلودهای تصویری هم در `~/kermani-app/data/uploads` هستند.
**بازگردانی در کامپیوتر خودتان:** `sqlite3 custom.db .dump > backup.sql`
**بازگردانی روی هاست:** فایل را در `db/` جایگزین کنید و `bash setup.sh` بزنید.

> ⚠️ هرگز `db/custom.db` را داخل گیت کامیت نکنید (در .gitignore است) — داده‌ی زنده‌ی سایت است.

---

## بخش ۴ — مشکلات رایج

| علامت | علت / راه‌حل |
|---|---|
| صفحه سفید یا 503 | Node.js App → دکمه Restart؛ سپس log خطا در Setup Node.js App (Open Logs) |
| `Error: Cannot find module ...` | دیپلوی ناقص — Actions را دوباره اجرا کنید |
| خطای Prisma + openssl | در ترمینال بزنید `node -p 'process.versions.openssl'` — موتورهای 1.0/1.1/3.0 داخل بیلد هست؛ اگر نسخه عجیب بود به من بگویید تا اضافه کنم |
| عکس‌های آپلودی 404 | `bash setup.sh` را دوباره بزنید (لینک uploads برقرار می‌شود) |
| تغییرات پنل بعد از دیپلوی برگشت | دیتابیس پاک شده — مطمئن شوید `db/custom.db` را دستی حذف نکرده‌اید؛ FTP-Deploy با cleaner خاموش است و چیزی حذف نمی‌کند |
| FTP آپلود نمی‌کند | IP ایران‌هاست را با `FTP_SERVER` چک کنید؛ اگر FTPS لازم است در workflow مقدار `protocol: ftp` را به `ftps` تغییر دهید |

---

## بخش ۵ — می‌خواهی من خودم در cPanel کار کنم؟

cPanel → **Manage API Tokens** → Create API Token:
- نام: `deploy-bot`
- Expire: بهتر است تاریخ انقضا بگذار (مثلاً ۱ سال) — این توکن دسترسی کامل اکانت می‌دهد
- توکن ساخته‌شده را **همین‌جا در چت** بفرست + آدرس cPanel (مثل `https://serverXX.iranhost.com:2083`) + یوزرنیم

با آن می‌توانم خودم: ساخت Node.js App، آپلود/اکسترکت فایل‌ها، اجرای setup، ری‌استارت و عیب‌یابی لاگ را انجام دهم.
بعد از راه‌اندازی، توکن را از همان صفحه حذف کن.
