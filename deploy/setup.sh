#!/usr/bin/env bash
# ============================================================
#   راه‌اندازی/به‌روزرسانی سایت دکتر کرمانی روی هاست اشتراکی cPanel
#   اجرا در Terminal سی‌پنل:  cd ~/kermani-app && bash setup.sh
#   (این اسکریپت بعد از هر دیپلوی هم می‌توانید اجرا کنید — بی‌خطر است)
# ============================================================
set -euo pipefail
cd "$(dirname "$0")"

echo "==> Node: $(node -v)  |  OpenSSL: $(node -p 'process.versions.openssl')"

# ---------- ۱) دیتابیس ----------
# اولین بار: از نسخه‌ی آماده‌ی init.db ساخته می‌شود؛ دفعات بعد حفظ می‌شود
if [ ! -f db/custom.db ]; then
  mkdir -p db
  cp db/init.db db/custom.db
  echo "==> دیتابیس ساخته شد (db/custom.db از init.db)"
else
  echo "==> دیتابیس موجود حفظ شد (db/custom.db)"
fi

# ---------- ۲) پوشه‌ی آپلودها (پایدار) ----------
# آپلودها در data/uploads ذخیره و از /uploads/<file> سرو می‌شوند؛
# FTP چیزی را حذف نمی‌کند، پس آپلودها با هر بیلد حفظ می‌شوند
mkdir -p data/uploads
echo "==> پوشه‌ی آپلودها آماده است (data/uploads)"

# ---------- ۲.۵) حذف فایل‌های کهنه که حالا مسیر داینامیک دارند ----------
# sitemap.xml حالا توسط Next (app/sitemap.ts) با URLهای واقعی ساخته می‌شود؛
# نسخه استاتیک قدیمی روی LiteSpeed جلوی نسخه داینامیک را می‌گرفت
rm -f public/sitemap.xml
echo "==> فایل‌های کهنه پاک شدند"

# ---------- ۲.۶) seed مقالات وبلاگ (فاز ۱ — idempotent) ----------
# اگر sqlite3 روی هاست موجود باشد و مقاله جدیدی در فایل seed باشد، اضافه می‌شود.
# INSERT OR REPLACE با slug یکتاست و رکوردهای ادمین را خراب نمی‌کند.
if command -v sqlite3 >/dev/null 2>&1 && [ -f db/blog-seed.sql ]; then
  if sqlite3 db/custom.db < db/blog-seed.sql 2>/dev/null; then
    echo "==> مقالات وبلاگ با دیتابیس همگام شد (blog-seed.sql)"
  else
    echo "==> اجرای blog-seed.sql ناموفق بود — مقالات از fallback سایت نمایش داده می‌شوند"
  fi
else
  echo "==> sqlite3 یافت نشد — مقالات از fallback سایت نمایش داده می‌شوند"
fi

# ---------- ۲.۷) اصلاح شماره تماس/واتسپ (idempotent) ----------
# شماره ها فقط اگر با مقدار درست فرق داشته باشند اصلاح می شوند؛
# بقیه تنظیمات ادمین (قیمت ها، متون و ...) دست نخورده می مانند.
# wa.me فقط فرمت بین المللی بدون صفر را می پذیرد: 09382080270 → 989382080270
if command -v sqlite3 >/dev/null 2>&1 && [ -f db/custom.db ]; then
  sqlite3 db/custom.db <<'SQLFIX' 2>/dev/null \
    && echo "==> شماره تماس/واتسپ دیتابیس بررسی و اصلاح شد" \
    || echo "==> اصلاح شماره ها ناموفق بود — fallback سایت با شماره درست کار می کند"
UPDATE Setting SET value = json_set(value,
  '$.phone', '02166921500',
  '$.phoneDisplay', '۰۲۱-۶۶۹۲۱۵۰۰',
  '$.whatsapp', '09382080270',
  '$.whatsappDisplay', '۰۹۳۸-۲۰۸۰۲۷۰')
WHERE key = 'site'
  AND (json_extract(value, '$.phone') IS NOT '02166921500'
    OR json_extract(value, '$.whatsapp') IS NOT '09382080270');
SQLFIX
else
  echo "==> sqlite3 یافت نشد — شماره ها از fallback سایت خوانده می شوند"
fi

# ---------- ۳) ری‌استارت Passenger ----------
mkdir -p tmp
touch tmp/restart.txt
echo "==> ری‌استارت شد (tmp/restart.txt)"

echo ""
echo "OK — تمام شد. سایت را باز کنید: دامنه‌ی شما"
echo "اگر بالا نیامده: cPanel > Setup Node.js App > دکمه Restart را بزنید."
echo "لاگ خطا: cPanel > Errors یا ~/logs"
