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

# ---------- ۳) ری‌استارت Passenger ----------
mkdir -p tmp
touch tmp/restart.txt
echo "==> ری‌استارت شد (tmp/restart.txt)"

echo ""
echo "OK — تمام شد. سایت را باز کنید: دامنه‌ی شما"
echo "اگر بالا نیامده: cPanel > Setup Node.js App > دکمه Restart را بزنید."
echo "لاگ خطا: cPanel > Errors یا ~/logs"
