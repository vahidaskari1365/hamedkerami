/* ============================================================
   نقطه‌ی ورود اپ روی cPanel (Setup Node.js App / Passenger)
   Application startup file = server.js

   کارها:
   ۱) chdir به ریشه‌ی اپ — تا دیتابیس (db/) و آپلودها (data/uploads)
      همیشه در مسیر پایدار و خارج از بیلد باشند
   ۲) تنظیم متغیرهای محیطی پروداکشن (DATABASE_URL و…)
   ۳) اجرای سرور standalone ساخته‌شده توسط `next build`
   ============================================================ */

/* eslint-disable @typescript-eslint/no-require-imports -- فایل ورودی Passenger باید CommonJS بماند */
const path = require("path");
const fs = require("fs");

const ROOT = __dirname;

/* Passenger ممکن است cwd را جای دیگری بگذارد — قطعی می‌کنیم */
process.chdir(ROOT);

process.env.NODE_ENV = process.env.NODE_ENV || "production";
process.env.NEXT_TELEMETRY_DISABLED = "1";

/* standalone باید روی 0.0.0.0 گوش دهد (متغیر HOSTNAME در لینوکس نام سرور است و باعث خطای bind می‌شود) */
process.env.HOSTNAME = "0.0.0.0";

/* Passenger پورت را از env می‌دهد؛ در نبودش 3000 */
if (!process.env.PORT) process.env.PORT = "3000";

/* دیتابیس SQLite — فایل پایدار در db/ کنار اپ (بیلد آن را پاک نمی‌کند) */
process.env.DATABASE_URL =
  process.env.DATABASE_URL || "file:" + path.join(ROOT, "db", "custom.db");

/* آپلودهای ادمین در <اپ>/data/uploads می‌مانند (پایدار، همراه بکاپ‌ها)
   و از طریق route داینامیک /uploads/<file> سرو می‌شوند */
process.env.UPLOAD_DIR = path.join(ROOT, "data", "uploads");
try {
  fs.mkdirSync(process.env.UPLOAD_DIR, { recursive: true });
} catch {
  /* noop */
}

const STANDALONE = path.join(ROOT, ".next", "standalone", "server.js");

if (!fs.existsSync(STANDALONE)) {
  console.error(
    "[server.js] بیلد پیدا نشد: .next/standalone/server.js موجود نیست.\n" +
      "دیپلوی را از گیت‌هاب اجرا کنید یا `bun run build` بزنید."
  );
  process.exit(1);
}

console.log("[server.js] starting standalone Next.js server…");
console.log("[server.js] DATABASE_URL =", process.env.DATABASE_URL);

require(STANDALONE);
