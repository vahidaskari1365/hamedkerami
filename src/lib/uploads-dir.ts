import path from "node:path";

/* ============================================================
   مسیر پایدار ذخیره‌ی آپلودهای ادمین:  <cwd>/data/uploads
   (خارج از public تا مسیر /uploads/* توسط فایل‌های استاتیک قاپیده
   نشود و route داینامیک /uploads/[file] سروشان کند)
   - توسعه: همان مسیر پیش‌فرض
   - هاست: wrapper (server.js) همان مسیر را صریح ست می‌کند
   ============================================================ */
export function uploadsDir(): string {
  return process.env.UPLOAD_DIR
    ? path.resolve(process.env.UPLOAD_DIR)
    : path.join(process.cwd(), "data", "uploads");
}
