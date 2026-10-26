/* ============================================================
   lang-map — نگاشت مسیر میان فارسی ⇄ انگلیسی (hreflang عملی)
   دکمه EN در ناوبری فارسی و دکمه «فارسی» در چارچوب /en از این
   توابع استفاده می‌کنند تا کاربر در «همان صفحه» بماند و زبان
   عوض شود؛ اگر معادل انگلیسی نداشت، نزدیک‌ترین صفحه EN.
   hreflang نسخه‌های head در alternates هر صفحه جداگانه مدیریت
   شده است؛ این ماژول فقط برای سوییچر UI است.
   ============================================================ */

/* فارسی → انگلیسی: مسیرهای مستقیم */
const FA_TO_EN: Readonly<Record<string, string>> = {
  "/": "/en",
  "/about": "/en/about",
  "/services": "/en/services",
  "/jaw-surgery": "/en/jaw-surgery-in-iran",
  "/costs": "/en/costs",
  "/blog": "/en/blog",
  "/contact": "/en/contact",
  "/appointment": "/en/contact",
  /* صفحات بدون معادل مستقیم — نزدیک‌ترین صفحه انگلیسی */
  "/chin-surgery": "/en/services",
  "/dental-implant": "/en/services",
  "/implant-pasdaran": "/en/services",
  "/surgery-care": "/en/jaw-surgery-in-iran",
  "/gallery": "/en/about",
};

/* انگلیسی → فارسی: وارونه همان جدول */
const EN_TO_FA: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(FA_TO_EN).map(([fa, en]) => [en, fa]),
);

/** مسیر معادل انگلیسی یک مسیر فارسی (هر مسیر ناشناخته → /en) */
export function faToEn(path: string): string {
  if (FA_TO_EN[path]) return FA_TO_EN[path];
  /* مقاله وبلاگ → فهرست انگلیسی وبلاگ */
  if (path.startsWith("/blog/")) return "/en/blog";
  return "/en";
}

/** مسیر معادل فارسی یک مسیر انگلیسی (هر مسیر ناشناخته → /) */
export function enToFa(path: string): string {
  if (EN_TO_FA[path]) return EN_TO_FA[path];
  if (path.startsWith("/en/blog")) return "/blog";
  if (path.startsWith("/en/")) return "/";
  return "/";
}
